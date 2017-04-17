/***********************************************************/
/*  Authors : Axel Rieben, Maël Pedretti, Quentin Vaucher  */
/*  Date : 10 April 2017                                   */
/***********************************************************/

// The global variable for the matrix
var matrix = new Array();

// The global variable for the JSON file
var matrixJSON = "matrix/matrice_0x0.json";

//Variable used to show/hide the matrix
var shownMatrix = false;

//webworkers aka threads
var workerMatrixPrinter;
var workerSolutionsPrinter;

/*******************************************************/
/*  Tools                                              */
/*******************************************************/

function $(id) {
    return document.getElementById(id);
}

function $name(name) {
    return document.getElementsByName(name);
}

// Deep copy arrays
function cloneArray(array) {
    let clone = [];
    for (i = 0; i < array.length; i++) {
        clone.push(array[i].slice(0))
    }
    return clone;
}

/*******************************************************/
/*  Web Worker                                         */
/*******************************************************/


function initWorkers(){
    if(typeof(Worker) === "undefined") {
        console.log("Sorry, your browser does not support Web Workers...");
    }
    else {
        console.log("Browser supported");

        if(typeof(workerMatrixPrinter) == "undefined")
            workerMatrixPrinter = new Worker("AN_Labo3_EquipeB1_workerMatrixPrinter.js");
        if(typeof(workerSolutionsPrinter) == "undefined")
            workerSolutionsPrinter = new Worker("AN_Labo3_EquipeB1_workerSolutionsPrinter.js");

        workerMatrixPrinter.onmessage = function(event) {
            $('matrix').innerHTML = event.data;
        };

        workerSolutionsPrinter.onmessage = function(event) {
            $('result').innerHTML = event.data;
            $('buttonSolve').disabled = false;
        }

        let errorFct = function(event) {
                            console.log(event.message);
                        };

        workerMatrixPrinter.onerror = workerSolutionsPrinter.onerror = errorFct;
    }
}

/*******************************************************/
/*  JSON                                               */
/*******************************************************/


function updateJSONFile() {
    matrixJSON = "matrix/"+$("selectMatrix").value;
    loadMatrixFromJSON();
}

// Source: https://codepen.io/KryptoniteDove/post/load-json-file-locally-using-pure-javascript
function loadMatrixFromJSON() {
    let callback = function(response) {
                        // Parse JSON string into object
                        let json = JSON.parse(response);
                        buildMatrixFromJSON(json);
                    }
    loadJSON(callback);
}

function loadJSON(callback) {
    let xobj = new XMLHttpRequest();
    xobj.onreadystatechange = function() {
        if (xobj.readyState == XMLHttpRequest.DONE && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
            if(typeof(workerMatrixPrinter) != "undefined")
                workerMatrixPrinter.postMessage(matrix);
        }
    };
    xobj.overrideMimeType("application/json");
    xobj.open('GET', matrixJSON, true);
    xobj.send();
}

/* build a matrix from the JSON file, the resulting matrix is of the following form:
(x1, y1, z1, constant1)
(x2, y2, z2, constant2)
...
(xn, yn, zn, constant_n)
*/
function buildMatrixFromJSON(json) {
    let n = json.n[0];
    matrix = new Array();
    let colIndex = 0;
    let rowIndex = 0;
    for (let i = 0; i < n; i++) {
        matrix[i] = new Array();
        //(x, y, z, ...)
        for (let j = 0; j < n; j++)
            matrix[i].push(parseFloat(json.A[colIndex++]));
        //constant
        matrix[i].push(parseFloat(json.B[rowIndex++]));
    }
}

/*******************************************************/
/*  HTML/User interactions                             */
/*******************************************************/

// Start the timer, solve the linear system and then stop the timer. Finally display the results on the screen.
function solve() {
    //Copy the matrix, becaus gauss(matrix) change the content
    let tempMatrix = cloneArray(matrix);

    let start = performance.now();
    let solutions = gauss(tempMatrix);
    let time = performance.now() - start;

    $('time').innerHTML = "<br/>" + time + "ms";
    $('t').style.display = "block";
    $('result').innerHTML = "";
    $('buttonSolve').disabled = true;
    if(typeof(workerSolutionsPrinter) != "undefined")
        workerSolutionsPrinter.postMessage(solutions);
    $('out').style.display = "block";
}


//Show the matrix in the HTML page
function showMatrix() {
    if(shownMatrix==false){
        $('mat').style.display="block";
        $('matrix').style.display = "block";
        $('buttonShow').innerHTML = "Hide matrix";
        shownMatrix = true;
    }
    else{
        $('mat').style.display="none";
        $('buttonShow').innerHTML = "Show matrix";
        shownMatrix = false;
    }
}

/*******************************************************/
/*  Gauss-Jordan Elimination                           */
/*******************************************************/

/* Source: https://martin-thoma.com/solving-linear-equations-with-gaussian-elimination/#javascript-code
The algorithm comes from the above source, but has been slightly modidfied.
---------------------------------------------------------------------------
Solve a linear system of equations given by a n*n matrix
with a result vector n*1. */
function gauss(matrix) {
    let n = matrix.length;

    for (let currentPos = 0; currentPos < n; currentPos++) {
        // Search for maximum in this column
        let maxRowValue = Math.abs(matrix[currentPos][currentPos]);
        let maxRowIndex = currentPos;
        for (let currentRow = currentPos + 1; currentRow < n; currentRow++) {
            if (Math.abs(matrix[currentRow][currentPos]) > maxRowValue) {
                maxRowValue = Math.abs(matrix[currentRow][currentPos]);
                maxRowIndex = currentRow;
            }
        }

        // Swap maximum row with current row
        let tmp = matrix[maxRowIndex];
        matrix[maxRowIndex]=matrix[currentPos];
        matrix[currentPos]=tmp;

        // Make all rows below this one 0 in current column
        for (currentRow = currentPos + 1; currentRow < n; currentRow++) {
            let c = -matrix[currentRow][currentPos] / matrix[currentPos][currentPos];
            for (let currentColumn = currentPos; currentColumn < n + 1; currentColumn++) {
                if (currentPos == currentColumn) {
                    matrix[currentRow][currentColumn] = 0;
                } else {
                    matrix[currentRow][currentColumn] += c * matrix[currentPos][currentColumn];
                }
            }
        }
    }

    // Solve equation Ax=b for an upper triangular matrix A (substitution)
    let solutions = new Array(n);
    for (let currentPos = n - 1; currentPos > -1; currentPos--) {
        solutions[currentPos] = matrix[currentPos][n] / matrix[currentPos][currentPos];
        for (let currentRow = currentPos - 1; currentRow > -1; currentRow--) {
            matrix[currentRow][n] -= matrix[currentRow][currentPos] * solutions[currentPos];
        }
    }

    return solutions;
}

function onSelectChange(){
    $("buttonSolve").style.display='block';
    $("buttonShow").style.display='block';
    updateJSONFile();
}

//function used to list only json files when a folder is chosen.
function listFiles(){
    let inp = $('fileElementId');
    let outp = $("selectMatrix");
    outp.innerHTML = "<option selected disabled>Select Matrix</option>";
    for (var i = 0; i < inp.files.length; i++){
        if(inp.files[i].name.split('.').pop()=="json")
            outp.innerHTML += "<option value=\"" + inp.files[i].name + "\">"+ inp.files[i].name +"</option>";
    }
    outp.style.display='block';
}

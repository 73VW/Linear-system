/***********************************************************/
/*  Authors : Axel Rieben, Maël Pedretti, Quentin Vaucher  */
/*  Date : 10 April 2017                                   */
/***********************************************************/

/*******************************************************/
/*  Tools : Easiest way to get element by id and name  */
/*******************************************************/

function $(id) {
    return document.getElementById(id);
}

function $name(name) {
    return document.getElementsByName(name);
}

//Thread
var w;
var w2;

function runThread() {
    if (typeof(Worker) !== "undefined") {
        console.log("Browser supported");
        if (typeof(w) == "undefined") {
            w = new Worker("worker.js");
            w.postMessage("Bonjour");
        }
        w.onmessage = function(event) {
            $("result").innerHTML += "<br/>" + event.data;
        };
        w.onerror = function(event) {
            $("result").innerHTML += "<br/>" + event.message;
        };
    } else {
        $("result").innerHTML = "Sorry, your browser does not support Web Workers...";
    }
}

function sendMessage() {
    if (typeof(w) != "undefined")
        w.postMessage($('text').value);
}

function stopThread() {
    if (typeof(w) != "undefined") {
        w.terminate();
        w = undefined;
    }
}

//---------------------------------------------------------------------------------------------------------

// Source: https://codepen.io/KryptoniteDove/post/load-json-file-locally-using-pure-javascript
function loadJSON(callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'matrix/matrice_3x3.json', true);
    xobj.onreadystatechange = function() {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

function loadMatrixFromJSON() {
    loadJSON(function(response) {
        // Parse JSON string into object
        var json = JSON.parse(response);
        buildMatrixFromJSON(json);
    });
}

/* build a matrix from the JSON file, the resulting matrix is of the following form:
(x1, y1, z1, constant1)
(x2, y2, z2, constant2)
*/
function buildMatrixFromJSON(json) {
    let n = json.n;
    var matrix = new Array();
    var aIndex = 0;
    var bIndex = 0;
    for (var i = 0; i < n; i++) {
        matrix[i] = new Array();
        for (var j = 0; j < n; j++) {
            matrix[i].push(parseFloat(json.A[aIndex]));
            aIndex++;
        }
        matrix[i].push(parseFloat(json.B[bIndex]));
        bIndex++;
    }

    showMatrix(matrix);
    solve(matrix);
}

//Show the matrix in the HTML page
function showMatrix(matrix) {
    let n = matrix.length;
    $('matrix').innerHTML = "";
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            $('matrix').innerHTML += matrix[i][j] + " ";
        }
        $('matrix').innerHTML += " = " + matrix[i][n] + " ";
        $('matrix').innerHTML += "</br>";
    }
}

//Show the solutions in the HTML page
function showResult(solutions) {
    //Check if the solution has been found
    let noSolution = false;
    for (var i = 0; i < solutions.length; i++) {
        if (!solutions[i]) {
            noSolution = true;
        }
    }

    if (!noSolution) {
        $('result').innerHTML = "";
        $('result').innerHTML += "</br>"
        for (var i = 0; i < solutions.length; i++) {
            $('result').innerHTML += "x<sub>" + i + "</sub> = " + solutions[i] + "</br>";
        }
    } else {
        $('result').innerHTML = "The aforementioned equation system can not be solved"
    }
}

// Start the timer, solve the linear system and then stop the timer. Finally display the results on the screen.
function solve(matrix) {
    let start = Date.now();
    let solutions = gauss(matrix);
    let time = Date.now() - start;

    showResult(solutions);
    $('time').innerHTML = time + "ms";
}

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

        // Swap maximum row with current row (column by column)
        for (let currentColumn = currentPos; currentColumn < n + 1; currentColumn++) {
            let tmp = matrix[maxRowIndex][currentColumn];
            matrix[maxRowIndex][currentColumn] = matrix[currentPos][currentColumn];
            matrix[currentPos][currentColumn] = tmp;
        }

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

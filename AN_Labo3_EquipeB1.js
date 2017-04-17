/***********************************************************/
/*  Authors : Axel Rieben, Maël Pedretti, Quentin Vaucher  */
/*  Date : 10 April 2017                                   */
/***********************************************************/

// The global variable for the matrix
var matrix = new Array();

// The global variable for the JSON file
var matrixJSON = "matrix/matrice_0x0.json";

var jsonFileName = ["matrix/matrice_0x0.json", "matrix/matrice_3x3.json",
                    "matrix/matrice_50x50.json", "matrix/matrice_250x250.json",
                    "matrix/matrice_300x300.json", "matrix/matrice_avecPB_0x0.json",
                    "matrix/matrice_avecPB_3x3_avec_A_a_0.json", "matrix/matrice_avecPB_3x3_avec_SwapObligatoire.json"];

function updateJSONFile() {
  for (var i = 0; i < $name('matrix').length; i++) {
    if ($name('matrix')[i].checked) {
      matrixJSON = jsonFileName[i];
      loadMatrixFromJSON();
    }
  }
}
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
/*  JSON                                               */
/*******************************************************/

// Source: https://codepen.io/KryptoniteDove/post/load-json-file-locally-using-pure-javascript
function loadMatrixFromJSON() {
    loadJSON(function(response) {
        // Parse JSON string into object
        let json = JSON.parse(response);
        buildMatrixFromJSON(json);
    });
}

function loadJSON(callback) {
    let xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', matrixJSON, true);
    xobj.onreadystatechange = function() {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

/* build a matrix from the JSON file, the resulting matrix is of the following form:
(x1, y1, z1, constant1)
(x2, y2, z2, constant2)
...
(xn, yn, zn, constant_n)
*/
function buildMatrixFromJSON(json) {
    let n = json.n;
    matrix = new Array();
    let colIndex = 0;
    let rowIndex = 0;
    for (let i = 0; i < n; i++) {
        matrix[i] = new Array();

        //(x, y, z, ...)
        for (let j = 0; j < n; j++) {
            matrix[i].push(parseFloat(json.A[colIndex]));
            colIndex++;
        }

        //constant
        matrix[i].push(parseFloat(json.B[rowIndex]));
        rowIndex++;
    }
}

/*******************************************************/
/*  HTML/User interactions                             */
/*******************************************************/

// Start the timer, solve the linear system and then stop the timer. Finally display the results on the screen.
function solve() {
    //Copy the matrix, becaus gauss(matrix) change the content
    let tempMatrix = cloneArray(matrix);

    let start = Date.now();
    let solutions = gauss(tempMatrix);
    let time = Date.now() - start;

    showResult(solutions);
    $('time').innerHTML = time + "ms";
}

//Show the matrix in the HTML page
function showMatrix() {
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
    for (let i = 0; i < solutions.length; i++) {
        if (!solutions[i]) {
            noSolution = true;
        }
    }

    if (!noSolution) {
        $('result').innerHTML = "";
        $('result').innerHTML += "</br>"
        for (let i = 0; i < solutions.length; i++) {
            $('result').innerHTML += "x<sub>" + (i+1) + "</sub> = " + solutions[i] + "</br>";
        }
    } else {
        $('result').innerHTML = "The aforementioned equation system can not be solved";
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

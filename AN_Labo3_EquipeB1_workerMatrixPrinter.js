console.log("Thread matrix start");

self.onmessage=function(e){
    let matrix = e.data;
    let n = matrix.length;
    let html="";
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            html += matrix[i][j] + " ";
        }
        html += " = " + matrix[i][n];
        html += "</br>";
    }
    self.postMessage(html);
};

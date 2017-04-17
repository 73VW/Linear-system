console.log("Thread solutions start");

self.onmessage=function(e){
    solutions = e.data;
    //Check if the solution has been found
    let response = "";
    let noSolution = false;
    for (let i = 0; i < solutions.length; i++) {
        if (!solutions[i]) {
            noSolution = true;
        }
    }
    if (!noSolution) {
        response += "</br>";
        for (let i = 0; i < solutions.length; i++) {
            response += "x<sub>" + (i+1) + "</sub> = " + solutions[i] + "</br>";
        }
    } else {
        response += "The aforementioned equation system can not be solved";
    }
    self.postMessage(response);
};

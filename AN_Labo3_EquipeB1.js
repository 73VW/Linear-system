/***********************************************************/
/*  Authors : Axel Rieben, Maël Pedretti, Quentin Vaucher  */
/*  Date : 28 March 2017                                   */
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

var w;
var w2;

function runThread(){
    if(typeof(Worker) !== "undefined") {
        console.log("Browser supported");
        if(typeof(w) == "undefined") {
            w = new Worker("worker.js");
            w.postMessage("Bonjour");
        }
        w.onmessage = function(event) {
            $("result").innerHTML += "<br/>" + event.data;
        };
        w.onerror = function(event) {
            $("result").innerHTML += "<br/>" + event.message;
        };
    } 
    else {
        $("result").innerHTML = "Sorry, your browser does not support Web Workers...";
    }
}

function sendMessage(){
    if(typeof(w) != "undefined")
        w.postMessage($('text').value);
}

function stopThread(){
    if(typeof(w) != "undefined"){
        w.terminate();
        w=undefined;
    }
}
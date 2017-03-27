console.log("Thread start");

onmessage=function(e){
    postMessage("From thread: "+e.data);
};
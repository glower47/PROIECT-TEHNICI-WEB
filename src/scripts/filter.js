var rangeMin = document.getElementById("pretMin");
var rangeMax = document.getElementById("pretMax");

rangeMin.addEventListener("change", function(){
    updateMinTextInput(rangeMin.value);
});

rangeMax.addEventListener("change", function(){
    updateMaxTextInput(rangeMax.value);
});

function updateMinTextInput(val) {
    document.getElementById('valueMin').innerHTML=val; 
  }
function updateMaxTextInput(val) {
    document.getElementById('valueMax').innerHTML=val; 
}

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
var Filters = {};
var Produse = {};

function filtreaza(){
    var Filters = {};

    Filters.minPret = document.getElementById("pretMin").value
    Filters.maxPret = document.getElementById("pretMax").value

    if(document.getElementById("student").checked == true){
        Filters.conceput_pentru = "studenti"
    }
    if(document.getElementById("firma").checked == true){
        Filters.conceput_pentru = "firme"
    }
    if(document.getElementById("angajat").checked == true){
        Filters.conceput_pentru = "angajati"
    }

    Filters.in_stoc = document.getElementById("stoc").checked
    Filters.categorie = document.getElementById("premium").checked == true ? "Premium" : "Standard"
    
    let query = "SELECT * FROM tabel_pachete WHERE pret > " + Filters.minPret + " AND pret < " + Filters.maxPret + " "
    if(Filters.conceput_pentru){
        query += "AND conceput_pentru = " + "'" + Filters.conceput_pentru + "'" + " "
    }
    if(Filters.in_stoc){
        query += "AND in_stoc = " + Filters.in_stoc + " "
    }
    if(Filters.categorie){
        query += "AND categorie = " + "'" + Filters.categorie + "'" + " "
    }
    // console.log({queryInFiltre: query})

    let dataToSend = {query: query};
    let fetchOptions = {method: "POST", headers: {'Content-Type': 'application/json'}, body: JSON.stringify(dataToSend)};
    fetch("/receiver", fetchOptions).then(response => {
        console.log({RESPONSE: response})
    });
}

function calculeazaTotal(){

}



Filters.minPret = document.getElementById("pretMin").value
Filters.maxPret = document.getElementById("pretMax").value

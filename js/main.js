//global variables
var map; //map object

//begin script when window loads
window.onload = initialize(); //->

//the first function called once the html is loaded
function initialize(){
  //<-window.onload
  setMap(); //->
};

//set basemap parameters
function setMap() {
  //<-initialize()
  
  //create  the map and set its initial view
  map = L.map('map').setView([1.355312,103.827068], 11);
  
  //add the tile layer to the map
  var layer = L.tileLayer(
    'http://{s}.tile.osm.org/{z}/{x}/{y}.png', 
    {
		  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	  }).addTo(map);
    };
    
console.log("My first geoweb mapping application")

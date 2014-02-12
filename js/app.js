
			function sizeMap(){
				var windowHeight = $(window).height();
				$('#map').height(windowHeight);
			}

			$(window).resize(function(){
				sizeMap();
			});


			$(function() {
				var map = L.mapbox.map('map', 'andrenhy.h81b3i47', {zoomControl: false});
				map.setView([37.737055,-122.435127], 12);
				map.addControl(new NavControls({
					position: 'bottomleft'
				}));
				sizeMap();
				// var road = L.geoJson(sanfranRoadData, {
				// 	color: 'blue',
				// 	opacity: 0.5,
				// 	weight: 1
				// });
				// map.addLayer(road);	
		d3.csv('data/sfpd_incident_2014.csv', function(err, incident){
			$('#overlayLoading h1').html('Building roads...');
			d3.json('data/simpleRoad.geojson', function(err, road){
				d3.csv('data/sanfranPoliceStations.csv', function(err, station){
				$('#overlayLoading h1').html('Locating police stations...');

				//Implement Choropleth Layer
				// Some hack job for the lack of a colorBrewer script

				var color = d3.scale.quantize()
								.domain([10100,71000])
								.range(['#FFFFFF', '#BD0026']);


				function getColor(d) {
				    return d > 164135  ? '#BD0026' :
				           d > 120000 ? '#E31A1C' :
				           d > 91172 ? '#FC4E2A' :
				           d > 66784 ? '#FD8D3C' :
				           d > 34923 ? '#FEB24C' :
				           d > 34923  ? '#FED976' : '#FFEDA0';
				}
				
				function randomColor(){
					var colorString = 
						'rgb('+ 
							(Math.round(Math.random() * (255 - 5) + 5)) + ',' +
							(Math.round(Math.random() * (255 - 5) + 5)) + ',' +
							(Math.round(Math.random() * (255 - 5) + 5))  + ')';
					return colorString;
				}

				// Changes the color of the Polygons within the Choropleth
				function style(feature) {
				    return {
				        fillColor: getColor(feature.properties.MedInc_d),
				        weight: 2,
				        opacity: 1,
				        color: 'green',
				        dashArray: '3',
				        fillOpacity: 0.7
				    };
				}

				var roadLayer = L.geoJson(road, {
									color: 'blue',
									weight: 1,
									opacity: 0.5,
								});

				roadLayer.bounds = roadLayer.getBounds();
;
				var incomeLayer = L.geoJson(sanfranIncomeData,{style: style});
				incomeLayer.bounds = incomeLayer.getBounds();


				var overviewLayer = L.layerGroup();
				var grouped = _.groupBy(incident, function(d){
					return d.PdDistrict;
				});

				for(var key in grouped){
					grouped[key] = _.reduce(grouped[key], function(memo, val){
						memo += 1;
						return memo;
					}, 0);
				}

				var values = [];

				for(var i in grouped){
					values.push(grouped[i]);
				}

				values = _.sortBy(values, function(d){
					return d;
				});

				// console.log(values);


					// load police district layer
				var pDistLayer = L.geoJson(policeDistrict, {	
					
					style: function(feature){
						var district = feature.properties.DISTRICT;
						// console.log(district);
							d3.csv('data/sanfranPoliceStations.csv', function(err, data){
								data.forEach(function(d, i){
									// val is the district name
									var val = d.pdDistricts;
									if (val == district) {
											var myIcon = L.divIcon({ 
													    iconSize: new L.Point(grouped[district]/20, grouped[district]/20), 
													    className: 'count-icon',
													    html: "<b>" + val +"</b><br>"+ grouped[district],
														opacity: 0.9,
														fillOpacity: 0.1
													});

									var latLng = [d.y, d.x];
									var marker = L.marker(latLng, {icon: myIcon});
									overviewLayer.addLayer(marker);

										// 	var marker = L.circleMarker(latLng, {
										// 		radius: grouped[district]/100,
										// 		color: 'red',
										// 		opacity: 0.9,
										// 		weight : 2,
										// 		fillOpacity: 0.8

										// });
										// marker.addTo(map);
									}
								});	
							});
						return {
							fillColor: randomColor(),
							weight: 2,
		 	        		opacity: 1,
			        		color: 'white',
		 	        		dashArray: '3',
		 	        		fillOpacity: 0.7
						}
					}
				});

				pDistLayer.bounds = roadLayer.getBounds();
				overviewLayer.bounds = roadLayer.getBounds();

				var layerGrp = L.layerGroup([overviewLayer]);
				layerGrp.addTo(map);


			// Implement Layer Toggle

				$("#sortable li img").click(function(event){
					console.log(roadLayer);
    				var mapid = $(this).parent().attr('id');
					if(mapid == 'road') {
						map.fitBounds(roadLayer.bounds);
					} if (mapid == 'income') {
						map.fitBounds(incomeLayer.bounds); 
					} if (mapid == 'district') {
						map.fitBounds(pDistLayer.bounds);
					} if (mapid == 'overview') {
						map.fitBounds(overviewLayer.bounds);

					}
    				//map.fitBounds(layerLatLng);
  				});


				$( "#sortable" ).sortable({
				  update: function( event, ui ) { 
				  }
				});

				$("#sortable .new" ).click(function() {
					console.log('layer clicked');
					if ($(this).parent().hasClass('off')) {
						$(this).parent().addClass('on');
						$(this).parent().removeClass('off');
					} else {
						$(this).parent().addClass('off');
						$(this).parent().removeClass('on');
					}
					var mapid = $(this).parent().attr('id');
						if(mapid == 'road') {
							if (layerGrp.hasLayer(roadLayer)) {
								layerGrp.removeLayer(roadLayer);
							} else {
								layerGrp.addLayer(roadLayer);
							}
						} if (mapid == 'income') {
							if(layerGrp.hasLayer(incomeLayer)) {
								layerGrp.removeLayer(incomeLayer);
								map.removeControl(legend);
							} else {
								layerGrp.addLayer(incomeLayer);
								legend.addTo(map);
							}
						} if (mapid == 'district') {
							if(layerGrp.hasLayer(pDistLayer)) {
								layerGrp.removeLayer(pDistLayer);
							} else {
								layerGrp.addLayer(pDistLayer);
								}
						} if (mapid == 'overview') {
							if(layerGrp.hasLayer(overviewLayer)) {
								layerGrp.removeLayer(overviewLayer);
							} else {
								layerGrp.addLayer(overviewLayer);
								}
						}						

				});

				$("#sortable" ).on("sortupdate", function( event, ui) {		
					// layerGrp.clearLayers();
					var revList = [];
					$("#sortable li").each( function() {
						var mapid = $(this).attr('id');
						if(layerGrp.hasLayer(roadLayer) && mapid == 'road') {
							revList.push(mapid);
						} if(layerGrp.hasLayer(incomeLayer) && mapid == 'income') {
							revList.push(mapid);
						} if(layerGrp.hasLayer(pDistLayer) && mapid == 'district') {
							revList.push(mapid);
						} if(layerGrp.hasLayer(overviewLayer) && mapid == 'overview') {
							revList.push(mapid);
						}
					});

						layerGrp.clearLayers();

					for (var i = revList.length -1; i >= 0; i--) {
							// console.log(mapholder[i]);
						if(revList[i] == 'road') {
							layerGrp.addLayer(roadLayer);
						} if (revList[i] == 'income') {
							layerGrp.addLayer(incomeLayer);
						} if (revList[i] == 'district') {
							layerGrp.addLayer(pDistLayer);
						} if (revList[i] == 'overview') {
							layerGrp.addLayer(overviewLayer);
						}
					}
						layerGrp.addTo(map);
				});
					
// Closes the nested d3 function calls.
					$('#overlayLoading').css('display', 'none');			
				});
			});	
		});

			//Implement Overall Crime Data Layer
				var crime = L.markerClusterGroup();
				var points_rand = L.geoJson(sanfranCrimeData, {
    				onEachFeature: function (feature, layer)
        			{
				            layer.bindPopup(
				            	'<b>S/N:</b> ' + feature.properties.IncidntNum +'<br>'
				            	+ '<b>Category:</b> ' + feature.properties.Categorty + '<br>'
				            	+ '<b>Details</b> ' + feature.properties.Descript + '<br>'
				            	+ '<b>Date:</b> ' + feature.properties.Date + '<br>'
				            	+ '<b>Time:</b> ' + feature.properties.Time + '<br>');
        			}
        		});   
        		//crime.addLayer(points_rand);
				//map.addLayer(crime);  

			//Implement arson Crime Data Layer
				var arsonCrimeLayer = L.markerClusterGroup();
				var arsonPoints = L.geoJson(arsonCrimeData, {
    				onEachFeature: function (feature, layer)
        			{
			            layer.bindPopup(
			            	'<b>S/N:</b> ' + feature.properties.IncidntNum +'<br>'
			            	+ '<b>Category:</b> ' + feature.properties.Categorty + '<br>'
			            	+ '<b>Details</b> ' + feature.properties.Descript + '<br>'
			            	+ '<b>Date:</b> ' + feature.properties.Date + '<br>'
			            	+ '<b>Time:</b> ' + feature.properties.Time + '<br>');
        			}
        		});   
        		arsonCrimeLayer.addLayer(arsonPoints);

			//Implement assault Crime Data Layer
				var assaultCrimeLayer = L.markerClusterGroup();
				var assaultPoints = L.geoJson(assaultCrimeData, {
    				onEachFeature: function (feature, layer)
        			{
		            layer.bindPopup(
			            	'<b>S/N:</b> ' + feature.properties.IncidntNum +'<br>'
			            	+ '<b>Category:</b> ' + feature.properties.Categorty + '<br>'
			            	+ '<b>Details</b> ' + feature.properties.Descript + '<br>'
			            	+ '<b>Date:</b> ' + feature.properties.Date + '<br>'
			            	+ '<b>Time:</b> ' + feature.properties.Time + '<br>');
        			}
        		});   
        		assaultCrimeLayer.addLayer(assaultPoints);

			//Implement robbery Crime Data Layer
				var robberyCrimeLayer = L.markerClusterGroup();
				var robberyPoints = L.geoJson(robberyCrimeData, {
    				onEachFeature: function (feature, layer)
        			{
		            layer.bindPopup(
			            	'<b>S/N:</b> ' + feature.properties.IncidntNum +'<br>'
			            	+ '<b>Category:</b> ' + feature.properties.Categorty + '<br>'
			            	+ '<b>Details</b> ' + feature.properties.Descript + '<br>'
			            	+ '<b>Date:</b> ' + feature.properties.Date + '<br>'
			            	+ '<b>Time:</b> ' + feature.properties.Time + '<br>');
        			}
        		});   
        		robberyCrimeLayer.addLayer(robberyPoints); 


			//Implement drug Crime Data Layer
				var drugCrimeLayer = L.markerClusterGroup();
				var drugPoints = L.geoJson(drugCrimeData, {
    				onEachFeature: function (feature, layer)
        			{
		            layer.bindPopup(
			            	'<b>S/N:</b> ' + feature.properties.IncidntNum +'<br>'
			            	+ '<b>Category:</b> ' + feature.properties.Categorty + '<br>'
			            	+ '<b>Details</b> ' + feature.properties.Descript + '<br>'
			            	+ '<b>Date:</b> ' + feature.properties.Date + '<br>'
			            	+ '<b>Time:</b> ' + feature.properties.Time + '<br>');
        			}
        		});   
        		drugCrimeLayer.addLayer(drugPoints); 


			//Implement kidnap Crime Data Layer
				var kidnapCrimeLayer = L.markerClusterGroup();
				var kidnapPoints = L.geoJson(kidnapCrimeData, {
    				onEachFeature: function (feature, layer)
        			{
		            layer.bindPopup(
			            	'<b>S/N:</b> ' + feature.properties.IncidntNum +'<br>'
			            	+ '<b>Category:</b> ' + feature.properties.Categorty + '<br>'
			            	+ '<b>Details</b> ' + feature.properties.Descript + '<br>'
			            	+ '<b>Date:</b> ' + feature.properties.Date + '<br>'
			            	+ '<b>Time:</b> ' + feature.properties.Time + '<br>');
        			}
        		});   
        		kidnapCrimeLayer.addLayer(kidnapPoints);          		


			//Implement Prostitiution Crime Data Layer
				var prostitutionCrimeLayer = L.markerClusterGroup();
				var prostitutionPoints = L.geoJson(prostitutionCrimeData, {
    				onEachFeature: function (feature, layer)
        			{
		            layer.bindPopup(
			            	'<b>S/N:</b> ' + feature.properties.IncidntNum +'<br>'
			            	+ '<b>Category:</b> ' + feature.properties.Categorty + '<br>'
			            	+ '<b>Details</b> ' + feature.properties.Descript + '<br>'
			            	+ '<b>Date:</b> ' + feature.properties.Date + '<br>'
			            	+ '<b>Time:</b> ' + feature.properties.Time + '<br>');
        			}
        		});   
        		prostitutionCrimeLayer.addLayer(prostitutionPoints);   

			//Implement sex Crime Data Layer
				var sexCrimeLayer = L.markerClusterGroup();
				var sexPoints = L.geoJson(sexCrimeData, {
    				onEachFeature: function (feature, layer)
        			{
		            layer.bindPopup(
			            	'<b>S/N:</b> ' + feature.properties.IncidntNum +'<br>'
			            	+ '<b>Category:</b> ' + feature.properties.Categorty + '<br>'
			            	+ '<b>Details</b> ' + feature.properties.Descript + '<br>'
			            	+ '<b>Date:</b> ' + feature.properties.Date + '<br>'
			            	+ '<b>Time:</b> ' + feature.properties.Time + '<br>');
        			}
        		});   
        		sexCrimeLayer.addLayer(sexPoints);  

			//Implement weapon Crime Data Layer
				var weaponCrimeLayer = L.markerClusterGroup();
				var weaponPoints = L.geoJson(weaponCrimeData, {
    				onEachFeature: function (feature, layer)
        			{
		            layer.bindPopup(
			            	'<b>S/N:</b> ' + feature.properties.IncidntNum +'<br>'
			            	+ '<b>Category:</b> ' + feature.properties.Categorty + '<br>'
			            	+ '<b>Details</b> ' + feature.properties.Descript + '<br>'
			            	+ '<b>Date:</b> ' + feature.properties.Date + '<br>'
			            	+ '<b>Time:</b> ' + feature.properties.Time + '<br>');
        			}
        		});   
        		weaponCrimeLayer.addLayer(weaponPoints);   



			// Implement main crimeData
				var crimeCatMaps = {
					"Arson": arsonCrimeLayer,
					"Assault": assaultCrimeLayer,
					"Drug": drugCrimeLayer,
					"Kidnapping": kidnapCrimeLayer,
					"Prostitution": prostitutionCrimeLayer,
					"Robbery": robberyCrimeLayer,
					"Weapon": weaponCrimeLayer

				};
				var controls = L.control.layers(
					{}, crimeCatMaps, 
					{
						collapsed: false
						}
					).addTo(map);


				var legend = L.control({position: 'bottomright'});

					legend.onAdd = function (map) {

					    var div = L.DomUtil.create('div', 'income legend');

					        div.innerHTML = "<div class='income legend leaflet-control'><h3>Med Income Legend</h3>" +
					        "<i style='background:#FFEDA0'></i> $0 – $34923<br><i style='background:#FED976'></i> " +
					        "$34923 - $66784<br><i style='background:#FEB24C'></i> $66784 - $91172<br><i style='background:#FD8D3C'></i>"+
					        "$91172 - $120000<br><i style='background:#FC4E2A'></i> $120000 - $164135<br><i style='background:#E31A1C'></i>" + 
					        "> $164135<br></div>";
					            
					    return div;
					};



		});
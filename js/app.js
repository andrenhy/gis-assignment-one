
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
			d3.json('data/simpleRoad.geojson', function(err, road){
				d3.csv('data/sanfranPoliceStations.csv', function(err, station){
				//Implement Choropleth Layer
				// Some hack job for the lack of a colorBrewer script
				function getColor(d) {
				    return d > 71000  ? '#BD0026' :
				           d > 61000  ? '#E31A1C' :
				           d > 47920 ? '#FC4E2A' :
				           d > 35400 ? '#FD8D3C' :
				           d > 26404 ? '#FEB24C' :
				           d > 18000  ? '#FED976' : '#FFEDA0';
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
				        fillColor: getColor(feature.properties.Tract2000),
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

				var incomeLayer = L.geoJson(sanfranIncomeData,{style: style});



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

				var color = d3.scale.quantize()
								.domain(values)
								.range(['rgb(247,252,240)','rgb(224,243,219)','rgb(204,235,197)',
									'rgb(168,221,181)','rgb(123,204,196)','rgb(78,179,211)',
									'rgb(43,140,190)','rgb(8,88,158)']);

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

				var layerGrp = L.layerGroup([overviewLayer]);
				layerGrp.addTo(map);


			// Implement Layer Toggle

				$( "#sortable" ).sortable({
				  update: function( event, ui ) { 
				  }
				});

				$("#sortable li" ).click(function() {
					var mapid = $(this).attr('id');
						if(mapid == 'road') {
							if (layerGrp.hasLayer(roadLayer)) {
								layerGrp.removeLayer(roadLayer);
							} else {
								layerGrp.addLayer(roadLayer);
							}
						} if (mapid == 'income') {
							if(layerGrp.hasLayer(incomeLayer)) {
								map.removeLayer(incomeLayer);
							} else {
								layerGrp.addLayer(incomeLayer);
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
					layerGrp.clearLayers();
					var mapholder = [];
					$("#sortable li").each( function() {
						var mapid = $(this).attr('id');
						if(mapid == 'road') {
							mapholder.push(mapid);
						} if (mapid == 'income') {
							mapholder.push(mapid);
						} if (mapid == 'district') {
							mapholder.push(mapid);
						} if (mapid == 'overview') {
							mapholder.push(mapid);
						}
					});

					for (var i = mapholder.length -1 ; i >= 0; i--) {
							// console.log(mapholder[i]);
						if(mapholder[i] == 'road') {
							roadLayer.addTo(layerGrp);
						} if (mapholder[i] == 'income') {
							incomeLayer.addTo(layerGrp);
						} if (mapholder[i] == 'district') {
							pDistLayer.addTo(layerGrp);
						} if (mapholder[i] == 'overview') {
							overviewLayer.addTo(layerGrp);
						}
					}
						layerGrp.addTo(map);
				});
					

				 // $( "#sortable" ).on( "sortupdate", function( event, ui ) { 
				 //  	var arrayOfMaps = [];
				 //  	// layerGrp.removeLayers();
				 //  	$("#sortable li").each( function() {
				 //  		// var mapid = $(this).attr('id');
				 //  		// for (var i = mapArray.length-1; i >= 0 ; i--) {
				 //  		// 	if (mapid == mapArray[i].mapname) {
				 //  		// 		map.removeLayer(mapArray[i].layer);
				 //  		// 		arrayOfMaps.push(mapArray[i].layer);
				 //  		// 	}
				 //  		// }
				 //  	});
				 //  	// for (var i = mapArray.length-1; i >= 0 ; i--) {
				 //  	// 		map.addLayer(arrayOfMaps[i]);
				 //  	// 	}
				 //  	});

// Closes the nested d3 function calls.			
				});
			});	
		});

						//layerGrp.addTo(map);

				
				
				//Implement all crime data
				 //  $.getJSON("data/sanfranCrimeData.geojson", function(data) {
				 //   // Define the markercluster
				 //    var crimeMarkers = new L.MarkerClusterGroup();
				 //    var geojson = L.geoJson(data, {
				 //        onEachFeature: function (feature, layer) {
				 //            // Bind a popup with a chart populated with feature properties 
				 //            layer.bindPopup(
				 //            	'<b>S/N:</b> ' + feature.properties.IncidntNum +'<br>'
				 //            	+ '<b>Category:</b> ' + feature.properties.Categorty + '<br>'
				 //            	+ '<b>Details</b> ' + feature.properties.Descript + '<br>'
				 //            	+ '<b>Date:</b> ' + feature.properties.Date + '<br>'
				 //            	+ '<b>Time:</b> ' + feature.properties.Time + '<br>')
					// }	
				 //    });
				 //    // Put it all together
				 //    crimeMarkers.addLayer(geojson);
				 //    map.addLayer(crimeMarkers);    
				 //  });

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
        				layer.bindPopup(feature.properties.Descript);
        			}
        		});   
        		assaultCrimeLayer.addLayer(assaultPoints);

			//Implement robbery Crime Data Layer
				var robberyCrimeLayer = L.markerClusterGroup();
				var robberyPoints = L.geoJson(robberyCrimeData, {
    				onEachFeature: function (feature, layer)
        			{
        				layer.bindPopup(feature.properties.Descript);
        			}
        		});   
        		robberyCrimeLayer.addLayer(robberyPoints); 


			//Implement drug Crime Data Layer
				var drugCrimeLayer = L.markerClusterGroup();
				var drugPoints = L.geoJson(drugCrimeData, {
    				onEachFeature: function (feature, layer)
        			{
        				layer.bindPopup(feature.properties.Descript);
        			}
        		});   
        		drugCrimeLayer.addLayer(drugPoints); 


			//Implement kidnap Crime Data Layer
				var kidnapCrimeLayer = L.markerClusterGroup();
				var kidnapPoints = L.geoJson(kidnapCrimeData, {
    				onEachFeature: function (feature, layer)
        			{
        				layer.bindPopup(feature.properties.Descript);
        			}
        		});   
        		kidnapCrimeLayer.addLayer(kidnapPoints);          		


			//Implement Prostitiution Crime Data Layer
				var prostitutionCrimeLayer = L.markerClusterGroup();
				var prostitutionPoints = L.geoJson(prostitutionCrimeData, {
    				onEachFeature: function (feature, layer)
        			{
        				layer.bindPopup(feature.properties.Descript);
        			}
        		});   
        		prostitutionCrimeLayer.addLayer(prostitutionPoints);   

			//Implement sex Crime Data Layer
				var sexCrimeLayer = L.markerClusterGroup();
				var sexPoints = L.geoJson(sexCrimeData, {
    				onEachFeature: function (feature, layer)
        			{
        				layer.bindPopup(feature.properties.Descript);
        			}
        		});   
        		sexCrimeLayer.addLayer(sexPoints);  

			//Implement weapon Crime Data Layer
				var weaponCrimeLayer = L.markerClusterGroup();
				var weaponPoints = L.geoJson(weaponCrimeData, {
    				onEachFeature: function (feature, layer)
        			{
        				layer.bindPopup(feature.properties.Descript);
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
						title: 'Serious Crime Category',
						collapsed: false
						}
					).addTo(map);

		});
var NavControls = L.Control.extend({
  initialize: function(options){
    L.Util.setOptions(this, options);
  },

  onAdd: function(map){
    var container = L.DomUtil.create('div');
    var zoomControls = L.DomUtil.create('div', '', container);
    zoomControls.setAttribute('id', 'zoomControls');

    var zoomIn = L.DomUtil.create('div', 'zoomIn', zoomControls);
    zoomIn.innerHTML = '+';
    L.DomEvent.on(zoomIn, 'click', function(e){
      map.zoomIn();
    });

    var zoomOut = L.DomUtil.create('div', 'zoomOut', zoomControls);
    zoomOut.innerHTML = '-';
    L.DomEvent.on(zoomOut, 'click', function(e){
      map.zoomOut();
    });

    var latLngViewer = L.DomUtil.create('div', '', container);
    latLngViewer.setAttribute('id', 'latLngViewer');
    var center = map.getCenter();
    latLngViewer.innerHTML = 'Position: (' + center.lat + ', ' + center.lng + ')';

    map.on('mousemove', function(e){
      var center = e.latlng;
      var container = map.getContainer().querySelector('#latLngViewer');
      var lat = parseFloat(center.lat);

      var lng = parseFloat(center.lng);
      container.innerHTML = 'Position: (' + lat.toFixed(4) + ', ' + lng.toFixed(4) + ')';
    });
    
    return container;
  }
});
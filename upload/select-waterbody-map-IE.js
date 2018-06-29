if (!mapboxgl.supported()){
  const SERVER_URL = 'http://al-ng033.xtr.deltares.nl/verzilting/'

  var selectedIds = []

  // create mapbox component
  L.mapbox.accessToken = 'pk.eyJ1IjoiY2FtdmR2cmllcyIsImEiOiJjajA4NXdpNmswMDB2MzNzMjk4dGM2cnhzIn0.lIwd8N7wf0hx7mq-kjTcbQ';
  var map = L.mapbox.map('select-waterbody-map')
    .setView([51.798101, 4.307184], 9.49);
  var style = L.mapbox.styleLayer('mapbox://styles/mapbox/light-v9').addTo(map);


  // When map style is loaded add layers
  style.on('ready', function(e) {
    var waterbodies = L.mapbox.featureLayer().addTo(map);
    var waterbodiesoutline = L.mapbox.featureLayer().addTo(map);
    $.getJSON('../waterlichamen_43260.geojson', function(data) {
          waterbodiesoutline.setGeoJSON(data)
          waterbodiesoutline.setStyle(
            {
              color: 'black',
              fillOpacity: 0
            }
          )
          waterbodiesoutline.setFilter(function(feature) {
            return (feature.properties.owmident === 'all')
          })
          waterbodies.setGeoJSON(data)
          waterbodies.setStyle(
            {
              color: 'blue',
              fillColor: 'blue',
              fillOpacity: 0.5
            }
          )
    })

    waterbodies.on('mouseover', function(e) {
      waterbodiesoutline.setFilter(function(feature) {
        return ($.inArray(feature.properties.owmident, selectedIds.concat(e.layer.feature.properties.owmident)) !== -1)
      })
    })
    waterbodiesoutline.on('mouseout', function(e) {
      waterbodiesoutline.setFilter(function(feature) {
        return ($.inArray(feature.properties.owmident, selectedIds) !== -1)
      })
    })

    waterbodiesoutline.on('click', function(e) {
      var waterbodyId = e.layer.feature.properties.owmident
      if ($.inArray(waterbodyId, selectedIds) === -1) {
        selectedIds.push(waterbodyId)
      } else if ($.inArray(waterbodyId, selectedIds) !== -1) {
        selectedIds.splice($.inArray(waterbodyId, selectedIds), 1);
      }
      waterbodiesoutline.setFilter(function(feature) {
        return ($.inArray(feature.properties.owmident, selectedIds) !== -1)
      })
      document.getElementsByName("waterbody").value = selectedIds
    })
  });
}

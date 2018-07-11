if (!mapboxgl.supported()){
  const SERVER_URL = 'http://al-ng033.xtr.deltares.nl/verzilting/'
  const SERVER = 'http://d01518:8080/'
  var selectedIds = []
  var selectedNames = []

  // create mapbox component
  L.mapbox.accessToken = 'pk.eyJ1IjoiY2FtdmR2cmllcyIsImEiOiJjajA4NXdpNmswMDB2MzNzMjk4dGM2cnhzIn0.lIwd8N7wf0hx7mq-kjTcbQ';
  var map = L.mapbox.map('select-waterbody-map')
    .setView([51.798101, 4.307184], 9.49);
  var style = L.mapbox.styleLayer('mapbox://styles/mapbox/light-v9').addTo(map);


  // When map style is loaded add layers
  style.on('ready', function(e) {
    var waterbodies = L.mapbox.featureLayer().addTo(map);
    var waterbodiesoutline = L.mapbox.featureLayer().addTo(map);
    $.getJSON(SERVER + '/verzilting/waterlichamen_43260.geojson', function(data) {
          waterbodiesoutline.setGeoJSON(data)
          waterbodiesoutline.setStyle(
            {
              color: 'black',
              fillOpacity: 0
            }
          )
          waterbodiesoutline.setFilter(function(feature) {
            return (feature.properties.OWMIDENT === 'all')
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

    var tooltipSpan = document.getElementById('tooltip-span');
    window.onmousemove = function (e) {
        var x = e.clientX,
            y = e.clientY;
        tooltipSpan.style.top = (y + 20) + 'px';
        tooltipSpan.style.left = (x + 20) + 'px';
        tooltipSpan.style['z-index'] = '5';
    };

    waterbodies.on('mouseover', function(e) {
      waterbodiesoutline.setFilter(function(feature) {
        return ($.inArray(feature.properties.OWMIDENT, selectedIds.concat(e.layer.feature.properties.OWMIDENT)) !== -1)
      })
      tooltipSpan.style.display = 'block'
      tooltipSpan.innerHTML = e.layer.feature.properties.OWMNAAM
    })
    waterbodiesoutline.on('mouseout', function(e) {
      waterbodiesoutline.setFilter(function(feature) {
        return ($.inArray(feature.properties.OWMIDENT, selectedIds) !== -1)
      })
      tooltipSpan.style.display = 'none'
    })

    waterbodiesoutline.on('click', function(e) {
      var waterbodyId = e.layer.feature.properties.OWMIDENT
      var waterbodyName = e.layer.feature.properties.OWMNAAM
      if ($.inArray(waterbodyId, selectedIds) === -1) {
        selectedIds.push(waterbodyId)
        selectedNames.push(waterbodyName)
      } else if ($.inArray(waterbodyId, selectedIds) !== -1) {
        selectedIds.splice($.inArray(waterbodyId, selectedIds), 1);
        selectedNames.splice($.inArray(waterbodyName, selectedNames), 1);
      }
      waterbodiesoutline.setFilter(function(feature) {
        return ($.inArray(feature.properties.OWMIDENT, selectedIds) !== -1)
      })
      // NOTE: added field to show selectedNames
      document.getElementsByName("waterbody").value = selectedIds
      document.getElementById("waterbody-names").value = selectedNames

    })
  });
}

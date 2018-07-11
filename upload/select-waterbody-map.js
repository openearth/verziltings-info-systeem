console.log(mapboxgl.supported())

if (mapboxgl.supported()){
  const SERVER = 'http://d01518:8080/'
  const SERVER_URL = 'http://al-ng033.xtr.deltares.nl/verzilting/'
  var selectedIds = []
  var selectedNames = []

  // create mapbox component
  mapboxgl.accessToken = 'pk.eyJ1IjoiY2FtdmR2cmllcyIsImEiOiJjajA4NXdpNmswMDB2MzNzMjk4dGM2cnhzIn0.lIwd8N7wf0hx7mq-kjTcbQ';
  var map = new mapboxgl.Map({
    container: 'select-waterbody-map', // container id
    style: 'mapbox://styles/mapbox/light-v9', // stylesheet location
    center: [4.307184, 51.798101], // starting position [lng, lat]
    zoom: 7.5,
    pitch: 0,
    bearing: 0
  });

  // When map style is loaded add layers
  map.on('load', function(e) {

    // Add the geojson with waterbodies as a layer
    map.addLayer({
      'id': 'waterbodies',
      'type': 'fill',
      'source': {
        'type': 'geojson',
        'data': SERVER + 'verzilting/waterlichamen_43260.geojson'
      },
      'layout': {},
      'paint': {
        'fill-color': 'blue',
        'fill-opacity': 0.2
      }
    });

    map.addLayer({
      'id': 'waterbodies-outline',
      'type': 'line',
      'source': {
        'type': 'geojson',
        'data': SERVER + 'verzilting/waterlichamen_43260.geojson'
      },
      'layout': {},
      'paint': {
        'line-color': 'black',
        'line-width': 3
      },
      'filter': ['==', 'db_id', '']
    });

    // Add the geocoder and navigation tools
    map.addControl(new mapboxgl.NavigationControl());
    var tooltipSpan = document.getElementById('tooltip-span');
    window.onmousemove = function (e) {
        var x = e.clientX,
            y = e.clientY;
        tooltipSpan.style.top = (y + 20) + 'px';
        tooltipSpan.style.left = (x + 20) + 'px';
        tooltipSpan.style['z-index'] = '5';
    };
    // Add functionality to show outlined polygons when hovered over
    map.on('mousemove', 'waterbodies', function (e) {
      map.setFilter('waterbodies-outline', ['in', 'OWMIDENT'].concat(selectedIds).concat(e.features[0].properties.OWMIDENT))
      map.getCanvas().style.cursor = 'pointer'
      tooltipSpan.style.display = 'block'
      tooltipSpan.innerHTML = e.features[0].properties.OWMNAAM
    })

    map.on('mouseleave', 'waterbodies', function (e) {
      map.setFilter('waterbodies-outline', ['in', 'OWMIDENT'].concat(selectedIds))
      map.getCanvas().style.cursor = ''
      tooltipSpan.style.display = 'none'
    })

    map.on('click', 'waterbodies', function (e) {
      var features = map.queryRenderedFeatures(e.point);
      var waterbodyId = e.features[0].properties.OWMIDENT
      var waterbodyName = e.features[0].properties.OWMNAAM
      if ($.inArray(waterbodyId, selectedIds) === -1) {
        selectedIds.push(waterbodyId)
        selectedNames.push(waterbodyName)
      } else if ($.inArray(waterbodyId, selectedIds) !== -1) {
        selectedIds.splice($.inArray(waterbodyId, selectedIds), 1);
        selectedNames.splice($.inArray(waterbodyName, selectedNames), 1);
      }
      map.setFilter('waterbodies-outline', ['in', 'OWMIDENT'].concat(selectedIds))
      // NOTE: added field to show selectedNames
      document.getElementById("waterbody").value = selectedIds
      document.getElementById("waterbody-names").value = selectedNames

    })
  });
}

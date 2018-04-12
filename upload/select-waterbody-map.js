var selectedIds = []

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
      'data': './waterlichamen_43260.geojson'
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
      'data': './waterlichamen_43260.geojson'
    },
    'layout': {},
    'paint': {
      'line-color': 'black',
      'line-width': 3
    },
    'filter': ['==', 'db_id', '']
  });

  // Add the geocoder and navigation tools
  map.addControl(new MapboxGeocoder({
    accessToken: mapboxgl.accessToken
  }));
  map.addControl(new mapboxgl.NavigationControl());

  // Add functionality to show outlined polygons when hovered over
  map.on('mousemove', 'waterbodies', (e) => {
    map.setFilter('waterbodies-outline', ['in', 'owmident'].concat(selectedIds).concat(e.features[0].properties.owmident))
    map.getCanvas().style.cursor = 'pointer'
  })

  map.on('mouseleave', 'waterbodies', (e) => {
    map.setFilter('waterbodies-outline', ['in', 'owmident'].concat(selectedIds))
    map.getCanvas().style.cursor = ''
  })

  map.on('click', 'waterbodies', (e) => {
    var features = map.queryRenderedFeatures(e.point);
    var waterbodyId = e.features[0].properties.owmident
    if ($.inArray(waterbodyId, selectedIds) === -1) {
      selectedIds.push(waterbodyId)
    } else if ($.inArray(waterbodyId, selectedIds) !== -1) {
      selectedIds.splice($.inArray(waterbodyId, selectedIds), 1);
    }
    map.setFilter('waterbodies-outline', ['in', 'owmident'].concat(selectedIds))
    document.getElementById("waterbody").value = selectedIds
  })
});

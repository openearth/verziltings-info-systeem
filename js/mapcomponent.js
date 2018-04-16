const SERVER_URL = 'http://al-ng033.xtr.deltares.nl/verzilting'

// create mapbox component
mapboxgl.accessToken = 'pk.eyJ1IjoiY2FtdmR2cmllcyIsImEiOiJjajA4NXdpNmswMDB2MzNzMjk4dGM2cnhzIn0.lIwd8N7wf0hx7mq-kjTcbQ';
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/light-v9', // stylesheet location
  center: [4.307184, 51.798101], // starting position [lng, lat]
  zoom: 9.49,
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
    map.setFilter('waterbodies-outline', ['==', 'owmident', e.features[0].properties.owmident])
    map.getCanvas().style.cursor = 'pointer'
  })
  map.on('mouseleave', 'waterbodies', (e) => {
    map.setFilter('waterbodies-outline', ['==', 'owmident', ''])
    map.getCanvas().style.cursor = ''
    // $('#document-title').html("")
    // var t = $("table#results thead").empty()
    // var t = $("table#results tbody").empty()
  })

  map.on('click', 'waterbodies', (e) => {
    var features = map.queryRenderedFeatures(e.point);
    console.log(features)

    var waterbodyId = e.features[0].properties.owmident
    $.ajax({
      url: SERVER_URL + 'php/verzilting.php',
      data: {
        'function': 'getDocumentsByWaterbodyId',
        'id': waterbodyId
      },
      type: 'GET',
      headers: {  'Access-Control-Allow-Origin': '*' }
    }).done(function(data) {
      var documents = JSON.parse(data);


      // $('#documents').css("display", "auto")
      var t = $("table#results tbody").empty()
      $('#document-title').html("Documenten voor waterlichaam: " + e.features[0].properties.owmnaam)
      $.each(documents, (ind, val ) => {
        $("<tr> \
            <td class='results'> \
              <i>" + val.Title + '</i> by: ' + val.Authors + " <br> "
              + val.Project + " \
            </td> \
          </tr>").appendTo(t)
        .click((data) => {
          window.open(SERVER_URL + val.Link, '_blank')
        })
      })
    });

  })
});

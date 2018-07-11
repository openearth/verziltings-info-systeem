if (mapboxgl.supported()){
  const SERVER = 'http://d01518:8080/'
  const SERVER_URL = 'http://al-ng033.xtr.deltares.nl/verzilting/'
  var selectedIds = []

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
    map.on('mousemove', 'waterbodies', function(e) {
      map.setFilter('waterbodies-outline', ['in', 'OWMIDENT'].concat(selectedIds).concat(e.features[0].properties.OWMIDENT))
      map.getCanvas().style.cursor = 'pointer'
      tooltipSpan.style.display = 'block'
      tooltipSpan.innerHTML = e.features[0].properties.OWMNAAM
    })
    map.on('mouseleave', 'waterbodies', function(e) {
      map.setFilter('waterbodies-outline', ['in', 'OWMIDENT'].concat(selectedIds))
      map.getCanvas().style.cursor = ''
      tooltipSpan.style.display = 'none'
    })

    map.on('click', 'waterbodies', function(e) {
      var features = map.queryRenderedFeatures(e.point);
      var waterbodyId = e.features[0].properties.OWMIDENT
      var owmnaam = e.features[0].properties.OWMNAAM
      if ($.inArray(waterbodyId, selectedIds) === -1) {
        selectedIds = []
        selectedIds.push(waterbodyId)
        map.setFilter('waterbodies-outline', ['in', 'OWMIDENT'].concat(selectedIds))
        document.getElementById("documents").style.display = "block";
      } else if ($.inArray(waterbodyId, selectedIds) !== -1) {
        selectedIds = []
        document.getElementById("documents").style.display = "none";
        $('#document-title').html("")
        var t = $("table#results thead").empty()
        var t = $("table#results tbody").empty()
      }

      if (selectedIds.length !== 0) {
        $.ajax({
          url: SERVER_URL + 'php/verzilting.php',
          data: {
            'function': 'getDocumentsByWaterbodyId',
            'id': waterbodyId
          },
          type: 'GET',
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        }).done(function(data) {
          var documents = JSON.parse(data);
          // sort document list to date
          documents = documents.sort(function(a, b) {
              a = new Date(Number(a.Date));
              b = new Date(Number(b.Date));
              return a>b ? -1 : a<b ? 1 : 0;
          });
          var t = $("#results").empty()
          $('#document-title').html("Documenten voor waterlichaam: " + owmnaam)

          $.each(documents, function(ind, val) {
            var dt = new Date(Number(val.Date));
            $("<button class='collapsible'> <i>" + val.Title + "</i> by: " + val.Authors + "</button> \
                <div class='content'> \
                  <p> <u> Abstract:</u>" + val.Abstract + " <br> \
                  <u> Datum:</u> " + dt.getFullYear() + "/" + (dt.getMonth() + 1) + "/" + dt.getDate() + " <br> \
                  <u> Organisation:</u> " + val.Organisation + " </p> \
                  <button onclick='window.open(&quot;" + SERVER_URL + val.Link + "&quot;, &quot;_blank&quot;)' class='btn'><i class='fa fa-file'></i></button> \
                </div>").appendTo(t)
            .click(function(data){
              var content = data.target.nextSibling.nextElementSibling
              if (content.style.display === "block") {
                content.style.display = "none";
              } else {
                content.style.display = "block";
              }
            })
          })
        });
      }
    })
  });
}

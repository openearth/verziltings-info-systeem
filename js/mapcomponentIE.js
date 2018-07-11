if (!mapboxgl.supported()){
  const SERVER = 'http://d01518:8080/'
  const SERVER_URL = 'http://al-ng033.xtr.deltares.nl/verzilting/'
  var selectedIds = []

  // create mapbox component
  L.mapbox.accessToken = 'pk.eyJ1IjoiY2FtdmR2cmllcyIsImEiOiJjajA4NXdpNmswMDB2MzNzMjk4dGM2cnhzIn0.lIwd8N7wf0hx7mq-kjTcbQ';

  var map = L.mapbox.map('map')
    .setView([51.798101, 4.307184], 9.49);
  var style = L.mapbox.styleLayer('mapbox://styles/mapbox/light-v9').addTo(map);

  // When map style is loaded add layers
  style.on('ready', function(e) {
    var waterbodies = L.mapbox.featureLayer().addTo(map);
    var waterbodiesoutline = L.mapbox.featureLayer().addTo(map);
    $.getJSON(SERVER + 'verzilting/waterlichamen_43260.geojson', function(data) {


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

    // Add functionality to show outlined polygons when hovered over
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
      if ($.inArray(waterbodyId, selectedIds) === -1) {
        selectedIds = []
        selectedIds.push(waterbodyId)
        waterbodiesoutline.setFilter(function(feature) {
          return ($.inArray(feature.properties.OWMIDENT, selectedIds) !== -1)
        })
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

          var t = $("#results").empty()
          $('#document-title').html("Documenten voor waterlichaam: " + e.layer.feature.properties.OWMNAAM)
          $.each(documents, function(ind, val) {
            var d = new Date(Number(val.Date));
            var year = d.getFullYear();
            $("<button class='collapsible'> <i>" + val.Title + "</i> by: " + val.Authors + "</button> \
                <div class='content'> \
                  <p> <u> Abstract:</u>" + val.Abstract + " <br> \
                  <u> Jaar:</u> " + year + " <br> \
                  <u> Organisation:</u> " + val.Organisation + " </p> \
                  <button onclick='window.open(&quot;" + SERVER_URL + val.Link + "&quot;, &quot;_blank&quot;)' class='btn'><i class='fa fa-file'></i></button> \
                </div>")
            .appendTo(t)
            .click(function(clickeddata){
              console.log(clickeddata)
              var content = clickeddata.target.nextElementSibling
              console.log(content)
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

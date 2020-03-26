// this is my mapboxGL token
// the base style includes data provided by mapbox, this links the requests to my account
mapboxgl.accessToken = 'pk.eyJ1IjoiY3dob25nLXFyaSIsImEiOiJjazZncWRkZGowb3kyM25vZXkwbms2cW0xIn0.lbwola6y7YDdaKLMdjif1g';

// we want to return to this point and zoom level after the user interacts
// with the map, so store them in variables
var initialCenterPoint = [-70.942970, 41.654956]
var initialZoom = 10

//This is the lookup code for the soils layer [awc_soil.geojson]
var LandUseLookupSoil = (code) => {
  switch (code) {
    case 0:
      return {
        color: '#B8860B',
        description: 'Freetown muck, 0 to 1 percent slopes',
      };
    case 1:
      return {
        color: '#CD853F',
        description: 'Freetown, 0 to 1 percent slopes, ponded',
      };
    case 2:
      return {
        color: '#D2691E',
        description: 'Swansea Muck, 0 to 1 percent slopes',
      };
    case 3:
      return {
        color: '#8B4513',
        description: 'Whitman Sandy Loam, 0 to 3 percent slopes, extremely stony',
      };
    case 4:
      return {
        color: '#a2b9bc',
        description: 'Dumps',
      };
    case 5:
      return {
        color: '#b2ad7f',
        description: 'Pits - Udorthents Complex, gravelly',
      };
    case 6:
      return {
        color: '#878f99',
        description: 'Udorthents, smoothed',
      };
    case 7:
      return {
        color: '#6b5b95',
        description: 'Urban Land',
      };

      }
    };


// set the default text for the feature-info div

var defaultText = '<p>Move the mouse over the map to get more info on a selected feature</p>'
$('#feature-info').html(defaultText)

// create an object to hold the initialization options for a mapboxGL map
var initOptions = {
  container: 'map-container', // put the map in this container
  style: 'mapbox://styles/mapbox/dark-v10', // use this basemap
  center: initialCenterPoint, // initial view center
  zoom: initialZoom, // initial view zoom level (0-18)
}

// create the new map
var map = new mapboxgl.Map(initOptions);

//disable the scroll bar

map.scrollZoom.disable();



// Add 3 popups  of typical areas of study
new mapboxgl.Marker(1)
  .setLngLat([-70.968588,41.687658])
  .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
   .setHTML('Atlantic White Cedar Swamp'))
  .addTo(map);


  new mapboxgl.Marker(2)
    .setLngLat([-70.928274,41.640380])
    .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
     .setHTML('Urban Land'))
    .addTo(map);

  new mapboxgl.Marker(3)
    .setLngLat([-70.954930, 41.748998])
    .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
      .setHTML('Freetown Muck'))
    .addTo(map);





// wait for the initial style to Load
map.on('style.load', function() {

  // add soil source layer from our external data folder
  map.addSource('soil-layer', {
    type: 'geojson',
    data: './data/awc_soil.geojson',
  });



  // let's make sure the source got added by logging the current map state to the console
  console.log(map.getStyle().sources)

  // add soils layer
  map.addLayer({
    id: 'Wetland Soils',
    type: 'fill',
    source: 'soil-layer',
    paint: {
      'fill-opacity': 0.3,
      'fill-color': {
        type: 'categorical',
        property: 'mukey',
        stops: [
          [
            '779958',
            LandUseLookupSoil(0).color, //I think I can change these back to 0,1, etc..
          ],
          [
            '779962',
            LandUseLookupSoil(1).color,
          ],
          [
            '780106',
            LandUseLookupSoil(2).color,
          ],
          [
            '780131',
            LandUseLookupSoil(3).color,
          ],

        ]
      }
    }
  })

  // add urban fill layer from our external data folder
    map.addSource('urban-fill-layer', {
      type: 'geojson',
      data: './data/urban_fill.geojson',
    });

// try to console
//console.log(map.getStyle().sources)

// add urban fill layer
    map.addLayer({
      id: 'Urban Fill (Udorthents)',
      type: 'fill',
      source: 'urban-fill-layer',
      paint: {
        'fill-opacity': 0.3,
        'fill-color': {
          type: 'categorical',
          property: 'mukey',
          stops: [
            [
              '779955',
              LandUseLookupSoil(4).color, //I think I can change these back to 0,1, etc..
            ],
            [
              '780066',
              LandUseLookupSoil(5).color,
            ],
            [
              '780111',
              LandUseLookupSoil(6).color,
            ],
            [
              '780113',
              LandUseLookupSoil(7).color,
            ],

          ]
        }
      }
    })
  // add Atlantic White Cedar Layer from our external data folder
  //Instead of explictly calling a function just call the color here as its only 1
  map.addSource('awc-wetland-layer', {
    type: 'geojson',
    data: './data/awc_wetland.geojson',
    });


    map.addLayer({
      id: 'Atlantic White Cedar Swamp ', //original Atlantic White Cedar Swamp
      type: 'fill',
      source: 'awc-wetland-layer',
      paint: {
           'fill-opacity': 0.9,
           'fill-color': '#2A542B',
         }
       });

console.log(map.getStyle().sources)
  // add an empty data source, which we will use to highlight the lot the user is hovering over
  map.addSource('highlight-feature', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  })

  // add a layer for the highlighted polygon
  map.addLayer({
    id: 'highlight-line',
    type: 'line',
    source: 'highlight-feature',
    paint: {
      'line-width': 2,
      'line-opacity': 0.9,
      'line-color': 'white',
    }
  });

// Toggle layers in a little box on the right hand
  var toggleableLayerIds = [ 'Atlantic White Cedar Swamp ', 'Wetland Soils', 'Urban Fill (Udorthents)'];

  for (var i = 0; i < toggleableLayerIds.length; i++) {
      var id = toggleableLayerIds[i];

      var link = document.createElement('a');
      link.href = '#';
      link.className = 'active';
      link.textContent = id;

      link.onclick = function (e) {
          var clickedLayer = this.textContent;
          e.preventDefault();
          e.stopPropagation();

          var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

          if (visibility === 'visible') {
              map.setLayoutProperty(clickedLayer, 'visibility', 'none');
              this.className = '';
          } else {
              this.className = 'active';
              map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
          }
      };

      var layers = document.getElementById('menu');
      layers.appendChild(link);
  }

  map.on('mousemove', function (e) {
    // query for the features under the mouse, but only in the lots layer
    var features = map.queryRenderedFeatures(e.point, {
        layers: ['Wetland Soils', 'Urban Fill (Udorthents)', 'Atlantic White Cedar Swamp '],
    });

    // if the mouse pointer is over a feature on our layer of interest
    // take the data for that feature and display it in the sidebar
    if (features.length > 0) {
      map.getCanvas().style.cursor = 'pointer';  // make the cursor a pointer

      var hoveredFeature = features[0]
      var featureInfo = `
        <h4>${hoveredFeature.properties.mapunit_na}</h4>
        <p><strong>Land Use:</strong> ${LandUseLookupSoil(parseInt(hoveredFeature.properties.mukey))}</p>
        <p><strong>Shape Area :</strong> ${hoveredFeature.properties.Shape_Area}</p>

        <h4>${hoveredFeature.properties.IT_VALDESC} </h4>
        <p><strong> Shape Area (SqMi) </strong> ${hoveredFeature.properties.AREASQMI}</p>

      `
      $('#feature-info').html(featureInfo)

      // set this lot's polygon feature as the data for the highlight source
      map.getSource('highlight-feature').setData(hoveredFeature.geometry);
    } else {
      // if there is no feature under the mouse, reset things:
      map.getCanvas().style.cursor = 'default'; // make the cursor default

      // reset the highlight source to an empty featurecollection
      map.getSource('highlight-feature').setData({
        type: 'FeatureCollection',
        features: []
      });

      // reset the default message
      $('#feature-info').html(defaultText)
    }
  })

})

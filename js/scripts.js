// this is my mapboxGL token
// the base style includes data provided by mapbox, this links the requests to my account
mapboxgl.accessToken = 'pk.eyJ1IjoiY3dob25nLXFyaSIsImEiOiJjazZncWRkZGowb3kyM25vZXkwbms2cW0xIn0.lbwola6y7YDdaKLMdjif1g';

// we want to return to this point and zoom level after the user interacts
// with the map, so store them in variables
var initialCenterPoint = [-70.942970, 41.654956]
var initialZoom = 10

//This is the lookup code for the all layers - converted layers in QGIS to have matching codes
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
    case 8:
      return {
        color: '#2A542B',
          description: 'Atlantic White Cedar Swamp',
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

var nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-left');


// Add 3 popups  of typical areas of study
new mapboxgl.Marker(1)
  .setLngLat([-70.968588, 41.687658])
  .setPopup(new mapboxgl.Popup({
      offset: 0
    }) // add popups
    .setHTML('<strong>Atlantic White Cedar Swamp (Wooded Swamp Coniferous)</strong><p>Freshwater Wetlands that extend from mid Maine to mid Florida within 200km of the coast. They grow primarily in organic soils commonly known as "peat" and "muck". They occupy only a fraction of their former range. </p><img src="https://upload.wikimedia.org/wikipedia/commons/8/8e/2013-05-10_13_55_05_Atlantic_White_Cedar_swamp_along_the_Mount_Misery_Trail_in_Brendan_T._Byrne_State_Forest.JPG" height="175" width="200">'))
  .addTo(map);

//create a marker for urban land and add text and image to pop up - there has to be a better way to do this
new mapboxgl.Marker(2)
  .setLngLat([-70.927497, 41.679681])
  .setPopup(new mapboxgl.Popup({
      offset: 0
    }) // add popups
    .setHTML('<strong>Urban Fill </strong><p> Typical of urbanized areas where the landscape was often filled with material from quarrys and gravel pits to support large buildings and roads. They can contain various materials including human waste, heavy metals, and coal ash. </p> <img src="https://e2s.us/wp-content/uploads/2015/01/E2S_York-PA-Brownfield-Remediation-Urban-Fill.jpg" height="175" width="200">'))
  .addTo(map);

// create a marker for freetown muck and add text and image to pop up
new mapboxgl.Marker(3)
  .setLngLat([-70.954930, 41.748998])
  .setPopup(new mapboxgl.Popup({
      offset: 0
    }) // add popups
    .setHTML('<strong> Freetown & Swansea Muck  </strong><p> These soils are generally classified as very wet soils that are fromed in highly decompossed organic material. These bogs can form in ancient glaical lakes and alluvial plains. Generally these soils are forested and are not suitable for agriculture. The main agricultural product produced in these soils are Cranberries! </p><img src="https://thedailyadventuresofme.com/wp-content/uploads/2018/10/submerged-cranberry-bog-e1540472741339.jpg" height="175" width="200">'))
  .addTo(map);



// wait for the initial style to Load
map.on('style.load', function() {


  // add soil source layer from our external data folder
  map.addSource('soil-layer', {
    type: 'geojson',
    data: './data/awc_soil.geojson',
  });


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
      'fill-color': {
        type: 'categorical',
        property: 'mukey',
        stops: [
          [
            'WS2',
            LandUseLookupSoil(8).color, //I think I can change these back to 0,1, etc..
          ]


        ]
      }
    }
  })

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
  var toggleableLayerIds = ['Atlantic White Cedar Swamp ', 'Wetland Soils', 'Urban Fill (Udorthents)'];

  for (var i = 0; i < toggleableLayerIds.length; i++) {
    var id = toggleableLayerIds[i];

    var link = document.createElement('a');
    link.href = '#';
    link.className = 'active';
    link.textContent = id;

    link.onclick = function(e) {
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

  map.on('mousemove', function(e) {
    // query for the features under the mouse, but only in the lots layer
    var features = map.queryRenderedFeatures(e.point, {
      layers: ['Wetland Soils', 'Urban Fill (Udorthents)', 'Atlantic White Cedar Swamp '],
    });

    // if the mouse pointer is over a feature on our layer of interest
    // take the data for that feature and display it in the sidebar
    if (features.length > 0) {
      map.getCanvas().style.cursor = 'pointer'; // make the cursor a pointer

      var hoveredFeature = features[0]
      var featureInfo = `
        <h2>${hoveredFeature.properties.mapunit_na}</h2>



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

// this is my mapboxGL token
// the base style includes data provided by mapbox, this links the requests to my account
mapboxgl.accessToken = 'pk.eyJ1IjoiY3dob25nLXFyaSIsImEiOiJjazZncWRkZGowb3kyM25vZXkwbms2cW0xIn0.lbwola6y7YDdaKLMdjif1g';

// we want to return to this point and zoom level after the user interacts
// with the map, so store them in variables
var initialCenterPoint = [-70.9024, 41.6250]
var initialZoom = 13

var LandUseLookup = (code) => {
  switch (code) {
    case 0:
      return {
        color: '#8A2BE2',
        description: 'EDGE OF OPEN OCEAN',
      };
    case 1:
      return {
        color: '#f4f455',
        description: 'SHORELINE',
      };
    case 2:
      return {
        color: '#f7d496',
        description: 'CLOSURE LINE',
      };
    case 3:
      return {
        color: '#FF9900',
        description: 'APPARENT WETLAND LIMIT',
      };
      case 7:
        return {
          color: '#00FFFF',
          description: 'HYDROLOGIC CONNECTION',
        };
        case 8:
          return {
            color: '#7FFF00',
            description: 'MEAN LOW WATER LINE',
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

// add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

// wait for the initial style to Load
map.on('style.load', function() {

  // add a geojson source to the map using our external geojson file
  map.addSource('wetlands-layer', {
    type: 'geojson',
    data: './data/wetlands-nb.geojson',
  });

  // let's make sure the source got added by logging the current map state to the console
  console.log(map.getStyle().sources)

  // add a layer for our custom source
  map.addLayer({
    id: 'fill-wetlands-nb',
    type: 'fill',
    source: 'wetlands-layer',
    paint: {
      'fill-color': {
        type: 'categorical',
        property: 'LandUse',
        stops: [
          [
            '00',
            LandUseLookup(0).color,
          ],
          [
            '01',
            LandUseLookup(1).color,
          ],
          [
            '02',
            LandUseLookup(2).color,
          ],
          [
            '03',
            LandUseLookup(3).color,
          ],
          [
            '07',
            LandUseLookup(7).color,
          ],
          [
            '08',
            LandUseLookup(8).color,
          ],



        ]
      }
    }
  })

  // add an empty data source, which we will use to highlight the lot the user is hovering over
  map.addSource('highlight-feature', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  })

  // add a layer for the highlighted lot
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

  // listen for the mouse moving over the map and react when the cursor is over our data

  map.on('mousemove', function (e) {
    // query for the features under the mouse, but only in the lots layer
    var features = map.queryRenderedFeatures(e.point, {
        layers: ['fill-wetlands-nb'],
    });

    // if the mouse pointer is over a feature on our layer of interest
    // take the data for that feature and display it in the sidebar
    if (features.length > 0) {
      map.getCanvas().style.cursor = 'pointer';  // make the cursor a pointer

      var hoveredFeature = features[0]
      var featureInfo = `
        <h4>${hoveredFeature.properties.Address}</h4>
        <p><strong>Type of Wetland :</strong> ${LandUseLookup(parseInt(hoveredFeature.properties.arc_code)).description}</p>
        <p><strong>Zoning:</strong> ${hoveredFeature.properties.arc_code_d}</p>
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

var initialCenter = [39.980556, -83.041111]
var initialZoom = 14

parcelProps = {
    "PARCELID":"Parcel ID",
    "RESYRBLT":"Year built",
    "RESSTRTYP":"Structure type",
    "RESFLRAREA":"Floor area",
    "HEIGHT":"Stories",
    "ACRES":"Acres",
    "ROOMS":"Rooms",
    "BEDRMS":"Bedrooms",
    "BATHS":"Bathrooms",
    "BASEMENT":"Basement",
    "WALL":"Exterior",
    "AIRCOND":"HVAC",
    "FIREPLC":"Fireplaces",
    "TOTVALUEBASE":"Total value",
    "LNDVALUEBASE":"Land value",
    "BLDVALUEBASE":"Improvement value",
    "SALEPRICE":"Sale price",
    "SALEDATE":"Sale date",
    "OWNERNME1":"Owner name",
    "RENTAL":"Rental",
    "CLASSCD":"Land-use code",
    "NBHDCD":"Neighborhood code",
    "SITEADDRESS":"Address",
}    


// Define all layer properties in this object.  All layers will be
// created automatically
layerDef = {
    'streets': {
	'group': 'baseLayers',
	'type': 'L.esri.basemapLayer',
	'title': 'Streets',
 	'addToMap': true
    },
    'imagery': {
	'group': 'baseLayers',
	'type': 'L.esri.basemapLayer',
	'title': 'Imagery'
    },

    'gray': {
	'group': 'baseLayers',
	'type': 'L.esri.basemapLayer',
	'title': 'Gray'
    },
    'parcels': {
	'group': 'featureLayers',
	'type': 'L.esri.featureLayer',
	'title': 'Parcels (all)',
	'url': 'http://maps.franklincountyauditor.com/fcaags/rest/services/Parcels/ParcelFeatures/MapServer/0',
	'style': {
            'color': 'blue',
            'weight': 2,
            'opacity': 0.5,

            'fillOpacity': 0
	   
	},
	'minZoom': 16,
	'popupTemplate': function (layer) {
	    return L.Util.template('<p>OID: {objectid}<br>Parcel ID: {PARCELID}<br>Acres: {acres}<br>Market value: {mkttotval}</p>', layer.feature.properties)
	},
    },
}

var baseLayers = {};
var featureLayers = {};
var featureLayersList = {};
var baseLayersList = {};

var map = L.map('map', {
    'doubleClickZoom': false,
    'preferCanvas': true,
    'zoomControl': false
}).setView(initialCenter, initialZoom);

var baseBounds = map.getBounds()
//L.rectangle(baseBounds).addTo(map)

var zoomControl = L.control.zoom({
    position: 'bottomright'
})
map.addControl(zoomControl)

// Load all layers defined in layerDef
for (var layerId in layerDef){

    // Start defining layer options. Interface-specific options are added below.
    var layerOptions = {}

    if (layerDef[layerId].group == 'featureLayers'){

	// If style is defined, set layer style
	if (layerDef[layerId].hasOwnProperty('style')){
 	    layerOptions['style'] = layerDef[layerId].style
	}

	
	// If marker style (i.e. pointToLayer) is defined, configure
	// pointToLayer
	if (layerDef[layerId].hasOwnProperty('pointToLayer')){
 	    layerOptions['pointToLayer'] = layerDef[layerId].pointToLayer
	}
	
	
	// If display is restricted above a minimum zoom level, set
	// minZoom
	if (layerDef[layerId].hasOwnProperty('minZoom')){
 	    layerOptions['minZoom'] = layerDef[layerId].minZoom
	}

	if (layerDef[layerId].type == 'L.esri.featureLayer'){
	    
	    // 'url' is the only mandatory property for esri featureLayer
	    layerOptions['url'] = layerDef[layerId].url
	    
	    // If layer features are filtered (i.e. a "where" condition is
	    // defined), set the where condition
	    if (layerDef[layerId].hasOwnProperty('where')){
		layerOptions['where'] = layerDef[layerId].where
	    }
	    
	    // Create the layer
	    featureLayers[layerId] =  L.esri.featureLayer( layerOptions )
	    
	} else if (layerDef[layerId].type == 'L.geoJSON'){

	    // Create the layer from a geoJSON object in memory
	    featureLayers[layerId] =  L.geoJSON( layerDef[layerId].object, layerOptions )

	} else {
	    console.log("Feature layer type not recognized")
	}

	// Add layer to layer control
	featureLayersList[layerDef[layerId].title] = featureLayers[layerId]

	// If popup template is defined, bind popup
	if (layerDef[layerId].hasOwnProperty("popupTemplate")){
	    featureLayers[layerId].bindPopup( layerDef[layerId].popupTemplate )
	}

	// If addToMap property is true, turn the layer on
	if(layerDef[layerId].hasOwnProperty('addToMap')){
	    if(layerDef[layerId].addToMap){
		map.addLayer(featureLayers[layerId])
	    }
	}
	
    } else if (layerDef[layerId].group == 'baseLayers'){
	if (layerDef[layerId].type == 'L.esri.basemapLayer'){
	    baseLayers[layerId] =  L.esri.basemapLayer(layerDef[layerId].title)
	} else if (layerDef[layerId].type == 'L.esri.imageMapLayer'){
	    
	    // 'url' is the only mandatory property for esri featureLayer
	    layerOptions['url'] = layerDef[layerId].url

	    // Create the layer
	    baseLayers[layerId] = L.esri.imageMapLayer({
		url: layerOptions.url,
	    })
	    
	} else {
	    console.log("Base layer type not recognized")
	}

	// Add layer to layer control
	baseLayersList[layerDef[layerId].title] = baseLayers[layerId]

	// If addToMap property is true, turn the layer on
	if(layerDef[layerId].hasOwnProperty('addToMap')){
	    if(layerDef[layerId].addToMap){
		map.addLayer(baseLayers[layerId])
	    }
	}
	
    } else if (layerDef[layerId].group == 'userLayers'){
	console.log("Ignoring user layer")	
    } else {
	console.log("Layer group not recognized")
    }


}


map.on({
    'dblclick': selectCenter
});

function selectCenter(e){
    var centerCoords = [e.latlng.lng, e.latlng.lat];

    centerString = "[ {lng}, {lat} ]".supplant( {lng: Number.parseFloat(e.latlng.lng).toFixed(5), lat: Number.parseFloat(e.latlng.lat).toFixed(5) } );
    
    var radius = document.getElementById("radius").value;
    
    createAreaPoly(centerCoords, radius);
}
  

map.on('zoomend', function() {
    baseBounds = map.getBounds()
})

map.on('moveend', function() {
    baseBounds = map.getBounds()
})

var parcelInfo = L.control( );

parcelInfo.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'parcelInfo'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
parcelInfo.update = function (properties) {
    if(properties){
	this._div.innerHTML = '<b>{SITEADDRESS}</b><br />Parcel: {PARCELID}<br />Year built: {RESYRBLT}<br />Floor Area: {RESFLRAREA} sq. ft.<br />Stories: {HEIGHT}<br />Bedrooms: {BEDRMS}<br />Parcel area: {ACRES} acres<br />FAR: {FAR}'.supplant( {SITEADDRESS: properties.SITEADDRESS, PARCELID: properties.PARCELID, RESYRBLT: properties.RESYRBLT, RESFLRAREA: properties.RESFLRAREA, HEIGHT: properties.HEIGHT, BEDRMS: properties.BEDRMS, ACRES: properties.ACRES, FAR: Number.parseFloat(properties.RESFLRAREA/(properties.ACRES * 43560)).toFixed(3)} )
    } else {
	this._div.innerHTML = 'Hover over a parcel'
    }
};

map.addControl(parcelInfo)

layerControl = L.control.layers(baseLayersList, featureLayersList);
map.addControl(layerControl)

var geocoder = L.Control.geocoder({
    collapsed: false,
    position: "topleft",
    defaultMarkGeocode: false
    })
    .on('markgeocode', function(e) {

	var centerCoords = [e.geocode.center.lng, e.geocode.center.lat];

	var radius = document.getElementById("radius").value;

	centerString = e.geocode.name;
	
	createAreaPoly(centerCoords, radius);

    })
    .addTo(map);


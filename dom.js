var statsArea = L.geoJSON()
var statsParcels = L.geoJSON()
var legend = L.control()
var centerString = ""

function createAreaPoly (center, radius) {
    document.getElementById("output").innerHTML = "Calculating...";

    if(statsArea){ statsArea.remove(); }
    if(statsParcels){ statsParcels.remove(); }
    if(legend){ legend.remove(); }
    
    var bufferedFC = turf.buffer(turf.point(center), radius, { units: 'miles' });    
    statsArea = L.geoJSON(bufferedFC, { style: { fillOpacity: 0 } } ).addTo(map);

    map.fitBounds(statsArea.getBounds());


    query = L.esri.query({
	url: layerDef["parcels"].url,
    });
    
    query.within(statsArea).where("RESFLRAREA > 0").run( function (error, featureCollection){
	
	statsParcels = L.choropleth(featureCollection, {
	    valueProperty: 'RESFLRAREA',
	    scale: 'YlOrRd', //['white', 'red'],
	    steps: 5,
	    mode: 'q',
	    style: {
		color: '#fff',
		weight: 2,
		fillOpacity: 0.8
	    },
	    onEachFeature: function (feature, layer) {
 		layer.on({
 		    mouseover: highlightFeature,
 		    mouseout: resetHighlight,
 		})
	    }
	}).addTo(map)

  legend = L.control({ position: 'bottomright' })
  legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend')
    var limits = statsParcels.options.limits
    var colors = statsParcels.options.colors
    var labels = []

    // Add min & max
    div.innerHTML = '<div class="labels"><div class="min">' + limits[0] + '</div> \
			<div class="max">' + limits[limits.length - 1] + '</div></div>'

    limits.forEach(function (limit, index) {
      labels.push('<li style="background-color: ' + colors[index] + '"></li>')
    })

    div.innerHTML += '<ul>' + labels.join('') + '</ul>'
    return div
  }
  legend.addTo(map)


	
	var data = dl.read(featureCollection, {type: 'json', parse: 'auto'});
	document.getElementById("output").innerHTML = "";
	document.getElementById("output").innerHTML += "<h2>Results</h2>\n";
	document.getElementById("output").innerHTML += "<p>Center: {0}<br />Radius: {1} miles</p>".supplant( { 0: centerString, 1: radius } );
	document.getElementById("output").innerHTML += "<p>\n";
	document.getElementById("output").innerHTML += "Parcel count: {0}<br>\n".supplant( {0: dl.count(data.features, function(x){ return x.properties['OBJECTID'] } )} );
	document.getElementById("output").innerHTML += "Mean floor area: {0}<br>\n".supplant( {0: Number.parseFloat(dl.mean(data.features, function(x){ return x.properties['RESFLRAREA'] } )).toFixed(0)} );
	document.getElementById("output").innerHTML += "Median floor area: {0}<br>\n".supplant( {0: dl.median(data.features, function(x){ return x.properties['RESFLRAREA'] } ) });
	document.getElementById("output").innerHTML += "Min floor area: {0}<br>\n".supplant( {0: dl.min(data.features, function(x){ return x.properties['RESFLRAREA'] } ) });
	document.getElementById("output").innerHTML += "Max floor area: {0}<br>\n".supplant( {0: dl.max(data.features, function(x){ return x.properties['RESFLRAREA'] } ) });
	document.getElementById("output").innerHTML += "Standard deviation of floor area: {0}<br>\n".supplant( {0: Number.parseFloat(dl.stdev(data.features, function(x){ return x.properties['RESFLRAREA'] } )).toFixed(0)} );
	document.getElementById("output").innerHTML += "</p>\n";
	
    })
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    parcelInfo.update(layer.feature.properties)
}

function resetHighlight(e) {
    statsParcels.resetStyle(e.target);
    parcelInfo.update()
}


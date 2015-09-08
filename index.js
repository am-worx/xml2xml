var http = require('http'),
	https = require('https'),
	fs = require('fs'),
	xmlbuilder = require('xmlbuilder'),
	parseXml = require('xml2js').parseString;

var urlDev;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";	// ignore self signed certificate error

https.get("https://origin.ieeetvdev.ieee.org/service/Signature?url=https://origin.ieeetvdev.ieee.org/service/SeriesList", function(res) {
  console.log("Got response: " + res.statusCode);
  var seriesListAddress = "";

  res.on('data', function(d) {
  	res.setEncoding('utf8');
  	seriesListAddress += d;
  });

  res.on('end', function(){
  	parseXml(seriesListAddress, function (err, result) {
		  urlDev = result.exemple.url_dev[0];
		});

  	//Second level request
		https.get(urlDev, function(res) {
			res.setEncoding('utf8');
  
		  console.log("Got response: " + res.statusCode);

		  var seriesListXML = "";

		  res.on('data', function(d) {
		  	res.setEncoding('utf8');
		  	seriesListXML += d
		  });

		  res.on('end', function() {
		  	parseXml(seriesListXML, function (err, result) {
				  seriesListObj = result;
				  //console.log('Series list object: \n', seriesListObj);

				  var xml = xmlbuilder.create('feed');

				  //forEach
				  seriesListObj.rsp.serie.forEach(function(item){
				  	//console.log('\n SERIE ITEM : \n', item);
				  	var item = xml.ele('item', {
							'sdImg' : item.image, 
							'hdImg' : item.image
						})
						.ele({
							'title' : 'title', 
							'contentType' : 'contentType', 
							'contentId' : 'contentId'
						})
						.up().ele('media')
						.ele({
							'streamFormat' : 'mp4',
							'streamQuality' : 'SD',
							'streamUrl' : '123'
						})
						.up().up().ele('media')
						.ele({
							'streamFormat' : 'mp4',
							'streamQuality' : 'HD',
							'streamUrl' : '456'
						})
						.up().up().ele({
							'synopsis' : 'synopsis',
							'genres' : 'genres'
						});

				  }); // /forEach

				  xml.end({ pretty: true});

				  fs.writeFile('category.xml', xml, function (err) {
					  if (err) throw err;
					  //console.log('It\'s saved! \n', xml);
					});

				  console.log('RESULTING XML: \n',xml);

				});
			});

		}).on('error', function(e) {
		  console.log("Got error: " + e.message);
		});
		// /Second level request

  }); 


}).on('error', function(e) {
  console.log("Got error: " + e.message);
});

var http = require('http'),
	https = require('https'),
	fs = require('fs'),
	xmlbuilder = require('xmlbuilder'),
	parseXml = require('xml2js').parseString;

var urlDev;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";	// ignore self signed certificate error

https.get("https://origin.ieeetvdev.ieee.org/service/Signature?url=https://origin.ieeetvdev.ieee.org/service/SeriesList", function(res) {
  console.log("\nhttps://origin.ieeetvdev.ieee.org/service/Signature?url=https://origin.ieeetvdev.ieee.org/service/SeriesList \n response: " + res.statusCode);
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
  
		  console.log(urlDev, ' \n response: ' + res.statusCode + '\n');

		  var seriesListXML = "";

		  res.on('data', function(d) {
		  	res.setEncoding('utf8');
		  	seriesListXML += d
		  });

		  res.on('end', function() {
		  	parseXml(seriesListXML, function (err, result) {
				  seriesListObj = result;

				  var xml = xmlbuilder.create('categories');

				  seriesListObj.rsp.serie
				  .forEach(function(item){
				  	xml.ele('category')
				  	.ele('id').txt(item.id)
						.up().ele('title').txt(item.title)
						.up().ele('description').txt(item.description)
						.up().ele('sdImg').txt(item.image)
						.up().ele('hdImg').txt(item.image)
						.up().ele('feed');
				  });

				  var readyXML = xml.end({ pretty: true});

				  fs.writeFile('categories.xml', readyXML, function (err) {
					  if (err) throw err;
					});

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

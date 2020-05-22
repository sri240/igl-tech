var querystring = require('querystring');
var http = require('http');
var fs = require('fs');
var jsonContent, searchResponse ='';
var ResponseText = "";
var ResponseText2 = "";
var queryError = 0;

//DO NOT CHANGE
const options = {
  host: 'stark-river-28238.herokuapp.com',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

// when making a request to the api, this block of code prints out the results
// of the search to the console
// TODO: change this code so that instead of logging to the console,
// a response message is sent to the facebook user with the data
const req = http.request(options, (res) => {
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    searchResponse += chunk;
    //console.log(`${chunk}`);
  });
  res.on('end', () => {
    //console.log(searchResponse);
    //console.log('No more data in response.');
    jsonContent = JSON.parse(searchResponse);
for(i=0;i < jsonContent.data.length; i++) {
	ResponseText2 += ("Video # " + (i+1) + ": ");
	ResponseText2 += (jsonContent.data[i].linkToVideo + "\n\n");
};
    console.log(ResponseText2);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
  queryError = 1;
});

//here is where you set the filters before searching the database
//after setting the filters, send the query
////////// LIST OF VALID KEYS ///////////
// "name"
// "country":
// "city":
// "gender":
// "age":
// "eventID":
// "eventDate": OR at least one "month", "day", "year" - these 3 must be 1-2 digit numbers
// "eventCountry":
// "eventCity":
// "eventHost":
// "songID":
// "song":
// "category":
// "language":
// "deckNumber"
var postData = (search, artist, year, location) => {
  var data;
  if (year != "") {
	if (location != "") {
  		data = JSON.stringify({
    		'name': `${artist}`,
    		'year': `${year}`,
    		'eventCity': `${location}`
  		});
	} else {
		if(isNaN(year)) {
  			data = JSON.stringify({
    			'name': `${artist}`,
    			'eventCity': `${year}`
  			});
		} else {
  			data = JSON.stringify({
    			'name': `${artist}`,
    			'year': `${year}`
  			});
		};
	};
   } else {
  		data = JSON.stringify({
    		'name': `${artist}`
  		});
   };
  console.log(data);
  search(data);
};

//search sends the query to the api
var search = (filters) => {
  req.write(filters);
  req.end();
};

var express = require("express");
var app = express();
var FBBotFramework = require("fb-bot-framework");
// Initialize
var bot = new FBBotFramework({
page_token: /* PAGE TOKEN */,
verify_token: /* VERIFY TOKEN */
});
// Setup Express middleware for /webhook
app.use('/webhook', bot.middleware());
// Setup listener for incoming messages
bot.on('message', function(userId, message){
var str = message.split(" ");
console.log(str.length);
//console.log(str[1], str[0]);
switch (str.length) {
case 1: postData(search, str[0], "", "");
	break;
case 2: postData(search, str[0], str[1], "");
	break;
case 3: postData(search, str[0], str[1], str[2]);
	break;
};

//postData(search, str[0], str[1]);
//postData(search, message); 
if (!queryError) {
	bot.sendTextMessage(userId, ("List of Videos of " + str[0] + ":\n"));
	bot.sendTextMessage(userId, ResponseText2);
	bot.sendTextMessage(userId, "\n");
} 
queryError = 0;
ResponseText2 = "";
});
app.get("/", function (req, res){
res.send("hello world");
});
//Make Express listening
app.listen(3000); 

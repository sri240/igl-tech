////////////////////////////////////////////////////////////
// IGL Chatbot Program
// Handles FAQ commands such as Hello, IGL, Help
// Handles Events Commands such as Events <<Host/City/All>>
// Handles Artists Commands such as Artist <<Name/Year/City>>
////////////////////////////////////////////////////////////

const https = require('https');
// Read FAQ JSON file from the server and parse

const port = process.env.PORT || 3000;

var jsonFAQ;
https.get('https://classique-chocolatine-74454.herokuapp.com/', (resp) => {
  let data = '';

  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  //console.log(data);
  // The whole response has been received.
  resp.on('end', () => {
  //console.log(data);
     jsonFAQ = JSON.parse(data);
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});

// Read Events JSON file from the server and parse
var jsonEvents;
https.get('https://greve-vin-51846.herokuapp.com/', (resp) => {
  let data = '';

  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  //console.log(data);
  // The whole response has been received.
  resp.on('end', () => {
  //console.log(data);
     jsonEvents = JSON.parse(data);
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});

/////////////////////////////////////////////////
// API Data Retrieval
/////////////////////////////////////////////////
var querystring = require('querystring');
var http = require('http');
var fs = require('fs');
var jsonArtist, searchResponse = '';
var queryError = 0;

var Myelements = [
    {
        "title": "Video 1",
        "image_url": "https://download.ecrio.com/dev/images/IGL-Logo.png",
        "buttons": [
            {
                "type": "web_url",
                "url": "https://drive.google.com/open?id=0B3a-BPEEHfKgaVJ0YlFDUVY0cEk",
                "title": "Play Video"
            }
            
        ]
    },
    {
        "title": "Video 2",
        "image_url": "https://scontent-sjc3-1.xx.fbcdn.net/v/t1.15752-0/s261x260/39020043_2162581930690431_4495368210878562304_n.jpg?_nc_cat=0&oh=b5485544a98ceae4714119abf8d4492a&oe=5C0EA7EF",
        "buttons": [
            {
                "type": "web_url",
                "url": "https://drive.google.com/open?id=0B3a-BPEEHfKgaVJ0YlFDUVY0cEk",
                "title": "Play Video"
            }
            
        ]
    },
    {
        "title": "Video 3",
        "image_url": "https://scontent-sjc3-1.xx.fbcdn.net/v/t1.15752-0/s261x260/39020043_2162581930690431_4495368210878562304_n.jpg?_nc_cat=0&oh=b5485544a98ceae4714119abf8d4492a&oe=5C0EA7EF",
        "buttons": [
            {
                "type": "web_url",
                "url": "https://drive.google.com/file/d/0B3a-BPEEHfKgZTJNT1h6RW9mU3M/view?usp=sharing",
                "title": "Play Video"
            }
            
        ]
    }
];
//HTTP POST Request Configuration: DO NOT CHANGE
const options = {
  host: 'stark-river-28238.herokuapp.com',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

//postData specifies the proper data to send to the API
var postData = (req, search, artist, year, location) => {
  var data;

  //handles all possible facebook messages
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
  search(req, data);
};

//search sends the query to the API
var search = (req, filters) => {
  req.write(filters);
  req.end();
};

////////////////////////////////////////////////////////////
// Facebook Chatbot Framework Code Lives Here
///////////////////////////////////////////////////////////
var express = require("express");
var app = express();
var FBBotFramework = require("fb-bot-framework");
var ResponseText = "";
// Initialize
var bot = new FBBotFramework({
  page_token: // get page token
  verify_token: // get verify token
});
// Setup Express middleware for /webhook
app.use('/webhook', bot.middleware());
// Setup listener for incoming messages
bot.on('message', function(userId, message){
  queryError = 0;
  searchResponse = "";
  ResponseText = "";
  sentResponse = 0;
  var commands = message.split(" ");
  var sentResponse = 0;
  var CityStr, CountryStr, HostsStr, CommandStr;
  /////////////////////////////////////////////////////
  // Handle FAQ Commands
  ////////////////////////////////////////////////////
  for (i=0; i<jsonFAQ.igl_faq.length; i++) {
  	if (commands[0].toLowerCase() === jsonFAQ.igl_faq[i].Question.toLowerCase()) {
  		bot.sendTextMessage(userId, jsonFAQ.igl_faq[i].Response);
  		sentResponse = 1;
  	};
  }
  /////////////////////////////////////////////////////
  // Handle Events Commands
  ////////////////////////////////////////////////////
  if (!sentResponse) {
  	numMatches = 1;
  	for(i=0;i < jsonEvents.igl_events.length; i++) {
  		CityStr = jsonEvents.igl_events[i].City.toLowerCase();
  		CountryStr = jsonEvents.igl_events[i].Country.toLowerCase();
  		HostsStr = jsonEvents.igl_events[i].Host.toLowerCase();
  		CommandStr = message.toLowerCase();
  		//console.log(HostsStr, CommandStr);
  		noMatchFound = 0;
  		if (CityStr.indexOf(CommandStr) != -1) {
  			ResponseText += ("FOUND A MATCHING CITY: " + numMatches + " \n");
  			numMatches++;
  		} else if (CountryStr.indexOf(CommandStr) != -1) {
  			ResponseText += ("FOUND A MATCHING COUNTRY: " + numMatches + " \n");
  			numMatches++;
  		} else if (HostsStr.indexOf(CommandStr) != -1) {
  			ResponseText += ("FOUND A MATCHING HOST: " + numMatches + " \n");
  			numMatches++;
  		} else noMatchFound = 1;
  		if (!noMatchFound) {
  			ResponseText += ("Date" + " " + jsonEvents.igl_events[i].Date + "\n") ;
  			ResponseText += ("City" + " " + jsonEvents.igl_events[i].City + "\n") ;
  			ResponseText += ("Country" + " " + jsonEvents.igl_events[i].Country + "\n") ;
  			ResponseText += ("Host" + " " + jsonEvents.igl_events[i].Host + "\n") ;
  			ResponseText += ("Theme" + " " + jsonEvents.igl_events[i].Theme + "\n") ;
  			ResponseText += ("Status" + " " + jsonEvents.igl_events[i].Status + "\n") ;
  			ResponseText += ("\n");
  			ResponseText += ("\n");
  			sentResponse = 1;
  		};
  	};
  	bot.sendTextMessage(userId, ResponseText);
  	ResponseText = "";
  }
  /////////////////////////////////////////////////////
  // Handle Artists Commands
  ////////////////////////////////////////////////////
  if (!sentResponse && (commands[0].toLowerCase() === "video")) {
    //Handles what the response does after a request
    const req = http.request(options, (res) => {
      res.setEncoding('utf8');

      // the response data is kept in a searchResponse variable
      res.on('data', (chunk) => {
        searchResponse += chunk;
      });

      // when the request ends, send the message to the user
      res.on('end', () => {
        //console.log(searchResponse);
        if (res.statusCode === 404) {
          queryError = 1;
          bot.sendTextMessage(userId, "Sorry, data with this criteria was not found.");
          sentResponse = 1;
        }
        else if (searchResponse.length > 1) {
          jsonArtist = JSON.parse(searchResponse);   //convert the search's response data to json
          var formString = (callback) => {
            ResponseText += ("List of Videos of " + commands[1] + ":\n");
            var firstVid = jsonArtist.data.length - 10;
            var limit = 0;
            if (firstVid < 0) {
              firstVid = 0;
              limit = jsonArtist.data.length;
            }
            else {
              limit = 10;
            }

            for(var i = 0; i < limit; i++) {   //iterate through the object and send the user the video for each song
              ResponseText += ("Video # " + (i + 1) + ": ");
            	ResponseText += (jsonArtist.data[firstVid + i].linkToVideo + "\n\n");
		if (i > 2) break;
		Myelements[i].title = (jsonArtist.data[i].name + " @ " + jsonArtist.data[i].eventCity + " On " + jsonArtist.data[i].eventDate);
                Myelements[i].buttons[0].url = jsonArtist.data[i].linkToVideo ;

            };

            callback();
          }

          //console.log(ResponseText);
          formString(() => {
            if (!queryError) {
            	//bot.sendTextMessage(userId, ("List of Videos of " + str[0] + ":\n"));
            	//bot.sendTextMessage(userId, ResponseText);
            	//bot.sendTextMessage(userId, "\n");
		bot.sendGenericMessage(userId, Myelements);
            }
          });
        };
        sentResponse = 1;
      });
    });
    //if there is an error, set the queryError to 1
    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
      queryError = 1;
    });


    switch (commands.length) {
      case 1: break;
      case 2: postData(req, search, commands[1], "", "");
      	break;
      case 3: postData(req, search, commands[1], commands[2], "");
      	break;
      case 4: postData(req, search, commands[1], commands[2], commands[3]);
      	break;
    };
  };
});

app.get("/", function (req, res){
  res.send("hello world");
});

//Make Express listen
app.listen(port);

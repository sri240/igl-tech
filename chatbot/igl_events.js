const https = require('https');
 
https.get('https://download.ecrio.com/dev/igl_events.json', (resp) => {
  let data = '';
 
  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    data += chunk;
  });
 
  //console.log(data);
  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    var jsonContent = JSON.parse(data);
    for (i=0; i<jsonContent.igl_events.length; i++) {
    console.log("Date: ", jsonContent.igl_events[i].Date, "City: ", jsonContent.igl_events[i].City, "Country: ", jsonContent.igl_events[i].Country, "Host: ", jsonContent.igl_events[i].Host, "Theme: ", jsonContent.igl_events[i].Theme, "Event ID: ", jsonContent.igl_events[i].Event_ID);
    console.log("\n");
    }
  });
 
}).on("error", (err) => {
  console.log("Error: " + err.message);
});

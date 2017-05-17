const stationBaseURL = 'http://transport.opendata.ch/v1/locations?type=station&query=';

function connectionsURL(startStationId, endStationId) {
  return `http://transport.opendata.ch/v1/connections?from=${startStationId}&to=${endStationId}`;
}

let startStationURL = stationBaseURL + 'neuchatel';
let endStationURL = stationBaseURL + 'thun';
var startStationId;
var endStationId;

let request = fetch(startStationURL);

request
  .then(response => response.json())
  .then(obj => {
    startStationId = obj.stations[0].id;
    return fetch(endStationURL);
  })
  .then(response => response.json())
  .then(obj => {
    endStationId = obj.stations[0].id;
    let connURL = connectionsURL(startStationId, endStationId);
    return fetch(connURL);
  })
  .then(response => response.json())
  .then(obj => {
    console.log(`From ${obj.from.name} to ${obj.to.name} departing at ${obj.connections[0].from.departure}.`);
  })
;

// Works. But time could be saved by doing
// fetch(startStationURL) and fetch(endStationURL)
// in parallel.

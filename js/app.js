const stationBaseURL = 'http://transport.opendata.ch/v1/locations?type=station&query=';

function connectionsURL(startStationId, endStationId) {
  return `http://transport.opendata.ch/v1/connections?from=${startStationId}&to=${endStationId}`;
}

let startStationURL = stationBaseURL + 'neuchatel';
let endStationURL = stationBaseURL + 'thun';

let startStation = fetch(startStationURL);
let endStation = fetch(endStationURL);

Promise.all([startStation, endStation])
  .then(resolvedValues => {
    let jsonPromises = resolvedValues.map(resolvedValue => resolvedValue.json())
    return Promise.all(jsonPromises);
  })
  .then(resolvedObjects => {
    let stationIds = resolvedObjects.map(resolvedObj => resolvedObj.stations[0].id)
    return Promise.all(stationIds);
  })
  .then(stationIds => {
    let connURL = connectionsURL(...stationIds);
    return fetch(connURL);
  })
  .then(response => response.json())
  .then(connectionsObject => {
    console.log(`From ${connectionsObject.from.name} to ${connectionsObject.to.name} departing at ${connectionsObject.connections[0].from.departure}.`);
  })
  // .catch(err => throw new Error(err))
;

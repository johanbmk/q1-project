let formData = {fromStation: 'neuchatel', endStation: 'thun'};

getStationIds(formData.fromStation, formData.endStation)
  .then(getConnections)
  .then(displayResults)
  .catch(catchError);

function getStationIds(fromStationName, endStationName) {
  const baseURL = 'http://transport.opendata.ch/v1/locations?type=station&query=';
  let fromStation = getJsonFromFetch(baseURL + fromStationName);
  let endStation = getJsonFromFetch(baseURL + endStationName);
  return Promise.all([fromStation, endStation]);
}

function getConnections(stations) {
  let stationIds = stations.map(stationObj => stationObj.stations[0].id);
  let connURL = connectionsURL(...stationIds);
  return getJsonFromFetch(connURL)
}

function displayResults(connectionsObject) {
  let message = `From ${connectionsObject.from.name} to ${connectionsObject.to.name} departing at ${connectionsObject.connections[0].from.departure}.`;
  console.log(message);
  let newParagraph = document.createElement('p').innerText = message;
  document.querySelector('#results').append(newParagraph);
}

function catchError(err) {
  throw new Error(err);
}

function getJsonFromFetch(url) {
  return fetch(url)
    .then(response => response.json());
}

function connectionsURL(fromStationId, endStationId) {
  return `http://transport.opendata.ch/v1/connections?from=${fromStationId}&to=${endStationId}`;
}

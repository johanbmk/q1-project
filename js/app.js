

$(document).ready(function() {

  // For Materialize Select form elements
  $('select').material_select();

  // To make a hamburger menu for small screens
  $(".button-collapse").sideNav();

  // Search button. Event listener and handler.
  $('#search-button').click((event) => {
    event.preventDefault(); // so <a href="#"> does not scroll

    // Get form data
    let fromStation = $('#from-station')[0].value;
    let endStation = $('#to-station')[0].value;

    // Hit the API
    getStationIds(fromStation, endStation)
    .then(getConnections)
    .then(displayResults)
    .catch(catchError);
  });

});


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
  console.log(connectionsObject);

  // DOM
  // let message = `From ${connectionsObject.from.name} to ${connectionsObject.to.name} departing at ${connectionsObject.connections[0].from.departure}.`;
  // let newParagraph = document.createElement('p').innerText = message;
  // $('#results').append(newParagraph);
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

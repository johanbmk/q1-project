$(document).ready(function() {

  // For Materialize 'Select' form elements
  $('select').material_select();

  // For Materialize small screens hamburger menu
  $(".button-collapse").sideNav();

  // For Materialize date picker
  $('.datepicker').pickadate({
    selectMonths: true, // Creates a dropdown to control month
    selectYears: 15 // Creates a dropdown of 15 years to control year
  });

  // Search button. Event listener and handler.
  $('#search-button').click((event) => {
    event.preventDefault(); // so <a href="#"> does not scroll

    // Get form data
    let fromStation = $('#from-station')[0].value;
    let endStation = $('#to-station')[0].value;

    // TRY
    let dateString = $('#date')[0].value;
    var date = inputDateConvert(dateString);

    // Hit the API
    getStationIds(fromStation, endStation, date)
    .then(getConnections)
    .then(displayResults)
    .catch(catchError);
  });

});


function inputDateConvert(dateString) {
  let d1 = Date.parse(dateString);
  let d2 = new Date(d1);
  let d3 = d2.toISOString(); // 2017-05-18T07:00:00.000Z
  return chopUpTime(d3)[0];
}


function getStationIds(fromStationName, endStationName, date) {
  const baseURL = 'http://transport.opendata.ch/v1/locations?type=station&query=';
  let fromStation = getJsonFromFetch(baseURL + fromStationName);
  let endStation = getJsonFromFetch(baseURL + endStationName);
  return Promise.all([fromStation, endStation, date]);
}


function getConnections(queryParams) {
  let date = queryParams.pop();
  let stationIds = queryParams.map(stationObj => stationObj.stations[0].id);
  let connURL = connectionsURL(...stationIds, date);
  return getJsonFromFetch(connURL);
}


function displayResults(connectionsObject) {
  let coob = connectionsObject; // shorter name

  let txt = `Here are your choices for train departure times from ${coob.from.name} to ${coob.to.name}:`;
  $('#from-and-to').text(txt);

  for (let i = 0; i < coob.connections.length; i++) {
    // Add to results table
    let [depDate, depTime] = chopUpTime(coob.connections[i].from.departure);
    let [arrDate, arrTime] = chopUpTime(coob.connections[i].to.arrival);
    let tr = $('<tr>');
    tr.append($('<td>').text(depDate));
    tr.append($('<td>').text(depTime));
    tr.append($('<td>').text(arrTime));
    $('#table-of-connections tbody').append(tr);
  }

}


function chopUpTime(dateAndTimeString) {
  let pieces = dateAndTimeString.match(/(.+)T(\d+:\d+)/)
  return [pieces[1], pieces[2]];
}


function catchError(err) {
  throw new Error(err);
}


function getJsonFromFetch(url) {
  return fetch(url)
    .then(response => response.json());
}


function connectionsURL(fromStationId, endStationId, date) {
  return `http://transport.opendata.ch/v1/connections?from=${fromStationId}&to=${endStationId}&date=${date}`;
}

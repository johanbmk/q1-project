class UserSearch {
  constructor() {
    this.setDefaultDate();
  }

  setDefaultDate() {
    let date = new Date();
    let dateString = chopUpTime(date.toISOString())[0];
    $('#date').val(dateString);
  }

  getFormData() {
    this.fromStationName = $('#from-station')[0].value;
    this.endStationName = $('#to-station')[0].value;
    let dateString = $('#date')[0].value;
    // var date = inputDateConvert(dateString);
    this.date = dateString;
    this.time = $('#time')[0].value;
    if (!this.date) {
      // Date cleared by user. Resetting to default.
      this.setDefaultDate();
    }
  }

  makeAPIRequest() {
    getStationIds(this)
    .then(getConnections)
    .then(displayResults)
    .catch(catchError);
  }
}

var search = new UserSearch();

$(document).ready(function() {
  // For Materialize 'Select' form elements
  $('select').material_select();

  // For Materialize date picker
  $('.datepicker').pickadate({
    selectMonths: true, // Creates a dropdown to control month
    selectYears: 5, // Creates a dropdown of n years to control year
    // format: 'mm/dd/yyyy'
    format: 'yyyy-mm-dd'
  });

  // Search button. Event listener and handler.
  $('#search-button').click((event) => {
    event.preventDefault(); // so <a href="#"> does not scroll
    search.getFormData();
    search.makeAPIRequest();
  });
});


function getStationIds(search) {
  const baseURL = 'http://transport.opendata.ch/v1/locations?type=station&query=';
  let fromStation = getJsonFromFetch(baseURL + search.fromStationName);
  let endStation = getJsonFromFetch(baseURL + search.endStationName);
  return Promise.all([fromStation, endStation, search.date, search.time]);
}


function getConnections(queryParams) {
  let time = queryParams.pop();
  let date = queryParams.pop();
  let stationIds = queryParams.map(stationObj => stationObj.stations[0].id);
  let connURL = connectionsURL(...stationIds, date, time);
  return getJsonFromFetch(connURL);
}


function displayResults(connectionsObject) {
  let coob = connectionsObject; // shorter name

  let txt = `Here are your choices for train departure times from ${coob.from.name} to ${coob.to.name}:`;
  $('#from-and-to').text(txt);

  // Clear results table, as there may be old results there
  $('#table-of-connections tbody').empty();

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


function connectionsURL(fromStationId, endStationId, date, time) {
  return `http://transport.opendata.ch/v1/connections?from=${fromStationId}&to=${endStationId}&date=${date}&time=${time}`;
}


// function inputDateConvert(dateString) {
//   let d1 = Date.parse(dateString);
//   let d2 = new Date(d1);
//   let d3 = d2.toISOString(); // 2017-05-18T07:00:00.000Z
//   return chopUpTime(d3)[0];
// }

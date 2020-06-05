// example adding a list element
var node = document.createElement("LI"); // Create a <li> node

let xhr = new XMLHttpRequest();

var dateResultsString = document.getElementById("results-date");

var editSearchButton = document.getElementById("editSearchButton");


xhr.open("POST", "/getLostAndFound");
xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

// set up callback function that will run when the HTTP response comes back
xhr.onloadend = function(e) {
  console.log(xhr.responseText);

  // responseText is a string
  let data = JSON.parse(xhr.responseText);

  var date = new Date(window.sessionStorage.getItem("dateString"));

  var months = new Array(
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  );

  var day = date.getDate() + 1;
  var month = date.getMonth();

  dateResultsString.innerHTML = months[month] + " " + day;

  if (window.sessionStorage.getItem("endDate") !== 'NaN') {
    var endDate = new Date(window.sessionStorage.getItem("endDateString"));
    var day2 = endDate.getDate() + 1;
    var month2 = endDate.getMonth();
    dateResultsString.innerHTML += " - " + months[month2] + " " + day2;
  }

  if (window.sessionStorage.getItem("category") !== "") {
    dateResultsString.innerHTML +=
      " , " + window.sessionStorage.getItem("category");
  }

  if (window.sessionStorage.getItem("location") !== "placeholder") {
    dateResultsString.innerHTML +=
      " , " + "location placeholder";
  }

  for (var i = 0; i < data.length; i++) {
    var lostorfound = data[i].lostorfound;
    var title = data[i].title;
    var category = data[i].category;
    var loc = data[i].location;
    var date = data[i].date;
    var description = data[i].description;
    var endDate = data[i].endDate;
    var photourl = data[i].photourl;
    var id = i;

    var div = document.createElement("div");
    div.id = "container" + i;
    console.log("photo:" + photourl);
    if (photourl === null) {
      div.innerHTML =
        "<p class='title'>" +
        title +
        "</p>" +
        '<div class="card-details"><div class="card-label"><b>Category</b> ' +
        category +
        "</div>" +
        '<div class="card-label"><b>Location</b> ' +
        loc +
        "</div>" +
        '<div class="card-label"><b>Date</b> ' +
        date +
        "</div>" +
        '<div class="card-desc">' +
        description +
        "</div></div>" +
        '<button onclick="toggleSwitch(' +
        i +
        ')" id="' +
        i +
        '" class="more">More</button>';
    } else {
      div.innerHTML =
        "<p class='title'>" +
        title +
        "</p><div class='img-details'><img src='" +
        photourl +
        "' alt='photo'/> " +
        '<div class="card-details"><div class="card-label"><b>Category</b> ' +
        category +
        "</div>" +
        '<div class="card-label"><b>Location</b> ' +
        loc +
        "</div>" +
        '<div class="card-label"><b>Date</b> ' +
        date +
        "</div>" +
        '<div class="card-desc">' +
        description +
        "</div></div></div>" +
        '<button onclick="toggleSwitch(' +
        i +
        ')" id="' +
        i +
        '" class="more">More</button>';
    }
    div.className = "card";
    node.appendChild(div); // Append the div to <li>
    document.getElementById("card-list").appendChild(node); // Append <li> to <ul> with id="myList"
  }
};

let data = {
  lostorfound: window.sessionStorage.getItem("lostorfound"),
  category: window.sessionStorage.getItem("category"),
  date: window.sessionStorage.getItem("date"),
  endDate: window.sessionStorage.getItem("endDate"),
  location: "placeholder"
};

// send off request
xhr.send(JSON.stringify(data));

function toggleSwitch(id) {
  var moreVar = document.getElementById(id);
  var card = document.getElementById("container" + id);
  if (moreVar.textContent === "More") {
    moreVar.textContent = "Less";
    console.log(card.children[1]);
    card.children[1].style.display = "flex";
  } else {
    moreVar.textContent = "More";
    card.children[1].style.display = "none";
  }
}

if (editSearchButton !== null) {
  editSearchButton.addEventListener("click", goBack);
}

function goBack() {
  window.location = "https://lost-and-found-steps.glitch.me/inputseeker";
}
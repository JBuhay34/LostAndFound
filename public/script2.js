// define variables that reference elements on our page
const submitButton = document.getElementById("submit-button");
const nextButton = document.getElementById("next-button");

const searchButton = document.getElementById("search-btn");

var isSearching = 0;
var categoryChecker = 1;
var startDateChecker = 1;
var endDateChecker = 1;
var locationChecker = 1;

function viewseshstorage() {
  for (let i = 0; i < window.sessionStorage.length; i++) {
    let key = window.sessionStorage.key(i);
    alert(`${key}: ${window.sessionStorage.getItem(key)}`);
  }
}

function storeDataPage1() {
  isSearching = 0;
  categoryChecker = 1;
  startDateChecker = 1;
  endDateChecker = 1;

  let title = document.getElementById("title-input");
  if (title !== null) {
    title = title.value;
  } else {
    title = "";
  }

  let cat = document.getElementById("category-input");
  if (cat !== null) {
    cat = cat.value;
  } else {
    cat = "";
  }

  let des = document.getElementById("writemessage");
  if (des !== null) {
    des = des.value;
  } else {
    des = "";
  }

  let lostorfound = nextButton.getAttribute("lostorfound");
  window.sessionStorage.setItem("lostorfound", lostorfound);
  window.sessionStorage.setItem("title", title);
  window.sessionStorage.setItem("category", cat);
  window.sessionStorage.setItem("description", des);
  //viewseshstorage();
  var currentDir = window.location.pathname;
  console.log(currentDir);
  if (currentDir === "/inputseeker") {
    window.location =
      "https://lost-and-found-steps.glitch.me/inputseekerlocation";
  } else if ((currentDir = "/inputfound")) {
    window.location = "https://lost-and-found-steps.glitch.me/inputfoundlocation";
  }
}

function storeDataPage2() {
    let cat = document.getElementById("category-input-search");
    if (cat !== null) {
      if(cat.value === "") {
        categoryChecker = 0;
        window.sessionStorage.setItem("category", cat.value);
      } else {
        window.sessionStorage.setItem("category", cat.value);
        categoryChecker = 1;
      }
      isSearching = 1;
    } else {
      isSearching = 0;
      categoryChecker = 0;
    }
  
  let loc = window.sessionStorage.getItem("location");
  if(loc !== null) {
    locationChecker = 1;
  } else {
    locationChecker = 0;
  }
  
  
  
  let date1 = document.getElementById("date-start-input");
  if (date1 !== null) {
    date1 = date1.value;
    startDateChecker = 1;
  } else {
    date1 = "";
    startDateChecker = 0;
  }

  let time1 = document.getElementById("time-start-input");
  if (time1 !== null) {
    time1 = time1.value;
  } else {
    time1 = "";
  }

  var endDate;
  var date2;
  var time2;
  if (isSearching) {
     date2 = document.getElementById("date-end-input");
     time2 = document.getElementById("time-end-input");
    if (date2 !== null) {
      date2 = date2.value;
      if (time2 !== null) {
        time2 = time2.value;
      } else {
        time2 = "";
      }
      endDateChecker = 1;
    } else {
      date2 = "";
      endDateChecker = 0;
    }
  } else {
    date2 = "";
    time2 = "";
  }

  var startDate;
  if (time1 !== "" && date1 !== "") {
    var milliseconds1 = getSeconds(time1);
    startDate = new Date(date1).getTime();
    startDate += milliseconds1;
    startDateChecker = 1;
  } else {
    startDate = "";
      startDateChecker = 0;
  }

  if (isSearching && date2 !== "" && time2 !== "") {
    var milliseconds2 = getSeconds(time2);
    endDate = new Date(date2).getTime();
    endDate += milliseconds2;
    endDateChecker = 1;
  } else {
    endDate = "";
    endDateChecker = 0;
  }

  var myEpochStartDate = startDate / 1000.0;
  var myEpochEndDate = endDate / 1000.0;
  

  window.sessionStorage.setItem("dateString", date1);
  window.sessionStorage.setItem("endDateString", date2);
  window.sessionStorage.setItem("date", myEpochStartDate);
  window.sessionStorage.setItem("endDate", myEpochEndDate);
  

  if (isSearching && categoryChecker === 0 && startDateChecker === 0 && endDateChecker === 0 && locationChecker === 0) {
    document.getElementById("error-message").style.display = "flex";
    return;
  }

  let data = {
    lostorfound: window.sessionStorage.getItem("lostorfound"),
    title: window.sessionStorage.getItem("title"),
    category: window.sessionStorage.getItem("category"),
    description: window.sessionStorage.getItem("description"),
    photourl: window.sessionStorage.getItem("photourl"),
    date: window.sessionStorage.getItem("date"),
    endDate: window.sessionStorage.getItem("endDate"),
    location: window.sessionStorage.getItem("location")
  };

  // new HttpRequest instance
  if (window.sessionStorage.getItem("lostorfound") === "Found") {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/saveitem");
    // important to set this for body-parser
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.onloadend = function(e) {
      console.log(xmlhttp.responseText);
    };
    // all set up!  Send off the HTTP request
    xmlhttp.send(JSON.stringify(data));
  }
  //TODO: List of items here

  let xhr = new XMLHttpRequest();
  window.sessionStorage.removeItem("photourl");

  window.location = "https://lost-and-found-steps.glitch.me/resultsseeker";
}


if (nextButton !== null) {
  nextButton.addEventListener("click", storeDataPage1);
}

if (submitButton !== null) {
  submitButton.addEventListener("click", storeDataPage2);
}

if (searchButton !== null) {
  searchButton.addEventListener("click", isSearchingFunc);
}

function isSearchingFunc() {
  isSearching = 1;
}

// UPLOAD IMAGE
if (document.querySelector("#imgUpload") !== null) {
  document.querySelector("#imgUpload").addEventListener("change", () => {
    // get the file with the file dialog box
    const selectedFile = document.querySelector("#imgUpload").files[0];
    // store it in a FormData object
    const formData = new FormData();
    formData.append("newImage", selectedFile, selectedFile.name);

    let button = document.querySelector(".own-label");

    // build an HTTP request data structure
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/upload", true);
    xhr.onloadend = function(e) {
      // Get the server's response to the upload
      console.log(xhr.responseText);
      let newImage = document.querySelector("#cardImg");
      let url =
        "http://ecs162.org:3000/images/mrdenitz/" + String(selectedFile.name);
      newImage.src = url; //put email here
      window.sessionStorage.setItem("photourl", url);
      newImage.style.display = "block";
      document.querySelector(".image").classList.remove("upload");
      button.textContent = "Replace Image";
    };

    button.textContent = "Uploading...";
    // actually send the request
    xhr.send(formData);
  });
}

function getSeconds(timeValue) {
  let splitByColon = timeValue.split(":");
  var hoursValue = parseInt(splitByColon[0]);

  let splitForMins = splitByColon[1].split(" ");
  if (splitForMins[1] === "PM") {
    hoursValue = hoursValue + 12;
  }
  var minutesValue = parseInt(splitForMins[0]);
  return 3600 * hoursValue + 60 * minutesValue * 1000;
}

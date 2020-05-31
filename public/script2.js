// define variables that reference elements on our page
const submitButton = document.getElementById("submit-button");
const nextButton = document.getElementById("next-button");

function storeDataPage1() {
  let title = document.getElementById("title-input").value;
  let cat = document.getElementById("category-input").value;
  let des = document.getElementById("writemessage").value;

  window.sessionStorage.setItem("title", title);
  window.sessionStorage.setItem("category", cat);
  window.sessionStorage.setItem("description", des);
  
  var currentDir = window.location.pathname
  if(currentDir="/inputseeker"){
  window.location =
    "https://lost-and-found-steps.glitch.me/inputseekerlocation";
  } else if (currentDir="/inputfound"){
    "https://lost-and-found-steps.glitch.me/inputfoundlocation";  }
}

function storeDataPage2() {
  let date = document.getElementById("date-input").value;
  let time = document.getElementById("time-input").value;
  window.sessionStorage.setItem("date", date);
  window.sessionStorage.setItem("time", time);

  //TODO add location
  if ((window.sessionStorage.getItem("date") ||window.sessionStorage.getItem("time")) && window.sessionStorage.getItem("category")) {
    // I need error text
    document.getElementById("error-message").display = "block";
    return;
  }
  if (date.length === 0 || time.length === 0) {
    document.getElementById("error-message").style.display = "block";
    return;
  }

  let data = {
    title: window.sessionStorage.getItem("title"),
    category: window.sessionStorage.getItem("category"),
    description: window.sessionStorage.getItem("description"),
    date: window.sessionStorage.getItem("date"),
    time: window.sessionStorage.getItem("time"),
    location: "placeholder"
  };

  // new HttpRequest instance
  var xmlhttp = new XMLHttpRequest();
  // xmlhttp.open("POST", '/saveDisplay');
  // important to set this for body-parser
  // xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  // // all set up!  Send off the HTTP request
  // xmlhttp.send(JSON.stringify(data));

  //TODO: List of items here
  window.location = "https://lost-and-found-steps.glitch.me/resultsseeker"
}

if (nextButton !== null) {
  nextButton.addEventListener("click", storeDataPage1);
}

if (submitButton !== null) {
  submitButton.addEventListener("click", storeDataPage2);
}

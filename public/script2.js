// define variables that reference elements on our page
const submitButton = document.getElementById("submit-button");
const nextButton = document.getElementById("next-button");
function viewseshstorage() {
  for (let i = 0; i < window.sessionStorage.length; i++) {
    let key = window.sessionStorage.key(i);
    alert(`${key}: ${window.sessionStorage.getItem(key)}`);
  }
}
function storeDataPage1() {
  let title = document.getElementById("title-input").value;
  let cat = document.getElementById("category-input").value;
  let des = document.getElementById("writemessage").value;
  let lostorfound = nextButton.getAttribute("lostorfound");
  window.sessionStorage.setItem("lostorfound", lostorfound);
  window.sessionStorage.setItem("title", title);
  window.sessionStorage.setItem("category", cat);
  window.sessionStorage.setItem("description", des);
  //viewseshstorage();
  var currentDir = window.location.pathname;
  if ((currentDir = "/inputseeker")) {
    window.location =
      "https://lost-and-found-steps.glitch.me/inputseekerlocation";
  } else if ((currentDir = "/inputfound")) {
    ("https://lost-and-found-steps.glitch.me/inputfoundlocation");
  }
}

function storeDataPage2() {
  let date = document.getElementById("date-input").value;
  let time = document.getElementById("time-input").value;
  window.sessionStorage.setItem("date", date);
  window.sessionStorage.setItem("time", time);

  if (date.length === 0 || time.length === 0) {
    document.getElementById("error-message").style.display = "block";
    return;
  }

  let data = {
    lostorfound: window.sessionStorage.getItem("lostorfound"),
    title: window.sessionStorage.getItem("title"),
    category: window.sessionStorage.getItem("category"),
    description: window.sessionStorage.getItem("description"),
    photourl: window.sessionStorage.getItem("photourl"),
    date: window.sessionStorage.getItem("date"),
    time: window.sessionStorage.getItem("time"),
    location: "placeholder"
  };

  // new HttpRequest instance
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("POST", "/saveitem");
  // important to set this for body-parser
  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xmlhttp.onloadend = function(e) {
    console.log(xmlhttp.responseText);
  };
  // all set up!  Send off the HTTP request
  xmlhttp.send(JSON.stringify(data));
  //TODO: List of items here

  let xhr = new XMLHttpRequest();

  window.location = "https://lost-and-found-steps.glitch.me/resultsseeker"
}

if (nextButton !== null) {
  nextButton.addEventListener("click", storeDataPage1);
}

if (submitButton !== null) {
  submitButton.addEventListener("click", storeDataPage2);
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

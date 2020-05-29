

// define variables that reference elements on our page
const submitButton = document.getElementById("submitButton");
const nextButton = document.getElementById("next-button");


submitButton.addEventListener("click", storeData);

function storeData() {
  let loc = document.getElementById("loc").value;
  let cat = document.getElementById("cat").value;
  let des = document.getElementById("des").value;
  window.sessionStorage.setItem('location', loc);
  window.sessionStorage.setItem('category', cat);
  window.sessionStorage.setItem('description', des);
  window.location = "https://lost-and-found-steps.glitch.me//searchfound.html";
}
// example adding a list element
var node = document.createElement("LI"); // Create a <li> node

// var title = "Lost airpods";
// var category = "Headphone";
// var loc = "Shield Library";
// var date = "May 20th";
// var description = "I was studying, then I supposedly lost it.";

// var div = document.createElement("div");
// div.id = "container";
// div.innerHTML = "<p>" + title + "</p>" + '<div class="more">More</div>';
// div.className = "card";
// node.appendChild(div); // Append the div to <li>
// document.getElementById("card-list").appendChild(node); // Append <li> to <ul> with id="myList"

let xhr = new XMLHttpRequest();

xhr.open("GET", "/getLostAndFound");
xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

// set up callback function that will run when the HTTP response comes back
xhr.onloadend = function(e) {
  console.log(xhr.responseText);

  // responseText is a string
  let data = JSON.parse(xhr.responseText);

  for (var i = 0; i < data.length; i++) {
    var lostorfound = data[i].lostorfound;
    var title = data[i].title;
    var category = data[i].category;
    var loc = data[i].location;
    var date = data[i].date;
    var description = data[i].description;
    var time = data[i].description;
    var photourl = data[i].photourl;
    var id=i

    var div = document.createElement("div");
    div.id = "container" + i;
    console.log("photo:" + photourl);
    if(photourl === null){
        div.innerHTML = "<p class='title'>" + title + "</p>" + '<div class="card-details"><div class="card-label"><b>Category</b> '+ category +'</div>'+ '<div class="card-label"><b>Location</b> '+ loc +'</div>' + '<div class="card-label"><b>Date</b> '+ date +'</div>' +'<div class="card-desc">'+ description +'</div></div>' + '<button onclick="toggleSwitch('+ i +')" id="'+ i +'" class="more">More</button>';
    } else{
        div.innerHTML = "<p class='title'>" + title + "</p><div class='img-details'><img src='" + photourl + "' alt='photo'/> " + '<div class="card-details"><div class="card-label"><b>Category</b> '+ category +'</div>'+ '<div class="card-label"><b>Location</b> '+ loc +'</div>' + '<div class="card-label"><b>Date</b> '+ date +'</div>' +'<div class="card-desc">'+ description +'</div></div></div>' + '<button onclick="toggleSwitch('+ i +')" id="'+ i +'" class="more">More</button>';
    }
    div.className = "card";
    node.appendChild(div); // Append the div to <li>
    document.getElementById("card-list").appendChild(node); // Append <li> to <ul> with id="myList"
  }
};

// send off request
xhr.send(null);


function toggleSwitch(id) {
  var moreVar = document.getElementById(id);
  var card = document.getElementById("container" + id);
  if(moreVar.textContent === "More"){
    moreVar.textContent = "Less";
    console.log(card.children[1]);
    card.children[1].style.display = "flex";
  } else{
    moreVar.textContent = "More";
    card.children[1].style.display = "none";
  }

}
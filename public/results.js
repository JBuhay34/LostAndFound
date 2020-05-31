// example adding a list element
var node = document.createElement("LI"); // Create a <li> node

var title="Lost airpods";
var category="Headphone";
var loc="Shield Library";
var date="May 20th";
var description="I was studying, then I supposedly lost it.";

var div = document.createElement("div");
div.id = "container";
div.innerHTML = "<p>"+ title + "</p>" + '<div class="more">More</div>';
div.className = "card";
node.appendChild(div); // Append the div to <li>
document.getElementById("card-list").appendChild(node); // Append <li> to <ul> with id="myList"

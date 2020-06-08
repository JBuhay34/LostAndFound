var map, marker;
// Create the script tag, set the appropriate attributes
var script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyA4mCOdPJMuezDURluL8iHW9z0e4RoPy1M&callback=initMap&libraries=&v=weekly';
script.defer = true;
script.async = true;

// Attach your callback function to the `window` object
window.initMap = function() {
  // JS API is loaded and available
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 38.5367859, lng: -121.7553711},
    zoom: 15
  });
  marker = new google.maps.Marker({draggable:true});
  marker.setPosition(map.center);
  marker.setMap(map);
  marker.addListener('click', function() {
          map.setZoom(8);
          map.setCenter(marker.getPosition());
        });
  marker.addListener('dragend', function() {
          map.setZoom(16);
          map.setCenter(marker.getPosition());
    let url = "/getAddress?lat="+ marker.getPosition().lat() + "&lng=" + marker.getPosition().lng();
    fetch(url)
    .then(res=>res.json())
    .then(data=>{
    console.log(data);
      document.getElementById('location-input').value= data.results[0].formatted_address;
      window.sessionStorage.setItem("location", data.results[0].formatted_address);
      console.log(data.results[0].formatted_address);
    })
        });
      
};



// Append the 'script' element to 'head'
document.head.appendChild(script);



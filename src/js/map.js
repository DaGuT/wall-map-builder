//TODO: rewrite selectors with changers into vue-app reactive things

$(document).ready(function() {

  //-------------------default map setup
  let maxZoom = 17;
  let minZoom = 3;

  window.isLandscape = false;

  setMapResolution();

  //map init
  let map = L.map('map', {
    maxZoom: maxZoom,
    minZoom: minZoom,
    maxBoundsViscosity: 1.0,
    preferCanvas: true
  });

  window.map = map;

  //bounding as it was in demo
  let bounds = L.latLngBounds(L.latLng(-89.999, -180), L.latLng(89.999, 180));
  map.setMaxBounds(bounds);

  //we init location at Tomsk
  map.setView([56.46771, 84.97437], 13);

  //this is map styling
  let style = $('[name="mapStyle"]:checked').attr('id');
  changeMapStyle(style);

  //now we fit map to its place
  scaleMap();


  //------------------------by hand changers
  //change city name
  $('#city-label').on('input', (e) => {
    $('#labels #headline span').html(e.target.value);
  });

  //change country name
  $('#country-label').on('input', (e) => {
    $('#labels #country span').html(e.target.value);
  });
  //change latlon name
  $('#latlon-label').on('input', (e) => {
    $('#labels #latlon span').html(e.target.value);

    try {
      let coords = e.target.value.split('/');
      let lat = parseFloat(coords[0]);
      let lng = parseFloat(coords[1]);

      map.setView([lat, lng]);
    } catch (e) {
      console.log('Coords are not numbers');
    }
  });

  //this is style changer
  $('[name="mapStyle"]').change((e) => {
    changeMapStyle(e.target.getAttribute('id'));
  });

  //this is text style changer
  $('[name="labelStyle"]').change((e) => {
    $('.styleSelector.label-selector label').removeClass('btn-info').addClass('btn-light');
    $(e.target).next().removeClass('btn-light').addClass('btn-info');

    $('#labels').parent().attr('id', e.target.getAttribute('to'));
  });

  //this is borderStyle changer
  $('[name="borderStyle"]').change((e) => {
    $('.styleSelector.border-selector label').removeClass('btn-info').addClass('btn-light');
    $(e.target).next().removeClass('btn-light').addClass('btn-info');

    $('#baget-wrapper > *:first').attr('class', e.target.getAttribute('to'));
  });

  //this is landscape changer
  $('[name="landscape"]').change((e) => {
    $('.styleSelector.landscape-selector label').removeClass('btn-info').addClass('btn-light');
    $(e.target).next().removeClass('btn-light').addClass('btn-info');

    //if it's undefined then it's false :D
    window.isLandscape = e.target.getAttribute('to');

    setMapResolution();

    scaleMap();
  });

  //this is resolution changer
  $('[name="resolution"]').change((e) => {
    $('.styleSelector.resolution-selector label').removeClass('btn-info').addClass('btn-light');
    $(e.target).next().removeClass('btn-light').addClass('btn-info');

    setMapResolution();

    scaleMap();
  });

  //auto rescaler upon window resize
  $(window).resize(() => {
    scaleMap();
  });

  $('.leaflet-control-attribution').remove();




  //---------------Auto changers

  //change lon,ltd Automatically on drag
  //TBD
  function changeLatLng(lat, lng) {
    $('#latlon-label')[0].value = `${lat.toFixed(5)}°N / ${lng.toFixed(5)}°E`;
    $('#labels #latlon span')[0].innerHTML = `${lat.toFixed(5)}°N / ${lng.toFixed(5)}°E`;
  }
  //I want to export this function for search purposes
  window.changeLatLng = changeLatLng;

  //and that part will do text chaning automatically
  map.whenReady(function() {
    map.on('drag', function(e) {
      let center = map.getCenter();
      let lat = center.lat;
      let lng = center.lng;
      changeLatLng(lat, lng);
    });
  });


});

//these are additional functions
function changeMapStyle(style) {

  $('.leaflet-tile-pane').empty();

  //map is global object
  map.eachLayer((layer) => {
    map.removeLayer(layer);
  });

  let token = "pk.eyJ1IjoiZGFndXQiLCJhIjoiY2puY2Fqdnd5MDVlMTNwbnZ2c3NxYTdpaCJ9.UXbtzl9dQ7tOKHyDZ2fljQ";

  let newLayer = 'https://api.mapbox.com/styles/v1/dagut/' + style + '/tiles/256/{z}/{x}/{y}@2x?access_token=' + token;
  L.tileLayer(newLayer).addTo(map);
}

//make image out of map DOM
function buildMap() {

  let node = document.getElementsByClassName('map-container')[0];
  $('.leaflet-control-zoom').addClass('d-none');
  $('.baget').removeClass('baget-border');

  domtoimage.toBlob(node)
    .then(function(blob) {
      window.saveAs(blob, `dagut.ru-Map.png`);
      $('.leaflet-control-zoom').removeClass('d-none');
      $('.baget').addClass('baget-border');
    });

}

//scaler
function scaleMap() {

  let styleScaledForX = 1240;
  let styleScaledForY = 1790;

  //this is container we need to fit
  let containerWidth = $('.scaled').width();
  let containerHeight = $('.scaled').height();

  //this is the map we need to fit
  let mapWidth = $('.map-wrapper').width();
  let mapHeight = $('.map-wrapper').innerHeight();


  let coef = mapHeight / mapWidth;
  if (coef < 1) { //in case of landscape mode

    coef = 1 / coef;
    let swap = styleScaledForX;
    styleScaledForX = styleScaledForY;
    styleScaledForY = swap;

  }
  let scaleX = containerWidth / mapWidth;
  let scaleY = containerHeight / mapHeight;

  if (mapWidth * scaleY <= containerWidth) {
    scaleX = scaleY;
  } else {
    scaleY = scaleX;
  }

  //we rescale map
  $('.map-wrapper')[0].style.transform = `scale(${scaleX},${scaleY}) translate(-50%,-50%)`;

  //now we fit map into new space
  map.invalidateSize();

  //now we rescale map layout
  $('.leaflet-top.leaflet-left')[0].style.transform = `scale(${1/scaleX},${1/scaleY})`;
  $('#baget-wrapper > *').css('width', (mapWidth / (mapWidth / styleScaledForX)) + 6).css('height', (mapHeight / (mapHeight / styleScaledForY)) + 6);
  $('#baget-wrapper > *')[0].style.transform = `scale(${mapWidth/styleScaledForX},${mapHeight/styleScaledForY})`;
}

//for resolution
function getRes(ppi) {
  if (ppi == undefined) ppi = 150;
  //300 ppi is good ppi for printing on paper
  let ppiScale = 300 / ppi;

  //resolution is set so that 300 ppi is met for specific paper standard (like A0 or A4). If we want to have less or more ppi, we need to scale our initial value by that scale factor
  let res = $('[name=resolution]:checked').attr('id').split('x').map(a => a / ppiScale);

  if (window.isLandscape) {
    let bubble = res[0];
    res[0] = res[1];
    res[1] = bubble;
  }

  return res;
}

function setMapResolution() {
  let res = getRes();

  let mapHeight = res[1]; //default is 4k (4096)
  let mapWidth = res[0]; //3072

  //we change map resolution to this thing
  $('.map-wrapper').innerHeight(mapHeight).width(mapWidth);
}


//-----------SEARCH BY PLACE

//this function will change all places with lat,lng, city name
function changeBySearch(lat, lng, city) {

  //we change our lat lng in menu
  changeLatLng(lat, lng);

  //we move our map
  map.setView([lat, lng]);

  //we change city in menu
  $('#city-label')[0].value = city;
  //we change city on map
  $('#labels #headline span').html(city);
  $("#city-label").val(city);
}

//search by place name and print list of results
function searchByName(placeName) {

  //my apikey to hide
  let apikey = 'e506f228a59f4133a40a76c6c3cf2a0a';

  //api url for beauty
  let api_url = 'https://api.opencagedata.com/geocode/v1/json'

  //request link
  let request_url = api_url +
    '?' +
    'key=' + apikey +
    '&q=' + encodeURIComponent(placeName) +
    '&pretty=1' +
    '&no_annotations=1';

  //request itself
  let request = new XMLHttpRequest();
  request.open('GET', request_url, true);

  request.onload = function() {

    if (request.status == 200) {
      // Success!

      //we extract answer
      let data = JSON.parse(request.responseText);

      //we reactively change our list (rerender)
      myApp.citiesList=buildCitiesList(data);

    } else if (request.status <= 500) {
      // We reached our target server, but it returned an error

      console.log("unable to geocode! Response code: " + request.status);
      let data = JSON.parse(request.responseText);
      console.log(data.status.message);
    } else {
      console.log("server error");
    }
  };

  request.onerror = function() {
    console.log("unable to connect to server");
  };

  request.send(); // make the request
}

//this function will propely build array of items so that proper HTML can be rendered with vue
function buildCitiesList(data) {

  //renaming
  let results = data.results;

  //if we have no results
  if (results.length == 0) {
    //we return "not found"
    return [emptyListPlaceHolder];
  }

  //soring list. The smaller confidence is, the higher result should be
  results.sort((a,b) => a.confidence-b.confidence);

  //this is our list of cities for myApp
  let list = results.map(city => {
    return {
      "name":city.formatted,
      "lat":city.geometry.lat,
      "lng":city.geometry.lng
    }
  });

  //and we return that list and thus later rerender it
  return list;
}

//DROPDOWN MENU search addition (bootstrap)
//whenever user click ENTER it will search places based on entered data
$(document).ready(function() {
  //our search field element
  let el = $('#city-label[data-toggle="dropdown"]');
  //adding event listener to search field. Whenever user clicks enter - we initiate search (we're on free key, so do not allow too much searches)
  el.on('keydown', e => {
    //if enter is clicked
    if (event.keyCode === 13) {
      //just changing everything according to bootstrap rules
      //chaging aria-expanded attr
      el.attr('aria-expanded', 'true');

      //adding show class
      el.addClass('show');
      el.next().addClass('show');

      //and we do magic with list
      searchByName(el.val());
    }
  });

  //whenever we click outside of list, we just close it without any changes
  $(document).click(e=>{
    hideSearchList();
  });
});

//just a function that hides list. I need it in different places
function hideSearchList() {
  //all our dropdown items
  let el = $('#city-label[data-toggle="dropdown"]');
  //chaging aria-expanded attr
  el.attr('aria-expanded', 'true');
  //adding show class
  el.removeClass('show');
  el.next().removeClass('show');
}

//onClick function for search resulsts list (HACK)
function onSearchSelect(selItem) {
  //upon selecting anything from search results, we need to close the list
  hideSearchList();

  $("#city-label").val(selItem.innerHTML);

  changeBySearch(parseFloat(selItem.getAttribute('lat')),parseFloat(selItem.getAttribute('lng')),selItem.innerHTML)
}

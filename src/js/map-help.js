$(document).ready(function () {
	var hash = Math.random().toString(36).replace(/[^a-z]+/g, '');
	var XHR = window.XDomainRequest || window.XMLHttpRequest
	var xhr = new XHR();

	function print_map() {
		map.invalidateSize();
		hash = $("#get_hash").val();
		localStorage.setItem('hash', hash);
		var src = $('.leaflet-tile-container img').attr('src');
		src = src.split('/'); // ["https:", "", "tiles.mapiful.com", "mono", "6", "33", "25.png"]
		var style = src[6];
		var zoom = src[9];
		var imgs = [];
		$('.leaflet-tile-container img').each(function (i) {
			src = this.src;
			src = src.split('/');
			var exclude_token = src[11].split('@');
			imgs.push(src[10] + '/' + exclude_token[0]);
		});

		var data = {};
		data.hash = hash;
		data.style = style;
		data.zoom = zoom;
		data = JSON.stringify(data);
		imgs = JSON.stringify(imgs);

		console.log('data: ', data);

		$.post(document.location.href, {
			step: 1,
			data: data,
			img: imgs
		}, function (res) {
			setTimeout(function () {
				console.log('time!');
				buildImg(map);
			}, 10000);
		});

	}

	$('.config').on('submit', function (e) {
		e.preventDefault();
	})

	/*=================== TEXT on MAP =======================*/
	$('#map_city').keyup(function () {
		$('.city').text(this.value);
	});
	$('#map_city').change(function () {
		$('.city').text(this.value);
	});
	$('#map_country').keyup(function () {
		$('.country span').text(this.value);
	});
	$('#map_country').change(function () {
		$('.country span').text(this.value);
	});
	$('#map_subtitle').keyup(function () {
		$('.subtitle').text(this.value);
	});
	$('#map_subtitle').change(function () {
		$('.subtitle').text(this.value);
	});

	$('#search').keyup(function (e) {
		if (e.keyCode == 13) {
			var city = this.value;
			search(city);
		}
	});

	$('.search-button').on('click', function (e) {
		e.preventDefault();
		var city = $('#search').val();
		search(city);
	})

	function search(city) {
		$.post(document.location.href, {
			action: city
		}, function (data) {
			var res = JSON.parse(data);
			var zoom = map.getZoom(),
				style = $('.map_style:checked').val();


			////
			var lat = String(res.lat);
			var lng = String(res.lng);
			lat = lat.substring(0, 6);
			lng = lng.substring(0, 6);

			$('.subtitle').html(lat + '°N / ' + lng + '°E');
			$('#map_subtitle').val(lat + '°N / ' + lng + '°E');
			////

			if (zoom < 12) zoom = 12;
			mapInit(style, res.lat, res.lng, zoom);

			$('.city').text(res.title);
			$('#map_city').val(res.title);

			$('.country span').text(res.country);
			$('#map_country').val(res.country);



		})
		return false;
	}

	/*===================== MAP INIT =========================*/
	const mapMinZoom = 3;
	const mapMaxZoom = 17;

	var map = L.map('map', {
		maxZoom: mapMaxZoom,
		minZoom: mapMinZoom,
		maxBoundsViscosity: 1.0,
		preferCanvas: true
	});

	var southWest = L.latLng(-89.98155760646617, -180);
	var northEast = L.latLng(89.99346179538875, 180);
	var bounds = L.latLngBounds(southWest, northEast);
	map.setMaxBounds(bounds);

	//var style = $('.map_style:checked').val();
    var style = 'cjmcm02owiw8q2sqaef01jszj';
	mapInit(style, 0, 0, 0);
	map.scrollWheelZoom.disable()

	function mapInit(style, lat, lng, zoom) {
		$('.leaflet-tile-pane').empty();
		map.eachLayer(function (layer) {
			map.removeLayer(layer);
		});

		var layer = 'https://api.mapbox.com/styles/v1/stvoler/' + style + '/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoic3R2b2xlciIsImEiOiJjamt6cGhlamkwdHFtM2pvZGxpbWNheTQwIn0.gQjWJJD8vhd8aJeFpPUsBQ';
		L.tileLayer(layer, {
			minZoom: mapMinZoom,
			maxZoom: mapMaxZoom,
			accessToken: 'pk.eyJ1Ijoic3R2b2xlciIsImEiOiJjamt6cGhlamkwdHFtM2pvZGxpbWNheTQwIn0.gQjWJJD8vhd8aJeFpPUsBQ'
		}).addTo(map);

		if (lat != undefined && lng != undefined && zoom != undefined) map.setView([lat, lng], zoom);
	}
	$(".ni1").click(function () {
		setTimeout(function () {
			map.invalidateSize()
		}, 9);
	});
	$(".ni2").click(function () {
		setTimeout(function () {
			map.invalidateSize()
		}, 9);
	});

	$('#print').on('click', function () {


		var lat = $('#lat').val();
		var lng = $('#lng').val();
		var zoom = $('#zoom').val();
		var style = $('#style').val();

		mapInit(style, lat, lng, zoom);

		function pause() {
			// code
			setTimeout(pause, 5000);
		}
		print_map();
	});

	$('#add_cart').on('click', function () {
		var size = $('.size_block .print_size:checked').attr('data-size');
		var coord = map.getCenter();

		$("#set_hash").val(hash);
		$("#set_lat").val(coord.lat);
		$("#set_lng").val(coord.lng);
		$("#set_zoom").val(map.getZoom());

		var data = {
			hash: hash,
			city: $('.city').text(),
			country: $('.country span').text(),
			subtitle: $('.subtitle').text(),
			size: size,
			lat: coord.lat,
			lng: coord.lng,
			zoom: map.getZoom(),
			style: $('.map_style:checked').val(),
			price: $('.price_value').text()
		}

		$.ajax({
			type: 'post',
			async: false,
			url: 'https://example.com:3000/config',
			data: data
			/*,
			success: function (res) {
			    location.href = '/cart?hash=' + res;
			}
			*/
		})
	})

	/*===================== BUILD IMG =========================*/
	function buildImg(map) {
		leafletImage(map, function (err, canvas) {
			try {
				console.log(canvas);
				var img = document.createElement('img');
				var orientation = $('input.orientation:checked').val();
				var sizew = $('input.sizew:checked').val();

				img.width = 2160;
				img.height = 3024;
				if (orientation == 'vertical') img.height = 3024;
				if (orientation == 'horizontal') img.height = 2160;
				if (orientation == 'horizontal') img.width = 3024;
				/*if (sizew == '30x40') img.width = 2062;*/
				console.log('width: ', img.width, 'height: ', img.height);

				img.src = canvas.toDataURL();
				var map_src = img.src;

				var labels = document.getElementById('frame');
				labels.style.width = img.width;
				labels.style.position = 'absolute';
			} catch (err) {
				console.error('buildImg(map) error: ', err);
			}

			domtoimage.toPng(labels)
				.then(function (labels_src) {
					console.log(labels_src);
					labels.style.position = 'absolute';
					$.ajax({
						type: 'post',
						async: false,
						url: 'https://example.com:3000/save',
						data: {
							map_src: map_src,
							labels_src: labels_src,
							hash: hash
						},
						success: function (res) {
							console.log('save: ', res);
							$('.gray.button').addClass('red');
						}
					})
				})
				.catch(function (error) {
					console.error('domtoimage.toPng(labels) error: ', error);
				});
		});
	}

	/*===================== CHANGE STYLE =========================*/
	$('.map_style').on('click', function () {
		mapInit(this.value);
	})
});

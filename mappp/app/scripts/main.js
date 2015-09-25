/*jslint browser: true*/
/*global L */

(function(window, document, L, undefined) {
  'use strict';

  L.GeoIP = L.extend({
    getPosition: function(ip, callback) {
      var url = "http://freegeoip.net/json/";
      var result = L.latLng(0, 0);

      if (ip !== undefined) {
        url = url + ip;
      } else {
        //lookup our own ip address
      }

      var xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.timeout = 2000;
      xhr.onload = function() {
        var status = xhr.status;
        if (status == 200) {
          var geoip_response = JSON.parse(xhr.responseText);
          result.lat = geoip_response.latitude;
          result.lng = geoip_response.longitude;

          callback(result)
        } else {
          console.log("Leaflet.GeoIP.getPosition failed because its XMLHttpRequest got this response: " + xhr.status);
        }
      };
      xhr.send();
    },

    centerMapOnPosition: function(map, zoom, ip) {
      L.GeoIP.getPosition(ip, function(position) {
        map.setView(position, zoom);
      });
    }
  });

  L.Icon.Default.imagePath = 'images/';

  /* create leaflet map */
  var map = L.map('map', {
    center: [52.5377, 13.3958],
    zoom: 4
  });

  /* add default stamen tile layer */
  new L.tileLayer('http://openmapsurfer.uni-hd.de/tiles/roads/x={x}&y={y}&z={z}', {
    minZoom: 0,
    maxZoom: 18,
    attribution: 'Map data © <a href="http://www.openstreetmap.org">OpenStreetMap contributors</a>'
  }).addTo(map);

  var marker = L.marker(map.getCenter()).addTo(map);
  var interval = 10000;
  var to, from = 0;
  var urlOrder = '';
  var orders = [];

  setInterval(function() {
    to = moment().utc().format('YYYY-MM-DD HH:mm:ss');
    from = moment().utc().add(-interval, 'milliseconds').format('YYYY-MM-DD HH:mm:ss');
    urlOrder = 'http://order.gep-api.jpe1.rpaas.prod.jp.local/order/find?pagerOffset=0&orderDateFrom=' + from + '&orderDateTo=' + to + '&isValid=true&isReal=true&isTest=false&responseFields=orderPrice&responseFields=shopper&responseFields=orderItem';

    console.log(from + ' to ' + to);

    $.ajax({
      url: urlOrder,
      type: 'GET',
      async: true,
      beforeSend: function(xhr) {
        xhr.setRequestHeader('x-client-id', 'randmo');
      },
      success: function(data) {
        _.each(data.order, function(order) {
          orders.push(order);
        });
      },
      error: function(xhr) {
        if (xhr.status == 404) {
          console.log('No Data');
        }
      }
    });
  }, interval);

	var isQuery = false;
  setInterval(function() {
		if(isQuery) {
			return true;
		}
    console.log(orders.length);
    if (orders.length > 0) {
      var order = orders.pop();
			console.log(order);
			//isQuery = true;

			$.get('http://ipinfo.io/' + order.shopper.ipAddress + '/json', function(result) {
				var loc = result.loc.split(",");
				var newLatLng = new L.LatLng(loc[0], loc[1]);
				marker.setLatLng(newLatLng);
				marker.bindPopup('Someone order <b>' + order.orderItem[0].name.value + '</b><br>Amount: ' + order.orderPrice.shopperTotalMinusPointAmount).openPopup();

				map.setView(marker.getLatLng(), map.getZoom());

				isQuery = false;
			});

    }
  }, 3000);

}(window, document, L));

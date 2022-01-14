onload = () => {
  setMap();
  setFunction();
  searchPlaces();
};

let map,
  ps,
  markerList = [],
  infoWindow;
function setMap() {
  const mapContainer = document.querySelector('#map');
  const mapOption = {
    center: new daum.maps.LatLng(37.554477, 126.970419),
    level: 3,
  };

  map = new daum.maps.Map(mapContainer, mapOption);
}

function setFunction() {
  infoWindow = new daum.maps.InfoWindow({
    zIndex: 1,
  });

  ps = new daum.maps.services.Places();
}

function searchPlaces() {
  const keyword = document.querySelector('#keyword').value;
  ps.keywordSearch(keyword, placeSearchCallback);
}

function placeSearchCallback(data, status) {
  if (status === daum.maps.services.Status.OK) {
    displayPlaces(data);
  } else if (status === daum.maps.services.Status.ZERO_RESULT) {
    alert('검색 결과가 존재하지 않습니다.');
    return;
  } else if (status === daum.maps.services.Status.ERROR) {
    alert('검색 중 오류가 발생했습니다.');
    return;
  }
}

function displayPlaces(places) {
  let listEl = document.querySelector('#placeList');
  let bounds = new daum.maps.LatLngBounds();

  removeAllChildNodes(listEl);
  removeMarker();

  for (let i = 0; i < places.length; i++) {
    const place = places[i];
    const {
      x: lng,
      y: lat,
      address_name: addressName,
      place_name: placeName,
    } = place;

    const placePosition = new daum.maps.LatLng(lat, lng);
    bounds.extend(placePosition);

    let marker = new daum.maps.Marker({
      position: placePosition,
    });

    marker.setMap(map);
    markerList.push(marker);

    const el = document.createElement('div');
    const itemStr = `
      <div class="info">
        <div class="info-title">
         ${placeName}
        </div>
        <span>${addressName}</span>
      </div>
    `;

    el.innerHTML = itemStr;
    el.className = 'item';

    daum.maps.event.addListener(marker, 'click', function () {
      displayInfoWindow(marker, placeName, addressName, lat, lng);
    });

    daum.maps.event.addListener(map, 'click', function () {
      infoWindow.close();
    });

    el.onclick = function () {
      displayInfoWindow(marker, placeName, addressName, lat, lng);
    };

    listEl.appendChild(el);
  }

  map.setBounds(bounds);
}

function displayInfoWindow(marker, title, address, lat, lng) {
  const content = `
    <div class="kakao-info-window">
      ${title}<br />
      ${address}<br />
      <button onclick="onSubmit('${title}', '${address}', ${lat}, ${lng});">등록</button>
    </div>
  `;

  map.panTo(marker.getPosition());
  infoWindow.setContent(content);
  infoWindow.open(map, marker);
}

function removeAllChildNodes(el) {
  while (el.hasChildNodes()) {
    el.removeChild(el.lastChild);
  }
}

function removeMarker() {
  for (let i = 0; i < markerList.length; i++) {
    markerList[i].setMap(null);
  }

  markerList = [];
}

function onSubmit(title, address, lat, lng) {
  console.log('title, address, lat, lng', title, address, lat, lng);

  $.ajax({
    url: '/locations',
    data: { title, address, lat, lng },
    method: 'POST',
  })
    .done((res) => {
      console.log('데이터 요청 성공 - res', res);

      alert('위치 저장 성공');
    })
    .fail((err) => {
      console.log('데이터 요청 실패 - err', err);
      alert('데이터 저장 실패');
    });
}

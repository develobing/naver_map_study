let map,
  kakaoPlace,
  markerList = [],
  infoWindowList = [],
  searchList = [];

onload = () => {
  setMap();
  setKakaoPlace();
  setMarker();
  setCurrentLocationEvent();
  setFindLocationEvent();
};

function setMap() {
  const mapOptions = {
    center: new naver.maps.LatLng(37.3595704, 127.105399),
    zoom: 10,
  };

  map = new naver.maps.Map('map', mapOptions);
}

function setKakaoPlace() {
  kakaoPlace = new kakao.maps.services.Places();
}

function setMarker() {
  const markerElement = '<div class="marker"></div>';

  console.log('positions', positions);

  for (let i in positions) {
    const target = positions[i];
    const latlng = new naver.maps.LatLng(target.lat, target.lng);

    const marker = new naver.maps.Marker({
      map: map,
      position: latlng,
      icon: {
        content: markerElement,
        // Marker의 CSS Style 크기가 24px 이므로, 중심좌표는 반인 (12, 12)로 설정
        anchor: new naver.maps.Point(12, 12),
      },
    });

    const content = `<div class="info-window-wrap">
      <div class="info-window-title">
        ${target.title}
      </div>
      <div class="info-window-content">
        ${target.content}
      </div>
      <div class="info-window-date">
        ${target.date}
      </div>
    </div>`;

    const infoWindow = new naver.maps.InfoWindow({
      content,

      // 스타일 커스터마이징을 위해 기본 색상은 초기화
      backgroundColor: '#00ff0000',
      borderColor: '#00ff0000',

      // 말풍선 형태의 꼬리표 제거
      anchorSize: new naver.maps.Size(0, 0),
    });

    markerList.push(marker);
    infoWindowList.push(infoWindow);
  }

  for (let i = 0, ii = markerList.length; i < ii; i++) {
    // 맵 클릭 이벤트 적용
    naver.maps.Event.addListener(map, 'click', clickMap(i));

    // 개별 마커에 클릭 이벤트 적용
    naver.maps.Event.addListener(markerList[i], 'click', getClickHandler(i));
  }
}

// Map click handler
function clickMap(i) {
  return function () {
    const infoWindow = infoWindowList[i];
    infoWindow.close();
  };
}

// Marker click handler
function getClickHandler(i) {
  return function () {
    const marker = markerList[i];
    const infoWindow = infoWindowList[i];

    // infoWindow 화면에 노출
    const isInfoWindowInMap = infoWindow.getMap();
    if (isInfoWindowInMap) infoWindow.close();
    else infoWindow.open(map, marker);
  };
}

let isCurrentUsed = false;
function setCurrentLocationEvent() {
  $('#current').click(() => {
    // 위치정보 사용할 수 있는 Device 인지 확인
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const latlng = new naver.maps.LatLng(lat, lng);

        if (!isCurrentUsed) {
          const marker = new naver.maps.Marker({
            map,
            position: latlng,
            icon: {
              content:
                '<img class="pulse" draggable="false" unselectable="on" src="https://myfirstmap.s3.ap-northeast-2.amazonaws.com/circle.png">',
              anchor: new naver.maps.Point(11, 11),
            },
          });

          isCurrentUsed = true;
        }

        // 지도 해당 위치로 이동
        moveToPosition(latlng);
      });
    } else {
      alert('위치정보 사용 불가능');
    }
  });
}

function setFindLocationEvent() {
  $('.search-input').on('keydown', function (e) {
    if (e.keyCode === 13) {
      let content = $(this).val();
      kakaoPlace.keywordSearch(content, placeSearchCallback);
    }
  });

  $('.search-button').on('click', function (e) {
    if (e.keyCode === 13) {
      let content = $('.search-input').val();
      kakaoPlace.keywordSearch(content, placeSearchCallback);
    }
  });
}

// Kakao Place API로 검색 후 실행되는 Callback 함수
function placeSearchCallback(data, status, pagination) {
  console.log('placeSearchCallback() - data', data);

  // // 다음 페이지의 데이터도 받고 싶으면, pagination의 nextPage() 함수 실행
  // let nextPage = pagination.nextPage();
  // console.log('placeSearchCallback() - pagination', pagination);
  // console.log('placeSearchCallback() - nextPage', nextPage);

  if (status === kakao.maps.services.Status.OK) {
    const target = data[0];
    const { y: lat, x: lng } = target;
    const latlng = new naver.maps.LatLng(lat, lng);

    const marker = new naver.maps.Marker({
      position: latlng,
      map,
    });

    // 화면에 검색 위치 마커가 표시되어 있는지 확인해서 1개만 노출되도록 함
    if (searchList.length === 0) {
      searchList.push(marker);
    } else {
      searchList.push(marker);

      // 이전 마커 추출해서, 지도에서 제거
      let previousMarker = searchList.splice(0, 1);
      previousMarker[0].setMap(null);
    }

    // 지도 해당 위치로 이동
    moveToPosition(latlng);
  } else {
    alert('검색결과가 없습니다.');
  }
}

// 지도에서 해당 위치로 이동
function moveToPosition(latlng) {
  // setZoom(): 지도의 줌 레벨 변경
  // params: (zoomLevel, isAnimation)
  map.setZoom(14, false);

  // panTo(): 해당 위치로 이동
  map.panTo(latlng);
}

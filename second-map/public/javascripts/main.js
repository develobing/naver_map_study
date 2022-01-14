onload = async () => {
  setMap();
  await setLocations();
  setMarkers(initialMarkers);
  setInfoWindow();
  setClustering();
  setRegion();
};

let map,
  initialMarkers = [],
  markerList = [],
  infoWindowList = [],
  regionGeoJson = [];

function setMap() {
  const mapOptions = {
    center: new naver.maps.LatLng(37.3595704, 127.105399),
    zoom: 10,
  };

  map = new naver.maps.Map('map', mapOptions);
  naver.maps.Event.addListener(map, 'click', clickMapHandler);
}

function setMarkers(markers) {
  for (let i in markers) {
    const { title, address, lat, lng } = markers[i];
    const latlng = new naver.maps.LatLng(lat, lng);

    let marker = new naver.maps.Marker({
      map,
      position: latlng,
      icon: {
        content: `<div class="marker"></div>`,
        anchor: new naver.maps.Point(7.5, 7.5),
      },
    });

    const infoWindowContent = `
      <div class="info-window-wrap">
        <div class="info-window-title">${title}</div>
        <div class="info-window-address">${address}</div>
      </div>
    `;

    const infoWindow = new naver.maps.InfoWindow({
      content: infoWindowContent,
      backgroundColor: '#00ff0000',
      borderColor: '#00ff0000',
      anchorSize: new naver.maps.Size(0, 0),
    });

    markerList.push(marker);
    infoWindowList.push(infoWindow);
  }
}

function setInfoWindow() {
  for (let i = 0, ii = markerList.length; i < ii; i++) {
    naver.maps.Event.addListener(markerList[i], 'click', () =>
      clickMarkerHandler(i)
    );
  }
}

function clickMapHandler() {
  infoWindowList.forEach((infoWindow) => {
    infoWindow.close();
  });
}

function clickMarkerHandler(i) {
  const marker = markerList[i];
  const infoWindow = infoWindowList[i];

  if (infoWindow.getMap()) {
    infoWindow.close();
  } else {
    infoWindow.open(map, marker);
  }
}

function setLocations() {
  return new Promise((resolve) => {
    $.ajax({
      url: '/locations',
      method: 'GET',
    })
      .done((res) => {
        console.log('위치 정보 조회 성공 - res', res);
        initialMarkers = res.locations;

        resolve();
      })
      .fail((err) => {
        console.log('위치 정보 조회 실패 - err', err);
      });
  });
}

function setClustering() {
  const cluster1 = {
    content: `<div class="cluster1"></div>`,
  };

  const cluster2 = {
    content: `<div class="cluster2"></div>`,
  };

  const cluster3 = {
    content: `<div class="cluster3"></div>`,
  };

  const markerClustering = new MarkerClustering({
    minClusterSize: 2,
    maxZoom: 12,
    map,
    markers: markerList,
    disableClickZoom: false, // 마커 클릭해서 해당 마커로 지도 확대
    gridSize: 20, // 클러스터의 그룹을 지을 영역 사이즈
    icons: [cluster1, cluster2, cluster3],
    indexGenerator: [2, 5, 10], // 각 클러스터가 생성될 마커의 최소 개수

    // 마커 클러스터 안에 몇개의 마커가 있는지를 확인해줄 수 있개 하는 함수
    stylingFunction: (clusterMarker, count) => {
      $(clusterMarker.getElement()).find('div:first-child').text(count);
    },
  });
}

function setRegion() {
  const regionUrl = 'https://navermaps.github.io/maps.js/docs/data/region';
  const urlSuffix = '.json';

  let loadCount = 0;

  const tooltip = $(
    `<div style="position: absolute; z-index: 1000; padding: 5px 10px; background-color: #fff; border: 1px solid black; font-size: 14px; display: none; point-event: none;"></div>`
  );

  tooltip.appendTo(map.getPanes().floatPane);

  // naver.maps.Event.once(map, 'init_stylemap', () => {

  for (let i = 1; i < 18; i++) {
    let keyword = i.toString();

    if (keyword.length === 1) {
      keyword = '0' + keyword;
    }

    $.ajax({
      url: `${regionUrl}${keyword}${urlSuffix}`,
    })
      .done((geoJson) => {
        console.log('GeoJson 조회 성공 - geoJson', geoJson);

        regionGeoJson.push(geoJson);
        loadCount++;
        if (loadCount === 17) {
          startDataLayer(tooltip);
        }
      })
      .fail((err) => {
        console.log('GeoJson 조회 실패 - err', err);
      });
  }
  // });
}

function startDataLayer(tooltip) {
  map.data.setStyle((feature) => {
    const styleOptions = {
      fillColor: '#ff0000',
      fillOpacity: 0.0001,
      strokeColor: '#ff0000',
      strokeWeight: 2,
      strokeOpacity: 0.4,
    };

    if (feature.getProperty('focus')) {
      styleOptions.fillOpacity = 0.6;
      styleOptions.fillColor = '#0f0';
      styleOptions.strokeColor = '#0f0';
      styleOptions.strokeWeight = 4;
      styleOptions.strokeOpacity = 1;
    }

    return styleOptions;
  });

  regionGeoJson.forEach((geoJson) => {
    map.data.addGeoJson(geoJson);
  });

  map.data.addListener('click', (e) => {
    let feature = e.feature;

    if (feature.getProperty('focus') !== true) {
      feature.setProperty('focus', true);
    } else {
      feature.setProperty('focus', false);
    }
  });

  map.data.addListener('mouseover', (e) => {
    let feature = e.feature;
    let regionName = feature.getProperty('area1');

    tooltip
      .css({
        display: 'block',
        left: e.offset.x,
        top: e.offset.y,
      })
      .text(regionName);

    map.data.overrideStyle(feature, {
      fillOpacity: 0.6,
      strokeWeight: 4,
      strokeOpacity: 1,
    });
  });

  map.data.addListener('mouseout', (e) => {
    tooltip.hide().empty();
    map.data.revertStyle();
  });
}

import React, { useState, useEffect } from 'react';

const KakaoMap = () => {
  
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    // 지도 초기화
    const container = document.getElementById('map');
    const options = {
      center: new window.kakao.maps.LatLng(37.566826, 126.978656),
      level: 3
    };
    const kakaoMap = new window.kakao.maps.Map(container, options);
    setMap(kakaoMap);
  }, []);

  // 마커 추가 함수
  const addMarker = (position, title) => {
    const markerPosition = new window.kakao.maps.LatLng(position.lat, position.lng);
    const marker = new window.kakao.maps.Marker({
      position: markerPosition,
      map: map
    });

    // 인포윈도우 생성
    const infowindow = new window.kakao.maps.InfoWindow({
      content: `<div style="padding:5px;font-size:12px;">${title}</div>`
    });

    // 마커 클릭 이벤트
    window.kakao.maps.event.addListener(marker, 'click', () => {
      infowindow.open(map, marker);
    });

    return marker;
  };

  // 검색 처리 함수
  const handleSearch = () => {
    if (!searchKeyword.trim()) return;

    // 기존 마커들 제거
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    // 장소 검색 객체 생성
    const ps = new window.kakao.maps.services.Places();

    // 키워드로 장소 검색
    ps.keywordSearch(searchKeyword, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
        // LatLngBounds 객체에 좌표를 추가합니다
        const bounds = new window.kakao.maps.LatLngBounds();
        const newMarkers = [];

        data.forEach(place => {
          const position = {
            lat: place.y,
            lng: place.x
          };
          const marker = addMarker(position, place.place_name);
          bounds.extend(new window.kakao.maps.LatLng(place.y, place.x));
          newMarkers.push(marker);
        });

        setMarkers(newMarkers);
        map.setBounds(bounds);
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        alert('검색 결과가 존재하지 않습니다.');
      } else if (status === window.kakao.maps.services.Status.ERROR) {
        alert('검색 결과 중 오류가 발생했습니다.');
      }
    });
  };

  return (
    <div>
      <div className="search-container" style={{ margin: '10px 0' }}>
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="장소를 검색하세요"
          style={{ padding: '5px', marginRight: '5px' }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
        />
        <button onClick={handleSearch} style={{ padding: '5px 10px' }}>
          검색
        </button>
      </div>
      <div id="map" style={{ width: '100%', height: '360px' }}></div>
    </div>
  );
};

export default KakaoMap;
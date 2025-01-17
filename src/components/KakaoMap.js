import React, { useState, useEffect,useCallback  } from 'react';
import '../css/KakaoMap.css';
import searchIcon from '../images/icon_search.png';

const KakaoMap = () => {
  
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);

  useEffect(() => {
    // 지도 초기화
    const container = document.getElementById('map');
    const options = {
      center: new window.kakao.maps.LatLng(37.566826, 126.978656),
      level: 3,
      draggable: true // 드래그 가능하도록 설정
    };
    const kakaoMap = new window.kakao.maps.Map(container, options);
    setMap(kakaoMap);

    // 지도 드래그 이벤트 리스너 추가
    window.kakao.maps.event.addListener(kakaoMap, 'dragend', () => {
      const latlng = kakaoMap.getCenter();
      console.log('지도 중심 좌표:', latlng.getLat(), latlng.getLng());
    });
  }, []);

  // 마커 추가 함수
  const addMarker = useCallback((position, title) => {
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
      focusOnPlace(position, title);
      infowindow.open(map, marker);
    });

    // 마우스가 마커 위로 올라왔을 때 인포윈도우 표시
    window.kakao.maps.event.addListener(marker, 'mouseover', () => {
      infowindow.open(map, marker);
    });
  
    // 마우스가 마커에서 벗어났을 때 인포윈도우 숨기기
    window.kakao.maps.event.addListener(marker, 'mouseout', () => {
      infowindow.close();
    });

    return { marker, infowindow };
  }, [map]);

  // 장소에 포커스하는 함수
  const focusOnPlace = useCallback((position, title) => {
    if (map) {
      const latLng = new window.kakao.maps.LatLng(position.lat, position.lng);
      map.setCenter(latLng);
      map.setLevel(5);
      setSelectedPlace({ title, position });
    }
  }, [map]);

  // 검색 처리 함수
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchKeyword.trim()) return;

    // 기존 마커들 제거
    markers.forEach(item => item.marker.setMap(null));
    setMarkers([]);
    setSearchResults([]);

    // 장소 검색 객체 생성
    const ps = new window.kakao.maps.services.Places();

    // 키워드로 장소 검색
    ps.keywordSearch(searchKeyword, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const bounds = new window.kakao.maps.LatLngBounds();
        const newMarkers = [];

        data.forEach(place => {
          const position = {
            lat: place.y,
            lng: place.x
          };
          const { marker, infowindow } = addMarker(position, place.place_name);
          bounds.extend(new window.kakao.maps.LatLng(place.y, place.x));
          newMarkers.push({ marker, infowindow });
        });

        setMarkers(newMarkers);
        map.setBounds(bounds);
        setSearchResults(data);
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        alert('검색 결과가 존재하지 않습니다.');
      } else if (status === window.kakao.maps.services.Status.ERROR) {
        alert('검색 결과 중 오류가 발생했습니다.');
      }
    });
  };

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 검색창 */}
      <div style={{ padding: '20px' }}>
        <form onSubmit={handleSearch} className="search-container">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="장소를 검색하세요"
            style={{ width: '100%', padding: '10px' }}
          />
          <button type="submit" className="search-button">
            <img src={searchIcon} alt="검색" style={{ width: '20px', height: '20px' }} />
          </button>
        </form>
      </div>
  
      {/* 지도 */}
      <div id="map" style={{ 
        width: '100%', 
        height: '50%',
        border: '1px solid black',
        boxSizing: 'border-box'
      }}></div>
  
      {/* 검색 결과 */}
      <div style={{ 
        width: '100%', 
        height: '30%', 
        overflowY: 'auto',
        border: '1px solid black',
        boxSizing: 'border-box',
        padding: '10px'
      }}>
        <h3>검색 결과</h3>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {searchResults.map((place, index) => (
            <li 
              key={index} 
              onClick={() => focusOnPlace({ lat: place.y, lng: place.x }, place.place_name)}
              style={{ cursor: 'pointer', padding: '5px 0', borderBottom: '1px solid #eee' }}
            >
              {place.place_name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default KakaoMap;
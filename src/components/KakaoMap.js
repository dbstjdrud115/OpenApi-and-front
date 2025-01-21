import React, { useState, useEffect, useCallback } from 'react';
import '../css/KakaoMap.css';
import searchIcon from '../images/icon_search.png';

import Toastify from "toastify-js";
import "toastify-js/src/toastify.css"; 

const KakaoMap = () => {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // 카카오 맵 스크립트 로딩
  /*
  useEffect(() => {
    const loadKakaoMapScript = () => {
      if (!window.kakao) {
        const script = document.createElement('script');
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=a0b89900e54e7b70d0940e6d3f947b35&autoload=false`;
        script.onload = () => {
          window.kakao.maps.load(() => {
            // 스크립트 로드 후 초기화 함수 실행
            setMap(window.kakao.maps);  // setMap을 통해 카카오맵 객체를 상태로 저장
          });
        };
        document.head.appendChild(script);
      } else {
        window.kakao.maps.load(() => {
          setMap(window.kakao.maps);
        });
      }
    };
  
    loadKakaoMapScript();
  }, []);

  */
  // 지도 초기화
  useEffect(() => {
    if (map) {
      const container = document.getElementById('map');
      const options = {
        center: new window.kakao.maps.LatLng(37.566826, 126.978656),
        level: 3,
        draggable: true,
      };
      const kakaoMap = new window.kakao.maps.Map(container, options);
      setMap(kakaoMap);
      
      window.kakao.maps.event.addListener(kakaoMap, 'dragend', () => {
        const latlng = kakaoMap.getCenter();
        console.log('지도 중심 좌표:', latlng.getLat(), latlng.getLng());
      });
    }
  }, [map]);  // map이 업데이트 될 때마다 실행

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
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchKeyword.trim()) {
      Toastify({
        text: "검색어를 입력해주세요", 
        duration: 3000, 
        close: true, 
        gravity: "bottom", 
        position: "right", 
        backgroundColor: "#333", 
        stopOnFocus: true, 
      }).showToast();
      return;
    }  

    // 기존 마커들 제거
    markers.forEach(item => item.marker.setMap(null));
    setMarkers([]);
    setSearchResults([]);

    try {
      const response = await fetch(`http://localhost:8050/kopis?keyword=${encodeURIComponent(searchKeyword)}`);
      const dbData = await response.json();
      const places = new window.kakao.maps.services.Places();
      const bounds = new window.kakao.maps.LatLngBounds();
      const newMarkers = [];

      for (const place of dbData) {
        places.keywordSearch(place.festivalHallName, (kakaoData, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const kakaoPlace = kakaoData[0];
            const position = {
              lat: kakaoPlace.y,
              lng: kakaoPlace.x,
            };

            const { marker, infowindow } = addMarker(position, place.festivalHallName);
            bounds.extend(new window.kakao.maps.LatLng(kakaoPlace.y, kakaoPlace.x));
            newMarkers.push({ marker, infowindow });

            // 지도 업데이트
            setMarkers(newMarkers);
            map.setBounds(bounds);
          } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
            console.warn(`"${place.festivalHallName}"에 대한 검색 결과가 없습니다.`);
          } else if (status === window.kakao.maps.services.Status.ERROR) {
            console.error(`"${place.festivalHallName}" 검색 중 오류가 발생했습니다.`);
          }
        });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('검색 중 오류가 발생했습니다.');
    }
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

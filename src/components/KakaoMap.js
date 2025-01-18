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
  //const handleSearch = (e) => {
  const handleSearch = async (e) => {



    e.preventDefault();
    if (!searchKeyword.trim()) return;

    // 기존 마커들 제거
    markers.forEach(item => item.marker.setMap(null));
    setMarkers([]);
    setSearchResults([]);

      
        try {
        //현재는 프론트, 백 모두 로컬서버라 이리 설정되어있지만, 고정 ip 및 도메인이 정해지면 설정 변경 필요!
        const response = await fetch(`http://localhost:8050/kopis?keyword=${encodeURIComponent(searchKeyword)}`);
        const dbData = await response.json();
        const places = new window.kakao.maps.services.Places();
        const bounds = new window.kakao.maps.LatLngBounds();
        const newMarkers = [];

        /*
        places.keywordSearch(searchKeyword, (data, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const bounds = new window.kakao.maps.LatLngBounds();
            const newMarkers = [];
        */

        for (const place of dbData) {
          // Kakao Maps API로 좌표 보완
          //place.festivalHallName = 공연장소
          //place.festivalArea     = 공연지역
          places.keywordSearch(place.festivalHallName, (kakaoData, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              // 첫 번째 검색 결과의 좌표 사용
              const kakaoPlace = kakaoData[0];
              const position = {
                lat: kakaoPlace.y,
                lng: kakaoPlace.x,
              };
      
              // 마커 및 인포윈도우 생성
              const { marker, infowindow } = addMarker(position, place.place_name);
              bounds.extend(new window.kakao.maps.LatLng(kakaoPlace.y, kakaoPlace.x));
              newMarkers.push({ marker, infowindow });
      
              // 지도 업데이트
              setMarkers(newMarkers);
              map.setBounds(bounds);
            } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
              console.warn(`"${place.place_name}"에 대한 검색 결과가 없습니다.`);
            } else if (status === window.kakao.maps.services.Status.ERROR) {
              console.error(`"${place.place_name}" 검색 중 오류가 발생했습니다.`);
            }
          });
        }

        //place = 배열(data)에 담긴 각 요소값. 거기에 위도 경도가 우린 없다. 
        //지금 떠오르는건, place에서 장소값을 가져다가 kakaomap api를 또 호출해서 마커를 얻어내느것이다. 
        //근데.. 이게 참 뭐하는짓인지..

        /*
        if (data.length > 0) {
            const bounds = new window.kakao.maps.LatLngBounds();
            const newMarkers = [];

            
            data.forEach(place => {
                const position = {
                    lat: place.latitude,
                    lng: place.longitude
                };
                const { marker, infowindow } = addMarker(position, place.name);
                bounds.extend(new window.kakao.maps.LatLng(place.latitude, place.longitude));
                newMarkers.push({ marker, infowindow });
            });

              setMarkers(newMarkers);
              map.setBounds(bounds);
              setSearchResults(data);
          } else {
              alert('검색 결과가 존재하지 않습니다.');
          }
              */
      } catch (error) {
          console.error('Error:', error);
          alert('검색 중 오류가 발생했습니다.');
      }
          

    // 장소 검색 객체 생성

    
    //https://apis.map.kakao.com/web/documentation/#services_Places_keywordSearch
    //OPEN API문서에 따름
    /*
    const places = new window.kakao.maps.services.Places();

    //places.keywordSearch('판교 치킨', callback);
    //공식문서 기준으로, searchKeyword의 콜백함수가 data,status다. 
    //일단 kakaomap은 콜백결과에 대한 위도, 경도값이 포함되어있기에 문제가 없지만.. 

    //data == 전체결과인 List
    //data.forEach(place  = place는 data에서 꺼낸 각 값. 그 값 안에는 위도 경도, 이름이 다 들어있음.
    //position은 addMarker에 사용되고, 순수 위경도값은 y,x축 표시에 사용됨.


    places.keywordSearch(searchKeyword, (data, status) => {
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
    


*/

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
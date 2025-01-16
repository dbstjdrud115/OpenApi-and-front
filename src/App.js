import {React,useEffect} from 'react';
import FetchKopisData from './components/FetchKopisData'; // 컴포넌트 import
import KakaoMap from './components/KakaoMap';
import FestivalSearch from './components/FestivalSearch';
import './App.css'; // CSS 파일 import


function App() {
  return (
    <div className="App">
      <h1>카카오 지도 예시</h1>
      <div className="content-container">
        <div className="map-container">
          <KakaoMap /> {/* KakaoMap 컴포넌트 렌더링 */}
        </div>
        <div className="kopis-container">
          <FetchKopisData /> {/* FetchKopisData 컴포넌트 추가 */}
        </div>
        {/*<div>
           <FestivalSearch></FestivalSearch>
        </div>*/}
      </div>
    </div>
  );
}

export default App;
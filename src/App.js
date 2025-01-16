import React from 'react';
import FetchKopisData from './components/FetchKopisData'; // 컴포넌트 import
import KakaoMap from './components/KakaoMap';

function App() {
  return (
    <div className="App">
      <h1>카카오 지도 예시</h1>
      <KakaoMap /> {/* KakaoMap 컴포넌트 렌더링 */}
      <FetchKopisData /> {/* FetchKopisData 컴포넌트 추가 */}
    </div>
  );
}

export default App;
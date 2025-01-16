import React, { useEffect } from 'react';

function FetchKopisData() {
  useEffect(() => {
    // KOPIS API에서 공연 데이터 가져오기
    const fetchData = async () => {



       try {
        const response = await fetch(
          "/openApi/restful/pblprfr?service=6047922a467940f3bf64dc296efae31b&stdate=20160101&eddate=20160630&rows=10&cpage=1"  
        );

        // 응답을 텍스트로 받기 (XML 형식)
        const xmlText = await response.text();

        // DOMParser를 이용해 XML 파싱
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");

        // 모든 <db> 태그 추출
        const dbElements = xmlDoc.getElementsByTagName("db");

        const performances = [];
        
        // 각 <db>에 대해 데이터를 추출
        for (let i = 0; i < dbElements.length; i++) {
          const mt20id = dbElements[i].getElementsByTagName("mt20id")[0]?.textContent || "없음";
          const prfnm = dbElements[i].getElementsByTagName("prfnm")[0]?.textContent || "없음";
          const prfpdfrom = dbElements[i].getElementsByTagName("prfpdfrom")[0]?.textContent || "없음";
          const prfpdto = dbElements[i].getElementsByTagName("prfpdto")[0]?.textContent || "없음";
          const fcltynm = dbElements[i].getElementsByTagName("fcltynm")[0]?.textContent || "없음";
          const poster = dbElements[i].getElementsByTagName("poster")[0]?.textContent || "없음";
          const area = dbElements[i].getElementsByTagName("area")[0]?.textContent || "없음";
          const genrenm = dbElements[i].getElementsByTagName("genrenm")[0]?.textContent || "없음";
          const openrun = dbElements[i].getElementsByTagName("openrun")[0]?.textContent || "없음";
          const prfstate = dbElements[i].getElementsByTagName("prfstate")[0]?.textContent || "없음";

          // 추출한 데이터를 객체로 만들어 배열에 저장
          performances.push({
            mt20id,
            prfnm,
            prfpdfrom,
            prfpdto,
            fcltynm,
            poster,
            area,
            genrenm,
            openrun,
            prfstate
          });
        }

        console.log(performances); 
        console.log("공연명" + performances[0].prfnm);
      } catch (error) {
        console.error('데이터를 가져오는 데 오류가 발생했습니다:', error);
      }
    };

    fetchData();
  }, []); // 빈 배열로 한 번만 실행되도록 설정

  return (
    <div>
      <h1>KOPIS API 데이터 확인</h1>
      <p>콘솔에서 데이터를 확인할 수 있습니다.</p>
    </div>
  );
}

export default FetchKopisData;
'use client';
import { useEffect, useState } from 'react';

export default function ConsumptionAnalysis() {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUserInfo(JSON.parse(userData));
    }
  }, []);

  if (userInfo) {
    return null;
  }

  return (
    <section className="p-12 text-center bg-white">
      <h2 className="text-4xl font-bold mt-6 text-black mb-2">합리적인 엄마의 스마트한 선택</h2>
      <h2 className="text-2xl font-semibold text-black mb-4">언제 어디서든 현명한 소비!</h2>
      <p className="text-gray-700 text-lg mt-2">
        월별 소비 내역 및 카테고리별 지출 통계를 통해<br />
        육아 비용을 체계적으로 관리합니다.
      </p>
      <div className="flex justify-center space-x-12 mt-12">
        <div className="text-center max-w-xs w-64 rounded-2xl shadow-lg overflow-hidden flex flex-col">
          <div className="w-64 h-48 relative mt-2">
            <img src="/images/육아비용절감.png" alt="최저가 추천" className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div className="p-4 flex flex-col justify-center">
            <h3 className="font-bold text-lg text-black mb-2 text-center">
              쇼핑 시간 감소
            </h3>
            <p className="text-gray-600 text-center">
              제품의 실제 구매자 리뷰 분석, <br /> 리뷰 요약으로 온라인 쇼핑 시간이 감소하고, 효율적인 소비가  <br />  가능합니다.
            </p>
          </div>
        </div>
        <div className="text-center max-w-xs w-64 rounded-2xl shadow-lg overflow-hidden flex flex-col">
          <div className="w-64 h-48 relative">
            <img src="/images/소비패턴.png" alt="소비 패턴 분석" className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div className="p-6 flex flex-col justify-center">
            <h3 className="font-bold text-lg text-black mb-2 text-center">
              월별/카테고리별 <br /> 소비 패턴 분석
            </h3>
            <p className="text-gray-600 text-center">
              사용자의 소비 습관을 분석하여 <br />맞춤형 소비 관리를 지원합니다.
            </p>
          </div>
        </div>
        <div className="text-center max-w-xs w-64 rounded-3xl shadow-lg overflow-hidden flex flex-col">
          <div className="w-64 h-48 relative">
            <img src="/images/소통.png" alt="제품 정보 및 리뷰" className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div className="p-6 flex flex-col justify-center">
            <h3 className="font-bold text-lg text-black mb-2 text-center">
              육아 제품 정보 제공  <br />및 리뷰 공유
            </h3>
            <p className="text-gray-600 text-center">
              직접 사용해 본 육아맘들의  <br /> 솔직한 제품 후기를 <br />한눈에 확인하세요.
            </p>
          </div>
        </div>
      </div>
      <div>
        
      </div>
    </section>
  );
}

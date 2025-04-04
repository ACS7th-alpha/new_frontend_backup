'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation, Autoplay } from 'swiper/modules';

// Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/autoplay'; // Autoplay 스타일 추가 (필요한 경우)

const images = [
  '/images/A5 - 1.png',
  '/images/A5 - 3.png',
  '/images/A5 - 4.png',
  '/images/A5 - 5.png',
  '/images/A5 - 6.png',
  '/images/A5 - 7.png',
  '/images/A5 - 8.png',
];

export default function Firstpage() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-pink-50 to-blue-50 py-20">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4">
          <div className="flex justify-center mb-2">
            <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center">
              <span className="text-4xl">👶</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            <span className="text-yellow-400">HAMA</span>와 함께
            <span className="inline-block animate-bounce ml-2">🎈</span>
          </h1>
          <p className="text-xl text-gray-700 font-semibold mb-4">
            아이 성장 단계에 맞는 맞춤형 육아 용품 구매, 소비패턴 분석을 한 곳에서
            <span className="inline-block ml-2">✨</span>
          </p>
          <p className="max-w-2xl mx-auto text-gray-700 mb-6 leading-relaxed">
            온라인 쇼핑 예산, 아기 정보(생년월일, 성별)을 입력하면 
            해당 조건에 맞는 육아 용품을 추천합니다. <br />
            월별 소비 내역 및 카테고리별 지출 통계를 통해 
            육아 비용을 체계적으로 관리합니다.
          </p>
        </div>
        <div className="relative mt-10">
          <div className="max-w-6xl mx-auto relative">
            <Swiper
              effect={'coverflow'}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={2} // 중앙 슬라이드와 양옆 슬라이드 표시
              spaceBetween={30} // 슬라이드 간격 설정

              autoplay={{
                delay: 2000, // ⏳ 1.8초마다 슬라이드 변경
                disableOnInteraction: false, // 사용자 조작 후에도 자동 재생 유지
              }}
              coverflowEffect={{
                rotate: 0, // 슬라이드 회전 각도
                stretch: 0, // 슬라이드 간 거리 조정
                depth: 300, // 슬라이드 깊이감 설정
                modifier: 2, // 효과 강도 조정
                slideShadows: false, // 그림자 비활성화
              }}
              navigation={true} // 네비게이션 활성화 (좌/우 버튼)
              modules={[EffectCoverflow, Navigation, Autoplay]} // Autoplay 모듈 추가
              className="mySwiper"
            >
              {images.map((src) => (
                <SwiperSlide key={src}>
                  <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-yellow-200">
                    <img src={src} alt={`이미지`} className="w-full h-full" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}

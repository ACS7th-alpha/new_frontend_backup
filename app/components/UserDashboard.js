'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // 라우터 추가
import CartBasedRecommendation from './CartBasedRecommendation';

export default function UserDashboard({
  userInfo,
  childAge,
  monthlySpending,
  remainingBudget,
}) {
  const router = useRouter(); // 라우터 초기화화
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAgeInfo, setShowAgeInfo] = useState(false);


  useEffect(() => {
    fetchAgeBasedProducts();
  }, [childAge]);

  const getAgeCharacteristics = (age) => {
    if (age <= 1) {
      return (
        <>
          신생아는 세상에 적응하는 시기로, 수면과 수유가 가장 중요한 활동입니다.{' '}
          <br />
          이 시기의 아기는 부모의 목소리와 심장 소리에 익숙해지며, 피부 접촉을
          통해 안정감을 느낍니다. <br />
          부모님은 아기의 움직임을 지켜보며 충분한 자극(감각 놀이, 소리 내기
          등)을 제공하고, 안전한 공간에서 <br /> 자유롭게 탐색할 수 있도록
          도와야 합니다.
        </>
      );
    } else if (age < 12) {
      return (
        <>
          이 시기의 아기들은 급속도로 성장하며, 목 가누기 → 뒤집기 → 앉기 → 기기
          → 서기 → 걷기의 과정을 거치면서 <br /> 신체 능력이 발달합니다.
          영유아는 부모님은 아기의 움직임을 지켜보며 충분한 자극(감각 놀이, 소리
          내기 등)을 <br /> 제공하고, 안전한 공간에서 자유롭게 탐색할 수 있도록
          도와야 합니다.
        </>
      );
    } else if (age < 36) {
      return (
        <>
          이 시기의 아이들은 자율성을 키워가는 시기로, 스스로 걷고, 뛰며 신체
          활동이 활발해지고 말을 배우고 <br /> 기본적인 의사소통을 할 수 있게
          됩니다. 부모님은 아이가 스스로 할 수 있는 기회를 주고, 긍정적인
          피드백을 통해 <br /> 자율성과 자신감을 키워주는 것이 중요합니다. 또한
          감정을 조절하는 방법을 자연스럽게 배우도록 돕는 것이 필요합니다.
        </>
      );
    } else {
      return (
        <>
          이 시기의 아이들은 창의력과 자율성을 키워가는 시기입니다. 놀이를 통해
          상상력을 발휘하고, 스스로 결정하며 <br /> 책임감을 배웁니다. 또한
          사회성이 발달하며, 또래 친구들과 상호작용하는 능력이 향상됩니다.
          부모님은 아이가 <br /> 주도적으로 탐구하고 배울 수 있는 환경을
          제공하는 것이 중요하며, 창의적 사고를 자극하는 놀이와 활동을 충분히{' '}
          <br />
          경험할 수 있도록 지원해야 합니다.
        </>
      );
    }
  };

  // 연령대별 제목 가져오는 함수
  const getAgeGroupTitle = (age) => {
    if (age <= 1) {
      return '👶 신생아 | 출생 후 ~ 1개월 (0~4주)';
    } else if (age < 12) {
      return '👶 영아 | 1개월 ~ 12개월 (1세 미만)';
    } else if (age < 36) {
      return '👶 유아 | 12개월 ~ 36개월 (1세 ~ 3세)';
    } else {
      return '🧒 어린이 | 36개월 이상 (3세 이상)';
    }
  };

  const fetchAgeBasedProducts = async () => {
    try {
      const limit = 40;
      const page = 1;
      let keyword;

      // 연령에 따른 키워드 설정
      if (childAge <= 1) {
        keyword = '신생아';
      } else if (childAge < 12) {
        keyword = '영유아';
      } else if (childAge < 36) {
        keyword = '유아';
      } else {
        keyword = '어린이';
      }

      // 검색 API 사용
      const searchUrl = `/api/search?keyword=${encodeURIComponent(
        keyword
      )}&page=${page}&limit=${limit}`;
      //console.log('Fetching URL:', searchUrl);
      const response = await fetch(searchUrl);

      // 응답 상태 확인
      //console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(`상품 조회 실패: ${response.status}`);
      }

      const responseData = await response.json();
      //console.log('API Response:', responseData);

      const productsArray = responseData.data || [];
      setProducts(productsArray);

      //console.log(`${keyword} 상품 개수:`, productsArray.length);
    } catch (error) {
      console.error('상품 조회 오류:', error);
      setProducts([]);
    }
  };

  // 다음 슬라이드로 이동
  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + 4 >= products.length ? 0 : prevIndex + 4
    );
  };

  // 이전 슬라이드로 이동
  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex - 4 < 0 ? Math.max(products.length - 4, 0) : prevIndex - 4
    );
  };
  // 현재 보여줄 상품들
  const currentProducts = products.slice(currentIndex, currentIndex + 4);

  // 프로그레스 바의 퍼센테이지 계산
  const spendingPercentage = userInfo.user?.monthlyBudget
    ? Math.min((monthlySpending / userInfo.user.monthlyBudget) * 100, 100)
    : 0;

  const spendingPercentage2 = userInfo.user?.monthlyBudget
    ? Math.floor((monthlySpending / userInfo.user.monthlyBudget) * 100)
    : 0;

  // 상품 클릭 핸들러 추가
  const handleProductClick = async (product) => {
    router.push(`/product/${product.uid}`);
  };

  return (
    <div className="w-full bg-gradient-to-b from-pink-50 to-yellow-50">
      <div className="w-3/4 mx-auto">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="flex justify-between items-center">
              {/* 사용자 프로필 섹션 */}
              <div className="flex flex-col items-center">
                {userInfo.user.photo && (
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-2 border-4 border-pink-200 shadow-lg">
                    <img
                      src={userInfo.user.photo}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <h2 className="text-xl font-bold text-gray-800">
                  {userInfo.user.nickname}
                </h2>
                {childAge !== null && (
                  <button
                    onClick={() => setShowAgeInfo(!showAgeInfo)}
                    className="mt-3 px-3 py-2 bg-pink-100 text-black rounded-full font-semibold text-base hover:bg-yellow-200 transition-colors duration-200 flex items-center gap-1"
                  >
                    <span>{childAge}개월</span>
                    <svg
                      className={`h-4 w-4 transition-transform duration-200 ${
                        showAgeInfo ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* 예산 정보 섹션 */}
              <div className="flex-1 ml-12 ">
                <div className="bg-pink-10 rounded-2xl p-6 shadow-md border-2 border-blue-10">
                  <div className="mb-4 text-left">
                    <p className="text-gray-800 flex items-center text-lg">
                      <span className="mr-2">💰</span> 이번 달 예산
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-3xl font-bold text-black">
                        {userInfo?.user?.monthlyBudget
                          ? `${Number(
                              userInfo.user.monthlyBudget
                            ).toLocaleString('ko-KR')}원`
                          : '0원'}
                      </p>
                      <p className="text-2xl font-bold text-gray-600 mr-1">
                        {spendingPercentage2.toLocaleString()}%
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-6 bg-white rounded-full overflow-hidden mt-4 shadow-inner">
                    <div
                      className="h-full bg-yellow-400 transition-all duration-500 rounded-full"
                      style={{ width: `${spendingPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-3 text-black">
                    <span className="flex items-center">
                      <span className="mr-1">💸</span> 지출{' '}
                      {monthlySpending.toLocaleString()}원
                    </span>
                    <span className="flex items-center ml-4">
                      <span className="mr-1">✨</span> 남은 예산{' '}
                      <span className="text-black ml-2">
                        {remainingBudget.toLocaleString()}원
                      </span>
                    </span>
                  </div>
                </div>

                {/* 새로운 귀여운 네모 칸 추가 */}
                <div className="bg-white rounded-2xl p-4 mt-6 shadow-md border-2 border-blue-10">
                  {monthlySpending > userInfo.user?.monthlyBudget ? ( // 조건부 렌더링
                    <p className="text-xl font-semibold text-red-500 text-center">
                      이번 달 예산을 다 쓰셔서, 아끼셔야 해요! 😢
                    </p>
                  ) : (
                    <p className="text-lg font-semibold text-center">
                      <span role="img" aria-label="pig">
                        🐻
                      </span>{' '}
                      하루에{' '}
                      <span className="text-green-500 font-bold text-lg">
                        {(() => {
                          const remainingBudget =
                            userInfo.user?.monthlyBudget - monthlySpending;
                          const remainingDays =
                            new Date(
                              new Date().getFullYear(),
                              new Date().getMonth() + 1,
                              0
                            ).getDate() - new Date().getDate();
                          return remainingDays > 0
                            ? (remainingBudget / remainingDays).toLocaleString(
                                undefined,
                                { maximumFractionDigits: 0 }
                              )
                            : 0;
                        })()}
                        원
                      </span>{' '}
                      이하로 써야 예산을 지킬 수 있어요!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 연령별 특징 섹션 - 조건부 렌더링 */}
        {showAgeInfo && (
          <div className="max-w-4xl mx-auto px-4 mb-8 transition-all duration-300 ease-in-out">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-400">
              <div className="flex items-start space-x-4 mr-8">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {getAgeGroupTitle(childAge)}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {getAgeCharacteristics(childAge)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 준비리스트 섹션 추가 */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {childAge}개월, 준비리스트
          </h2>
          <div className="relative">
            {/* 이전 버튼 */}
            {products.length > 4 && (
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            {/* 상품 그리드 */}
            <div className="grid grid-cols-4 gap-4">
              {currentProducts.map((product) => (
                <div
                  key={product.uid}
                  onClick={() => handleProductClick(product)}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="relative pb-[100%]">
                    <img
                      src={product.img}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-110"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-500 mb-1">
                      {product.brand}
                    </p>
                    <h3 className="text-md font-semibold text-gray-800 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-black-500">
                      {product.sale_price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* 다음 버튼 */}
            {products.length > 4 && (
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </div>
          <CartBasedRecommendation />
        </div>
      </div>
    </div>
  );
}

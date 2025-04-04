'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CartBasedRecommendation() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');

  // 장바구니 상품 조회
  const fetchCartItems = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('/api/cart', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error('장바구니 조회 실패');

      const data = await response.json();
      setCartItems(data.products || []);
    } catch (error) {
      console.error('장바구니 조회 오류:', error);
      setCartItems([]);
    }
  };

  // 브랜드 기반 상품 추천
  const fetchBrandProducts = async (brand) => {
    try {
      const response = await fetch(
        `/api/products/search?keyword=${encodeURIComponent(brand)}&page=1&limit=4`
      );

      if (!response.ok) throw new Error('추천 상품 조회 실패');

      const data = await response.json();
      setRecommendedProducts(data.data || []);
      setSelectedBrand(brand);
    } catch (error) {
      console.error('추천 상품 조회 오류:', error);
      setRecommendedProducts([]);
    }
  };

  // 컴포넌트 마운트 시 장바구니 조회
  useEffect(() => {
    fetchCartItems();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 mt-16">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        고객님의 장바구니에 담긴 상품을 기반으로 추천드려요
      </h2>

      {/* 장바구니 상품 목록 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cartItems.map((item) => (
          <div
            key={item.uid}
            className="relative bg-white rounded-xl shadow-md p-4 flex flex-col"
          >
            <div className="relative pb-[100%] mb-4">
              <img
                src={item.img}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
              />
            </div>
            <p className="text-sm text-gray-500 mb-1">{item.brand}</p>
            <h3 className="text-md font-semibold text-gray-800 mb-2 line-clamp-2">
              {item.name}
            </h3>
            <div className="mt-auto">
              <button
                onClick={() => fetchBrandProducts(item.brand)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors duration-200 
                  ${
                    selectedBrand === item.brand
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
              >
                같은 브랜드 보기
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 추천 상품 목록 */}
      {recommendedProducts.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            {selectedBrand} 추천 상품
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendedProducts.map((product) => (
              <div
                key={product.uid}
                onClick={() => router.push(`/product/${product.uid}`)}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              >
                <div className="relative pb-[100%]">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
                  <h3 className="text-md font-semibold text-gray-800 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold text-black">
                    {product.sale_price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

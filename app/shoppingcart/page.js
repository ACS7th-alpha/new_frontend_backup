'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import ExpenseModal from '@/app/components/ExpenseModal';
import Link from 'next/link';

export default function ShoppingCart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/cart', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart items');
      }

      const data = await response.json();
      setCartItems(data.products || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (uid) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch(`/api/cart/${uid}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error('상품 삭제 실패');

      fetchCartItems(); // 장바구니 새로고침
      alert('상품이 장바구니에서 삭제되었습니다.');
    } catch (error) {
      console.error('상품 삭제 오류:', error);
      alert('상품 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleClearCart = async () => {
    if (!confirm('장바구니를 비우시겠습니까?')) return;

    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('/api/cart/clear', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error('장바구니 전체 삭제 실패');

      setCartItems([]); // 장바구니를 빈 배열로 업데이트
      alert('장바구니가 비워졌습니다.');
    } catch (error) {
      console.error('장바구니 전체 삭제 오류:', error);
      alert('장바구니 전체 삭제 중 오류가 발생했습니다.');
    }
  };

  // 🔹 총 가격 계산 (숫자 이외의 문자 제거 후 숫자로 변환)
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + Number(item.sale_price.replace(/\D/g, '')),
    0
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Link
          href="/"
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-8">장바구니</h1>
          <div className="bg-white rounded-lg  p-8 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              장바구니가 비어있습니다
            </h2>
            <p className="text-gray-600 mb-6">
              필요한 육아용품을 장바구니에 담아보세요!
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors duration-200"
            >
              쇼핑 계속하기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleExpenseAdd = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">장바구니</h1>
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200"
            >
              전체 삭제
            </button>
          )}
        </div>

        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.uid}
              className="bg-white rounded-2xl shadow-md p-5 flex items-center gap-6"
            >
              <img
                src={item.img}
                alt={item.name}
                className="w-32 h-32 object-cover rounded-xl mr-3"
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  {item.name}
                </h2>
                <p className="text-sm text-gray-500 mb-1">{item.brand}</p>
                <p className="text-xl font-bold text-black">
                  {item.sale_price.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleRemoveItem(item.uid)}
                className="text-black bg-white font-bold"
              >
                삭제
              </button>
              <button
                onClick={() => handleExpenseAdd(item)}
                className="font-medium bg-orange-400 text-white px-3 py-2 rounded-full hover:bg-orange-200 transition-colors duration-200"
              >
                지출 추가
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-gray-300 pt-6 text-center">
          <p className="text-2xl font-semibold text-gray-800">
            총 {cartItems.length}개 상품 금액:{' '}
            <span className="text-orange-500">
              {totalPrice.toLocaleString()}
            </span>
          </p>
        </div>
      </div>
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
      />
    </div>
  );
}

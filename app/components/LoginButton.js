'use client';
import { useState } from 'react';

export default function LoginButton({ onLogin }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onLogin();
    } catch (error) {
      console.error('로그인 중 오류 발생:', error);
      alert('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex flex-col items-center px-4 py-2 text-gray-700 rounded-lg font-semibold bg-white hover:bg-pink-200 transition-colors"
    >
      {loading ? (
        '로그인 중...' 
      ) : (
        <>
          <span className="text-2xl">😃</span>
          <span className="text-sm font-semibold">로그인</span>
        </>
      )}
    </button>
  );
} 
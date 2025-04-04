'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import Loading from '../components/Loading';
import Header from '../components/Header';
import Link from 'next/link';

export default function SearchPage() {
  noStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('keyword');
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 40;

  // 페이지네이션 계산
  const pageGroupSize = 5; // 한 번에 보여줄 페이지 버튼 수
  const currentGroup = Math.floor((currentPage - 1) / pageGroupSize);
  const startPage = currentGroup * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  console.log('[SearchPage] Render start:', { query, currentPage, loading });

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        console.log('[SearchPage] No query provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log('[SearchPage] Fetching data:', { query, currentPage, limit });

      try {
        const apiUrl = `/api/products/search?keyword=${encodeURIComponent(
          query
        )}&page=${currentPage}&limit=${limit}`;
        console.log('[SearchPage] API URL:', apiUrl);

        const response = await fetch(apiUrl);
        console.log('[SearchPage] Response status:', response.status);

        if (!response.ok) {
          throw new Error(`검색 실패: ${response.status}`);
        }

        const data = await response.json();
        console.log('[SearchPage] Raw API response:', data);

        if (data.success) {
          console.log('[SearchPage] Setting data:', {
            productsCount: data.data?.length,
            total: data.meta?.total,
          });
          setProducts(data.data || []);
          const totalItems = data.meta?.total || 0;
          const calculatedTotalPages = Math.max(
            Math.ceil(totalItems / limit),
            1
          );
          setTotalPages(calculatedTotalPages);
          setTotalCount(totalItems);
        } else {
          console.warn('[SearchPage] API returned success: false');
        }
      } catch (error) {
        console.error('[SearchPage] Error:', error);
        setProducts([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
        console.log('[SearchPage] Loading finished');
      }
    };

    console.log('[SearchPage] Effect triggered');
    fetchSearchResults();
  }, [query, currentPage]);

  console.log('[SearchPage] Before render:', {
    loading,
    productsCount: products.length,
    totalCount,
    totalPages,
  });

  if (loading) {
    console.log('[SearchPage] Rendering loading state');
    return <Loading />;
  }

  if (!query) {
    console.log('[SearchPage] No query - rendering empty state');
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">검색어를 입력해주세요.</p>
      </div>
    );
  }

  if (products.length === 0) {
    console.log('[SearchPage] No results - rendering empty state');
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">검색 결과가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container max-w-5xl mx-auto px-4 py-12">
        {/* 검색 결과 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            &ldquo;{query}&rdquo; 검색 결과
          </h1>
          <p className="text-xl text-gray-600">
            총{' '}
            <span className="text-xl font-bold text-orange-500">
              {totalCount}
            </span>
            건의 상품이 있습니다
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">검색 결과가 없습니다 😢</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <Link
                  key={product.uid}
                  href={`/product/${product.uid}`}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 block"
                >
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="px-5 py-4">
                    <h2 className="text-base font-semibold text-gray-800 mb-1 line-clamp-2">
                      {product.name}
                    </h2>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        {product.site}
                      </p>
                      <p className="text-xl font-bold text-black">
                        {product.sale_price}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {products.length > 0 && (
              <div className="flex justify-center items-center gap-1 mt-12">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-6 py-3 rounded-full bg-white text-gray-700 border-2 border-pink-200 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                >
                  ← 이전
                </button>

                {/* 페이지 번호 목록 */}
                <div className="flex gap-1">
                  {Array.from(
                    { length: endPage - startPage + 1 },
                    (_, idx) => startPage + idx
                  ).map((n) => (
                    <button
                      key={n}
                      onClick={() => setCurrentPage(n)}
                      className={`rounded-full text-pink-600 font-medium ${
                        currentPage === n
                          ? 'bg-pink-100'
                          : 'bg-white hover:bg-pink-50'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                {endPage < totalPages && (
                  <button
                    onClick={() => setCurrentPage(endPage + 1)}
                    className="px-6 py-3 rounded-full bg-white text-gray-700 border-2 border-pink-200 hover:bg-pink-50 transition-colors duration-200 font-medium"
                  >
                    → 다음
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

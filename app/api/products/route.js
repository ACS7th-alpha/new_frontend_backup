export async function GET(request) {
  try {
    console.log('Products fetch request received');

    // 요청 URL에서 검색 파라미터 추출
    const requestUrl = new URL(request.url);
    const page = requestUrl.searchParams.get('page') || '1';
    const limit = requestUrl.searchParams.get('limit') || '20';

    console.log('Query parameters:', { page, limit });

    // 백엔드 요청 URL 구성
    //const baseUrl = 'http://hama-product:3007';
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_SEARCH_URL;
    const url = new URL('/products', baseUrl);
    url.searchParams.set('page', page);
    url.searchParams.set('limit', limit);

    console.log('Fetching products from:', url.toString());

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend products fetch error:', errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const data = await response.json();

    // 백엔드 응답 구조 확인을 위한 로그
    console.log('Raw backend response:', JSON.stringify(data, null, 2));

    // 응답 데이터 구조 검증 및 변환
    const products = Array.isArray(data) ? data : data.data || [];
    const normalizedProducts = products.map((product) => ({
      ...product,
      id: product.id || product._id,
      price: Number(product.price) || 0,
      createdAt: product.createdAt || new Date().toISOString(),
    }));

    console.log('Processed products data:', {
      count: normalizedProducts.length,
      sample: normalizedProducts[0],
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: normalizedProducts,
        message: '상품 목록을 성공적으로 불러왔습니다.',
        timestamp: new Date().toISOString(),
        path: '/api/products',
        meta: {
          total: normalizedProducts.length,
          page: parseInt(page),
          limit: parseInt(limit),
          fetchedAt: new Date().toISOString(),
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, private',
          Pragma: 'no-cache',
        },
      }
    );
  } catch (error) {
    console.error('Products API Error:', {
      message: error.message,
      stack: error.stack,
    });

    return Response.json(
      {
        error: '상품 목록을 불러오는데 실패했습니다.',
        details: error.message,
        timestamp: new Date().toISOString(),
        path: '/api/products',
      },
      { status: 500 }
    );
  }
}

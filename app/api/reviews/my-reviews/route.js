export async function GET(request) {
  try {
    const authorization = request.headers.get('Authorization');

    console.log('Authorization header:', authorization ? 'Present' : 'Missing');

    if (!authorization) {
      console.error('Missing Authorization header in my reviews request');
      return new Response(
        JSON.stringify({
          error: 'Authorization header is required',
          timestamp: new Date().toISOString(),
          path: '/api/reviews/my-reviews',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    //const baseUrl = 'http://hama-review:3004';
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_REVIEW_URL;
    const url = `${baseUrl}/reviews/my-reviews`;
    console.log('Fetching my reviews from:', url);

    const response = await fetch(url, {
      headers: { Authorization: authorization },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend my reviews fetch error:', errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const data = await response.json();

    // 백엔드 응답 구조 확인을 위한 로그
    console.log('Raw backend response:', JSON.stringify(data, null, 2));

    // 응답 데이터 구조 검증 및 변환
    const reviews = Array.isArray(data) ? data : data.reviews || [];
    const normalizedReviews = reviews.map((review) => ({
      ...review,
      id: review.id || review._id,
      rating: Number(review.rating) || 0,
      createdAt: review.createdAt || new Date().toISOString(),
    }));

    console.log('Processed reviews data:', {
      count: normalizedReviews.length,
      sample: normalizedReviews[0],
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: normalizedReviews,
        message: '내 리뷰 목록을 성공적으로 불러왔습니다.',
        timestamp: new Date().toISOString(),
        path: '/api/reviews/my-reviews',
        meta: {
          total: normalizedReviews.length,
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
    console.error('My Reviews API Error:', {
      message: error.message,
      stack: error.stack,
    });
    return new Response(
      JSON.stringify({
        error: '내 리뷰 목록을 불러오는데 실패했습니다.',
        details: error.message,
        timestamp: new Date().toISOString(),
        path: '/api/reviews/my-reviews',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

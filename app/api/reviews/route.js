export async function GET(request) {
  try {
    console.log('Related reviews fetch request received');
    //const baseUrl = 'http://hama-review:3004';
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_REVIEW_URL;
    const url = `${baseUrl}/reviews`;
    console.log('Fetching reviews from:', url);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const data = await response.json();
    console.log('Reviews data received:', data);

    // 백엔드에서 받은 데이터를 그대로 전달
    return new Response(
      JSON.stringify({
        success: true,
        data: data, // 배열을 직접 전달
        metadata: {
          totalCount: data.length,
          timestamp: new Date().toISOString(),
        },
        message: '관련 리뷰 목록을 성공적으로 불러왔습니다.',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching related reviews:', error);
    return new Response(
      JSON.stringify({
        error: '관련 리뷰 목록을 불러오는데 실패했습니다.',
        details: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}

export async function POST(request) {
  try {
    console.log('Review creation request received');
    const authorization = request.headers.get('Authorization');

    //const baseUrl = 'http://hama-review:3004';
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_REVIEW_URL;
    // 환경 변수 로깅 추가
    console.log('Environment:', {
      baseUrl,
      NODE_ENV: process.env.NODE_ENV,
    });

    if (!authorization) {
      console.error('Missing Authorization header in review creation request');
      return new Response(
        JSON.stringify({
          error: 'Authorization header is required',
          timestamp: new Date().toISOString(),
          path: '/api/reviews',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const reviewData = await request.json();
    console.log('Received review data:', reviewData);

    // 필수 필드 검증
    if (!reviewData.name?.trim() || !reviewData.description?.trim()) {
      console.error('Invalid review data:', reviewData);
      return new Response(
        JSON.stringify({
          error: '제목과 내용은 필수 입력 항목입니다.',
          timestamp: new Date().toISOString(),
          path: '/api/reviews',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const url = `${baseUrl}/reviews`;
    console.log('Sending review to backend:', {
      url,
      data: reviewData,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: reviewData.name.trim(),
        description: reviewData.description.trim(),
        ageGroup: reviewData.ageGroup?.trim(),
        purchaseLink: reviewData.purchaseLink?.trim() || null,
        recommended: reviewData.recommended,
        imageUrls: reviewData.imageUrls || [],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend review creation error:', errorData);
      throw new Error(
        `Backend error: ${response.status}, message: ${JSON.stringify(
          errorData
        )}`
      );
    }

    const data = await response.json();
    console.log('Review creation successful:', data);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...data,
          createdAt: new Date().toISOString(),
        },
        message: '리뷰가 성공적으로 등록되었습니다.',
        timestamp: new Date().toISOString(),
        path: '/api/reviews',
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating review:', error);
    return new Response(
      JSON.stringify({
        error: '리뷰 등록에 실패했습니다.',
        details: error.message,
        timestamp: new Date().toISOString(),
        path: '/api/reviews',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function DELETE(request) {
  //const baseUrl = 'http://hama-review:3004';
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_REVIEW_URL;

  try {
    console.log('All reviews deletion request received');
    const authorization = request.headers.get('Authorization');

    if (!authorization) {
      console.error(
        'Missing Authorization header in all reviews deletion request'
      );
      return new Response(
        JSON.stringify({
          error: 'Authorization header is required',
          timestamp: new Date().toISOString(),
          path: '/api/reviews',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const url = `${baseUrl}/reviews/all`;
    console.log('Deleting all reviews at:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: authorization },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: '모든 리뷰가 성공적으로 삭제되었습니다.',
        timestamp: new Date().toISOString(),
        path: '/api/reviews',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deleting all reviews:', error);
    return new Response(
      JSON.stringify({
        error: '리뷰 삭제에 실패했습니다.',
        details: error.message,
        timestamp: new Date().toISOString(),
        path: '/api/reviews',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

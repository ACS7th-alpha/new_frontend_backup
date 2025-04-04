export async function GET(request, { params }) {
  try {
    console.log('Review detail fetch request received');
    const { id } = params;

    //const baseUrl = 'http://hama-review:3004';
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_REVIEW_URL;
    const url = `${baseUrl}/reviews/${id}`;
    console.log('Fetching review detail from:', url);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend review detail fetch error:', errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const data = await response.json();

    // 백엔드 응답 구조 확인을 위한 로그
    console.log('Raw backend response:', JSON.stringify(data, null, 2));

    // 응답 데이터 구조 검증 및 변환
    const reviewDetail = {
      ...data,
      id: data.id || data._id,
      createdAt: data.createdAt || new Date().toISOString(),
      rating: Number(data.rating) || 0,
    };

    console.log('Processed review detail:', {
      reviewId: reviewDetail.id,
      rating: reviewDetail.rating,
      hasContent: !!reviewDetail.content,
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: reviewDetail,
        message: '리뷰 상세 정보를 성공적으로 불러왔습니다.',
        timestamp: new Date().toISOString(),
        path: `/api/reviews/${id}`,
        meta: {
          reviewId: reviewDetail.id,
          createdAt: reviewDetail.createdAt,
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
    console.error('Review Detail API Error:', {
      message: error.message,
      stack: error.stack,
    });
    return new Response(
      JSON.stringify({
        error: '리뷰 상세 정보를 불러오는데 실패했습니다.',
        details: error.message,
        timestamp: new Date().toISOString(),
        path: `/api/reviews/${id}`,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    console.log('Review deletion request received');
    const { id } = params;
    const authorization = request.headers.get('Authorization');

    console.log('Delete request details:', {
      reviewId: id,
      hasAuthorization: !!authorization,
    });
    //const baseUrl = 'http://hama-review:3004';
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_REVIEW_URL;
    const url = `${baseUrl}/reviews/${id}`;
    console.log('Deleting review at:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: authorization },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend review deletion error:', errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    console.log('Review successfully deleted:', { reviewId: id });

    return new Response(
      JSON.stringify({
        success: true,
        message: '리뷰가 성공적으로 삭제되었습니다.',
        deletedId: id,
        timestamp: new Date().toISOString(),
        path: `/api/reviews/${id}`,
        meta: {
          deletedAt: new Date().toISOString(),
          reviewId: id,
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
    console.error('Review Deletion API Error:', {
      message: error.message,
      stack: error.stack,
    });
    return new Response(
      JSON.stringify({
        error: '리뷰 삭제에 실패했습니다.',
        details: error.message,
        timestamp: new Date().toISOString(),
        path: `/api/reviews/${id}`,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function DELETE(request) {
  try {
    const authorization = request.headers.get('Authorization');
    console.log('Authorization header:', authorization ? 'Present' : 'Missing');

    if (!authorization) {
      console.error('Missing Authorization header in cart clear request');
      return new Response(
        JSON.stringify({
          error: 'Authorization header is required',
          timestamp: new Date().toISOString(),
          path: '/api/cart/clear',
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, private',
            Pragma: 'no-cache',
          },
        }
      );
    }

    //const baseUrl = 'http://hama-cart:3008';
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_CART_URL;
    const url = `${baseUrl}/cart/clear`;
    console.log('Clearing cart at:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: authorization },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend cart clear error:', errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    // 백엔드 응답 로깅
    console.log('Cart successfully cleared');

    return new Response(
      JSON.stringify({
        success: true,
        message: '장바구니가 비워졌습니다.',
        timestamp: new Date().toISOString(),
        path: '/api/cart/clear',
        meta: {
          clearedAt: new Date().toISOString(),
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
    console.error('Cart Clear API Error:', {
      message: error.message,
      stack: error.stack,
    });
    return new Response(
      JSON.stringify({
        error: '장바구니 비우기에 실패했습니다.',
        details: error.message,
        timestamp: new Date().toISOString(),
        path: '/api/cart/clear',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

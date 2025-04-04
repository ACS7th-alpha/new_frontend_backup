export async function DELETE(request, { params }) {
  try {
    const accessToken = request.headers.get('Authorization');
    console.log('[Cart API] DELETE Request received:', {
      hasToken: !!accessToken,
      method: request.method,
      uid: params.uid,
      headers: Object.fromEntries(request.headers.entries()),
    });

    //const baseUrl = 'http://hama-cart:3008';
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_CART_URL;
    //const endpoint = `/cart/remove/${params.uid}`;
    const url = `${baseUrl}/cart/remove/${params.uid}`;
    console.log(
      '[Cart API] Sending DELETE request to:',
      `${baseUrl}${endpoint}`
    );

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: accessToken,
        'Content-Type': 'application/json',
      },
    });

    console.log('[Cart API] DELETE Backend response details:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Cart API] DELETE Backend error response:', {
        status: response.status,
        error: errorText,
      });

      return new Response(
        JSON.stringify({
          error: '상품 삭제에 실패했습니다.',
          details: `HTTP error! status: ${response.status}, message: ${errorText}`,
          timestamp: new Date().toISOString(),
          path: `/api/cart/remove/${params.uid}`,
        }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(null, {
      status: 204, // No Content
    });
  } catch (error) {
    console.error('[Cart API] DELETE Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });

    return new Response(
      JSON.stringify({
        error: '상품 삭제 중 오류가 발생했습니다.',
        details: error.message,
        timestamp: new Date().toISOString(),
        path: `/api/cart/remove/${params.uid}`,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

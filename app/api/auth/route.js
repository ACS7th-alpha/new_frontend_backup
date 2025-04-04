export async function POST(request) {
  try {
    console.log('Authentication request received');

    const requestBody = await request.json();
    console.log('Auth request data:', {
      hasGoogleId: !!requestBody.googleId,
    });

    // 요청 본문 검증
    if (!requestBody.googleId) {
      return new Response(JSON.stringify({ error: 'googleId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    //const baseUrl = 'http://hama-auth:3001';
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_AUTH_URL;
    // 백엔드 URL 확인
    const url = `${baseUrl}/auth/google/login`;
    console.log('Authenticating at:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const data = await response.json();

    // 응답 데이터가 없는 경우 기본값 설정
    const responseData = {
      success: true,
      data: data || {},
      message: data?.message || '인증이 완료되었습니다.',
      timestamp: new Date().toISOString(),
      path: '/api/auth',
      meta: {
        tokens: {
          accessToken: data?.accessToken || null,
          refreshToken: data?.refreshToken || null,
        },
      },
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, private',
        Pragma: 'no-cache',
      },
    });
  } catch (error) {
    console.error('Auth API Error:', {
      message: error.message,
      stack: error.stack,
    });

    return new Response(
      JSON.stringify({
        success: false,
        error: '인증에 실패했습니다.',
        details: error.message,
        timestamp: new Date().toISOString(),
        path: '/api/auth',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, private',
          Pragma: 'no-cache',
        },
      }
    );
  }
}

export async function DELETE(request) {
  try {
    console.log('Account deletion request received');

    const authorization = request.headers.get('Authorization');
    console.log('Authorization header:', authorization ? 'Present' : 'Missing');

    const url = `${process.env.NEXT_PUBLIC_BACKEND_AUTH_URL}/auth`;
    console.log('Deleting account at:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: authorization,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: '계정이 성공적으로 삭제되었습니다.',
        timestamp: new Date().toISOString(),
        path: '/api/auth',
        meta: {
          deletedAt: new Date().toISOString(),
        },
      }),
      {
        status: 204,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, private',
          Pragma: 'no-cache',
        },
      }
    );
  } catch (error) {
    console.error('Account Deletion API Error:', {
      message: error.message,
      stack: error.stack,
    });
    return Response.json(
      { error: 'Failed to delete user account', details: error.message },
      { status: 500 }
    );
  }
}

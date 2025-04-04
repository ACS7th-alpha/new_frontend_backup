export async function POST(request) {
  try {
    console.log('=== 구글 로그인 요청 시작 ===');
    
    const requestBody = await request.json();
    console.log('요청 데이터:', {
      googleId: requestBody.googleId,
    });

    if (!requestBody.googleId) {
      console.error('googleId 누락됨');
      return new Response(JSON.stringify({ error: 'googleId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_AUTH_URL;
    const url = `${baseUrl}/auth/google/login`;
    console.log('백엔드 요청 URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('백엔드 응답 상태:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('백엔드 에러:', errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const data = await response.json();
    console.log('백엔드 응답 성공');

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, private',
        Pragma: 'no-cache',
      },
    });
  } catch (error) {
    console.error('인증 에러:', {
      message: error.message,
      stack: error.stack,
    });

    return new Response(
      JSON.stringify({
        statusCode: 500,
        message: '인증에 실패했습니다.',
        error: error.message,
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
export async function POST(request) {
  try {
    const body = await request.json();
    console.log('[API] Register request received:', body);

    const requestData = {
      user: {
        googleId: body.user?.googleId,
        email: body.user?.email,
        name: body.user?.name,
        photo: body.user?.photo,
      },
      additionalInfo: {
        nickname: body.additionalInfo?.nickname,
        monthlyBudget: body.additionalInfo?.monthlyBudget,
        children: body.additionalInfo?.children,
      },
    };

    console.log('[API] Structured register data:', requestData);

    //const baseUrl = 'http://hama-auth:3001';
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_AUTH_URL;
    const response = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();
    console.log('[API] Auth service response:', data);

    if (!response.ok) {
      throw new Error(data.message || '회원가입에 실패했습니다.');
    }

    // 사용자 정보를 포함한 응답 데이터 구성
    const userInfo = {
      id: data.user.id || body.user.googleId,
      email: body.user?.email,
      name: body.user?.name,
      photo: body.user?.photo,
      nickname: body.additionalInfo?.nickname,
      monthlyBudget: body.additionalInfo?.monthlyBudget,
      children: body.additionalInfo?.children,
    };

    const responseData = {
      access_token: data?.access_token,
      refresh_token: data?.refresh_token,
      user: userInfo,
    };

    // 로컬 스토리지에 사용자 정보 저장을 위한 데이터 추가
    const storageData = {
      ...responseData,
      userInfo: JSON.stringify(userInfo), // 로컬 스토리지용 사용자 정보
    };

    console.log('[API] Enhanced response data with storage info:', storageData);

    return new Response(JSON.stringify(storageData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[API] Register error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || '회원가입 처리 중 오류가 발생했습니다.',
        timestamp: new Date().toISOString(),
        path: '/api/auth/register',
      }),
      {
        status: error.status || 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

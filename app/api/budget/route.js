export async function GET(request) {
  try {
    // console.log('[Budget API] Request received:', {
    //   url: request.url,
    //   headers: Object.fromEntries(request.headers),
    //   timestamp: new Date().toISOString(),
    // });

    // 토큰 확인
    const authHeader = request.headers.get('authorization');
    //console.log('[Budget API] Auth header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      //console.error('[Budget API] Missing or invalid authorization header');
      throw new Error('Authorization header is required');
    }

    const token = authHeader.split(' ')[1];
    console.log('[Budget API] Token found:', token?.slice(-10));

    // 백엔드 요청 URL 구성
    //const baseUrl = 'http://hama-budget:3005';
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BUDGET_URL;
    const url = new URL('/budget', baseUrl);

    //console.log('[Budget API] Requesting budget from:', url.toString());

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });

    //console.log('[Budget API] Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      // console.error('[Budget API] Backend error:', {
      //   status: response.status,
      //   statusText: response.statusText,
      //   error: errorText,
      // });
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const data = await response.json();
    // console.log('[Budget API] Raw backend response:', data);
    // console.log('[Budget API] Backend response data:', {
    //   success: true,
    //   dataLength: data?.length || 0,
    //   sampleData: data?.[0] || null,
    //   fullData: data,
    // });

    return new Response(
      JSON.stringify({
        success: true,
        data: data || [],
        message: data?.length
          ? '예산 데이터를 성공적으로 불러왔습니다.'
          : '예산 데이터가 없습니다.',
        timestamp: new Date().toISOString(),
        path: '/api/budget',
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
    // console.error('[Budget API] Error:', {
    //   message: error.message,
    //   stack: error.stack,
    //   timestamp: new Date().toISOString(),
    // });

    return new Response(
      JSON.stringify({
        success: false,
        error: '지출 데이터를 불러오는데 실패했습니다.',
        details: error.message,
        timestamp: new Date().toISOString(),
        path: '/api/budget/spending',
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
    //console.log('Budget creation request received');

    const authorization = request.headers.get('Authorization');
    //console.log('Authorization header:', authorization ? 'Present' : 'Missing');

    const requestBody = await request.json();
    // console.log('Budget creation data:', {
    //   hasAmount: !!requestBody.amount,
    //   amount: requestBody.amount,
    // });

    //const baseUrl = 'http://hama-budget:3005';
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BUDGET_URL;
    const url = `${baseUrl}/budget`;
    //console.log('Creating budget at:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      //console.error('Backend budget creation error:', errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const data = await response.json();

    // 백엔드 응답 구조 확인을 위한 로그
    //console.log('Raw backend response:', JSON.stringify(data, null, 2));

    // 응답 데이터 구조 검증 및 변환
    const createdBudget = {
      ...data,
      id: data.id || data._id,
      createdAt: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: createdBudget,
        message: '예산이 성공적으로 생성되었습니다.',
        timestamp: new Date().toISOString(),
        path: '/api/budget',
        meta: {
          createdAt: createdBudget.createdAt,
        },
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, private',
          Pragma: 'no-cache',
        },
      }
    );
  } catch (error) {
    // console.error('Budget Creation API Error:', {
    //   message: error.message,
    //   stack: error.stack,
    // });
    return new Response(
      JSON.stringify({
        error: '예산 설정에 실패했습니다.',
        details: error.message,
        timestamp: new Date().toISOString(),
        path: '/api/budget',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function DELETE(request) {
  try {
    //console.log('Budget deletion request received');
    const authorization = request.headers.get('Authorization');

    if (!authorization) {
      //console.error('Missing Authorization header in budget deletion request');
      return new Response(
        JSON.stringify({
          error: 'Authorization header is required',
          timestamp: new Date().toISOString(),
          path: '/api/budget',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    //const baseUrl = 'http://hama-budget:3005';
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BUDGET_URL;
    const url = `${baseUrl}/budget`;
    //console.log('Deleting budget at:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: authorization },
    });

    // 404 응답을 성공으로 처리
    if (response.status === 404) {
      return new Response(
        JSON.stringify({
          success: true,
          message: '예산 정보가 이미 존재하지 않습니다.',
          timestamp: new Date().toISOString(),
          path: '/api/budget',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: '예산 정보가 성공적으로 삭제되었습니다.',
        timestamp: new Date().toISOString(),
        path: '/api/budget',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    //console.error('Error deleting budget:', error);
    return new Response(
      JSON.stringify({
        error: '예산 삭제에 실패했습니다.',
        details: error.message,
        timestamp: new Date().toISOString(),
        path: '/api/budget',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET(request) {
  try {
    //console.log('Spending data fetch request received');

    const authorization = request.headers.get('Authorization');
    //console.log('Authorization header:', authorization ? 'Present' : 'Missing');

    //const baseUrl = 'http://hama-budget:3005';
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BUDGET_URL;
    const url = `${baseUrl}/budget/spending`;
    //console.log('Fetching spending data from:', url);

    const response = await fetch(url, {
      headers: { Authorization: authorization },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const data = await response.json();

    // 백엔드 응답 구조 확인을 위한 로그
    //console.log('Raw backend response:', JSON.stringify(data, null, 2));

    // 응답 데이터 구조 검증 및 변환
    const spendingData = {
      spending: data.spending || {},
      totalAmount: Object.values(data.spending || {}).reduce(
        (sum, amount) => sum + amount,
        0
      ),
      period: {
        year: data.year || new Date().getFullYear(),
        month: data.month || new Date().getMonth() + 1,
      },
    };

    // console.log('Processed spending data:', {
    //   categories: Object.keys(spendingData.spending).length,
    //   totalAmount: spendingData.totalAmount,
    //   period: spendingData.period,
    // });

    return new Response(
      JSON.stringify({
        success: true,
        data: spendingData,
        message: '지출 데이터를 성공적으로 불러왔습니다.',
        timestamp: new Date().toISOString(),
        path: '/api/budget/spending',
        meta: {
          period: spendingData.period,
          totalCategories: Object.keys(spendingData.spending).length,
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
    // console.error('Spending API Error:', {
    //   message: error.message,
    //   stack: error.stack,
    // });
    return new Response(
      JSON.stringify({
        error: '지출 데이터를 불러오는데 실패했습니다.',
        details: error.message,
        timestamp: new Date().toISOString(),
        path: '/api/budget/spending',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(request) {
  try {
    //console.log('Spending creation request received');

    const authorization = request.headers.get('Authorization');
    //console.log('Authorization header:', authorization ? 'Present' : 'Missing');

    const requestBody = await request.json();
    // console.log('Spending creation data:', {
    //   hasDate: !!requestBody.date,
    //   hasCategory: !!requestBody.category,
    //   hasAmount: !!requestBody.amount,
    // });

    //const baseUrl = 'http://hama-budget:3005';
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BUDGET_URL;
    const url = `${baseUrl}/budget/spendings`;
    //console.log('Creating spending at:', url);

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
      //console.error('Backend expense creation error:', errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const data = await response.json();

    // 백엔드 응답 구조 확인을 위한 로그
    //console.log('Raw backend response:', JSON.stringify(data, null, 2));

    // 응답 데이터 구조 검증 및 변환
    const createdSpending = {
      ...data,
      id: data.id || data._id,
      createdAt: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: createdSpending,
        message: '지출이 성공적으로 등록되었습니다.',
        timestamp: new Date().toISOString(),
        path: '/api/budget/spending',
        meta: {
          createdAt: createdSpending.createdAt,
          category: createdSpending.category,
          amount: createdSpending.amount,
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
    // console.error('Spending Creation API Error:', {
    //   message: error.message,
    //   stack: error.stack,
    // });
    return new Response(
      JSON.stringify({
        error: '지출 등록에 실패했습니다.',
        details: error.message,
        timestamp: new Date().toISOString(),
        path: '/api/budget/spending',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

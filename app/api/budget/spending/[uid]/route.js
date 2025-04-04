export async function PUT(request, { params }) {
  try {
    const { uid } = params;
    const authorization = request.headers.get('Authorization');

    // 요청 본문 검증
    const requestBody = await request.json();
    // console.log('Update data:', {
    //   spendingId: uid,
    //   hasDate: !!requestBody.date,
    //   hasCategory: !!requestBody.category,
    //   hasAmount: !!requestBody.amount,
    // });

    //const baseUrl = 'http://hama-budget:3005';
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BUDGET_URL;
    const url = `${baseUrl}/budget/spending/${uid}`;
    //console.log('Updating spending at:', url);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend spending update error:', errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const data = await response.json();

    // 백엔드 응답 구조 확인을 위한 로그
    //console.log('Raw backend response:', JSON.stringify(data, null, 2));

    // 응답 데이터 구조 검증 및 변환
    const updatedSpending = {
      ...data,
      id: data.id || data._id,
      updatedAt: new Date().toISOString(),
    };

    // console.log('Processed spending update:', {
    //   spendingId: updatedSpending.id,
    //   category: updatedSpending.category,
    //   amount: updatedSpending.amount,
    // });

    return new Response(
      JSON.stringify({
        success: true,
        data: updatedSpending,
        message: '지출이 성공적으로 수정되었습니다.',
        timestamp: new Date().toISOString(),
        path: `/api/budget/spending/${uid}`,
        meta: {
          updatedAt: updatedSpending.updatedAt,
          category: updatedSpending.category,
          amount: updatedSpending.amount,
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
    // console.error('Spending Update API Error:', {
    //   message: error.message,
    //   stack: error.stack,
    // });
    return new Response(
      JSON.stringify({
        error: '지출 수정에 실패했습니다.',
        details: error.message,
        timestamp: new Date().toISOString(),
        path: `/api/budget/spending/${uid}`,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    //console.log('Spending deletion request received');

    const { uid } = params;
    const authorization = request.headers.get('Authorization');

    // console.log('Delete request details:', {
    //   spendingId: uid,
    //   hasAuthorization: !!authorization,
    // });
    //const baseUrl = 'http://hama-budget:3005';
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BUDGET_URL;
    const url = `${baseUrl}/budget/spending/${uid}`;
    //console.log('Deleting spending at:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: authorization },
    });

    if (!response.ok) {
      const errorText = await response.text();
      //console.error('Backend spending deletion error:', errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    //console.log('Spending successfully deleted:', { spendingId: uid });

    return new Response(
      JSON.stringify({
        success: true,
        message: '지출이 성공적으로 삭제되었습니다.',
        deletedId: uid,
        timestamp: new Date().toISOString(),
        path: `/api/budget/spending/${uid}`,
        meta: {
          deletedAt: new Date().toISOString(),
          spendingId: uid,
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
    // console.error('Spending Deletion API Error:', {
    //   message: error.message,
    //   stack: error.stack,
    // });
    return new Response(
      JSON.stringify({
        error: '지출 삭제에 실패했습니다.',
        details: error.message,
        spendingId: uid,
        timestamp: new Date().toISOString(),
        path: `/api/budget/spending/${uid}`,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function DELETE(request) {
  try {
    console.log('[API] Account deletion request received');
    const authorization = request.headers.get('Authorization');

    if (!authorization) {
      console.error(
        '[API] Missing Authorization header in account deletion request'
      );
      return new Response(
        JSON.stringify({
          error: 'Authorization header is required',
          timestamp: new Date().toISOString(),
          path: '/api/auth/delete',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    //const baseUrl = 'http://hama-auth:3001';
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_AUTH_URL;
    const url = `${baseUrl}/auth/delete`;
    console.log('[API] Deleting account at:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: authorization,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('[API] Account deletion response:', {
      status: response.status,
      ok: response.ok,
      data,
    });

    if (!response.ok) {
      throw new Error(data.message || '계정 삭제에 실패했습니다.');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: '계정이 성공적으로 삭제되었습니다.',
        timestamp: new Date().toISOString(),
        path: '/api/auth/delete',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[API] Error deleting account:', error);
    return new Response(
      JSON.stringify({
        error: error.message || '계정 삭제에 실패했습니다.',
        timestamp: new Date().toISOString(),
        path: '/api/auth/delete',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

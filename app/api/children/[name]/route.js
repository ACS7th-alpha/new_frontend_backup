export async function PUT(request, { params }) {
  try {
    console.log('[Children API] PUT: Updating child info');
    const authorization = request.headers.get('Authorization');
    const { name } = params; // URL에서 아이 이름 가져오기

    if (!authorization) {
      console.error('[Children API] PUT: Missing Authorization header');
      return new Response(
        JSON.stringify({
          error: 'Authorization header is required',
          timestamp: new Date().toISOString(),
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const requestBody = await request.json();
    console.log('[Children API] PUT: Updating child:', {
      originalName: name,
      newData: requestBody,
    });

    //const baseUrl = 'http://hama-auth:3001';
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_AUTH_URL;
    const response = await fetch(
      `${baseUrl}/auth/children/${encodeURIComponent(name)}`,
      {
        method: 'PUT',
        headers: {
          Authorization: authorization,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Children API] PUT: Backend error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Children API] PUT Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

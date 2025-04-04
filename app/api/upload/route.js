export async function POST(request) {
  try {
    console.log('File upload request received');
    const authorization = request.headers.get('Authorization');

    if (!authorization) {
      console.error('Missing Authorization header in upload request');
      return new Response(
        JSON.stringify({
          error: 'Authorization header is required',
          timestamp: new Date().toISOString(),
          path: '/api/upload',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const formData = await request.formData();
    if (!formData.has('file')) {
      return new Response(
        JSON.stringify({
          error: '업로드할 파일이 필요합니다.',
          timestamp: new Date().toISOString(),
          path: '/api/upload',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const url = `${process.env.NEXT_PUBLIC_BACKEND_UPLOAD_URL}/upload/multiple`;
    console.log('Uploading file to:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: authorization },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const data = await response.json();
    return new Response(
      JSON.stringify({
        success: true,
        data: data,
        message: '파일이 성공적으로 업로드되었습니다.',
        timestamp: new Date().toISOString(),
        path: '/api/upload',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error uploading file:', error);
    return new Response(
      JSON.stringify({
        error: '파일 업로드에 실패했습니다.',
        details: error.message,
        timestamp: new Date().toISOString(),
        path: '/api/upload',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

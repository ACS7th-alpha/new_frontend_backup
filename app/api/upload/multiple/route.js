export async function POST(request) {
  try {
    console.log('Multiple images upload request received');
    const authorization = request.headers.get('Authorization');

    if (!authorization) {
      console.error('Missing Authorization header in upload request');
      return new Response(
        JSON.stringify({
          error: 'Authorization header is required',
          timestamp: new Date().toISOString(),
          path: '/api/upload/multiple',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files');

    console.log('Multiple upload request data:', {
      fileCount: files.length,
      fileNames: files.map((file) => file.name),
    });

    //const baseUrl = 'http://hama-product:3002';
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_UPLOAD_URL;
    const url = `${baseUrl}/upload/multiple`;
    console.log('Uploading multiple files to:', url);

    const uploadFormData = new FormData();
    files.forEach((file) => {
      uploadFormData.append('files', file);
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: authorization, // 원본 Authorization 헤더 그대로 전달
      },
      body: uploadFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend multiple upload error:', errorData);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${JSON.stringify(
          errorData
        )}`
      );
    }

    const data = await response.json();

    // 백엔드 응답 구조 확인을 위한 로그
    console.log('Raw backend response:', JSON.stringify(data, null, 2));

    // 응답 데이터 구조 검증 및 변환
    const uploadResults = Array.isArray(data) ? data : [data];
    const normalizedResults = uploadResults.map((result) => ({
      ...result,
      uploadedAt: new Date().toISOString(),
      url: result.url || result.fileUrl,
      size: result.size || 0,
    }));

    console.log('Processed upload results:', {
      count: normalizedResults.length,
      urls: normalizedResults.map((r) => r.url),
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: normalizedResults,
        message: '파일들이 성공적으로 업로드되었습니다.',
        timestamp: new Date().toISOString(),
        path: '/api/upload/multiple',
        meta: {
          uploadedAt: new Date().toISOString(),
          totalFiles: normalizedResults.length,
          totalSize: normalizedResults.reduce(
            (sum, file) => sum + file.size,
            0
          ),
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
    console.error('Multiple Upload API Error:', {
      message: error.message,
      stack: error.stack,
    });
    return new Response(
      JSON.stringify({
        error: '이미지 업로드에 실패했습니다.',
        details: error.message,
        timestamp: new Date().toISOString(),
        path: '/api/upload/multiple',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

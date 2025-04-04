export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    console.log('Receipt analysis request received:', {
      fileName: file?.name,
    });
    //
    //const baseUrl = 'http://hama-ocr:3006';
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_OCR_URL;
    const url = `${baseUrl}/analyze`;

    console.log('Sending request to:', url);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Image analysis service error:', {
        status: response.status,
        error: errorText,
        url: url,
      });
      throw new Error(`Image analysis service error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Analysis service response:', data);

    return new Response(
      JSON.stringify({
        success: true,
        data: data,
        message: '영수증 분석이 성공적으로 완료되었습니다.',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Analysis service error:', error);
    return new Response(
      JSON.stringify({
        error: '영수증 분석에 실패했습니다.',
        details: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

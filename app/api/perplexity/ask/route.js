export async function POST(request) {
  try {
    const body = await request.json();
    console.log('AI chat request received:', body);

    //const baseUrl = 'http://hama-chat:3009';
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_CHAT_URL;
    const url = `${baseUrl}/perplexity/ask`;

    console.log('Sending request to:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI service error:', {
        status: response.status,
        error: errorText,
        url: url,
      });
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI service response:', data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI service error:', error);
    return new Response(
      JSON.stringify({
        error: 'AI 응답 생성에 실패했습니다.',
        details: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

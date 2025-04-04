import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '40';

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_SEARCH_URL;

    const apiUrl = `${baseUrl}/search?keyword=${encodeURIComponent(
      keyword
    )}&page=${page}&limit=${limit}`;

    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });

    if (!response.ok) {
      console.error('[Search API] Backend error:', {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Search API] Backend response details:', {
      status: response.status,
      hasData: !!data.data,
      dataLength: data.data?.length || 0,
      total: data.total,
      firstItem: data.data?.[0],
      metaInfo: data.meta,
    });

    return NextResponse.json({
      success: true,
      data: data.data || [],
      meta: {
        total: data.total || 0,
        page: Number(page),
        limit: Number(limit),
        keyword,
      },
    });
  } catch (error) {
    console.error('[Search API] Error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });

    return NextResponse.json(
      {
        success: false,
        message: '검색 중 오류가 발생했습니다.',
        error: error.message,
      },
      { status: 500 }
    );
  }
} 
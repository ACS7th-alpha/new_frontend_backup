// export async function GET(request) {
//   try {
//     const authorization = request.headers.get('Authorization');
//     console.log('=== 인기 상품 조회 시작 ===');
//     console.log('요청 헤더 확인:', {
//       hasAuth: !!authorization,
//       authType: authorization?.substring(0, 7),
//       tokenPreview: authorization ? `...${authorization.slice(-10)}` : 'none',
//     });

//     if (!authorization || !authorization.startsWith('Bearer ')) {
//       console.error('올바른 Authorization 헤더가 없습니다.');
//       throw new Error('Authorization token required');
//     }

//     const baseUrl = process.env.NEXT_PUBLIC_BACKEND_CLICKSTREAM_GET_URL;
//     const url = `${baseUrl}/data/users/top-products`;
//     console.log('인기 상품 요청 정보:', {
//       baseUrl,
//       fullUrl: url,
//       method: 'GET',
//       timestamp: new Date().toISOString(),
//     });

//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: authorization,
//       },
//     });

//     console.log('백엔드 응답 상태:', {
//       status: response.status,
//       ok: response.ok,
//       statusText: response.statusText,
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       console.error('랭킹 상품 서비스 에러:', {
//         status: response.status,
//         error: errorData,
//         url: url,
//         timestamp: new Date().toISOString(),
//       });
//       throw new Error(`랭킹 상품 서비스 에러: ${response.status}`);
//     }

//     const data = await response.json();
//     console.log('랭킹 상품 데이터 수신:', {
//       productsCount: data?.length || 0,
//       firstProduct: data?.[0]?.PRODUCT_NAME || 'none',
//       timestamp: new Date().toISOString(),
//     });

//     console.log('=== 랭킹 상품 조회 종료 ===');

//     return Response.json(
//       {
//         success: true,
//         data: data,
//         message: '랭킹 상품 데이터가 성공적으로 조회되었습니다.',
//         timestamp: new Date().toISOString(),
//         meta: {
//           count: data?.length || 0,
//           categories: [...new Set(data?.map((p) => p.PRODUCT_CATEGORY) || [])],
//         },
//       },
//       {
//         status: 200,
//         headers: {
//           'Cache-Control': 'no-store, private',
//         },
//       }
//     );
//   } catch (error) {
//     console.error('=== 랭킹 상품 서비스 에러 ===');
//     console.error('에러 상세:', {
//       message: error.message,
//       stack: error.stack,
//       timestamp: new Date().toISOString(),
//     });

//     return Response.json(
//       {
//         error: '랭킹 상품 데이터 조회에 실패했습니다.',
//         details: error.message,
//         timestamp: new Date().toISOString(),
//       },
//       {
//         status: error.message === 'Authorization token required' ? 401 : 500,
//         headers: {
//           'Cache-Control': 'no-store, private',
//         },
//       }
//     );
//   }
// }

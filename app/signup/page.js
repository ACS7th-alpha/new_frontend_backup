'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// SignupForm 컴포넌트로 분리
function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [children, setChildren] = useState([
    {
      name: '',
      gender: '',
      birthDate: '',
      id: Date.now(),
    },
  ]);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const userDataParam = searchParams.get('userData');
    console.log('=== URL에서 받은 userData 파라미터 ===');
    console.log('Raw userData:', userDataParam);

    if (userDataParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(userDataParam));
        console.log('Decoded userData:', decoded);
        setUserData(decoded);
        setEmail(decoded.email || '');
      } catch (error) {
        console.error('userData 파싱 에러:', error);
        setError('사용자 정보를 불러오는데 실패했습니다.');
      }
    }
  }, [searchParams]);

  const addChild = () => {
    setChildren([
      ...children,
      {
        name: '',
        gender: '',
        birthDate: '',
        id: Date.now(),
      },
    ]);
  };

  const removeChild = (childId) => {
    setChildren(children.filter((child) => child.id !== childId));
  };

  const updateChild = (index, field, value) => {
    const newChildren = [...children];
    newChildren[index] = { ...newChildren[index], [field]: value };
    setChildren(newChildren);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const signupData = {
      user: {
        googleId: userData?.id,
        email: email,
        name: userData?.name,
        photo: userData?.picture,
      },
      additionalInfo: {
        nickname: nickname,
        monthlyBudget: Number(monthlyBudget),
        children: children.map((child) => ({
          name: child.name,
          gender: child.gender,
          birthdate: child.birthDate,
        })),
      },
    };

    console.log('=== 회원가입 요청 데이터 ===');
    console.log('전체 데이터:', signupData);
    console.log('Google 사용자 정보:', signupData.user);
    console.log('추가 정보:', signupData.additionalInfo);
    console.log('------------------------');

    try {
      console.log('회원가입 요청 시작...');
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();
      console.log('서버 응답:', data);

      if (response.ok) {
        console.log('=== 회원가입 성공 ===');
        const { access_token, refresh_token, userInfo } = data;
        console.log('받은 토큰들:', { access_token, refresh_token });
        console.log('받은 userInfo (raw):', userInfo);

        try {
          // userInfo가 이미 문자열인지 확인
          const parsedUserInfo =
            typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo;
          console.log('파싱된 userInfo:', parsedUserInfo);

          // 메인페이지 구조에 맞게 데이터 구조화
          const formattedUserInfo = {
            user: {
              ...parsedUserInfo, // id, email, name, photo, nickname, monthlyBudget, children 등
            },
          };

          // 토큰과 사용자 정보 저장
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          localStorage.setItem('user', JSON.stringify(formattedUserInfo));
          localStorage.removeItem('spendingData');
          localStorage.removeItem('budget');

          console.log('저장된 user 정보:', localStorage.getItem('user'));
          console.log('로컬 스토리지 저장 완료');
          console.log('메인 페이지로 이동 중...');

          // 2. 초기 예산 설정 요청
          try {
            const currentDate = new Date();
            const year = currentDate.getFullYear(); // 현재 년도
            const month = currentDate.getMonth() + 1; // 현재 월 (0부터 시작하므로 +1)

            const budgetResponse = await fetch('/api/budget', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${access_token}`,
              },
              body: JSON.stringify({
                year: year,
                month: month,
                categories: {
                  diaper: 0,
                  sanitary: 0,
                  feeding: 0,
                  skincare: 0,
                  food: 0,
                  toys: 0,
                  bedding: 0,
                  fashion: 0,
                  other: 0,
                },
              }),
            });

            if (!budgetResponse.ok) {
              console.warn('초기 예산 설정 실패:', await budgetResponse.text());
            }
          } catch (error) {
            console.error('초기 예산 설정 중 오류:', error);
          }

          // 3. 메인 페이지로 이동
          router.push('/');
        } catch (error) {
          console.error('초기 예산 설정 중 오류:', error);
        }
      } else {
        console.error('=== 회원가입 실패 ===');
        console.error('에러 메시지:', data.message);
        setError(data.message || '회원가입 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('=== 회원가입 요청 중 오류 발생 ===');
      console.error('에러 내용:', error);
      setError('서버 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-[400px] space-y-8 bg-white p-8 shadow-lg rounded-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">회원가입</h2>
          <div className="w-10 h-10 rounded-full bg-blue-100"></div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            required
            readOnly
          />

          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            required
          />

          <input
            type="number"
            value={monthlyBudget}
            onChange={(e) => setMonthlyBudget(e.target.value)}
            placeholder="당월 예산"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            required
          />

          {children.map((child, index) => (
            <div
              key={child.id}
              className="space-y-4 p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">
                  자녀 정보 {index + 1}
                </span>
                {children.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeChild(child.id)}
                    className="bg-red-600 text-white text-sm py-1 px-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    삭제
                  </button>
                )}
              </div>

              <input
                type="text"
                value={child.name}
                onChange={(e) => updateChild(index, 'name', e.target.value)}
                placeholder="아기 이름"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                required
              />

              <select
                value={child.gender}
                onChange={(e) => updateChild(index, 'gender', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                required
              >
                <option value="" className="text-gray-500">
                  아기 성별
                </option>
                <option value="male" className="text-gray-900">
                  남자아기
                </option>
                <option value="female" className="text-gray-900">
                  여자아기
                </option>
              </select>

              <input
                type="date"
                value={child.birthDate}
                onChange={(e) =>
                  updateChild(index, 'birthDate', e.target.value)
                }
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                required
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addChild}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            자녀 추가
          </button>

          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            등록하기
          </button>
        </form>
      </div>
    </div>
  );
}

// 메인 SignupPage 컴포넌트
export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}

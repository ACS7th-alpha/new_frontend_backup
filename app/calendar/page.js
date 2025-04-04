'use client';

import { useState, useEffect, Suspense } from 'react';
import Header from '@/app/components/Header';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ko from 'date-fns/locale/ko'; // 한국어 로케일
import { useRouter } from 'next/router';

function CalendarContent() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [allSpending, setAllSpending] = useState([]); // 전체 지출 내역 저장
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [productName, setProductName] = useState('');
  const [spendingAmount, setSpendingAmount] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateSpending, setSelectedDateSpending] = useState([]);
  const [dailySpending, setDailySpending] = useState({}); // 추가: 일별 지출 내역
  const [monthlySpending, setMonthlySpending] = useState(0); // 추가: 월별 총 지출액
  const [spendingToEdit, setSpendingToEdit] = useState(null); // 수정할 지출 내역
  const [spendingItems, setSpendingItems] = useState([
    {
      date: '',
      category: '',
      itemName: '',
      amount: '',
    },
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [data, setData] = useState(null); // localStorage 데이터를 위한 상태
  const [userData, setUserData] = useState(null); // user 데이터를 위한 state 추가

  // 전체 지출 내역 조회
  useEffect(() => {
    const fetchSpending = async () => {
      try {
        const accessToken =
          typeof window !== 'undefined'
            ? localStorage.getItem('access_token')
            : null;

        if (!accessToken) {
          console.error('No access token found');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/budget/spending', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch spending data');
        }

        const data = await response.json();
        setAllSpending(data?.data?.spending || []);
      } catch (error) {
        console.error('Error fetching spending:', error);
      } finally {
        setLoading(false);
      }
    };

    // 사용자 정보와 당월 예산 설정
    const userStr = localStorage.getItem('user');
    console.log('[CalendarPage] Local storage user data:', {
      hasUserData: !!userStr,
      rawData: userStr,
    });

    if (userStr) {
      const parsedData = JSON.parse(userStr);
      console.log('[CalendarPage] Parsed user data:', {
        fullUserObject: parsedData,
        userInfo: parsedData?.user,
        monthlyBudget: parsedData?.user?.monthlyBudget,
        parsedBudget: Number(parsedData?.user?.monthlyBudget),
      });
      setUserData(parsedData.user); // user 데이터 저장
      setMonthlyBudget(parsedData?.user?.monthlyBudget || 0);
    }

    // 전체 지출 내역 조회
    fetchSpending();
  }, []);

  // allSpending이 변경될 때마다 dailySpending을 다시 계산하는 useEffect 수정
  useEffect(() => {
    // 수정 모드일 때는 실행하지 않음
    if (spendingToEdit) return;

    const currentMonthSpending = {};
    let totalMonthSpending = 0;

    allSpending.forEach((categoryData) => {
      if (categoryData.details && Array.isArray(categoryData.details)) {
        categoryData.details.forEach((detail) => {
          const spendingDate = new Date(detail.date);
          if (
            spendingDate.getFullYear() === currentDate.getFullYear() &&
            spendingDate.getMonth() === currentDate.getMonth()
          ) {
            const day = spendingDate.getDate();
            if (!currentMonthSpending[day]) {
              currentMonthSpending[day] = [];
            }
            currentMonthSpending[day].push({
              ...detail,
              category: categoryData.category,
            });
            totalMonthSpending += detail.amount;
          }
        });
      }
    });

    setDailySpending(currentMonthSpending);
    setMonthlySpending(totalMonthSpending);

    // 현재 선택된 날짜의 지출 내역도 업데이트
    if (selectedDate) {
      const day = selectedDate.getDate();
      setSelectedDateSpending(currentMonthSpending[day] || []);
    }
  }, [allSpending, currentDate, selectedDate, spendingToEdit]); // spendingToEdit 의존성 추가

  // 선택된 날짜가 변경될 때 수정 모드 초기화
  useEffect(() => {
    // spendingToEdit가 null일 때만 초기화
    if (!spendingToEdit) {
      setProductName('');
      setSpendingAmount('');
      setSelectedCategory('');
    }
  }, [selectedDate]);

  // 월 이동 핸들러 수정
  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
    // 지출 내역 초기화 및 등록 상태 초기화
    resetSpendingForm();
    setSelectedDateSpending([]); // 지출 내역 초기화
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
    // 지출 내역 초기화 및 등록 상태 초기화
    resetSpendingForm();
    setSelectedDateSpending([]); // 지출 내역 초기화
  };

  // 지출 등록 상태 초기화 함수
  const resetSpendingForm = () => {
    setSpendingItems([
      {
        date: '',
        category: '',
        itemName: '',
        amount: '',
      },
    ]);
    setSpendingToEdit(null);
    setProductName('');
    setSpendingAmount('');
    setSelectedCategory('');
  };

  // 지출 등록 버튼 상태 관리
  const isEditing = spendingToEdit !== null;

  // 달력 데이터 생성
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 해당 월의 첫 날과 마지막 날
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 달력에 표시할 날짜들
    const days = [];

    // 첫 주의 시작 부분을 빈 칸으로 채우기
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // 실제 날짜 채우기
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(i);
    }

    return days;
  };

  // 카테고리 매핑 함수 수정
  const getCategoryValue = (category) => {
    // 이미 영문 카테고리인 경우 그대로 반환
    if (
      category === 'diaper' ||
      category === 'sanitary' ||
      category === 'feeding' ||
      category === 'skincare' ||
      category === 'food' ||
      category === 'toys' ||
      category === 'bedding' ||
      category === 'fashion' ||
      category === 'other'
    ) {
      return category;
    }

    // 한글 카테고리를 영문으로 매핑
    const categoryMap = {
      '기저귀/물티슈': 'diaper',
      '생활/위생용품': 'sanitary',
      '수유/이유용품': 'feeding',
      '스킨케어/화장품': 'skincare',
      식품: 'food',
      완구용품: 'toys',
      침구류: 'bedding',
      '패션의류/잡화': 'fashion',
      기타: 'other',
    };

    const categoryValue = categoryMap[category] || 'other';
    console.log(`Category Input: ${category}, Mapped Value: ${categoryValue}`);
    return categoryValue;
  };

  // 카테고리 이름 변환 함수
  const getCategoryName = (category) => {
    const categoryMap = {
      diaper: '기저귀/물티슈',
      sanitary: '생활/위생용품',
      feeding: '수유/이유용품',
      skincare: '스킨케어/화장품',
      food: '식품',
      toys: '완구용품',
      bedding: '침구류',
      fashion: '패션의류/잡화',
      other: '기타',
    };

    // 역방향 매핑도 추가 (한글 -> 영문)
    const reverseMap = Object.entries(categoryMap).reduce(
      (acc, [key, value]) => {
        acc[value] = key;
        return acc;
      },
      {}
    );

    // 카테고리가 이미 한글인 경우 그대로 반환
    if (Object.values(categoryMap).includes(category)) {
      return category;
    }

    // 영문 카테고리인 경우 한글로 변환
    return categoryMap[category] || '기타';
  };

  const addSpendingItem = () => {
    setSpendingItems([
      ...spendingItems,
      {
        date: '',
        category: '',
        itemName: '',
        amount: '',
      },
    ]);
  };

  const removeSpendingItem = (index) => {
    setSpendingItems(spendingItems.filter((_, i) => i !== index));
  };

  const updateSpendingItem = (index, field, value) => {
    const newItems = [...spendingItems];
    newItems[index][field] = value;
    setSpendingItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all spending items
    for (const item of spendingItems) {
      if (!item.category || !item.itemName || !item.amount) {
        alert('모든 필드를 입력해주세요.');
        return;
      }
    }

    // Prepare the request body
    const requestBody = {
      spendings: spendingItems.map((item) => {
        const categoryValue = getCategoryValue(item.category); // 카테고리 매핑
        console.log(
          `Item: ${item.itemName}, Category: ${categoryValue}, Amount: ${item.amount}`
        ); // 로그 추가
        return {
          date: item.date,
          category: categoryValue,
          itemName: item.itemName,
          amount: parseInt(item.amount),
        };
      }),
    };

    try {
      const accessToken =
        typeof window !== 'undefined'
          ? localStorage.getItem('access_token')
          : null;
      if (!accessToken) {
        alert('로그인이 필요합니다.');
        return;
      }

      const response = await fetch('/api/budget/spending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('지출 등록에 실패했습니다.');
      }

      const responseData = await response.json();
      alert(responseData?.data?.message);

      // 지출 등록 성공 후 전체 지출 내역을 다시 불러오기
      const spendingResponse = await fetch('/api/budget/spending', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (spendingResponse.ok) {
        const spendingData = await spendingResponse.json();
        setAllSpending(spendingData?.data?.spending || []);
      }

      // 폼 초기화
      resetSpendingForm();
    } catch (error) {
      console.error('Error:', error);
      alert('서버 통신 중 오류가 발생했습니다.');
    }
  };

  // 날짜 선택 핸들러 수정
  const handleDateClick = (day) => {
    const selectedDateObj = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(selectedDateObj);

    // 선택된 날짜의 지출 내역 필터링
    const daySpending = dailySpending[day] || [];
    setSelectedDateSpending(daySpending);

    // 수정 모드 초기화
    setSpendingToEdit(null);
    setProductName('');
    setSpendingAmount('');
    setSelectedCategory('');
  };

  // 날짜 선택 핸들러
  const handleDateChange = (date) => {
    setSelectedDate(date);
    // 지출 내역을 업데이트하는 로직 추가
    const day = date.getDate();
    setSelectedDateSpending(dailySpending[day] || []);
  };

  // 지출 수정 핸들러
  const handleEditSpending = (spending) => {
    setSpendingToEdit(spending);
    setProductName(spending.itemName);
    setSpendingAmount(spending.amount.toString());
    // 카테고리를 한글로 변환하여 설정
    setSelectedCategory(getCategoryName(spending.category));
    setSelectedDate(new Date(spending.date));
  };

  // 지출 수정 취소 핸들러
  const handleCancelEdit = () => {
    setSpendingToEdit(null);
    setProductName('');
    setSpendingAmount('');
    setSelectedCategory('');
    // 원래의 날짜로 설정
    setSelectedDate(new Date(selectedDate)); // 원래 날짜로 설정
  };

  // 지출 수정 제출 핸들러
  const handleUpdateSpending = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !productName || !spendingAmount) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    try {
      const accessToken =
        typeof window !== 'undefined'
          ? localStorage.getItem('access_token')
          : null;
      if (!accessToken) {
        alert('로그인이 필요합니다.');
        return;
      }

      const requestBody = {
        date: selectedDate.toISOString().split('T')[0],
        category: getCategoryValue(selectedCategory),
        itemName: productName,
        amount: parseInt(spendingAmount),
      };

      const response = await fetch(
        `/api/budget/spending/${spendingToEdit.uid}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        alert('지출이 수정되었습니다.');
        // 수정 후 전체 지출 데이터를 다시 불러옴
        const spendingResponse = await fetch('/api/budget/spending', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (spendingResponse.ok) {
          const spendingData = await spendingResponse.json();
          setAllSpending(spendingData?.data?.spending || []);

          // 선택된 날짜의 지출 내역도 업데이트
          const day = selectedDate.getDate();
          const updatedDailySpending = spendingData?.data?.spending.filter(
            (spending) => {
              const spendingDate = new Date(spending.date);
              return spendingDate.getDate() === day;
            }
          );
          setSelectedDateSpending(updatedDailySpending);
        }

        setSpendingToEdit(null); // 수정 모드 종료
        setProductName('');
        setSpendingAmount('');
        setSelectedCategory('');
      } else {
        alert('지출 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('서버 통신 중 오류가 발생했습니다.');
    }
  };

  // 지출 삭제 핸들러
  const handleDeleteSpending = async (spendingId) => {
    const confirmDelete = window.confirm('이 지출 내역을 삭제하시겠습니까?');
    if (!confirmDelete) return;

    try {
      const accessToken =
        typeof window !== 'undefined'
          ? localStorage.getItem('access_token')
          : null;
      const response = await fetch(`/api/budget/spending/${spendingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        alert('지출이 삭제되었습니다.');

        // 삭제 후 전체 지출 데이터를 다시 불러옴
        const spendingResponse = await fetch('/api/budget/spending', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (spendingResponse.ok) {
          const spendingData = await spendingResponse.json();
          setAllSpending(spendingData?.data?.spending || []);
        }
      } else {
        alert('지출 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('서버 통신 중 오류가 발생했습니다.');
    }
  };

  // OCR 파일 처리 함수 수정
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OCR 분석 실패:', {
          status: response.status,
          error: errorText,
        });
        throw new Error('OCR 분석에 실패했습니다.');
      }

      const data = await response.json();
      console.log('OCR 응답:', data?.data?.analysisResult);

      // OCR 결과를 지출 항목으로 변환
      const newSpendingItems = data?.data?.analysisResult?.items.map(
        (item) => ({
          date: item.date || '',
          category: getCategoryValue(item.category),
          itemName: item.itemName,
          amount: item.amount ? item.amount.toString() : '0',
        })
      );

      setSpendingItems(newSpendingItems);
    } catch (error) {
      console.error('OCR 분석 오류:', error);
      alert('영수증 분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderCalendar = () => {
    const days = generateCalendarDays();
    const weeks = [];
    let week = [];

    days.forEach((day) => {
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
      week.push(day);
    });

    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null);
      }
      weeks.push(week);
    }

    return (
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <th key={day} className="p-2 border-b text-center text-black">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={`week-${weekIndex}`}>
              {week.map((day, dayIndex) => (
                <td
                  key={`${weekIndex}-${dayIndex}`}
                  className={`p-4 border text-center ${
                    day ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  style={{ width: '14.28%' }}
                  onClick={() => handleDateClick(day)}
                >
                  {day && (
                    <div className="min-h-[80px] flex flex-col items-center">
                      <span className="text-sm font-medium text-black mb-3">
                        {day}
                      </span>
                      {dailySpending[day] && dailySpending[day].length > 0 && (
                        <span className="text-base text-red-500 text-center">
                          {dailySpending[day]
                            .reduce((sum, item) => sum + item.amount, 0)
                            .toLocaleString()}{' '}
                          원
                        </span>
                      )}
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto max-w-5xl">
        <div className="bg-white rounded-lg shadow p-12">
          {/* 달력 헤더 */}
          <div className="flex justify-center items-center mb-6">
            <button
              onClick={handlePrevMonth}
              className="p-2 bg-white hover:bg-gray-50 rounded-full border border-gray-300 shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="black"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <span className="text-xl font-semibold text-black mx-4">
              {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 bg-white hover:bg-gray-50 rounded-full border border-gray-300 shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="black"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>

          {/* 예산 및 지출 요약 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2 text-black">예산</h3>
              <p className="text-2xl font-bold text-blue-600">
                {monthlyBudget?.toLocaleString('ko-KR') || '0'}원
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2 text-black">지출</h3>
              <p className="text-2xl font-bold text-red-600">
                {monthlySpending?.toLocaleString()}원
              </p>
            </div>
          </div>

          {/* 달력 */}
          <div className="overflow-x-auto">{renderCalendar()}</div>

          {/* 달력 이후 추가되는 섹션 */}
          <div className="mt-8 space-y-8">
            {/* 지출 내역 */}
            <div className="bg-white rounded-lg shadow p-12">
              <h3 className="text-xl font-bold mb-4 text-black">지출 내역</h3>
              <div className="overflow-x-auto mb-6">
                <table className="w-full">
                  <thead className="bg-orange-50">
                    <tr className="border-b">
                      <th className="px-6 py-3 text-left text-black font-semibold">
                        날짜
                      </th>
                      <th className="px-6 py-3 text-left text-black font-semibold">
                        카테고리
                      </th>
                      <th className="px-6 py-3 text-left text-black font-semibold">
                        상품
                      </th>
                      <th className="px-6 py-3 text-center text-black font-semibold">
                        지출
                      </th>
                      <th className="px-6 py-3 text-center text-black font-semibold">
                        편집
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 whitespace-nowrap">
                    {selectedDateSpending.map((spending) => (
                      <tr key={spending.uid || spending.itemName}>
                        {spendingToEdit?._id === spending._id ? (
                          // 수정 모드
                          <>
                            <td className="px-6 py-4">
                              <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                dateFormat="yyyy-MM-dd"
                                className="border p-2 rounded w-full text-black"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={selectedCategory}
                                onChange={(e) =>
                                  setSelectedCategory(e.target.value)
                                }
                                className="border p-2 rounded w-full text-black"
                              >
                                <option value="">카테고리 선택</option>
                                <option value="기저귀/물티슈">
                                  기저귀/물티슈
                                </option>
                                <option value="생활/위생용품">
                                  생활/위생용품
                                </option>
                                <option value="수유/이유용품">
                                  수유/이유용품
                                </option>
                                <option value="스킨케어/화장품">
                                  스킨케어/화장품
                                </option>
                                <option value="식품">식품</option>
                                <option value="완구용품">완구용품</option>
                                <option value="침구류">침구류</option>
                                <option value="패션의류/잡화">
                                  패션의류/잡화
                                </option>
                                <option value="기타">기타</option>
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                className="border p-2 rounded w-full text-black"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="number"
                                value={spendingAmount}
                                onChange={(e) =>
                                  setSpendingAmount(e.target.value)
                                }
                                className="border p-2 rounded w-full text-black text-right"
                              />
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end mt-4">
                                <button
                                  type="submit"
                                  onClick={handleUpdateSpending}
                                  className="inline-flex items-center px-4 py-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors duration-200 mr-2"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  저장하기
                                </button>
                                <button
                                  type="button"
                                  onClick={resetSpendingForm}
                                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors duration-200"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                  취소
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          // 일반 모드
                          <>
                            <td className="px-3 py-4 text-black ">
                              {new Date(spending.date).toLocaleDateString()}
                            </td>
                            <td className="px-2 py-4 text-black">
                              {getCategoryName(spending.category)}
                            </td>
                            <td className="px-3 py-4 text-black ">
                              {spending.itemName}
                            </td>
                            <td className="px-2 py-4 text-center text-black">
                              {parseInt(spending.amount).toLocaleString()}원
                            </td>
                            <td className="px-2 py-4 text-right">
                              <button
                                onClick={() => handleEditSpending(spending)}
                                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors duration-200 mr-2"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                수정
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteSpending(spending.uid)
                                }
                                className="inline-flex items-center px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors duration-200"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                삭제
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 지출 등록 */}
            <div className="bg-white rounded-lg shadow p-12">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold mb-4 text-black">지출 등록</h2>
                <div className="flex items-center space-x-4">
                  {/* OCR 업로드 버튼 */}
                  {/* <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="receipt-upload"
                      disabled={isAnalyzing}
                    />
                    <label
                      htmlFor="receipt-upload"
                      className={`flex items-center cursor-pointer ${
                        isAnalyzing
                          ? 'bg-gray-400'
                          : 'bg-orange-100 hover:bg-orange-200'
                      } text-orange-600 py-2 px-4 rounded-md transition duration-200`}
                    >
                      {isAnalyzing ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 mr-2"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          분석 중...
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          영수증 스캔
                        </>
                      )}
                    </label>
                  </div> */}

                  {/* 기존 지출 항목 추가 버튼 */}
                  <button
                    type="button"
                    onClick={addSpendingItem}
                    className="bg-orange-400 hover:bg-orange-600 text-white py-2 px-4 rounded-md transition duration-200 flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    지출 항목 추가
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center mb-2 font-semibold text-gray-700 bg-gray-100 p-2 rounded-md">
                  <span className="w-1/4 text-center text-black font-semibold">
                    날짜
                  </span>
                  <span className="w-1/4 text-center text-black font-semibold">
                    카테고리
                  </span>
                  <span className="w-1/4 text-center text-black font-semibold">
                    상품명
                  </span>
                  <span className="w-1/4 text-center text-black font-semibold">
                    금액
                  </span>
                </div>

                {spendingItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 border border-gray-300 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
                  >
                    <input
                      type="date"
                      value={item.date}
                      onChange={(e) =>
                        updateSpendingItem(index, 'date', e.target.value)
                      }
                      className="w-1/4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                      required
                    />

                    <select
                      value={item.category}
                      onChange={(e) =>
                        updateSpendingItem(index, 'category', e.target.value)
                      }
                      className="w-1/4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                      required
                    >
                      <option value="">카테고리 선택</option>
                      <option value="diaper">기저귀/물티슈</option>
                      <option value="sanitary">생활/위생용품</option>
                      <option value="feeding">수유/이유용품</option>
                      <option value="skincare">스킨케어/화장품</option>
                      <option value="food">식품</option>
                      <option value="toys">완구용품</option>
                      <option value="bedding">침구류</option>
                      <option value="fashion">패션의류/잡화</option>
                      <option value="other">기타</option>
                    </select>

                    <input
                      type="text"
                      value={item.itemName}
                      onChange={(e) =>
                        updateSpendingItem(index, 'itemName', e.target.value)
                      }
                      placeholder="상품명"
                      className="w-1/4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                      required
                    />

                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) =>
                        updateSpendingItem(index, 'amount', e.target.value)
                      }
                      placeholder="금액"
                      className="w-1/4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                      required
                    />

                    {spendingItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSpendingItem(index)}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                ))}

                <div className="flex justify-end mt-4">
                  {isEditing ? (
                    <>
                      <button
                        type="submit"
                        onClick={handleUpdateSpending}
                        className="inline-flex items-center px-4 py-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors duration-200 mr-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        저장하기
                      </button>
                      <button
                        type="button"
                        onClick={resetSpendingForm}
                        className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        취소
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className="inline-flex items-center px-4 py-2 bg-pink-100 text-pink-600 rounded-md hover:bg-blue-200 transition-colors duration-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      등록하기
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// 메인 페이지 컴포넌트
export default function CalendarPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CalendarContent />
    </Suspense>
  );
}

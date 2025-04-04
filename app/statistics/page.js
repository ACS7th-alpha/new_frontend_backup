'use client';

import { useState, useEffect } from 'react';
import { Pie, Doughnut, Bar, Line } from 'react-chartjs-2';
import Header from '@/app/components/Header';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register required chart components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// 카테고리 이름 매핑
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

export default function StatisticsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [categoryData, setCategoryData] = useState([]);
  const [monthlySpending, setMonthlySpending] = useState(0);
  const [yearlyData, setYearlyData] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // 사용자 상태 추가

  // 사용자 데이터와 지출 데이터 가져오기
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      setMonthlyBudget(storedUser.user?.monthlyBudget || 0); // monthlyBudget 설정
    }

    const fetchSpendingData = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          console.log('No access token found');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/budget/spending', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.status === 404) {
          console.log('No spending data found');
          setCategoryData([]);
          setMonthlySpending(0);
          setYearlyData(Array(12).fill(0));
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch spending data');
        }

        const data = await response.json();
        processData(data?.data?.spending || []);
      } catch (error) {
        console.error('Error:', error);
        return new Response(
          JSON.stringify({
            error: 'Failed to...',
            details: error.message,
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSpendingData();
  }, [currentDate]); // currentDate가 변경될 때마다 데이터 업데이트

  // 데이터 처리 함수
  const processData = (spendingData) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 1. 해당 월의 카테고리별 데이터 처리
    const monthlyData = spendingData
      .map((category) => {
        const details = category.details.filter((detail) => {
          const date = new Date(detail.date);
          return date.getFullYear() === year && date.getMonth() === month;
        });

        const totalAmount = details.reduce(
          (sum, detail) => sum + detail.amount,
          0
        );

        return {
          name: categoryMap[category.category] || category.category,
          amount: totalAmount,
          details: details,
        };
      })
      .filter((category) => category.amount > 0);

    // 2. 연간 데이터 처리
    const yearlyTotals = Array(12).fill(0);
    spendingData.forEach((category) => {
      category.details.forEach((detail) => {
        const date = new Date(detail.date);
        if (date.getFullYear() === year) {
          yearlyTotals[date.getMonth()] += detail.amount;
        }
      });
    });

    setCategoryData(monthlyData);
    setMonthlySpending(
      monthlyData.reduce((sum, category) => sum + category.amount, 0)
    );
    setYearlyData(yearlyTotals);
  };

  // 년월 변경 핸들러
  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const pieData = {
    labels: categoryData.map((category) => category.name),
    datasets: [
      {
        data: categoryData.map((category) => category.amount),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#FF9F40',
          '#4BC0C0',
        ],
      },
    ],
  };

  const doughnutData = {
    labels: categoryData.map((category) => category.name),
    datasets: [
      {
        data: categoryData.map((category) => category.amount),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#FF9F40',
          '#4BC0C0',
        ],
      },
    ],
  };

  // 전체 지출액 대비 카테고리별 비율 계산 함수
  const calculatePercentage = (amount) => {
    if (monthlySpending === 0) return 0;
    return ((amount / monthlySpending) * 100).toFixed(1);
  };

  // 연간 지출 차트 데이터
  const yearlyChartData = {
    labels: [
      '1월',
      '2월',
      '3월',
      '4월',
      '5월',
      '6월',
      '7월',
      '8월',
      '9월',
      '10월',
      '11월',
      '12월',
    ],
    datasets: [
      {
        label: '월별 지출',
        data: yearlyData,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: '월별 예산',
        data: Array(12).fill(user?.user?.monthlyBudget || 0),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        type: 'line',
      },
    ],
  };

  const processMonthlyComparison = (spendingData) => {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // 현재 월과 이전 월의 일별 지출 데이터 초기화
    const daysInCurrentMonth = new Date(
      currentYear,
      currentMonth + 1,
      0
    ).getDate();
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

    const currentMonthData = Array(daysInCurrentMonth).fill(0);
    const prevMonthData = Array(daysInPrevMonth).fill(0);

    // 이전 달 총액을 일별로 균등 분배 (소수점 제거)
    const prevMonthTotal = yearlyData[prevMonth] || 0;
    const dailyAmountPrevMonth = Math.floor(prevMonthTotal / daysInPrevMonth);

    // 이전 달 데이터 채우기
    for (let i = 0; i < daysInPrevMonth; i++) {
      prevMonthData[i] = dailyAmountPrevMonth;
    }

    // 남은 금액을 마지막 날짜에 추가 (반올림 오차 처리)
    const remainingAmount =
      prevMonthTotal - dailyAmountPrevMonth * daysInPrevMonth;
    if (remainingAmount > 0) {
      prevMonthData[daysInPrevMonth - 1] += remainingAmount;
    }

    // 현재 달 데이터 처리 (기존 로직 유지)
    spendingData.forEach((category) => {
      category.details.forEach((detail) => {
        const date = new Date(detail.date);
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        if (year === currentYear && month === currentMonth) {
          currentMonthData[day - 1] += detail.amount;
        }
      });
    });

    // 누적 합계 계산
    let currentSum = 0;
    let prevSum = 0;
    const currentCumulative = currentMonthData.map(
      (amount) => (currentSum += amount)
    );
    const prevCumulative = prevMonthData.map((amount) => (prevSum += amount));

    return {
      currentMonth: currentCumulative,
      prevMonth: prevCumulative,
      daysInCurrentMonth,
      daysInPrevMonth,
    };
  };

  const getComparisonChartData = (comparisonData) => {
    const { currentMonth, prevMonth, daysInCurrentMonth, daysInPrevMonth } =
      comparisonData;

    return {
      labels: Array.from(
        { length: Math.max(daysInCurrentMonth, daysInPrevMonth) },
        (_, i) => i + 1
      ),
      datasets: [
        {
          label: `${currentDate.getMonth() + 1}월`,
          data: currentMonth,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
          fill: false,
        },
        {
          label: `${
            currentDate.getMonth() === 0 ? 12 : currentDate.getMonth()
          }월`,
          data: prevMonth,
          borderColor: 'rgb(201, 203, 207)',
          tension: 0.1,
          fill: false,
        },
      ],
    };
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-5xl mx-auto px-8 flex flex-col">
        <div className="max-w-5xl mx-auto w-full relative">
          {/* 년월 선택 부분 */}
          <div className="flex justify-center items-center mt-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrevMonth}
                className="p-2 bg-white hover:bg-gray-50 rounded-full border border-gray-300"
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
              <span className="text-xl font-semibold text-black">
                {currentDate.getFullYear()}년{' '}
                {String(currentDate.getMonth() + 1).padStart(2, '0')}월
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
          </div>

          {/* 도넛 차트 섹션 */}
          <div className="bg-white rounded-lg p-6 mt-8">
            <div className="flex flex-col items-center">
              <div style={{ width: '400px', height: '400px' }}>
                <Doughnut
                  data={doughnutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 20,
                          font: {
                            size: 12,
                            color: 'black',
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-black text-center">
                  총 지출: {monthlySpending.toLocaleString()}원
                </h3>
              </div>
            </div>
          </div>

          {/* 카테고리별 지출 내역 */}
          <div className=" rounded-lg p-16 mt-6 border-2 max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-black mb-2">
              카테고리별 지출 내역
            </h3>
            {categoryData.map((category, index) => (
              <div key={index} className="mb-4">
                {/* 카테고리 헤더 */}
                <div className="flex justify-between items-center py-1 border-b">
                  <div className="flex items-center gap-1 mb-3">
                    <span className="relative text-black text-xl font-medium before:content-[''] before:inline-block before:w-3 before:h-3 before:bg-orange-500 before:rounded-full before:mr-2">
                      {category.name}
                    </span>
                    <span className="ml-2 text-gray-600 text-lg">
                      {calculatePercentage(category.amount)}%
                    </span>
                  </div>
                  <span className="text-black text-xl font-medium">
                    {category.amount.toLocaleString()}원
                  </span>
                </div>

                {/* 세부 내역 */}
                {category.details &&
                  category.details.map((detail, detailIndex) => (
                    <div
                      key={detailIndex}
                      className="flex justify-between py-1 pl-2 text-lg border-b last:border-b-0"
                    >
                      <div className="ml-8 flex items-center gap-2">
                        <span className="text-gray-600 min-w-[60px]">
                          {new Date(detail.date).toLocaleDateString('ko-KR', {
                            month: '2-digit',
                            day: '2-digit',
                          })}
                        </span>
                        <span className="text-black">{detail.itemName}</span>
                      </div>
                      <span className="text-black">
                        {detail.amount.toLocaleString()}원
                      </span>
                    </div>
                  ))}
              </div>
            ))}
          </div>

          {/* 연간 지출 내역 */}
          <div className="bg-white rounded-lg px-20 py-12 shadow-md mt-6 max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-black mb-4">
              {currentDate.getFullYear()}년 연간 지출 내역
            </h3>
            <div className="h-[400px]">
              <Bar
                data={yearlyChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `${value.toLocaleString()}원`,
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const label = context.dataset.label || '';
                          const value = context.parsed.y;
                          return `${label}: ${value.toLocaleString()}원`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>
            <div className="mt-12 text-center">
              <p className="text-black text-base">
                월별 예산:{' '}
                {Number(user?.user?.monthlyBudget)?.toLocaleString('ko-KR')}원
              </p>
              <p className="text-black text-base">
                연간 총 지출:{' '}
                {yearlyData.reduce((a, b) => a + b, 0).toLocaleString()}원
              </p>
            </div>
          </div>

          {/* 월별 비교 차트 */}
          <div className="bg-white rounded-lg p-16 shadow-md mt-6 max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-black mb-4">
              기간별 지출액 비교
            </h3>
            {monthlySpending > 0 ||
            yearlyData[currentDate.getMonth() - 1] > 0 ? (
              <>
                {(() => {
                  const comparisonData = processMonthlyComparison(categoryData);
                  console.log(
                    'Previous Month Data:',
                    yearlyData[currentDate.getMonth() - 1]
                  ); // 디버깅용 로그
                  console.log('Comparison Data:', comparisonData); // 디버깅용 로그

                  const { daysInCurrentMonth } = comparisonData;
                  const today = new Date().getDate();
                  const currentMonthSpendingToDate =
                    comparisonData.currentMonth[today - 1] || 0;
                  const prevMonthSpendingToDate =
                    comparisonData.prevMonth[today - 1] || 0;
                  const difference =
                    currentMonthSpendingToDate - prevMonthSpendingToDate;
                  const percentChange =
                    prevMonthSpendingToDate !== 0
                      ? (difference / prevMonthSpendingToDate) * 100
                      : 100;

                  return (
                    <>
                      <div className="mb-6 text-center space-y-3">
                        <p className="text-gray-700 font-medium flex items-center justify-center gap-2">
                          <span className="text-pink-500">🗓️</span>
                          {today}일 기준
                        </p>
                        <div className="flex justify-center items-center gap-4">
                          <div className="text-sm space-y-1 bg-blue-50 rounded-xl px-6 py-3">
                            <p>
                              <span className="text-gray-600">
                                이번달 총 지출
                              </span>{' '}
                              <span className="text-blue-600 font-semibold">
                                💙 {currentMonthSpendingToDate.toLocaleString()}
                                원
                              </span>
                            </p>
                            <p>
                              <span className="text-gray-600">
                                지난달 총 지출
                              </span>{' '}
                              <span className="text-gray-600 font-semibold">
                                💭 {prevMonthSpendingToDate.toLocaleString()}원
                              </span>
                            </p>
                          </div>
                        </div>
                        <p className="text-lg font-medium bg-gray-50 rounded-2xl px-6 py-4 inline-block">
                          {difference > 0 ? (
                            <>
                              <span className="text-pink-500"></span> 지난달보다{' '}
                              <span className={`font-bold text-red-500`}>
                                {Math.abs(difference).toLocaleString()}원
                              </span>
                              을{' '}
                              <span className="text-red-500 font-semibold">
                                더 많이
                              </span>{' '}
                              썼어요!
                              <span className={`text-sm ml-2 text-red-500`}>
                                (+{percentChange.toFixed(1)}%)
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-blue-500"></span> 지난달보다{' '}
                              <span className={`font-bold text-blue-500`}>
                                {Math.abs(difference).toLocaleString()}원
                              </span>
                              을{' '}
                              <span className="text-blue-500 font-semibold">
                                덜
                              </span>{' '}
                              썼어요!
                              <span className={`text-sm ml-2 text-blue-500`}>
                                ({percentChange.toFixed(1)}%)
                              </span>
                            </>
                          )}
                          <br />
                          <span className="text-sm text-gray-500 mt-1 block">
                            {difference > 0
                              ? '아기를 위한 소중한 지출이네요! 👶'
                              : '절약을 잘 하고 계시네요! ✨'}
                          </span>
                        </p>
                      </div>
                      <div className="h-[300px]">
                        <Line
                          data={{
                            labels: Array.from(
                              { length: daysInCurrentMonth },
                              (_, i) => i + 1
                            ),
                            datasets: [
                              {
                                label: `${currentDate.getMonth() + 1}월`,
                                data: comparisonData.currentMonth,
                                borderColor: 'rgba(53, 162, 235, 0.8)',
                                backgroundColor: 'rgba(53, 162, 235, 0.1)',
                                borderWidth: 2,
                                tension: 0.4,
                                fill: true,
                                pointRadius: 0,
                                pointHoverRadius: 6,
                                pointHoverBackgroundColor:
                                  'rgba(53, 162, 235, 1)',
                                pointHoverBorderColor: 'white',
                                pointHoverBorderWidth: 2,
                              },
                              {
                                label: `${
                                  currentDate.getMonth() === 0
                                    ? 12
                                    : currentDate.getMonth()
                                }월`,
                                data: comparisonData.prevMonth,
                                borderColor: 'rgba(255, 99, 132, 0.8)',
                                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                                borderWidth: 2,
                                tension: 0.4,
                                fill: true,
                                pointRadius: 0,
                                pointHoverRadius: 6,
                                pointHoverBackgroundColor:
                                  'rgba(255, 99, 132, 1)',
                                pointHoverBorderColor: 'white',
                                pointHoverBorderWidth: 2,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: true,
                                grid: {
                                  color: 'rgba(0, 0, 0, 0.05)',
                                  drawBorder: false,
                                },
                                ticks: {
                                  callback: (value) =>
                                    `${value.toLocaleString()}원`,
                                  font: {
                                    size: 11,
                                  },
                                },
                              },
                              x: {
                                title: {
                                  display: true,
                                  text: '일자',
                                  font: {
                                    size: 12,
                                    weight: 'bold',
                                  },
                                },
                                grid: {
                                  display: true,
                                  drawBorder: false,
                                  color: function (context) {
                                    const day =
                                      parseInt(context.tick.value) + 1;
                                    return day === 1 ||
                                      day === 15 ||
                                      day === daysInCurrentMonth
                                      ? 'rgba(0, 0, 0, 0.1)'
                                      : 'rgba(0, 0, 0, 0.03)';
                                  },
                                },
                                ticks: {
                                  callback: function (value) {
                                    const day = parseInt(value) + 1;
                                    if (
                                      day === 1 ||
                                      day === 15 ||
                                      day === daysInCurrentMonth
                                    ) {
                                      return `${day}일`;
                                    }
                                    return '';
                                  },
                                  autoSkip: false,
                                  font: {
                                    size: 11,
                                  },
                                },
                              },
                            },
                            plugins: {
                              legend: {
                                position: 'top',
                                labels: {
                                  usePointStyle: true,
                                  padding: 20,
                                  font: {
                                    size: 12,
                                  },
                                },
                              },
                              tooltip: {
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                titleColor: '#333',
                                titleFont: {
                                  size: 13,
                                  weight: 'normal',
                                },
                                bodyColor: '#666',
                                bodyFont: {
                                  size: 12,
                                },
                                padding: 12,
                                borderColor: 'rgba(0, 0, 0, 0.1)',
                                borderWidth: 1,
                                callbacks: {
                                  label: function (context) {
                                    const label = context.dataset.label || '';
                                    const value = context.parsed.y;
                                    return `${label}: ${value.toLocaleString()}원`;
                                  },
                                },
                              },
                            },
                            interaction: {
                              intersect: false,
                              mode: 'index',
                            },
                          }}
                        />
                      </div>
                    </>
                  );
                })()}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>아직 비교할 수 있는 데이터가 없습니다.</p>
                <p className="mt-2">
                  지출을 기록하시면 월별 비교 차트를 확인하실 수 있습니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

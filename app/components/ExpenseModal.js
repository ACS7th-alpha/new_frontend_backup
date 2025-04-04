'use client';
import { useState, useEffect } from 'react';

export default function ExpenseModal({ isOpen, onClose, item }) {
  const [expenseData, setExpenseData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    itemName: '',
    amount: '',
  });

  // 카테고리 매핑 객체 추가
  const categoryMapping = {
    수유_이유용품: 'feeding',
    기저귀_물티슈: 'diaper',
    생활_위생용품: 'sanitary',
    스킨케어_화장품: 'skincare',
    식품: 'food',
    완구용품: 'toys',
    침구류: 'bedding',
    패션의류_잡화: 'fashion',
    기타: 'other',
  };

  // 카테고리 옵션 추가
  const categoryOptions = [
    { value: 'diaper', label: '기저귀/물티슈' },
    { value: 'sanitary', label: '생활/위생용품' },
    { value: 'feeding', label: '수유/이유용품' },
    { value: 'skincare', label: '스킨케어/화장품' },
    { value: 'food', label: '식품' },
    { value: 'toys', label: '완구용품' },
    { value: 'bedding', label: '침구류' },
    { value: 'fashion', label: '패션의류/잡화' },
    { value: 'other', label: '기타' },
  ];

  // item이 변경될 때마다 expenseData 업데이트
  useEffect(() => {
    if (item) {
      const mappedCategory = categoryMapping[item.category] || 'other';
      setExpenseData({
        date: new Date().toISOString().split('T')[0],
        category: mappedCategory,
        itemName: item.name || '',
        amount: item.sale_price?.replace(/[^0-9]/g, '') || '',
      });
    }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const accessToken = localStorage.getItem('access_token');

      const requestData = {
        date: expenseData.date,
        category: expenseData.category,
        itemName: expenseData.itemName,
        amount: parseInt(expenseData.amount),
      };

      console.log('Request Data:', requestData);

      const response = await fetch('/api/budget/spending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          spendings: [requestData],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || '지출 내역 추가 실패');
      }

      alert('지출 내역이 추가되었습니다.');
      onClose();
    } catch (error) {
      console.error('지출 내역 추가 오류:', error);
      alert('지출 내역 추가 중 오류가 발생했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">지출 추가</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">날짜</label>
            <input
              type="date"
              value={expenseData.date}
              onChange={(e) =>
                setExpenseData({ ...expenseData, date: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-pink-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">카테고리</label>
            <select
              value={expenseData.category}
              onChange={(e) =>
                setExpenseData({ ...expenseData, category: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-pink-500 focus:outline-none"
              required
            >
              <option value="">카테고리 선택</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">상품</label>
            <input
              type="text"
              value={expenseData.itemName}
              onChange={(e) =>
                setExpenseData({ ...expenseData, itemName: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-pink-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">지출</label>
            <input
              type="number"
              value={expenseData.amount}
              onChange={(e) =>
                setExpenseData({ ...expenseData, amount: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-pink-500 focus:outline-none"
              required
            />
          </div>
          <div className="flex justify-end gap-1 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-white hover:text-gray-800 transition-colors duration-200"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200"
            >
              확인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

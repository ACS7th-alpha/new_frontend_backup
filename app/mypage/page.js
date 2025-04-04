'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Link from 'next/link';

export default function MyPage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [myPosts, setMyPosts] = useState([]); // 내가 쓴 글 저장할 상태
  const [loading, setLoading] = useState(false);
  const [childToEdit, setChildToEdit] = useState(null);
  const [newChild, setNewChild] = useState({
    name: '',
    birthdate: '',
    gender: 'male',
  }); // 새로운 자녀 정보 상태
  const [isAddingChild, setIsAddingChild] = useState(false); // 추가 모드 상태
  const [isEditing, setIsEditing] = useState(false);
  const [newNickname, setNewNickname] = useState(
    userInfo?.user?.nickname || ''
  );
  const [newBudget, setNewBudget] = useState(
    userInfo?.user?.monthlyBudget || 0
  );

  useEffect(() => {
    const userData = localStorage.getItem('user');
    console.log('[MyPage] Initializing user data:', {
      hasUserData: !!userData,
      timestamp: new Date().toISOString(),
    });
    if (userData) {
      const parsedData = JSON.parse(userData);
      console.log('[MyPage] Parsed user data:', {
        nickname: parsedData?.user?.nickname,
        hasChildren: !!parsedData?.user?.children,
        childrenCount: parsedData?.user?.children?.length,
      });
      setUserInfo(parsedData);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'posts') {
      console.log('[MyPage] Fetching posts for active tab:', activeTab);
      fetchMyPosts();
    }
  }, [activeTab]);

  const handleDeletePost = async (e, id) => {
    e.stopPropagation();
    console.log('[MyPage] Attempting to delete post:', id);

    const confirmDelete = window.confirm('이 글을 정말 삭제하시겠습니까?');
    if (!confirmDelete) {
      console.log('[MyPage] Post deletion cancelled by user');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      console.log('[MyPage] Delete post request initiated:', {
        postId: id,
        hasToken: !!token,
      });

      if (!token) {
        console.error('[MyPage] Delete post failed: No access token');
        throw new Error('로그인이 필요합니다.');
      }

      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('[MyPage] Delete post response:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      });

      if (!response.ok) throw new Error('글 삭제 실패');

      setMyPosts(myPosts.filter((post) => post._id !== id));
      console.log('[MyPage] Post successfully deleted:', id);
      alert('글이 삭제되었습니다.');
    } catch (error) {
      console.error('[MyPage] Error deleting post:', {
        postId: id,
        error: error.message,
        stack: error.stack,
      });
      alert('글 삭제 중 오류가 발생했습니다.');
    }
  };

  const fetchMyPosts = async () => {
    setLoading(true);
    console.log('[MyPage] Starting to fetch posts');

    try {
      const token = localStorage.getItem('access_token');
      console.log('[MyPage] Fetch posts request initiated:', {
        hasToken: !!token,
      });

      if (!token) throw new Error('로그인이 필요합니다.');

      const response = await fetch('/api/reviews/my-reviews', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('[MyPage] Fetch posts response:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      });

      if (!response.ok) {
        throw new Error('내가 쓴 글을 불러오는 데 실패했습니다.');
      }

      const responseData = await response.json();
      console.log('[MyPage] Posts fetched successfully:', {
        responseData,
        count: responseData?.data?.length || 0,
      });

      if (!Array.isArray(responseData.data)) {
        console.error('[MyPage] Invalid response format:', responseData);
        throw new Error('서버 응답 형식이 올바르지 않습니다.');
      }

      setMyPosts(responseData.data);
    } catch (error) {
      console.error('[MyPage] Error fetching posts:', {
        message: error.message,
        stack: error.stack,
      });
      alert(error.message);
    } finally {
      setLoading(false);
      console.log('[MyPage] Fetch posts completed');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    console.log('[MyPage] Starting account deletion process');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('로그인이 필요합니다.');

      // 예산 데이터 삭제
      console.log('[MyPage] Attempting to delete budget data');
      const budgetResponse = await fetch('/api/budget', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('[MyPage] Budget deletion response:', {
        status: budgetResponse.status,
        ok: budgetResponse.ok,
      });

      // 예산 데이터가 없는 경우(404)는 무시하고 진행
      if (!budgetResponse.ok && budgetResponse.status !== 404) {
        const errorData = await budgetResponse.json();
        console.error('[MyPage] Budget deletion error details:', errorData);
        throw new Error(
          errorData.error ||
            '예산 데이터 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.'
        );
      }

      // 계정 삭제 API 엔드포인트 수정
      console.log('[MyPage] Proceeding with account deletion');
      const userResponse = await fetch('/api/auth/delete', {
        // 수정된 엔드포인트
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.error || '계정 삭제에 실패했습니다.');
      }

      // 모든 과정이 성공적으로 완료되면 로그아웃 처리
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      router.push('/');
      alert('회원 탈퇴가 완료되었습니다.');
    } catch (error) {
      console.error('[MyPage] Error during account deletion:', {
        message: error.message,
        stack: error.stack,
      });
      alert(error.message);
    }
  };

  const handleDeleteChild = async (index) => {
    const childToDelete = userInfo?.user?.children[index];
    const confirmDelete = window.confirm(
      `${childToDelete.name}의 정보를 정말 삭제하시겠습니까?`
    );
    if (!confirmDelete) return;

    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('로그인이 필요합니다.');

      console.log(`[MyPage] Deleting child: ${childToDelete.name}`);
      const response = await fetch(
        `/api/children?name=${encodeURIComponent(childToDelete.name)}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error('[MyPage] Failed to delete child:', response.statusText);
        throw new Error('아기 정보 삭제 실패');
      }

      const data = await response.json();
      console.log('[MyPage] Delete response:', data);

      if (data.user) {
        // 서버에서 반환된 최신 사용자 데이터로 업데이트
        const updatedUserData = {
          ...userInfo,
          user: data.user,
        };

        console.log('[MyPage] Updating with server data:', updatedUserData);

        // localStorage와 상태 업데이트
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        setUserInfo(updatedUserData);
      } else {
        // 서버에서 최신 데이터를 받지 못한 경우, 로컬에서 처리
        const updatedChildren = userInfo.user.children.filter(
          (_, idx) => idx !== index
        );

        const updatedUserData = {
          ...userInfo,
          user: {
            ...userInfo.user,
            children: updatedChildren,
          },
        };

        console.log('[MyPage] Updating locally:', updatedUserData);

        localStorage.setItem('user', JSON.stringify(updatedUserData));
        setUserInfo(updatedUserData);
      }

      alert(`${childToDelete.name}의 정보가 삭제되었습니다.`);
      console.log(
        `[MyPage] ${childToDelete.name}의 정보가 성공적으로 삭제되었습니다.`
      );
    } catch (error) {
      console.error('[MyPage] Error deleting child:', error);
      alert('아기 정보 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEditChild = (index, field, value) => {
    console.log('[MyPage] Editing child:', { index, field, value });

    setUserInfo((prev) => {
      // 먼저 children 배열이 있는지 확인
      if (!prev?.user?.children) {
        console.error('[MyPage] No children array found in userInfo');
        return prev;
      }

      // 기존 children 배열 복사
      const updatedChildren = [...prev.user.children];

      // 해당 인덱스의 child 업데이트
      updatedChildren[index] = {
        ...updatedChildren[index],
        [field]: value,
      };

      console.log('[MyPage] Updated child:', updatedChildren[index]);

      // 전체 userInfo 업데이트
      const updatedUserInfo = {
        ...prev,
        user: {
          ...prev.user,
          children: updatedChildren,
        },
      };

      console.log('[MyPage] Full updated userInfo:', updatedUserInfo);

      // localStorage도 함께 업데이트
      localStorage.setItem('user', JSON.stringify(updatedUserInfo));

      return updatedUserInfo;
    });
  };

  const handleEditClick = (index, originalName) => {
    console.log('[MyPage] Entering edit mode:', { index, originalName });
    setChildToEdit({ index, originalName });
  };

  const handleSaveChild = async (index) => {
    const child = userInfo?.user?.children[index];
    const originalName = childToEdit.originalName; // 수정 전의 이름

    try {
      const accessToken = localStorage.getItem('access_token');
      console.log('[MyPage] Attempting to update child:', {
        originalName,
        updatedData: child,
      });

      if (!accessToken) {
        alert('로그인이 필요합니다.');
        return;
      }

      const requestBody = {
        name: child.name,
        gender: child.gender,
        birthdate: child.birthdate,
      };

      console.log('[MyPage] Sending update request:', {
        originalName,
        requestBody,
      });

      // URL에 원래 이름을 포함시켜 요청
      const response = await fetch(
        `/api/children/${encodeURIComponent(originalName)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log('[MyPage] Update response:', {
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[MyPage] Update failed:', errorText);
        throw new Error(`아기 정보 수정 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('[MyPage] Update successful:', data);

      // 현재 localStorage의 user 데이터를 가져옴
      const currentUserData = JSON.parse(localStorage.getItem('user'));

      // 자녀 정보 업데이트
      const updatedChildren = currentUserData.user.children.map((c, idx) =>
        idx === index
          ? {
              ...c,
              name: child.name,
              gender: child.gender,
              birthdate: child.birthdate,
            }
          : c
      );

      // 전체 user 데이터 업데이트
      const updatedUserData = {
        ...currentUserData,
        user: {
          ...currentUserData.user,
          children: updatedChildren,
        },
      };

      console.log('[MyPage] Updating localStorage with:', updatedUserData);

      // localStorage와 상태 업데이트
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      setUserInfo(updatedUserData);
      setChildToEdit(null); // 수정 모드 종료

      alert('아기 정보가 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('[MyPage] Error updating child:', {
        message: error.message,
        stack: error.stack,
      });
      alert('아기 정보 수정 중 오류가 발생했습니다.');
    }
  };

  const handleAddChild = async () => {
    try {
      console.log('[MyPage] Adding new child:', newChild);

      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        alert('로그인이 필요합니다.');
        return;
      }

      // 입력 검증
      if (!newChild.name || !newChild.birthdate) {
        alert('이름과 생년월일을 모두 입력해주세요.');
        return;
      }

      const response = await fetch('/api/children', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: newChild.name.trim(),
          birthdate: newChild.birthdate,
          gender: newChild.gender || 'male',
        }),
      });

      console.log('[MyPage] Add child response:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[MyPage] Add child error:', errorText);

        if (response.status === 409) {
          throw new Error('이미 존재하는 자녀 이름입니다.');
        }
        throw new Error(`아기 정보 추가 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('[MyPage] Server response data:', data);

      if (!data.user) {
        console.error(
          '[MyPage] Invalid server response - missing user data:',
          data
        );
        throw new Error('서버 응답 데이터 오류');
      }

      // 현재 localStorage의 user 데이터를 가져옴
      const currentUserData = JSON.parse(localStorage.getItem('user'));
      console.log('[MyPage] Current user data:', currentUserData);

      // 새로운 데이터로 업데이트
      const updatedUserData = {
        ...currentUserData,
        user: data.user,
      };

      console.log('[MyPage] Updated user data to save:', updatedUserData);

      // localStorage와 상태 업데이트
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      setUserInfo(updatedUserData);

      // 입력 폼 초기화
      setNewChild({
        name: '',
        birthdate: '',
        gender: 'male',
      });
      setIsAddingChild(false);

      alert('자녀 정보가 추가되었습니다.');

      // 페이지 새로고침 (선택적)
      window.location.reload();
    } catch (error) {
      console.error('[MyPage] Error adding child:', {
        message: error.message,
        stack: error.stack,
      });
      alert(error.message);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setNewNickname(userInfo?.user?.nickname || '');
    setNewBudget(userInfo?.user?.monthlyBudget || 0);
  };

  const handleSaveProfile = async () => {
    const accessToken = localStorage.getItem('access_token');
    console.log('[MyPage] Updating profile:', {
      nickname: newNickname,
      monthlyBudget: newBudget,
    });

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          nickname: newNickname,
          monthlyBudget: newBudget,
        }),
      });

      console.log('[MyPage] Profile update response:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      });

      const data = await response.json();
      console.log('[MyPage] Parsed response data:', data);

      if (response.ok) {
        // 현재 localStorage의 user 데이터를 가져옴
        const currentUserData = JSON.parse(localStorage.getItem('user'));
        console.log('[MyPage] Current user data:', currentUserData);

        // 새로운 데이터로 기존 데이터 업데이트
        const updatedUserData = {
          ...currentUserData,
          user: {
            ...currentUserData.user,
            nickname: data.user.nickname,
            monthlyBudget: data.user.monthlyBudget,
          },
        };

        console.log('[MyPage] Updated user data:', updatedUserData);

        localStorage.setItem('user', JSON.stringify(updatedUserData));
        setUserInfo(updatedUserData);
        setIsEditing(false);
        alert('프로필이 업데이트되었습니다.');
      } else {
        console.error('[MyPage] Error updating profile:', data.message);
        alert(data.message || '프로필 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('[MyPage] Profile update error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      alert('프로필 업데이트 중 오류가 발생했습니다.');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewNickname(userInfo?.user?.nickname || '');
    setNewBudget(userInfo?.user?.monthlyBudget || 0);
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-pink-50">
        <Header />
        <div className="flex justify-center items-center h-[calc(100vh-100px)]">
          <p className="text-lg">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-0">
      <Header />
      <div className="max-w-4xl mx-auto p-8">
        {/* 프로필 헤더 */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-pink-200 shadow-lg">
              <img
                src={userInfo?.user?.photo}
                alt="Profile"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {userInfo?.user?.nickname} <span className="ml-2">👋</span>
              </h1>
              <p className="text-gray-600">{userInfo?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-full font-semibold transition-colors ${
              activeTab === 'profile'
                ? 'bg-orange-400 text-white'
                : 'bg-white text-gray-600 hover:bg-blue-50'
            }`}
          >
            프로필 정보
          </button>
          <button
            onClick={() => setActiveTab('children')}
            className={`px-6 py-3 rounded-full font-semibold transition-colors ${
              activeTab === 'children'
                ? 'bg-orange-400 text-white'
                : 'bg-white text-gray-600 hover:bg-blue-50'
            }`}
          >
            자녀 정보
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-3 rounded-full font-semibold transition-colors ${
              activeTab === 'posts'
                ? 'bg-orange-400 text-white'
                : 'bg-white text-gray-600 hover:bg-blue-50'
            }`}
          >
            내가 쓴 글
          </button>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="mb-36 rounded-3xl shadow-lg p-12">
          {activeTab === 'profile' && (
            <div className="space-y-6 px-8 mt-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-12">
                프로필 정보 <span className="ml-2">📝</span>
              </h2>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-gray-600 mb-2">이메일</p>
                  <p className="text-lg font-semibold">
                    {userInfo?.user?.email}
                  </p>
                  <div className="mt-8">
                    <p className="text-gray-600 mb-2">당월 예산</p>
                    {isEditing ? (
                      <input
                        type="number"
                        value={newBudget}
                        onChange={(e) => setNewBudget(e.target.value)}
                        className="border border-gray-300 rounded-md p-2 w-full"
                      />
                    ) : (
                      <p className="text-lg font-semibold">
                        {Number(userInfo?.user?.monthlyBudget)?.toLocaleString(
                          'ko-KR'
                        )}
                        원
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 mb-2">닉네임</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={newNickname}
                      onChange={(e) => setNewNickname(e.target.value)}
                      className="border border-gray-300 rounded-md p-2 w-full"
                    />
                  ) : (
                    <p className="text-lg font-semibold">
                      {userInfo?.user?.nickname}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-600 transition-colors h-10"
                    >
                      저장
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors h-10"
                    >
                      취소
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEditProfile}
                    className="px-4 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-600 transition-colors h-10"
                  >
                    수정
                  </button>
                )}
              </div>
            </div>
          )}
          {activeTab === 'children' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold px-4 text-gray-800 mb-6 flex justify-between items-center">
                자녀 정보 👶
                <button
                  onClick={() => setIsAddingChild(true)}
                  className="px-4 py-2 bg-orange-400 text-white text-base rounded-md hover:bg-orange-600 transition-colors"
                >
                  추가
                </button>
              </h2>
              {isAddingChild && ( // 추가 모드일 때 입력 필드 표시
                <div className="rounded-2xl p-6 border-2 border-gray-200 flex justify-between items-center mb-4">
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-gray-600 mb-2">이름</p>
                      <input
                        type="text"
                        value={newChild.name}
                        onChange={(e) =>
                          setNewChild({ ...newChild, name: e.target.value })
                        }
                        className="text-lg font-semibold border border-gray-300 rounded-md p-2 w-36 h-12"
                        required
                      />
                    </div>
                    <div>
                      <p className="text-gray-600 mb-2">생년월일</p>
                      <input
                        type="date"
                        value={newChild.birthdate}
                        onChange={(e) =>
                          setNewChild({
                            ...newChild,
                            birthdate: e.target.value,
                          })
                        }
                        className="text-lg font-semibold border border-gray-300 rounded-md p-2"
                        required
                      />
                    </div>
                    <div>
                      <p className="text-gray-600 mb-2">성별</p>
                      <select
                        value={newChild.gender}
                        onChange={(e) =>
                          setNewChild({ ...newChild, gender: e.target.value })
                        }
                        className="text-lg font-semibold border border-gray-300 rounded-md p-2 h-12"
                        required
                      >
                        <option value="male">남자</option>
                        <option value="female">여자</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={handleAddChild}
                      className="px-4 py-2 bg-orange-200 text-gray-600 rounded-md hover:bg-green-200 transition-colors flex items-center justify-center whitespace-nowrap"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => setIsAddingChild(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md hover:bg-gray-400 transition-colors flex items-center justify-center whitespace-nowrap"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
              {userInfo?.user?.children &&
              userInfo?.user?.children.length > 0 ? (
                userInfo?.user?.children.map((child, index) => (
                  <div
                    key={index}
                    className="rounded-2xl p-6 flex justify-between items-center"
                  >
                    <div className="grid grid-cols-3 gap-16">
                      {childToEdit?.index === index ? (
                        <>
                          <div>
                            <p className="text-gray-600 mb-2">이름</p>
                            <input
                              type="text"
                              value={child.name || ''}
                              onChange={(e) => {
                                console.log('[MyPage] Updating child name:', {
                                  oldName: child.name,
                                  newName: e.target.value,
                                });
                                handleEditChild(index, 'name', e.target.value);
                              }}
                              className="text-lg font-semibold border border-gray-300 rounded-md p-2 w-36 h-12"
                              required
                            />
                          </div>
                          <div>
                            <p className="text-gray-600 mb-2">생년월일</p>
                            <input
                              type="date"
                              value={
                                child.birthdate
                                  ? child.birthdate.split('T')[0]
                                  : ''
                              }
                              onChange={(e) => {
                                console.log(
                                  '[MyPage] Updating child birthdate:',
                                  {
                                    oldDate: child.birthdate,
                                    newDate: e.target.value,
                                  }
                                );
                                handleEditChild(
                                  index,
                                  'birthdate',
                                  e.target.value
                                );
                              }}
                              className="text-lg font-semibold border border-gray-300 rounded-md p-2"
                              required
                            />
                          </div>
                          <div>
                            <p className="text-gray-600 mb-2">성별</p>
                            <select
                              value={child.gender || 'male'}
                              onChange={(e) => {
                                console.log('[MyPage] Updating child gender:', {
                                  oldGender: child.gender,
                                  newGender: e.target.value,
                                });
                                handleEditChild(
                                  index,
                                  'gender',
                                  e.target.value
                                );
                              }}
                              className="text-lg font-semibold border border-gray-300 rounded-md p-2 h-12"
                              required
                            >
                              <option value="male">남자</option>
                              <option value="female">여자</option>
                            </select>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <p className="text-gray-600 mb-2">이름</p>
                            <p className="text-lg font-semibold">
                              {child.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-2">생년월일</p>
                            <p className="text-lg font-semibold">
                              {new Date(child.birthdate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-2">성별</p>
                            <p className="text-lg font-semibold">
                              {child.gender === 'male' ? '남자' : '여자'}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {childToEdit?.index === index ? (
                        <>
                          <button
                            onClick={() => handleSaveChild(index)}
                            className="px-4 py-2 bg-orange-200 text-gray-600 rounded-md hover:bg-orange-200 transition-colors flex items-center justify-center whitespace-nowrap"
                          >
                            저장
                          </button>
                          <button
                            onClick={() => setChildToEdit(null)}
                            className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md hover:bg-gray-400 transition-colors flex items-center justify-center whitespace-nowrap"
                          >
                            취소
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditClick(index, child.name)}
                            className="px-4 py-2 bg-orange-200 text-black rounded-md hover:bg-orange-400 transition-colors"
                          >
                            수정
                          </button>
                          {userInfo?.user?.children?.length > 1 && (
                            <button
                              onClick={() => handleDeleteChild(index)}
                              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                            >
                              삭제
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">등록된 자녀 정보가 없습니다.</p>
              )}
            </div>
          )}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                내가 쓴 글 <span className="ml-2">📝</span>
              </h2>
              {loading ? (
                <p>로딩 중...</p>
              ) : myPosts.length > 0 ? (
                <div className="grid gap-4">
                  {myPosts.map((post) => (
                    <div
                      key={post._id}
                      className="p-4 bg-white rounded-lg shadow flex justify-between items-center"
                    >
                      <div className="flex gap-4 items-center">
                        <div className="w-20 h-20 flex-shrink-0">
                          {post.thumbnailUrls && post.thumbnailUrls[0] ? (
                            <img
                              src={post.thumbnailUrls[0]}
                              alt={post.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-gray-400">No Image</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{post.name}</h3>
                          <p className="text-gray-600 text-sm">
                            {post.description}
                          </p>
                          <p className="text-gray-500 text-xs">
                            연령대: {post.ageGroup} |
                            {post.recommended ? ' 추천함' : ' 추천안함'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/community/${post._id}`}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          보기
                        </Link>
                        <button
                          onClick={(e) => handleDeletePost(e, post._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  작성한 글이 없습니다.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

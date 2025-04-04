'use client';
import Firstpage from './Firstpage';
import UserDashboard from './UserDashboard';
import Categoryproduct from './Categoryproduct';

export default function HeroSection({
  userInfo,
  childAge,
  monthlySpending,
}) {
  if (!userInfo) {
    return <Firstpage />;
  }

  // 남은 예산 계산
  const remainingBudget = Math.max(
    0,
    (userInfo.monthlyBudget || 0) - monthlySpending
  );

  return (
    <>
      <UserDashboard
        userInfo={userInfo}
        childAge={childAge}
        monthlySpending={monthlySpending}
        remainingBudget={remainingBudget}
      />
      <Categoryproduct />
    </>
  );
}

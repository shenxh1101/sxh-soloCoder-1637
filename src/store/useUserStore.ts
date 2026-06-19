import { create } from 'zustand';
import type { User } from '@/types/user';
import { calculateLeaderGrade, getGradeDiscount } from '@/utils/gradeCalculator';

interface UserState {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  updateUserRating: (newRating: number) => void;
  incrementActivityCount: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  currentUser: null,

  setCurrentUser: (user: User) => {
    console.log('[UserStore] 设置当前用户', user);
    set({ currentUser: user });
  },

  updateUserRating: (newRating: number) => {
    const { currentUser } = get();
    if (!currentUser) return;

    const updatedCount = currentUser.activityCount;
    const oldTotalRating = currentUser.averageRating * updatedCount;
    const newAverageRating = (oldTotalRating + newRating) / (updatedCount + 1);
    
    const gradeResult = calculateLeaderGrade(updatedCount, newAverageRating);
    const discount = getGradeDiscount(gradeResult.grade);

    const updatedUser: User = {
      ...currentUser,
      averageRating: Math.round(newAverageRating * 10) / 10,
      leaderGrade: gradeResult.grade,
      discount
    };

    console.log('[UserStore] 更新用户评分', updatedUser);
    set({ currentUser: updatedUser });
  },

  incrementActivityCount: () => {
    const { currentUser } = get();
    if (!currentUser) return;

    const newCount = currentUser.activityCount + 1;
    const gradeResult = calculateLeaderGrade(newCount, currentUser.averageRating);
    const discount = getGradeDiscount(gradeResult.grade);

    const updatedUser: User = {
      ...currentUser,
      activityCount: newCount,
      leaderGrade: gradeResult.grade,
      discount
    };

    console.log('[UserStore] 增加活动计数', updatedUser);
    set({ currentUser: updatedUser });
  }
}));

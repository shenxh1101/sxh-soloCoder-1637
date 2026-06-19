import { create } from 'zustand';
import type { User } from '@/types/user';
import { calculateLeaderGrade, getGradeDiscount } from '@/utils/gradeCalculator';
import { mockUsers } from '@/data/mockUsers';

interface UserState {
  users: User[];
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  getUserById: (userId: string) => User | undefined;
  updateLeaderRating: (leaderId: string, newRating: number) => void;
  incrementLeaderActivityCount: (leaderId: string) => void;
  updateUserRating: (newRating: number) => void;
  incrementActivityCount: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: mockUsers,
  currentUser: null,

  setCurrentUser: (user: User) => {
    console.log('[UserStore] 设置当前用户', user);
    set({ currentUser: user });
  },

  getUserById: (userId: string) => {
    const { users } = get();
    return users.find(u => u.id === userId);
  },

  updateLeaderRating: (leaderId: string, newRating: number) => {
    console.log('[UserStore] 更新领队评分', { leaderId, newRating });
    
    set(state => {
      const updatedUsers = state.users.map(user => {
        if (user.id !== leaderId) return user;

        const updatedCount = user.activityCount;
        const oldTotalRating = user.averageRating * updatedCount;
        const newAverageRating = (oldTotalRating + newRating) / (updatedCount + 1);
        
        const gradeResult = calculateLeaderGrade(updatedCount, newAverageRating);
        const discount = getGradeDiscount(gradeResult.grade);

        return {
          ...user,
          averageRating: Math.round(newAverageRating * 10) / 10,
          leaderGrade: gradeResult.grade,
          discount
        };
      });

      const updatedCurrentUser = state.currentUser && state.currentUser.id === leaderId
        ? updatedUsers.find(u => u.id === leaderId) || state.currentUser
        : state.currentUser;

      return {
        users: updatedUsers,
        currentUser: updatedCurrentUser
      };
    });
  },

  incrementLeaderActivityCount: (leaderId: string) => {
    console.log('[UserStore] 增加领队活动计数', { leaderId });
    
    set(state => {
      const updatedUsers = state.users.map(user => {
        if (user.id !== leaderId) return user;

        const newCount = user.activityCount + 1;
        const gradeResult = calculateLeaderGrade(newCount, user.averageRating);
        const discount = getGradeDiscount(gradeResult.grade);

        return {
          ...user,
          activityCount: newCount,
          leaderGrade: gradeResult.grade,
          discount
        };
      });

      const updatedCurrentUser = state.currentUser && state.currentUser.id === leaderId
        ? updatedUsers.find(u => u.id === leaderId) || state.currentUser
        : state.currentUser;

      return {
        users: updatedUsers,
        currentUser: updatedCurrentUser
      };
    });
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

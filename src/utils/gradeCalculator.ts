import type { LeaderGrade } from '@/types/user';

interface GradeCriteria {
  minActivities: number;
  minRating: number;
  discount: number;
  label: string;
}

const gradeCriteria: Record<LeaderGrade, GradeCriteria> = {
  bronze: {
    minActivities: 0,
    minRating: 0,
    discount: 0,
    label: '青铜'
  },
  silver: {
    minActivities: 5,
    minRating: 4.0,
    discount: 5,
    label: '白银'
  },
  gold: {
    minActivities: 15,
    minRating: 4.3,
    discount: 10,
    label: '黄金'
  },
  platinum: {
    minActivities: 30,
    minRating: 4.6,
    discount: 15,
    label: '铂金'
  },
  diamond: {
    minActivities: 50,
    minRating: 4.8,
    discount: 20,
    label: '钻石'
  }
};

const gradesInOrder: LeaderGrade[] = ['diamond', 'platinum', 'gold', 'silver', 'bronze'];

export const calculateLeaderGrade = (activityCount: number, averageRating: number): { grade: LeaderGrade; nextGrade: LeaderGrade | null; progress: number } => {
  console.log('[GradeCalculator] 计算领队等级', { activityCount, averageRating });

  let currentGrade: LeaderGrade = 'bronze';
  let nextGrade: LeaderGrade | null = null;

  for (let i = 0; i < gradesInOrder.length; i++) {
    const grade = gradesInOrder[i];
    const criteria = gradeCriteria[grade];
    if (activityCount >= criteria.minActivities && averageRating >= criteria.minRating) {
      currentGrade = grade;
      const currentIndex = gradesInOrder.indexOf(grade);
      nextGrade = currentIndex > 0 ? gradesInOrder[currentIndex - 1] : null;
      break;
    }
  }

  if (currentGrade === 'bronze') {
    nextGrade = 'silver';
  }

  let progress = 100;
  if (nextGrade) {
    const currentCriteria = gradeCriteria[currentGrade];
    const nextCriteria = gradeCriteria[nextGrade];
    const activityProgress = Math.min(100, ((activityCount - currentCriteria.minActivities) / (nextCriteria.minActivities - currentCriteria.minActivities)) * 100);
    const ratingProgress = Math.min(100, ((averageRating - currentCriteria.minRating) / (nextCriteria.minRating - currentCriteria.minRating)) * 100);
    progress = Math.min(activityProgress, ratingProgress);
  }

  const result = { grade: currentGrade, nextGrade, progress: Math.round(progress) };
  console.log('[GradeCalculator] 等级计算结果', result);
  return result;
};

export const getGradeLabel = (grade: LeaderGrade): string => {
  return gradeCriteria[grade].label;
};

export const getGradeColor = (grade: LeaderGrade): string => {
  const colors: Record<LeaderGrade, string> = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
    diamond: '#B9F2FF'
  };
  return colors[grade];
};

export const getGradeDiscount = (grade: LeaderGrade): number => {
  return gradeCriteria[grade].discount;
};

export type LeaderGrade = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface User {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  leaderGrade: LeaderGrade;
  activityCount: number;
  averageRating: number;
  joinDate: string;
  discount: number;
}

export interface JoinApplication {
  id: string;
  activityId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  status: 'pending' | 'approved' | 'rejected';
  applyTime: string;
  message: string;
}

export interface Participant {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  checkedIn: boolean;
  checkInTime?: string;
}

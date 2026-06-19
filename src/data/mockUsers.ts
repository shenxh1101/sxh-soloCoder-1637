import type { User, JoinApplication } from '@/types/user';

export const mockCurrentUser: User = {
  id: 'u1',
  name: '露营达人',
  avatar: 'https://picsum.photos/id/1012/200/200',
  phone: '138****8888',
  leaderGrade: 'gold',
  activityCount: 18,
  averageRating: 4.5,
  joinDate: '2024-01-15',
  discount: 10
};

export const mockUsers: User[] = [
  mockCurrentUser,
  {
    id: 'u2',
    name: '山野行者',
    avatar: 'https://picsum.photos/id/1025/200/200',
    phone: '139****6666',
    leaderGrade: 'diamond',
    activityCount: 52,
    averageRating: 4.9,
    joinDate: '2023-06-20',
    discount: 20
  },
  {
    id: 'u3',
    name: '星空守望者',
    avatar: 'https://picsum.photos/id/1062/200/200',
    phone: '137****5555',
    leaderGrade: 'platinum',
    activityCount: 35,
    averageRating: 4.7,
    joinDate: '2023-08-10',
    discount: 15
  },
  {
    id: 'u4',
    name: '森林漫步者',
    avatar: 'https://picsum.photos/id/1074/200/200',
    phone: '136****4444',
    leaderGrade: 'silver',
    activityCount: 8,
    averageRating: 4.2,
    joinDate: '2024-03-01',
    discount: 5
  },
  {
    id: 'u5',
    name: '溪流探险家',
    avatar: 'https://picsum.photos/id/1066/200/200',
    phone: '135****3333',
    leaderGrade: 'bronze',
    activityCount: 2,
    averageRating: 4.0,
    joinDate: '2024-05-10',
    discount: 0
  },
  {
    id: 'u6',
    name: '背包客小李',
    avatar: 'https://picsum.photos/id/1005/200/200',
    phone: '134****2222',
    leaderGrade: 'bronze',
    activityCount: 0,
    averageRating: 0,
    joinDate: '2024-06-01',
    discount: 0
  }
];

export const mockJoinApplications: JoinApplication[] = [
  {
    id: 'app1',
    activityId: 'act1',
    userId: 'u4',
    userName: '森林漫步者',
    userAvatar: 'https://picsum.photos/id/1074/200/200',
    status: 'pending',
    applyTime: '2024-06-15 10:30',
    message: '有露营经验，装备齐全'
  },
  {
    id: 'app2',
    activityId: 'act1',
    userId: 'u5',
    userName: '溪流探险家',
    userAvatar: 'https://picsum.photos/id/1066/200/200',
    status: 'approved',
    applyTime: '2024-06-14 15:20',
    message: '新手求带，会积极配合'
  }
];

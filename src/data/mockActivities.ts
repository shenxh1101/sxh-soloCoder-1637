import type { Activity, ActivityLog, ActivityReview } from '@/types/activity';
import { mockUsers, mockJoinApplications } from './mockUsers';

export const mockActivities: Activity[] = [
  {
    id: 'act1',
    name: '黄山露营之旅',
    destination: '安徽黄山风景区',
    startDate: '2024-06-22',
    endDate: '2024-06-23',
    maxParticipants: 8,
    currentParticipants: 5,
    description: '黄山两日露营，观日出云海，体验户外烧烤',
    weather: '晴转多云',
    temperature: '18°C - 28°C',
    leaderId: 'u1',
    leaderName: '露营达人',
    leaderAvatar: 'https://picsum.photos/id/1012/200/200',
    status: 'upcoming',
    participants: [
      { id: 'p1', userId: 'u1', name: '露营达人', avatar: 'https://picsum.photos/id/1012/200/200', checkedIn: false },
      { id: 'p2', userId: 'u2', name: '山野行者', avatar: 'https://picsum.photos/id/1025/200/200', checkedIn: false },
      { id: 'p3', userId: 'u3', name: '星空守望者', avatar: 'https://picsum.photos/id/1062/200/200', checkedIn: false },
      { id: 'p4', userId: 'u5', name: '溪流探险家', avatar: 'https://picsum.photos/id/1066/200/200', checkedIn: false },
      { id: 'p5', userId: 'u6', name: '背包客小李', avatar: 'https://picsum.photos/id/1005/200/200', checkedIn: false }
    ],
    equipmentList: [
      { equipmentId: 'e1', equipmentName: '帐篷', category: 'tent', quantity: 2, status: 'pending', isPersonal: false },
      { equipmentId: 'e2', equipmentName: '睡袋', category: 'sleeping', quantity: 8, status: 'pending', isPersonal: true },
      { equipmentId: 'e3', equipmentName: '防潮垫', category: 'sleeping', quantity: 8, status: 'pending', isPersonal: true },
      { equipmentId: 'e4', equipmentName: '头灯', category: 'lighting', quantity: 8, status: 'pending', isPersonal: true },
      { equipmentId: 'e5', equipmentName: '营灯', category: 'lighting', quantity: 2, status: 'pending', isPersonal: false },
      { equipmentId: 'e6', equipmentName: '急救包', category: 'firstaid', quantity: 1, status: 'packed', isPersonal: false },
      { equipmentId: 'e7', equipmentName: '登山杖', category: 'navigation', quantity: 8, status: 'pending', isPersonal: true }
    ],
    equipmentRecommendation: {
      reason: '根据夏季气候和2天行程，为您推荐以下装备',
      items: []
    },
    timeline: [
      { id: 't1', time: '2024-06-15 09:00', type: 'system', content: '活动"黄山露营之旅"已创建' },
      { id: 't2', time: '2024-06-15 10:30', type: 'system', content: '森林漫步者 申请加入活动' },
      { id: 't3', time: '2024-06-15 14:20', type: 'system', content: '溪流探险家 申请加入活动' },
      { id: 't4', time: '2024-06-15 15:00', type: 'system', content: '溪流探险家 已加入活动' }
    ],
    joinApplications: [
      mockJoinApplications[0],
      { ...mockJoinApplications[1], activityId: 'act1' }
    ],
    createdAt: '2024-06-15 09:00',
    packingReminderSent: false,
    itinerary: [
      { id: 'it1', day: 1, time: '08:00', content: '集合出发', location: '合肥南站' },
      { id: 'it2', day: 1, time: '11:00', content: '抵达黄山景区，徒步上山', location: '黄山南大门' },
      { id: 'it3', day: 1, time: '14:00', content: '到达营地，搭建帐篷', location: '光明顶营地' },
      { id: 'it4', day: 1, time: '18:00', content: '户外烧烤 & 看日落', location: '光明顶' },
      { id: 'it5', day: 2, time: '05:00', content: '早起看日出', location: '光明顶' },
      { id: 'it6', day: 2, time: '10:00', content: '收拾装备，徒步下山', location: '光明顶营地' },
      { id: 'it7', day: 2, time: '14:00', content: '返程', location: '黄山南大门' }
    ]
  },
  {
    id: 'act2',
    name: '千岛湖星空露营',
    destination: '浙江千岛湖',
    startDate: '2024-06-15',
    endDate: '2024-06-16',
    maxParticipants: 10,
    currentParticipants: 8,
    description: '千岛湖星空露营，皮划艇体验，篝火晚会',
    weather: '晴',
    temperature: '22°C - 30°C',
    leaderId: 'u2',
    leaderName: '山野行者',
    leaderAvatar: 'https://picsum.photos/id/1025/200/200',
    status: 'completed',
    participants: [
      { id: 'p6', userId: 'u2', name: '山野行者', avatar: 'https://picsum.photos/id/1025/200/200', checkedIn: true, checkInTime: '2024-06-15 09:30' },
      { id: 'p7', userId: 'u1', name: '露营达人', avatar: 'https://picsum.photos/id/1012/200/200', checkedIn: true, checkInTime: '2024-06-15 09:35' },
      { id: 'p8', userId: 'u3', name: '星空守望者', avatar: 'https://picsum.photos/id/1062/200/200', checkedIn: true, checkInTime: '2024-06-15 09:40' }
    ],
    equipmentList: [
      { equipmentId: 'e1', equipmentName: '帐篷', category: 'tent', quantity: 3, status: 'packed', isPersonal: false },
      { equipmentId: 'e2', equipmentName: '睡袋', category: 'sleeping', quantity: 10, status: 'packed', isPersonal: true }
    ],
    equipmentRecommendation: {
      reason: '根据夏季气候和2天行程，为您推荐以下装备',
      items: []
    },
    timeline: [
      { id: 't5', time: '2024-06-10 10:00', type: 'system', content: '活动"千岛湖星空露营"已创建' },
      { id: 't6', time: '2024-06-15 09:30', type: 'checkin', userName: '山野行者', content: '山野行者 已签到' },
      { id: 't7', time: '2024-06-15 14:00', type: 'log', userName: '露营达人', content: '抵达千岛湖，风景太美了！' },
      { id: 't8', time: '2024-06-15 20:00', type: 'photo', userName: '星空守望者', content: '星空守望者 上传了照片', imageUrl: 'https://picsum.photos/id/1039/750/500' },
      { id: 't9', time: '2024-06-16 12:00', type: 'system', content: '活动已完成' }
    ],
    joinApplications: [],
    ratings: {
      facilities: 4.5,
      route: 4.8,
      averageRating: 4.7,
      totalReviews: 6,
      reviews: [
        { id: 'r1', userId: 'u1', userName: '露营达人', userAvatar: 'https://picsum.photos/id/1012/200/200', facilities: 5, route: 5, comment: '营地设施完善，路线规划合理，非常棒的体验！', createdAt: '2024-06-17 10:00' },
        { id: 'r2', userId: 'u3', userName: '星空守望者', userAvatar: 'https://picsum.photos/id/1062/200/200', facilities: 4, route: 5, comment: '星空很美，皮划艇体验很棒', createdAt: '2024-06-17 11:30' }
      ]
    },
    createdAt: '2024-06-10 10:00',
    packingReminderSent: true,
    itinerary: []
  },
  {
    id: 'act3',
    name: '武功山徒步露营',
    destination: '江西武功山',
    startDate: '2024-07-05',
    endDate: '2024-07-07',
    maxParticipants: 12,
    currentParticipants: 6,
    description: '武功山三日徒步，穿越高山草甸，看云海日出',
    weather: '多云',
    temperature: '15°C - 25°C',
    leaderId: 'u3',
    leaderName: '星空守望者',
    leaderAvatar: 'https://picsum.photos/id/1062/200/200',
    status: 'upcoming',
    participants: [
      { id: 'p9', userId: 'u3', name: '星空守望者', avatar: 'https://picsum.photos/id/1062/200/200', checkedIn: false },
      { id: 'p10', userId: 'u2', name: '山野行者', avatar: 'https://picsum.photos/id/1025/200/200', checkedIn: false }
    ],
    equipmentList: [],
    equipmentRecommendation: {
      reason: '根据夏季气候和3天行程，为您推荐以下装备',
      items: []
    },
    timeline: [
      { id: 't10', time: '2024-06-18 14:00', type: 'system', content: '活动"武功山徒步露营"已创建' }
    ],
    joinApplications: [],
    createdAt: '2024-06-18 14:00',
    packingReminderSent: false,
    itinerary: []
  },
  {
    id: 'act4',
    name: '莫干山亲子露营',
    destination: '浙江莫干山',
    startDate: '2024-06-29',
    endDate: '2024-06-30',
    maxParticipants: 15,
    currentParticipants: 12,
    description: '莫干山亲子露营活动，适合带小朋友参加，有丰富的亲子活动',
    weather: '晴',
    temperature: '20°C - 28°C',
    leaderId: 'u1',
    leaderName: '露营达人',
    leaderAvatar: 'https://picsum.photos/id/1012/200/200',
    status: 'upcoming',
    participants: [
      { id: 'p11', userId: 'u1', name: '露营达人', avatar: 'https://picsum.photos/id/1012/200/200', checkedIn: false }
    ],
    equipmentList: [],
    equipmentRecommendation: {
      reason: '根据夏季气候和2天行程，为您推荐以下装备',
      items: []
    },
    timeline: [
      { id: 't11', time: '2024-06-16 09:00', type: 'system', content: '活动"莫干山亲子露营"已创建' }
    ],
    joinApplications: [],
    createdAt: '2024-06-16 09:00',
    packingReminderSent: false,
    itinerary: []
  },
  {
    id: 'act5',
    name: '崇明岛观鸟露营',
    destination: '上海崇明岛',
    startDate: '2024-06-08',
    endDate: '2024-06-09',
    maxParticipants: 6,
    currentParticipants: 6,
    description: '崇明岛东滩湿地观鸟，体验野趣露营',
    weather: '多云转晴',
    temperature: '21°C - 27°C',
    leaderId: 'u4',
    leaderName: '森林漫步者',
    leaderAvatar: 'https://picsum.photos/id/1074/200/200',
    status: 'completed',
    participants: [],
    equipmentList: [],
    equipmentRecommendation: {
      reason: '',
      items: []
    },
    timeline: [],
    joinApplications: [],
    ratings: {
      facilities: 4.0,
      route: 4.2,
      averageRating: 4.1,
      totalReviews: 5,
      reviews: []
    },
    createdAt: '2024-06-01 10:00',
    packingReminderSent: true,
    itinerary: []
  },
  {
    id: 'act6',
    name: '天目溪漂流露营',
    destination: '浙江天目溪',
    startDate: '2024-07-12',
    endDate: '2024-07-13',
    maxParticipants: 10,
    currentParticipants: 4,
    description: '天目溪漂流+露营，清凉一夏',
    weather: '晴',
    temperature: '25°C - 33°C',
    leaderId: 'u5',
    leaderName: '溪流探险家',
    leaderAvatar: 'https://picsum.photos/id/1066/200/200',
    status: 'upcoming',
    participants: [],
    equipmentList: [],
    equipmentRecommendation: {
      reason: '',
      items: []
    },
    timeline: [],
    joinApplications: [],
    createdAt: '2024-06-19 11:00',
    packingReminderSent: false,
    itinerary: []
  }
];

export const mockActivityLogs: ActivityLog[] = [
  {
    id: 'log1',
    activityId: 'act2',
    userId: 'u1',
    userName: '露营达人',
    date: '2024-06-15',
    content: '今天的千岛湖太美了！湖水清澈见底，营地就在湖边，风景绝佳。下午体验了皮划艇，非常刺激有趣。晚上的篝火晚会大家一起唱歌跳舞，气氛超棒！',
    images: [
      'https://picsum.photos/id/1015/750/500',
      'https://picsum.photos/id/1018/750/500'
    ],
    createdAt: '2024-06-15 21:30'
  },
  {
    id: 'log2',
    activityId: 'act2',
    userId: 'u3',
    userName: '星空守望者',
    date: '2024-06-16',
    content: '凌晨起来看星空，漫天繁星，还看到了银河！早上的日出也很美，湖面雾气缭绕，宛如仙境。这次露营体验满分！',
    images: [
      'https://picsum.photos/id/1039/750/500',
      'https://picsum.photos/id/1044/750/500'
    ],
    createdAt: '2024-06-16 08:00'
  }
];

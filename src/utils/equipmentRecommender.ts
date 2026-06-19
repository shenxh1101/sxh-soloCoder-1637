import dayjs from 'dayjs';
import type { EquipmentListItem, EquipmentRecommendation, EquipmentCategory } from '@/types/equipment';

interface RecommendContext {
  destination: string;
  startDate: string;
  endDate: string;
  participants: number;
}

const getSeason = (date: string): string => {
  const month = dayjs(date).month() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
};

const getDays = (startDate: string, endDate: string): number => {
  return dayjs(endDate).diff(dayjs(startDate), 'day') + 1;
};

const baseEquipment: EquipmentListItem[] = [
  { equipmentId: 'e1', equipmentName: '帐篷', category: 'tent', quantity: 1, status: 'pending', isPersonal: false },
  { equipmentId: 'e2', equipmentName: '睡袋', category: 'sleeping', quantity: 1, status: 'pending', isPersonal: true },
  { equipmentId: 'e3', equipmentName: '防潮垫', category: 'sleeping', quantity: 1, status: 'pending', isPersonal: true },
  { equipmentId: 'e4', equipmentName: '头灯', category: 'lighting', quantity: 1, status: 'pending', isPersonal: true },
  { equipmentId: 'e5', equipmentName: '营灯', category: 'lighting', quantity: 1, status: 'pending', isPersonal: false },
  { equipmentId: 'e6', equipmentName: '急救包', category: 'firstaid', quantity: 1, status: 'pending', isPersonal: false },
  { equipmentId: 'e7', equipmentName: '登山杖', category: 'navigation', quantity: 2, status: 'pending', isPersonal: true },
];

const seasonEquipment: Record<string, EquipmentListItem[]> = {
  spring: [
    { equipmentId: 's1', equipmentName: '薄款冲锋衣', category: 'clothing', quantity: 1, status: 'pending', isPersonal: true },
    { equipmentId: 's2', equipmentName: '防蚊液', category: 'other', quantity: 1, status: 'pending', isPersonal: false },
  ],
  summer: [
    { equipmentId: 's3', equipmentName: '防晒霜', category: 'other', quantity: 1, status: 'pending', isPersonal: true },
    { equipmentId: 's4', equipmentName: '遮阳帽', category: 'clothing', quantity: 1, status: 'pending', isPersonal: true },
    { equipmentId: 's5', equipmentName: '便携风扇', category: 'other', quantity: 1, status: 'pending', isPersonal: true },
  ],
  autumn: [
    { equipmentId: 's6', equipmentName: '厚款冲锋衣', category: 'clothing', quantity: 1, status: 'pending', isPersonal: true },
    { equipmentId: 's7', equipmentName: '保温水壶', category: 'cooking', quantity: 1, status: 'pending', isPersonal: true },
  ],
  winter: [
    { equipmentId: 's8', equipmentName: '羽绒服', category: 'clothing', quantity: 1, status: 'pending', isPersonal: true },
    { equipmentId: 's9', equipmentName: '保暖睡袋', category: 'sleeping', quantity: 1, status: 'pending', isPersonal: true },
    { equipmentId: 's10', equipmentName: '手套', category: 'clothing', quantity: 1, status: 'pending', isPersonal: true },
    { equipmentId: 's11', equipmentName: '暖宝宝', category: 'other', quantity: 5, status: 'pending', isPersonal: true },
  ],
};

const cookingEquipment: EquipmentListItem[] = [
  { equipmentId: 'c1', equipmentName: '便携炉具', category: 'cooking', quantity: 1, status: 'pending', isPersonal: false },
  { equipmentId: 'c2', equipmentName: '气罐', category: 'cooking', quantity: 2, status: 'pending', isPersonal: false },
  { equipmentId: 'c3', equipmentName: '餐具套装', category: 'cooking', quantity: 1, status: 'pending', isPersonal: true },
  { equipmentId: 'c4', equipmentName: '保温杯', category: 'cooking', quantity: 1, status: 'pending', isPersonal: true },
];

export const recommendEquipment = (context: RecommendContext): EquipmentRecommendation => {
  console.log('[EquipmentRecommender] 开始推荐装备', context);
  
  const season = getSeason(context.startDate);
  const days = getDays(context.startDate, context.endDate);
  const seasonName: Record<string, string> = {
    spring: '春季',
    summer: '夏季',
    autumn: '秋季',
    winter: '冬季'
  };

  let recommendedItems: EquipmentListItem[] = [...baseEquipment];
  
  recommendedItems = [...recommendedItems, ...seasonEquipment[season]];
  
  if (days >= 2) {
    recommendedItems = [...recommendedItems, ...cookingEquipment];
  }

  recommendedItems = recommendedItems.map(item => ({
    ...item,
    quantity: item.isPersonal ? item.quantity : Math.ceil(item.quantity * Math.ceil(context.participants / 4))
  }));

  const recommendation: EquipmentRecommendation = {
    reason: `根据${seasonName[season]}气候和${days}天行程，为您推荐以下装备`,
    items: recommendedItems
  };

  console.log('[EquipmentRecommender] 推荐完成', recommendation);
  return recommendation;
};

export const generateItinerary = (context: RecommendContext) => {
  const days = getDays(context.startDate, context.endDate);
  const itinerary = [];
  
  for (let i = 1; i <= days; i++) {
    itinerary.push(
      {
        id: `day${i}-1`,
        day: i,
        time: '08:00',
        content: '集合出发，前往目的地',
        location: '指定集合点'
      },
      {
        id: `day${i}-2`,
        day: i,
        time: '10:00',
        content: '抵达营地，搭建帐篷',
        location: context.destination
      },
      {
        id: `day${i}-3`,
        day: i,
        time: '12:00',
        content: '午餐时间',
        location: context.destination
      },
      {
        id: `day${i}-4`,
        day: i,
        time: '14:00',
        content: '周边探索/户外活动',
        location: context.destination
      },
      {
        id: `day${i}-5`,
        day: i,
        time: '18:00',
        content: '晚餐 & 篝火晚会',
        location: context.destination
      },
      {
        id: `day${i}-6`,
        day: i,
        time: '22:00',
        content: '休息',
        location: context.destination
      }
    );
  }

  itinerary.push({
    id: `day${days}-7`,
    day: days,
    time: '10:00',
    content: '收拾装备，清理营地',
    location: context.destination
  });

  itinerary.push({
    id: `day${days}-8`,
    day: days,
    time: '12:00',
    content: '返程',
    location: context.destination
  });

  return itinerary;
};

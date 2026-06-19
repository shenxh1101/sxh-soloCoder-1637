import type { Equipment, UsageRecord } from '@/types/equipment';

export const mockEquipments: Equipment[] = [
  {
    id: 'e1',
    name: '三人双层帐篷',
    category: 'tent',
    description: '防暴雨双层帐篷，适合3-4人使用',
    image: 'https://picsum.photos/id/1036/300/300',
    isRental: true,
    rentalPrice: 50,
    usageCount: 12
  },
  {
    id: 'e2',
    name: '羽绒睡袋',
    category: 'sleeping',
    description: '零下15度舒适温标，轻量化设计',
    image: 'https://picsum.photos/id/1039/300/300',
    isRental: true,
    rentalPrice: 30,
    usageCount: 18
  },
  {
    id: 'e3',
    name: '自动充气防潮垫',
    category: 'sleeping',
    description: '5cm加厚，舒适保暖',
    image: 'https://picsum.photos/id/1044/300/300',
    isRental: true,
    rentalPrice: 20,
    usageCount: 15
  },
  {
    id: 'e4',
    name: '便携式炉具套装',
    category: 'cooking',
    description: '含炉头、气罐、锅具',
    image: 'https://picsum.photos/id/1015/300/300',
    isRental: true,
    rentalPrice: 40,
    usageCount: 20
  },
  {
    id: 'e5',
    name: '高亮度头灯',
    category: 'lighting',
    description: 'IPX6防水，续航12小时',
    image: 'https://picsum.photos/id/1018/300/300',
    isRental: false,
    usageCount: 25
  },
  {
    id: 'e6',
    name: '户外急救包',
    category: 'firstaid',
    description: '含绷带、消毒用品、急救药品',
    image: 'https://picsum.photos/id/1080/300/300',
    isRental: false,
    usageCount: 8
  },
  {
    id: 'e7',
    name: '碳纤维登山杖',
    category: 'navigation',
    description: '超轻碳纤维，三节可调节',
    image: 'https://picsum.photos/id/1025/300/300',
    isRental: true,
    rentalPrice: 15,
    usageCount: 22
  },
  {
    id: 'e8',
    name: '冲锋衣',
    category: 'clothing',
    description: 'GORE-TEX面料，防风防水透气',
    image: 'https://picsum.photos/id/292/300/300',
    isRental: false,
    usageCount: 16
  },
  {
    id: 'e9',
    name: '营地灯',
    category: 'lighting',
    description: 'USB充电，多档亮度调节',
    image: 'https://picsum.photos/id/312/300/300',
    isRental: true,
    rentalPrice: 10,
    usageCount: 19
  },
  {
    id: 'e10',
    name: '便携保温壶',
    category: 'cooking',
    description: '1.5L大容量，24小时保温',
    image: 'https://picsum.photos/id/326/300/300',
    isRental: false,
    usageCount: 14
  }
];

export const mockUsageRecords: UsageRecord[] = [
  {
    id: 'rec1',
    equipmentId: 'e1',
    activityId: 'act1',
    activityName: '黄山露营之旅',
    useDate: '2024-06-20',
    returned: false
  },
  {
    id: 'rec2',
    equipmentId: 'e2',
    activityId: 'act1',
    activityName: '黄山露营之旅',
    useDate: '2024-06-20',
    returned: false
  },
  {
    id: 'rec3',
    equipmentId: 'e4',
    activityId: 'act2',
    activityName: '千岛湖星空露营',
    useDate: '2024-06-10',
    returned: true
  },
  {
    id: 'rec4',
    equipmentId: 'e7',
    activityId: 'act3',
    activityName: '武功山徒步露营',
    useDate: '2024-06-01',
    returned: true
  },
  {
    id: 'rec5',
    equipmentId: 'e1',
    activityId: 'act4',
    activityName: '莫干山亲子露营',
    useDate: '2024-05-25',
    returned: true
  }
];

export const categoryLabels: Record<string, string> = {
  tent: '帐篷',
  sleeping: '睡眠装备',
  cooking: '炊具餐具',
  clothing: '服装',
  lighting: '照明',
  firstaid: '急救',
  navigation: '导航工具',
  other: '其他'
};

export const categoryIcons: Record<string, string> = {
  tent: '⛺',
  sleeping: '🛏️',
  cooking: '🍳',
  clothing: '🧥',
  lighting: '💡',
  firstaid: '🩹',
  navigation: '🧭',
  other: '📦'
};

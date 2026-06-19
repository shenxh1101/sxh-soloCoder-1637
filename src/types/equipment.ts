export type EquipmentCategory = 'tent' | 'sleeping' | 'cooking' | 'clothing' | 'lighting' | 'firstaid' | 'navigation' | 'other';
export type EquipmentStatus = 'pending' | 'packed' | 'missing';

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  description: string;
  image: string;
  isRental: boolean;
  rentalPrice?: number;
  usageCount: number;
}

export interface EquipmentListItem {
  equipmentId: string;
  equipmentName: string;
  category: EquipmentCategory;
  quantity: number;
  status: EquipmentStatus;
  isPersonal: boolean;
}

export interface EquipmentRecommendation {
  reason: string;
  items: EquipmentListItem[];
}

export interface UsageRecord {
  id: string;
  equipmentId: string;
  activityId: string;
  activityName: string;
  useDate: string;
  returned: boolean;
}

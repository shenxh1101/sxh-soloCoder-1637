import { create } from 'zustand';
import type { Equipment, UsageRecord } from '@/types/equipment';

interface EquipmentState {
  equipments: Equipment[];
  usageRecords: UsageRecord[];
  setEquipments: (equipments: Equipment[]) => void;
  setUsageRecords: (records: UsageRecord[]) => void;
  addEquipment: (equipment: Omit<Equipment, 'id' | 'usageCount'>) => void;
  recordUsage: (equipmentId: string, activityId: string, activityName: string, useDate: string) => void;
  markReturned: (recordId: string) => void;
  getEquipmentById: (id: string) => Equipment | undefined;
}

export const useEquipmentStore = create<EquipmentState>((set, get) => ({
  equipments: [],
  usageRecords: [],

  setEquipments: (equipments) => {
    console.log('[EquipmentStore] 设置装备列表', equipments.length);
    set({ equipments });
  },

  setUsageRecords: (records) => {
    console.log('[EquipmentStore] 设置使用记录', records.length);
    set({ usageRecords: records });
  },

  addEquipment: (equipment) => {
    console.log('[EquipmentStore] 添加装备', equipment);
    
    const newEquipment: Equipment = {
      ...equipment,
      id: `eq_${Date.now()}`,
      usageCount: 0
    };

    set(state => ({
      equipments: [...state.equipments, newEquipment]
    }));

    return newEquipment;
  },

  recordUsage: (equipmentId, activityId, activityName, useDate) => {
    console.log('[EquipmentStore] 记录装备使用', { equipmentId, activityId });
    
    const equipment = get().equipments.find(e => e.id === equipmentId);
    
    const record: UsageRecord = {
      id: `rec_${Date.now()}`,
      equipmentId,
      activityId,
      activityName,
      useDate,
      returned: false
    };

    set(state => ({
      usageRecords: [...state.usageRecords, record],
      equipments: state.equipments.map(e => 
        e.id === equipmentId ? { ...e, usageCount: e.usageCount + 1 } : e
      )
    }));
  },

  markReturned: (recordId) => {
    console.log('[EquipmentStore] 标记归还', { recordId });
    
    set(state => ({
      usageRecords: state.usageRecords.map(r => 
        r.id === recordId ? { ...r, returned: true } : r
      )
    }));
  },

  getEquipmentById: (id) => {
    return get().equipments.find(e => e.id === id);
  }
}));

import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import type { EquipmentListItem } from '@/types/equipment';
import { categoryLabels } from '@/data/mockEquipments';
import styles from './index.module.scss';

interface EquipmentItemProps {
  item: EquipmentListItem;
  showStatus?: boolean;
  onStatusChange?: (status: 'packed' | 'pending' | 'missing') => void;
}

const statusText: Record<string, string> = {
  packed: '已打包',
  pending: '待打包',
  missing: '缺失'
};

const EquipmentItem: React.FC<EquipmentItemProps> = ({ item, showStatus = true, onStatusChange }) => {
  const handleStatusClick = () => {
    if (!onStatusChange) return;
    const statusOrder: ('pending' | 'packed' | 'missing')[] = ['pending', 'packed', 'missing'];
    const currentIndex = statusOrder.indexOf(item.status as any);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    onStatusChange(nextStatus);
  };

  return (
    <View className={styles.equipmentItem}>
      <View className={styles.itemInfo}>
        <View className={styles.itemIcon}>
          <Text className={styles.iconText}>🏕️</Text>
        </View>
        <View className={styles.itemDetail}>
          <Text className={styles.itemName}>{item.equipmentName}</Text>
          <View className={styles.itemMeta}>
            <Text className={styles.categoryTag}>{categoryLabels[item.category]}</Text>
            <Text className={styles.quantity}>x{item.quantity}</Text>
            {item.isPersonal && (
              <Text className={styles.personalTag}>个人</Text>
            )}
          </View>
        </View>
      </View>
      {showStatus && (
        <View 
          className={classnames(styles.statusBadge, styles[item.status])}
          onClick={handleStatusClick}
        >
          <Text>{statusText[item.status]}</Text>
        </View>
      )}
    </View>
  );
};

export default EquipmentItem;

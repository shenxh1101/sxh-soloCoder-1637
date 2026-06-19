import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter, usePullDownRefresh, useDidShow } from '@tarojs/taro';
import { useActivityStore } from '@/store/useActivityStore';
import { useUserStore } from '@/store/useUserStore';
import EmptyState from '@/components/EmptyState';
import type { Activity } from '@/types/activity';
import type { EquipmentListItem, EquipmentStatus, EquipmentCategory } from '@/types/equipment';
import { categoryLabels, categoryIcons } from '@/data/mockEquipments';
import styles from './index.module.scss';

type FilterType = 'all' | 'packed' | 'pending' | 'missing';

const statusText: Record<string, string> = {
  packed: '已打包',
  pending: '待打包',
  missing: '缺失'
};

const EquipmentListPage: React.FC = () => {
  const router = useRouter();
  const { getActivityById, updateEquipmentStatus } = useActivityStore();
  const { currentUser } = useUserStore();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(false);

  const activityId = router.params.activityId as string;

  useEffect(() => {
    loadData();
  }, [activityId]);

  useDidShow(() => {
    loadData();
  });

  usePullDownRefresh(() => {
    refreshData();
  });

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      const act = getActivityById(activityId);
      setActivity(act || null);
      setLoading(false);
      Taro.stopPullDownRefresh();
    }, 300);
  };

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      const act = getActivityById(activityId);
      setActivity(act ? { ...act } : null);
      setLoading(false);
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 500);
  };

  const isParticipant = useMemo(() => {
    if (!currentUser || !activity) return false;
    return activity.participants.some(p => p.userId === currentUser.id);
  }, [currentUser, activity]);

  const canEdit = useMemo(() => {
    return isParticipant && activity?.status !== 'completed';
  }, [isParticipant, activity]);

  const packingProgress = useMemo(() => {
    if (!activity || activity.equipmentList.length === 0) return 0;
    const packed = activity.equipmentList.filter(e => e.status === 'packed').length;
    return Math.round((packed / activity.equipmentList.length) * 100);
  }, [activity]);

  const packedCount = useMemo(() => {
    if (!activity) return 0;
    return activity.equipmentList.filter(e => e.status === 'packed').length;
  }, [activity]);

  const pendingCount = useMemo(() => {
    if (!activity) return 0;
    return activity.equipmentList.filter(e => e.status === 'pending').length;
  }, [activity]);

  const missingCount = useMemo(() => {
    if (!activity) return 0;
    return activity.equipmentList.filter(e => e.status === 'missing').length;
  }, [activity]);

  const filteredEquipment = useMemo(() => {
    if (!activity) return [];
    if (activeFilter === 'all') return activity.equipmentList;
    return activity.equipmentList.filter(e => e.status === activeFilter);
  }, [activity, activeFilter]);

  const groupedEquipment = useMemo(() => {
    const groups: Record<string, EquipmentListItem[]> = {};
    filteredEquipment.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredEquipment]);

  const handleStatusChange = (equipmentId: string, status: EquipmentStatus) => {
    if (!canEdit || !activity) return;
    updateEquipmentStatus(activity.id, equipmentId, status);
    loadData();
  };

  const cycleStatus = (equipmentId: string, currentStatus: EquipmentStatus) => {
    const statusOrder: EquipmentStatus[] = ['pending', 'packed', 'missing'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    handleStatusChange(equipmentId, nextStatus);
  };

  const handleMarkAllPacked = () => {
    if (!canEdit || !activity) return;
    Taro.showModal({
      title: '一键打包',
      content: '确定将所有装备标记为已打包吗？',
      success: (res) => {
        if (res.confirm) {
          activity.equipmentList.forEach(item => {
            if (item.status !== 'packed') {
              updateEquipmentStatus(activity.id, item.equipmentId, 'packed');
            }
          });
          Taro.showToast({ title: '已全部标记为已打包', icon: 'success' });
          loadData();
        }
      }
    });
  };

  const handleSendReminder = () => {
    if (!activity) return;
    const missing = activity.equipmentList.filter(e => e.status !== 'packed');
    if (missing.length === 0) {
      Taro.showToast({ title: '所有装备已打包完成', icon: 'success' });
      return;
    }
    Taro.showModal({
      title: '打包提醒',
      content: `还有 ${missing.length} 件装备未打包，确定发送提醒吗？`,
      success: (res) => {
        if (res.confirm) {
          useActivityStore.getState().sendPackingReminder(activity.id);
          loadData();
        }
      }
    });
  };

  const filterTabs: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'packed', label: '已打包' },
    { key: 'pending', label: '待打包' },
    { key: 'missing', label: '缺失' }
  ];

  if (!activity) {
    return (
      <ScrollView className={styles.page} scrollY>
        <EmptyState
          icon="❓"
          title="活动不存在"
          description="该活动可能已被删除或不存在"
          buttonText="返回首页"
          onButtonClick={() => Taro.switchTab({ url: '/pages/home/index' })}
        />
      </ScrollView>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.activityName}>{activity.name}</Text>
        <Text className={styles.activityDate}>{activity.startDate} 至 {activity.endDate}</Text>
      </View>

      <View className={styles.progressCard}>
        <View className={styles.progressHeader}>
          <Text className={styles.progressTitle}>打包进度</Text>
          <Text className={styles.progressPercent}>{packingProgress}%</Text>
        </View>
        <View className={styles.progressBar}>
          <View className={styles.progressFill} style={{ width: `${packingProgress}%` }} />
        </View>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={`${styles.statValue} ${styles.packed}`}>{packedCount}</Text>
            <Text className={styles.statLabel}>已打包</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={`${styles.statValue} ${styles.pending}`}>{pendingCount}</Text>
            <Text className={styles.statLabel}>待打包</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={`${styles.statValue} ${styles.missing}`}>{missingCount}</Text>
            <Text className={styles.statLabel}>缺失</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{activity.equipmentList.length}</Text>
            <Text className={styles.statLabel}>总计</Text>
          </View>
        </View>
      </View>

      {activity.equipmentRecommendation?.reason && (
        <View className={styles.recommendationTip}>
          <Text className={styles.tipText}>💡 {activity.equipmentRecommendation.reason}</Text>
        </View>
      )}

      <View className={styles.filterTabs}>
        {filterTabs.map((tab) => (
          <View
            key={tab.key}
            className={`${styles.tabItem} ${activeFilter === tab.key ? styles.active : ''}`}
            onClick={() => setActiveFilter(tab.key)}
          >
            <Text>{tab.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView scrollY className={styles.equipmentList}>
        {loading ? (
          <View className={styles.loading}>
            <Text>加载中...</Text>
          </View>
        ) : filteredEquipment.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.icon}>🎒</Text>
            <Text className={styles.title}>
              {activeFilter === 'all' ? '暂无装备清单' :
               activeFilter === 'packed' ? '暂无已打包装备' :
               activeFilter === 'pending' ? '暂无待打包装备' : '暂无缺失装备'}
            </Text>
            <Text className={styles.description}>
              {activeFilter === 'all' ? '领队还未添加装备清单' : ''}
            </Text>
          </View>
        ) : (
          Object.entries(groupedEquipment).map(([category, items]) => (
            <View key={category} className={styles.categorySection}>
              <View className={styles.categoryHeader}>
                <Text className={styles.categoryName}>
                  <Text className={styles.icon}>{categoryIcons[category as EquipmentCategory] || '📦'}</Text>
                  {categoryLabels[category as EquipmentCategory]}
                </Text>
                <Text className={styles.categoryCount}>{items.length} 件</Text>
              </View>
              <View className={styles.equipmentItems}>
                {items.map((item) => (
                  <View key={item.equipmentId} className={styles.equipmentItem}>
                    <View className={styles.itemIcon}>
                      {categoryIcons[item.category] || '📦'}
                    </View>
                    <View className={styles.itemInfo}>
                      <View className={styles.itemName}>
                        {item.equipmentName}
                        <Text className={styles.quantity}>×{item.quantity}</Text>
                        {item.isPersonal && (
                          <Text className={styles.personalTag}>个人</Text>
                        )}
                      </View>
                      <View className={styles.itemMeta}>
                        <Text>{categoryLabels[item.category]}</Text>
                      </View>
                    </View>
                    <View className={styles.statusSelector}>
                      <View
                        className={`${styles.statusBadge} ${styles[item.status]}`}
                        onClick={() => canEdit && cycleStatus(item.equipmentId, item.status)}
                      >
                        {statusText[item.status]}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
        <View style={{ height: '160rpx' }} />
      </ScrollView>

      {canEdit && (
        <View className={styles.bottomBar}>
          <View className={styles.btn + ' ' + styles.secondary} onClick={handleSendReminder}>
            <Text>📢</Text>
            <Text>发送提醒</Text>
          </View>
          <View
            className={styles.btn + ' ' + styles.primary + ' ' + (packedCount === activity.equipmentList.length ? styles.disabled : '')}
            onClick={handleMarkAllPacked}
          >
            <Text>✅</Text>
            <Text>一键打包</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default EquipmentListPage;

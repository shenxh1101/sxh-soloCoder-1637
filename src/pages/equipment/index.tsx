import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import { useEquipmentStore } from '@/store/useEquipmentStore';
import { useUserStore } from '@/store/useUserStore';
import { mockEquipments, mockUsageRecords, categoryLabels } from '@/data/mockEquipments';
import { mockCurrentUser } from '@/data/mockUsers';
import EmptyState from '@/components/EmptyState';
import type { EquipmentCategory } from '@/types/equipment';
import styles from './index.module.scss';

type TabType = 'all' | EquipmentCategory;

const EquipmentPage: React.FC = () => {
  const { equipments, usageRecords, setEquipments, setUsageRecords } = useEquipmentStore();
  const { currentUser, setCurrentUser } = useUserStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initData();
  }, []);

  useDidShow(() => {
    if (equipments.length === 0) {
      initData();
    }
  });

  usePullDownRefresh(() => {
    refreshData();
  });

  const initData = () => {
    setLoading(true);
    setTimeout(() => {
      setEquipments(mockEquipments);
      setUsageRecords(mockUsageRecords);
      setCurrentUser(mockCurrentUser);
      setLoading(false);
      Taro.stopPullDownRefresh();
    }, 500);
  };

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setEquipments([...mockEquipments]);
      setUsageRecords([...mockUsageRecords]);
      setLoading(false);
      Taro.stopPullDownRefresh();
      Taro.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    }, 800);
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'tent', label: '帐篷' },
    { key: 'sleeping', label: '睡眠' },
    { key: 'cooking', label: '炊具' },
    { key: 'clothing', label: '服装' },
    { key: 'lighting', label: '照明' },
    { key: 'firstaid', label: '急救' },
    { key: 'navigation', label: '导航' }
  ];

  const filteredEquipments = equipments.filter(e => {
    if (activeTab === 'all') return true;
    return e.category === activeTab;
  });

  const totalEquipments = equipments.length;
  const rentalEquipments = equipments.filter(e => e.isRental).length;
  const totalUsage = equipments.reduce((sum, e) => sum + e.usageCount, 0);

  const recentUsage = usageRecords.slice(0, 5);

  const handleAddEquipment = () => {
    Taro.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  };

  const handleViewEquipmentList = () => {
    Taro.navigateTo({
      url: '/pages/equipment-list/index'
    });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.statsRow}>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{totalEquipments}</Text>
          <Text className={styles.statLabel}>装备总数</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{rentalEquipments}</Text>
          <Text className={styles.statLabel}>可租赁</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{totalUsage}</Text>
          <Text className={styles.statLabel}>使用次数</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.recommendCard}>
          <View className={styles.recommendTitle}>
            <Text>🎒</Text>
            <Text>智能装备推荐</Text>
          </View>
          <Text className={styles.recommendDesc}>
            系统会根据您的露营目的地、季节和行程天数，自动推荐必备装备清单，确保您的露营之旅准备充分。
          </Text>
          <Button className={styles.viewListBtn} onClick={handleViewEquipmentList}>
            查看推荐清单
          </Button>
        </View>
      </View>

      <View className={styles.tabs}>
        {tabs.map(tab => (
          <View
            key={tab.key}
            className={classnames(styles.tabItem, activeTab === tab.key && styles.active)}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text>{tab.label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>我的装备</Text>
          <Text className={styles.seeAll}>管理</Text>
        </View>

        {loading ? (
          <View style={{ textAlign: 'center', padding: '32rpx', color: '#86909C' }}>
            <Text>加载中...</Text>
          </View>
        ) : filteredEquipments.length === 0 ? (
          <EmptyState
            icon="🎒"
            title="暂无装备"
            description="添加您的露营装备，便于管理和使用"
            buttonText="添加装备"
            onButtonClick={handleAddEquipment}
          />
        ) : (
          filteredEquipments.map(equipment => (
            <View key={equipment.id} className={styles.equipmentCard}>
              <Image 
                className={styles.equipmentImage} 
                src={equipment.image} 
                mode="aspectFill"
                onError={(e) => console.error('[Equipment] 图片加载失败', e)}
              />
              <View className={styles.equipmentInfo}>
                <Text className={styles.equipmentName}>{equipment.name}</Text>
                <Text className={styles.equipmentDesc}>{equipment.description}</Text>
                <View className={styles.equipmentMeta}>
                  <Text className={styles.categoryTag}>{categoryLabels[equipment.category]}</Text>
                  <Text className={styles.usageCount}>使用 {equipment.usageCount} 次</Text>
                  {equipment.isRental ? (
                    <View style={{ display: 'flex', alignItems: 'center', gap: '8rpx' }}>
                      <Text className={styles.rentalTag}>可租赁</Text>
                      <Text className={styles.price}>¥{equipment.rentalPrice}/次</Text>
                    </View>
                  ) : (
                    <Text className={styles.categoryTag} style={{ backgroundColor: 'rgba(134, 144, 156, 0.1)', color: '#86909C' }}>个人</Text>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>最近使用记录</Text>
          <Text className={styles.seeAll}>全部</Text>
        </View>

        <View className={styles.usageList}>
          {recentUsage.map(record => (
            <View key={record.id} className={styles.usageItem}>
              <View className={styles.usageInfo}>
                <Text className={styles.usageTitle}>{record.activityName}</Text>
                <Text className={styles.usageDate}>{record.useDate}</Text>
              </View>
              <Text className={classnames(
                styles.usageStatus,
                record.returned ? styles.returned : styles.using
              )}>
                {record.returned ? '已归还' : '使用中'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {currentUser && currentUser.discount > 0 && (
        <View className={styles.section}>
          <View className={styles.recommendCard} style={{ background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%)', borderColor: 'rgba(255, 152, 0, 0.2)' }}>
            <View className={styles.recommendTitle} style={{ color: '#FF9800' }}>
              <Text>🏆</Text>
              <Text>等级特权</Text>
            </View>
            <Text className={styles.recommendDesc}>
              您是{currentUser.leaderGrade === 'gold' ? '黄金' : currentUser.leaderGrade === 'platinum' ? '铂金' : '钻石'}领队，
              享受装备租赁 {currentUser.discount}% 折扣优惠！
            </Text>
          </View>
        </View>
      )}

      <View className={styles.fab} onClick={handleAddEquipment}>
        <Text className={styles.fabIcon}>+</Text>
      </View>
    </ScrollView>
  );
};

export default EquipmentPage;

import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import { useActivityStore } from '@/store/useActivityStore';
import { useUserStore } from '@/store/useUserStore';
import { mockActivities } from '@/data/mockActivities';
import { mockUsers, mockCurrentUser } from '@/data/mockUsers';
import ActivityCard from '@/components/ActivityCard';
import GradeBadge from '@/components/GradeBadge';
import EmptyState from '@/components/EmptyState';
import type { Activity, ActivityStatus } from '@/types/activity';
import styles from './index.module.scss';

type TabType = 'all' | 'upcoming' | 'ongoing' | 'completed';

const HomePage: React.FC = () => {
  const { activities, setActivities, checkAndSendPackingReminders, markReminderShown, hasShownReminder, loadShownRemindersFromStorage } = useActivityStore();
  const { currentUser, setCurrentUser, users } = useUserStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initData();
  }, []);

  useDidShow(() => {
    if (activities.length === 0) {
      initData();
      return;
    }
    
    setTimeout(() => {
      const reminders = checkAndSendPackingReminders();
      const unshownReminders = reminders.filter(r => !hasShownReminder(r.id));
      
      if (unshownReminders.length > 0) {
        const firstReminder = unshownReminders[0];
        markReminderShown(firstReminder.id);
        Taro.showModal({
          title: '打包提醒',
          content: `明天就是"${firstReminder.name}"的出发日啦，记得检查装备清单，准备好所有物品哦！`,
          showCancel: false,
          confirmText: '我知道了'
        });
      }
    }, 500);
  });

  usePullDownRefresh(() => {
    refreshData();
  });

  const initData = () => {
    setLoading(true);
    setTimeout(() => {
      loadShownRemindersFromStorage();
      setActivities(mockActivities);
      setCurrentUser(mockCurrentUser);
      setLoading(false);
      Taro.stopPullDownRefresh();
    }, 500);
  };

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      loadShownRemindersFromStorage();
      setActivities([...mockActivities]);
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
    { key: 'upcoming', label: '即将开始' },
    { key: 'ongoing', label: '进行中' },
    { key: 'completed', label: '已完成' }
  ];

  const quickActions = [
    { icon: '🏕️', label: '创建活动', color: 'rgba(46, 125, 50, 0.1)', action: () => Taro.switchTab({ url: '/pages/create/index' }) },
    { icon: '🔍', label: '附近活动', color: 'rgba(255, 152, 0, 0.1)', action: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) },
    { icon: '📋', label: '我的活动', color: 'rgba(22, 93, 255, 0.1)', action: () => Taro.switchTab({ url: '/pages/mine/index' }) },
    { icon: '⭐', label: '领队排行', color: 'rgba(255, 193, 7, 0.1)', action: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) }
  ];

  const filteredActivities = activities.filter(a => {
    if (activeTab === 'all') return true;
    return a.status === activeTab;
  });

  const sortedLeaders = [...users]
    .sort((a, b) => {
      if (b.averageRating !== a.averageRating) return b.averageRating - a.averageRating;
      return b.activityCount - a.activityCount;
    })
    .slice(0, 5);

  const handleActivityClick = (activity: Activity) => {
    Taro.navigateTo({
      url: `/pages/activity-detail/index?id=${activity.id}`
    });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.welcomeRow}>
          <View>
            <Text className={styles.welcomeText}>探索户外新体验</Text>
            <View className={styles.subText}>发现精彩露营活动</View>
          </View>
          {currentUser && (
            <Image className={styles.avatar} src={currentUser.avatar} mode="aspectFill" />
          )}
        </View>
      </View>

      <View className={styles.quickActions}>
        {quickActions.map((action, index) => (
          <View key={index} className={styles.actionItem} onClick={action.action}>
            <View className={styles.actionIcon} style={{ backgroundColor: action.color }}>
              <Text>{action.icon}</Text>
            </View>
            <Text className={styles.actionLabel}>{action.label}</Text>
          </View>
        ))}
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
          <Text className={styles.sectionTitle}>
            {activeTab === 'all' ? '热门活动' : 
             activeTab === 'upcoming' ? '即将开始' :
             activeTab === 'ongoing' ? '进行中的活动' : '已完成活动'}
          </Text>
          <Text className={styles.seeAll}>查看全部</Text>
        </View>

        {loading ? (
          <View className={styles.loading}>
            <Text>加载中...</Text>
          </View>
        ) : filteredActivities.length === 0 ? (
          <EmptyState
            icon="🏕️"
            title="暂无活动"
            description="快去创建或加入一个露营活动吧"
            buttonText="发布活动"
            onButtonClick={() => Taro.switchTab({ url: '/pages/create/index' })}
          />
        ) : (
          filteredActivities.map(activity => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onClick={() => handleActivityClick(activity)}
            />
          ))
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>🏆 领队排行榜</Text>
          <Text className={styles.seeAll}>更多</Text>
        </View>

        <View className={styles.leaderBoard}>
          {sortedLeaders.map((leader, index) => (
            <View key={leader.id} className={styles.leaderItem}>
              <View className={classnames(
                styles.rankBadge,
                index === 0 ? styles.rank1 :
                index === 1 ? styles.rank2 :
                index === 2 ? styles.rank3 : styles.other
              )}>
                <Text>{index + 1}</Text>
              </View>
              <Image className={styles.leaderAvatar} src={leader.avatar} mode="aspectFill" />
              <View className={styles.leaderInfo}>
                <View style={{ display: 'flex', alignItems: 'center', gap: '8rpx' }}>
                  <Text className={styles.leaderName}>{leader.name}</Text>
                  <GradeBadge grade={leader.leaderGrade} size="sm" />
                </View>
                <View className={styles.leaderStats}>
                  <Text className={styles.statItem}>
                    活动 <Text className={styles.statValue}>{leader.activityCount}</Text> 场
                  </Text>
                  <Text className={styles.statItem}>
                    评分 <Text className={styles.statValue}>{leader.averageRating}</Text>
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;

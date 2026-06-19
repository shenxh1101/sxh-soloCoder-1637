import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import dayjs from 'dayjs';
import classnames from 'classnames';
import { useUserStore } from '@/store/useUserStore';
import { useActivityStore } from '@/store/useActivityStore';
import { mockCurrentUser, mockUsers } from '@/data/mockUsers';
import { mockActivities } from '@/data/mockActivities';
import GradeBadge from '@/components/GradeBadge';
import { getGradeLabel, calculateLeaderGrade } from '@/utils/gradeCalculator';
import { getReportShownMonth, setReportShownMonth } from '@/utils/reportGenerator';
import type { LeaderGrade } from '@/types/user';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const { currentUser, setCurrentUser } = useUserStore();
  const { activities, setActivities } = useActivityStore();
  const [loading, setLoading] = useState(false);
  const [showReportTip, setShowReportTip] = useState(false);

  useEffect(() => {
    initData();
  }, []);

  useDidShow(() => {
    if (!currentUser) {
      initData();
    }
    
    const today = dayjs().date();
    const isFirstDayOfMonth = today === 1;
    const hasShownTip = getReportShownMonth();
    
    if (isFirstDayOfMonth && !hasShownTip) {
      setShowReportTip(true);
      setReportShownMonth();
      setTimeout(() => setShowReportTip(false), 3000);
    }
  });

  usePullDownRefresh(() => {
    refreshData();
  });

  const initData = () => {
    setLoading(true);
    setTimeout(() => {
      setCurrentUser(mockCurrentUser);
      setActivities(mockActivities);
      setLoading(false);
      Taro.stopPullDownRefresh();
    }, 500);
  };

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setCurrentUser({ ...mockCurrentUser });
      setActivities([...mockActivities]);
      setLoading(false);
      Taro.stopPullDownRefresh();
      Taro.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    }, 800);
  };

  const myActivities = activities.filter(a => 
    a.participants.some(p => p.userId === currentUser?.id) || 
    a.leaderId === currentUser?.id
  );

  const myLeadingActivities = activities.filter(a => a.leaderId === currentUser?.id);
  const completedActivities = myActivities.filter(a => a.status === 'completed');

  const gradeInfo = currentUser 
    ? calculateLeaderGrade(currentUser.activityCount, currentUser.averageRating)
    : { grade: 'bronze' as LeaderGrade, nextGrade: 'silver' as LeaderGrade, progress: 0 };

  const menuGroups = [
    {
      title: '活动管理',
      items: [
        { 
          icon: '📋', 
          iconBg: 'rgba(46, 125, 50, 0.1)', 
          text: '我发起的活动', 
          subtitle: `${myLeadingActivities.length} 个活动`,
          action: () => Taro.showToast({ title: '功能开发中', icon: 'none' })
        },
        { 
          icon: '🎯', 
          iconBg: 'rgba(255, 152, 0, 0.1)', 
          text: '我参与的活动', 
          subtitle: `${myActivities.length} 个活动`,
          action: () => Taro.showToast({ title: '功能开发中', icon: 'none' })
        },
        { 
          icon: '📝', 
          iconBg: 'rgba(22, 93, 255, 0.1)', 
          text: '待审批申请', 
          subtitle: '3 条待处理',
          badge: '3',
          action: () => Taro.navigateTo({ url: '/pages/leader-approval/index' })
        }
      ]
    },
    {
      title: '数据中心',
      items: [
        { 
          icon: '📊', 
          iconBg: 'rgba(156, 39, 176, 0.1)', 
          text: '月度报告', 
          subtitle: '查看户外活动数据统计',
          action: () => Taro.navigateTo({ url: '/pages/monthly-report/index' })
        },
        { 
          icon: '⭐', 
          iconBg: 'rgba(255, 193, 7, 0.1)', 
          text: '我的评价', 
          subtitle: `${completedActivities.length} 条待评价`,
          action: () => Taro.showToast({ title: '功能开发中', icon: 'none' })
        }
      ]
    },
    {
      title: '其他',
      items: [
        { 
          icon: '⚙️', 
          iconBg: 'rgba(134, 144, 156, 0.1)', 
          text: '设置', 
          subtitle: '',
          action: () => Taro.showToast({ title: '功能开发中', icon: 'none' })
        },
        { 
          icon: '💬', 
          iconBg: 'rgba(33, 150, 243, 0.1)', 
          text: '意见反馈', 
          subtitle: '',
          action: () => Taro.showToast({ title: '功能开发中', icon: 'none' })
        }
      ]
    }
  ];

  const privileges = [
    { icon: '✨', text: '优先推荐', active: true },
    { icon: '💰', text: '装备租赁10%折扣', active: currentUser?.discount === 10 },
    { icon: '🏆', text: '专属标识', active: true },
    { icon: '🎁', text: '生日礼包', active: false },
    { icon: '📸', text: '高清相册', active: true },
    { icon: '🎯', text: 'VIP活动', active: false }
  ];

  const handleMenuClick = (item: any) => {
    if (item.action) {
      item.action();
    }
  };

  return (
    <ScrollView className={styles.page} scrollY>
      {showReportTip && (
        <View 
          className={styles.reportTip}
          onClick={() => Taro.navigateTo({ url: '/pages/monthly-report/index' })}
        >
          <Text className={styles.tipIcon}>✨</Text>
          <Text className={styles.tipText}>{dayjs().format('YYYY年M月')}月度报告已生成，点击查看</Text>
          <Text className={styles.tipArrow}>{'>'}</Text>
        </View>
      )}
      <View className={styles.profileHeader}>
        <View className={styles.profileRow}>
          {currentUser && (
            <>
              <Image className={styles.avatar} src={currentUser.avatar} mode="aspectFill" />
              <View className={styles.profileInfo}>
                <Text className={styles.userName}>{currentUser.name}</Text>
                <View className={styles.gradeRow}>
                  <GradeBadge grade={currentUser.leaderGrade} size="lg" />
                </View>
              </View>
            </>
          )}
        </View>

        {currentUser && gradeInfo.nextGrade && (
          <View className={styles.progressSection}>
            <View className={styles.progressLabel}>
              <Text className={styles.progressText}>升级进度</Text>
              <Text className={styles.progressValue}>{gradeInfo.progress}%</Text>
            </View>
            <View className={styles.progressBar}>
              <View className={styles.progressFill} style={{ width: `${gradeInfo.progress}%` }} />
            </View>
            <Text className={styles.nextGradeText}>
              距离 {getGradeLabel(gradeInfo.nextGrade)} 还需 
              {currentUser.leaderGrade === 'bronze' ? ' 3 场活动和 4.0 评分' :
               currentUser.leaderGrade === 'silver' ? ' 7 场活动和 0.3 评分' :
               currentUser.leaderGrade === 'gold' ? ' 15 场活动和 0.3 评分' :
               ' 20 场活动和 0.2 评分'}
            </Text>
          </View>
        )}
      </View>

      <View className={styles.statsGrid}>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{myActivities.length}</Text>
          <Text className={styles.statLabel}>参与活动</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{myLeadingActivities.length}</Text>
          <Text className={styles.statLabel}>发起活动</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{currentUser?.averageRating || 0}</Text>
          <Text className={styles.statLabel}>综合评分</Text>
        </View>
      </View>

      {currentUser && currentUser.discount > 0 && (
        <View className={styles.discountBanner}>
          <Text className={styles.discountIcon}>🎉</Text>
          <View className={styles.discountInfo}>
            <Text className={styles.discountTitle}>
              {getGradeLabel(currentUser.leaderGrade)}领队专享
            </Text>
            <Text className={styles.discountDesc}>
              装备租赁享受 {currentUser.discount}% 折扣优惠
            </Text>
          </View>
        </View>
      )}

      <View className={styles.privilegesCard}>
        <Text className={styles.privilegesTitle}>🎖️ 等级特权</Text>
        <View className={styles.privilegeList}>
          {privileges.map((item, index) => (
            <View key={index} className={classnames(styles.privilegeItem, !item.active && styles.privilegeLocked)}>
              <Text className={styles.privilegeIcon}>{item.icon}</Text>
              <Text className={classnames(styles.privilegeText, item.active && styles.active)}>
                {item.text}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {menuGroups.map((group, groupIndex) => (
        <View key={groupIndex} className={styles.menuSection}>
          <Text className={styles.menuTitle}>{group.title}</Text>
          <View className={styles.menuList}>
            {group.items.map((item, itemIndex) => (
              <View 
                key={itemIndex} 
                className={styles.menuItem}
                onClick={() => handleMenuClick(item)}
              >
                <View className={styles.menuIcon} style={{ backgroundColor: item.iconBg }}>
                  <Text>{item.icon}</Text>
                </View>
                <View className={styles.menuContent}>
                  <Text className={styles.menuText}>{item.text}</Text>
                  {item.subtitle && (
                    <Text className={styles.menuSubtitle}>{item.subtitle}</Text>
                  )}
                </View>
                {item.badge && (
                  <Text className={styles.menuBadge}>{item.badge}</Text>
                )}
                <Text className={styles.menuArrow}>›</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default MinePage;

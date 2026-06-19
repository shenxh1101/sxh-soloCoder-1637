import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter, usePullDownRefresh, useDidShow } from '@tarojs/taro';
import { useActivityStore } from '@/store/useActivityStore';
import { useUserStore } from '@/store/useUserStore';
import EmptyState from '@/components/EmptyState';
import type { Activity } from '@/types/activity';
import type { JoinApplication } from '@/types/user';
import styles from './index.module.scss';

type TabType = 'pending' | 'approved' | 'rejected';

const statusText: Record<string, string> = {
  pending: '待审批',
  approved: '已通过',
  rejected: '已拒绝'
};

const LeaderApprovalPage: React.FC = () => {
  const router = useRouter();
  const { getActivityById, approveApplication, rejectApplication } = useActivityStore();
  const { currentUser } = useUserStore();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('pending');
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

  const isLeader = useMemo(() => {
    return currentUser && activity && currentUser.id === activity.leaderId;
  }, [currentUser, activity]);

  const filteredApplications = useMemo(() => {
    if (!activity) return [];
    return activity.joinApplications.filter(app => app.status === activeTab);
  }, [activity, activeTab]);

  const pendingCount = useMemo(() => {
    if (!activity) return 0;
    return activity.joinApplications.filter(app => app.status === 'pending').length;
  }, [activity]);

  const approvedCount = useMemo(() => {
    if (!activity) return 0;
    return activity.joinApplications.filter(app => app.status === 'approved').length;
  }, [activity]);

  const rejectedCount = useMemo(() => {
    if (!activity) return 0;
    return activity.joinApplications.filter(app => app.status === 'rejected').length;
  }, [activity]);

  const handleApprove = (applicationId: string) => {
    if (!activity) return;
    
    if (activity.currentParticipants >= activity.maxParticipants) {
      Taro.showToast({ title: '人数已满，无法批准', icon: 'none' });
      return;
    }

    Taro.showModal({
      title: '批准申请',
      content: '确定批准该用户加入活动吗？',
      success: (res) => {
        if (res.confirm) {
          approveApplication(activity.id, applicationId);
          Taro.showToast({ title: '已批准', icon: 'success' });
          loadData();
        }
      }
    });
  };

  const handleReject = (applicationId: string) => {
    if (!activity) return;

    Taro.showModal({
      title: '拒绝申请',
      content: '确定拒绝该用户加入活动吗？',
      editable: true,
      placeholderText: '请输入拒绝原因（可选）',
      success: (res) => {
        if (res.confirm) {
          rejectApplication(activity.id, applicationId);
          Taro.showToast({ title: '已拒绝', icon: 'success' });
          loadData();
        }
      }
    });
  };

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'pending', label: '待审批', count: pendingCount },
    { key: 'approved', label: '已通过', count: approvedCount },
    { key: 'rejected', label: '已拒绝', count: rejectedCount }
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

  if (!isLeader) {
    return (
      <ScrollView className={styles.page} scrollY>
        <EmptyState
          icon="🔒"
          title="无权限访问"
          description="只有领队才能查看和审批加入申请"
          buttonText="返回首页"
          onButtonClick={() => Taro.switchTab({ url: '/pages/home/index' })}
        />
      </ScrollView>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.activityInfo}>
          <Text className={styles.activityName}>{activity.name}</Text>
          <View className={styles.activityMeta}>
            <Text>📍 {activity.destination}</Text>
            <Text>📅 {activity.startDate}</Text>
          </View>
        </View>
        <View className={styles.stats}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{activity.currentParticipants}/{activity.maxParticipants}</Text>
            <Text className={styles.statLabel}>参与人数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{pendingCount}</Text>
            <Text className={styles.statLabel}>待审批</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{approvedCount}</Text>
            <Text className={styles.statLabel}>已通过</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{rejectedCount}</Text>
            <Text className={styles.statLabel}>已拒绝</Text>
          </View>
        </View>
      </View>

      <View className={styles.tabs}>
        {tabs.map((tab) => (
          <View
            key={tab.key}
            className={`${styles.tabItem} ${activeTab === tab.key ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text>{tab.label}</Text>
            {tab.count > 0 && (
              <Text className={styles.badge}>{tab.count}</Text>
            )}
          </View>
        ))}
      </View>

      <ScrollView scrollY className={styles.applicationList}>
        {loading ? (
          <View className={styles.loading}>
            <Text>加载中...</Text>
          </View>
        ) : filteredApplications.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.icon}>📋</Text>
            <Text className={styles.title}>
              {activeTab === 'pending' ? '暂无待审批申请' :
               activeTab === 'approved' ? '暂无已通过申请' : '暂无已拒绝申请'}
            </Text>
            <Text className={styles.description}>
              {activeTab === 'pending' ? '耐心等待队员申请加入吧' : ''}
            </Text>
          </View>
        ) : (
          filteredApplications.map((application) => (
            <View key={application.id} className={styles.applicationCard}>
              <View className={styles.cardHeader}>
                <Image className={styles.avatar} src={application.userAvatar} mode="aspectFill" />
                <View className={styles.userInfo}>
                  <Text className={styles.userName}>{application.userName}</Text>
                  <Text className={styles.applyTime}>申请时间: {application.applyTime}</Text>
                </View>
                <View className={`${styles.statusBadge} ${styles[application.status]}`}>
                  {statusText[application.status]}
                </View>
              </View>

              {application.message && (
                <View className={styles.messageSection}>
                  <Text className={styles.messageLabel}>申请留言</Text>
                  <Text className={styles.messageContent}>{application.message}</Text>
                </View>
              )}

              {application.status === 'pending' ? (
                <View className={styles.actionButtons}>
                  <View className={`${styles.btn} ${styles.reject}`} onClick={() => handleReject(application.id)}>
                    <Text>拒绝</Text>
                  </View>
                  <View className={`${styles.btn} ${styles.approve}`} onClick={() => handleApprove(application.id)}>
                    <Text>通过</Text>
                  </View>
                </View>
              ) : (
                <View className={styles.processedInfo}>
                  <Text className={styles.processedBy}>
                    由领队 {activity.leaderName} 处理
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default LeaderApprovalPage;

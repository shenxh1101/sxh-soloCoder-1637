import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter, usePullDownRefresh, useDidShow } from '@tarojs/taro';
import dayjs from 'dayjs';
import { useActivityStore } from '@/store/useActivityStore';
import { useUserStore } from '@/store/useUserStore';
import { mockUsers } from '@/data/mockUsers';
import TimelineItemComponent from '@/components/TimelineItem';
import EquipmentItem from '@/components/EquipmentItem';
import GradeBadge from '@/components/GradeBadge';
import RatingStars from '@/components/RatingStars';
import EmptyState from '@/components/EmptyState';
import type { Activity } from '@/types/activity';
import type { EquipmentStatus } from '@/types/equipment';
import styles from './index.module.scss';

const statusText: Record<string, string> = {
  upcoming: '即将开始',
  ongoing: '进行中',
  completed: '已完成',
  cancelled: '已取消'
};

const ActivityDetailPage: React.FC = () => {
  const router = useRouter();
  const { getActivityById, updateEquipmentStatus, checkInParticipant, sendPackingReminder, checkAndSendPackingReminders, markReminderShown, hasShownReminder, loadShownRemindersFromStorage, updateActivityStatus, approveApplication, rejectApplication } = useActivityStore();
  const { currentUser, users, getUserById } = useUserStore();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(false);

  const activityId = router.params.id as string;

  useEffect(() => {
    loadActivity();
  }, [activityId]);

  useDidShow(() => {
    loadActivity();
  });

  usePullDownRefresh(() => {
    refreshActivity();
  });

  const loadActivity = () => {
    setLoading(true);
    setTimeout(() => {
      loadShownRemindersFromStorage();
      const reminders = checkAndSendPackingReminders();
      if (reminders.length > 0) {
        const reminderActivity = reminders.find(r => r.id === activityId);
        if (reminderActivity && !hasShownReminder(activityId)) {
          markReminderShown(activityId);
          Taro.showModal({
            title: '打包提醒',
            content: `明天就是"${reminderActivity.name}"的出发日啦，记得检查装备清单，准备好所有物品哦！`,
            showCancel: false,
            confirmText: '我知道了'
          });
        }
      }
      
      const act = getActivityById(activityId);
      setActivity(act || null);
      setLoading(false);
      Taro.stopPullDownRefresh();
    }, 300);
  };

  const refreshActivity = () => {
    setLoading(true);
    setTimeout(() => {
      loadShownRemindersFromStorage();
      const act = getActivityById(activityId);
      setActivity(act ? { ...act } : null);
      setLoading(false);
      Taro.stopPullDownRefresh();
      Taro.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    }, 500);
  };

  const isLeader = useMemo(() => {
    return currentUser && activity && currentUser.id === activity.leaderId;
  }, [currentUser, activity]);

  const isParticipant = useMemo(() => {
    if (!currentUser || !activity) return false;
    return activity.participants.some(p => p.userId === currentUser.id);
  }, [currentUser, activity]);

  const hasApplied = useMemo(() => {
    if (!currentUser || !activity) return false;
    return activity.joinApplications.some(app => app.userId === currentUser.id && app.status === 'pending');
  }, [currentUser, activity]);

  const hasReviewed = useMemo(() => {
    if (!currentUser || !activity?.ratings) return false;
    return activity.ratings.reviews.some(r => r.userId === currentUser.id);
  }, [currentUser, activity]);

  const packingProgress = useMemo(() => {
    if (!activity || activity.equipmentList.length === 0) return 0;
    const packed = activity.equipmentList.filter(e => e.status === 'packed').length;
    return Math.round((packed / activity.equipmentList.length) * 100);
  }, [activity]);

  const checkInProgress = useMemo(() => {
    if (!activity || activity.participants.length === 0) return 0;
    const checked = activity.participants.filter(p => p.checkedIn).length;
    return Math.round((checked / activity.participants.length) * 100);
  }, [activity]);

  const handleApplyJoin = () => {
    if (!currentUser || !activity) return;
    Taro.showModal({
      title: '申请加入',
      editable: true,
      placeholderText: '请输入申请留言（可选）',
      success: (res) => {
        if (res.confirm) {
          useActivityStore.getState().applyToJoin(
            activity.id,
            currentUser.id,
            currentUser.name,
            currentUser.avatar,
            res.content || '想参加这次活动'
          );
          Taro.showToast({ title: '申请已发送', icon: 'success' });
          loadActivity();
        }
      }
    });
  };

  const handleCheckIn = () => {
    if (!currentUser || !activity) return;
    checkInParticipant(activity.id, currentUser.id);
    Taro.showToast({ title: '签到成功', icon: 'success' });
    loadActivity();
  };

  const handleSendReminder = () => {
    if (!activity) return;
    sendPackingReminder(activity.id);
    setTimeout(() => {
      loadActivity();
    }, 100);
  };

  const handleEquipmentStatusChange = (equipmentId: string, status: EquipmentStatus) => {
    if (!activity) return;
    updateEquipmentStatus(activity.id, equipmentId, status);
    loadActivity();
  };

  const handleUpdateStatus = (status: Activity['status']) => {
    if (!activity) return;
    updateActivityStatus(activity.id, status);
    loadActivity();
  };

  const handleGoToEquipmentList = () => {
    Taro.navigateTo({
      url: `/pages/equipment-list/index?activityId=${activityId}`
    });
  };

  const handleGoToLog = () => {
    Taro.navigateTo({
      url: `/pages/activity-log/index?activityId=${activityId}`
    });
  };

  const handleGoToRating = () => {
    Taro.navigateTo({
      url: `/pages/activity-rating/index?activityId=${activityId}`
    });
  };

  const handleGoToApproval = () => {
    Taro.navigateTo({
      url: `/pages/leader-approval/index?activityId=${activityId}`
    });
  };

  const handleGoToReport = () => {
    Taro.navigateTo({
      url: '/pages/monthly-report/index'
    });
  };

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

  const pendingApplications = activity.joinApplications.filter(app => app.status === 'pending');
  const leader = getUserById(activity.leaderId) || users.find(u => u.id === activity.leaderId);

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.banner}>
        <View className={styles.statusBadge + ' ' + styles[activity.status]}>
          {statusText[activity.status]}
        </View>
        <View className={styles.bannerContent}>
          <Text className={styles.activityName}>{activity.name}</Text>
          <View className={styles.activityMeta}>
            <View className={styles.metaItem}>
              <Text className={styles.icon}>📍</Text>
              <Text>{activity.destination}</Text>
            </View>
            <View className={styles.metaItem}>
              <Text className={styles.icon}>📅</Text>
              <Text>{activity.startDate} 至 {activity.endDate}</Text>
            </View>
            <View className={styles.metaItem}>
              <Text className={styles.icon}>👥</Text>
              <Text>{activity.currentParticipants}/{activity.maxParticipants} 人</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.card}>
          <View className={styles.cardTitle}>
            <Text className={styles.icon}>ℹ️</Text>
            活动信息
          </View>
          <View className={styles.infoGrid}>
            <View className={styles.infoItem}>
              <Text className={styles.label}>天气</Text>
              <Text className={styles.value}>{activity.weather}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.label}>温度</Text>
              <Text className={styles.value}>{activity.temperature}</Text>
            </View>
          </View>
          {activity.description && (
            <View style={{ marginTop: '24rpx' }}>
              <Text className={styles.label} style={{ fontSize: '24rpx', color: '#999', marginBottom: '8rpx' }}>活动描述</Text>
              <Text style={{ fontSize: '28rpx', color: '#333', lineHeight: 1.6 }}>{activity.description}</Text>
            </View>
          )}
        </View>

        <View className={styles.card}>
          <View className={styles.cardTitle}>
            <Text className={styles.icon}>👤</Text>
            领队信息
          </View>
          <View className={styles.leaderSection}>
            <Image className={styles.leaderAvatar} src={activity.leaderAvatar} mode="aspectFill" />
            <View className={styles.leaderInfo}>
              <View className={styles.name}>
                {activity.leaderName}
                {leader && <GradeBadge grade={leader.leaderGrade} size="sm" />}
              </View>
              <View className={styles.stats}>
                <Text>活动 {leader?.activityCount || 0} 场</Text>
                <Text>评分 {leader?.averageRating || 0}</Text>
              </View>
            </View>
            <View className={styles.contactBtn} onClick={() => Taro.showToast({ title: '联系领队', icon: 'none' })}>
              联系
            </View>
          </View>
        </View>

        {activity.itinerary.length > 0 && (
          <View className={styles.card}>
            <View className={styles.cardTitle}>
              <Text className={styles.icon}>📋</Text>
              电子行程单
            </View>
            <View className={styles.itineraryList}>
              {activity.itinerary.map((item, index) => (
                <View key={item.id} className={styles.itineraryItem}>
                  <View className={styles.dayBadge}>
                    <Text className={styles.dayNum}>D{item.day}</Text>
                    <Text className={styles.dayText}>第{item.day}天</Text>
                  </View>
                  <View className={styles.content} style={{ marginTop: 0, position: 'static' }}>
                    <Text className={styles.time}>{item.time}</Text>
                    <Text className={styles.activity}>{item.content}</Text>
                    {item.location && (
                      <Text className={styles.location}>
                        📍 {item.location}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className={styles.card}>
          <View className={styles.cardTitle}>
            <Text className={styles.icon}>👥</Text>
            参与人员 ({activity.participants.length}/{activity.maxParticipants})
          </View>
          <View className={styles.participantsList}>
            {activity.participants.map((p) => (
              <View key={p.id} className={styles.participantItem}>
                <Image className={styles.avatar} src={p.avatar} mode="aspectFill" />
                <View className={styles.info}>
                  <Text className={styles.name}>{p.name}</Text>
                  {activity.status === 'ongoing' && (
                    <Text className={styles.checkInStatus}>
                      {p.checkInTime ? `签到时间: ${p.checkInTime}` : '未签到'}
                    </Text>
                  )}
                </View>
                <View className={styles.checkInBadge + ' ' + (p.checkedIn ? styles.checked : styles.unchecked)}>
                  {p.checkedIn ? '已签到' : '未签到'}
                </View>
              </View>
            ))}
          </View>

          {isLeader && activity.status !== 'completed' && (
            <View className={styles.progressSection} style={{ marginTop: '32rpx' }}>
              <View className={styles.progressHeader}>
                <Text className={styles.label}>签到进度</Text>
                <Text className={styles.percent}>{checkInProgress}%</Text>
              </View>
              <View className={styles.progressBar}>
                <View className={styles.progressFill} style={{ width: `${checkInProgress}%` }} />
              </View>
            </View>
          )}

          {isLeader && pendingApplications.length > 0 && (
            <View className={styles.sectionActions}>
              <View className={styles.actionBtn + ' ' + styles.primary} onClick={handleGoToApproval}>
                审批申请 ({pendingApplications.length})
              </View>
            </View>
          )}
        </View>

        <View className={styles.card}>
          <View className={styles.cardTitle}>
            <Text className={styles.icon}>🎒</Text>
            装备清单
          </View>
          <View className={styles.equipmentPreview}>
            <Text className={styles.equipmentCount}>
              共 {activity.equipmentList.length} 件装备
            </Text>
            {activity.equipmentList.length > 0 ? (
              <>
                <View className={styles.progressSection}>
                  <View className={styles.progressHeader}>
                    <Text className={styles.label}>打包进度</Text>
                    <Text className={styles.percent}>{packingProgress}%</Text>
                  </View>
                  <View className={styles.progressBar}>
                    <View className={styles.progressFill} style={{ width: `${packingProgress}%` }} />
                  </View>
                </View>
                <View className={styles.equipmentList} style={{ marginTop: '24rpx' }}>
                  {activity.equipmentList.slice(0, 3).map((item) => (
                    <EquipmentItem
                      key={item.equipmentId}
                      item={item}
                      showStatus={isLeader || isParticipant}
                      onStatusChange={(status) => handleEquipmentStatusChange(item.equipmentId, status)}
                    />
                  ))}
                </View>
                {activity.equipmentList.length > 3 && (
                  <View className={styles.viewAll} onClick={handleGoToEquipmentList}>
                    查看全部装备 →
                  </View>
                )}
              </>
            ) : (
              <EmptyState
                icon="🎒"
                title="暂无装备"
                description="领队还未添加装备清单"
              />
            )}
          </View>
        </View>

        {activity.status === 'completed' && activity.ratings && (
          <View className={styles.card}>
            <View className={styles.cardTitle}>
              <Text className={styles.icon}>⭐</Text>
              活动评分
            </View>
            <View className={styles.ratingSection}>
              <View className={styles.ratingRow}>
                <Text className={styles.label}>综合评分</Text>
                <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx' }}>
                  <RatingStars value={Math.round(activity.ratings.averageRating)} size="sm" />
                  <Text className={styles.value}>{activity.ratings.averageRating}</Text>
                </View>
              </View>
              <View className={styles.ratingRow}>
                <Text className={styles.label}>营地设施</Text>
                <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx' }}>
                  <RatingStars value={Math.round(activity.ratings.facilities)} size="sm" />
                  <Text className={styles.value}>{activity.ratings.facilities}</Text>
                </View>
              </View>
              <View className={styles.ratingRow}>
                <Text className={styles.label}>路线评分</Text>
                <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx' }}>
                  <RatingStars value={Math.round(activity.ratings.route)} size="sm" />
                  <Text className={styles.value}>{activity.ratings.route}</Text>
                </View>
              </View>
              <View className={styles.ratingRow}>
                <Text className={styles.label}>评价人数</Text>
                <Text className={styles.value}>{activity.ratings.totalReviews} 人</Text>
              </View>
            </View>
            {isParticipant && !hasReviewed && (
              <View className={styles.sectionActions}>
                <View className={styles.actionBtn + ' ' + styles.primary} onClick={handleGoToRating}>
                  去评分
                </View>
              </View>
            )}
          </View>
        )}

        <View className={styles.card}>
          <View className={styles.cardTitle}>
            <Text className={styles.icon}>📝</Text>
            活动时间线
          </View>
          <View className={styles.timelineSection}>
            {activity.timeline.length > 0 ? (
              <View className={styles.timelineList}>
                {activity.timeline.map((item, index) => (
                  <TimelineItemComponent
                    key={item.id}
                    item={item}
                    isLast={index === activity.timeline.length - 1}
                  />
                ))}
              </View>
            ) : (
              <View className={styles.emptyTimeline}>暂无活动动态</View>
            )}
          </View>

          {(activity.status === 'ongoing' || activity.status === 'completed') && (
            <View className={styles.sectionActions}>
              <View className={styles.actionBtn + ' ' + styles.secondary} onClick={handleGoToLog}>
                查看行程日志
              </View>
              {activity.status === 'ongoing' && isParticipant && (
                <View className={styles.actionBtn + ' ' + styles.primary} onClick={handleGoToLog}>
                  写日志
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      <View className={styles.bottomBar}>
        {isLeader ? (
          <>
            {activity.status === 'upcoming' && (
              <>
                <View className={styles.btn + ' ' + styles.secondary} onClick={handleSendReminder}>
                  发送提醒
                </View>
                <View className={styles.btn + ' ' + styles.primary} onClick={() => handleUpdateStatus('ongoing')}>
                  开始活动
                </View>
              </>
            )}
            {activity.status === 'ongoing' && (
              <View className={styles.btn + ' ' + styles.primary} onClick={() => handleUpdateStatus('completed')}>
                结束活动
              </View>
            )}
            {activity.status === 'completed' && (
              <View className={styles.btn + ' ' + styles.primary} onClick={handleGoToReport}>
                查看报告
              </View>
            )}
          </>
        ) : isParticipant ? (
          <>
            {activity.status === 'ongoing' && !activity.participants.find(p => p.userId === currentUser?.id)?.checkedIn && (
              <View className={styles.btn + ' ' + styles.primary} onClick={handleCheckIn}>
                立即签到
              </View>
            )}
            {activity.status === 'completed' && !hasReviewed && (
              <View className={styles.btn + ' ' + styles.primary} onClick={handleGoToRating}>
                去评分
              </View>
            )}
            <View className={styles.btn + ' ' + styles.secondary} onClick={handleGoToLog}>
              行程日志
            </View>
          </>
        ) : hasApplied ? (
          <View className={styles.btn + ' ' + styles.disabled}>
            申请审核中...
          </View>
        ) : activity.status === 'upcoming' && activity.currentParticipants < activity.maxParticipants ? (
          <View className={styles.btn + ' ' + styles.primary} onClick={handleApplyJoin}>
            申请加入
          </View>
        ) : (
          <View className={styles.btn + ' ' + styles.disabled}>
            {activity.status !== 'upcoming' ? '活动已开始' : '人数已满'}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default ActivityDetailPage;

import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import dayjs from 'dayjs';
import { useActivityStore } from '@/store/useActivityStore';
import styles from './index.module.scss';

interface ReminderRecord {
  id: string;
  activityId: string;
  activityName: string;
  type: 'auto' | 'manual' | 'confirmed';
  content: string;
  time: string;
  status: 'sent' | 'confirmed';
}

const ReminderCenterPage: React.FC = () => {
  const { activities, loadShownRemindersFromStorage } = useActivityStore();
  const [loading, setLoading] = useState(false);

  useDidShow(() => {
    loadShownRemindersFromStorage();
  });

  usePullDownRefresh(() => {
    loadShownRemindersFromStorage();
    setLoading(false);
    Taro.stopPullDownRefresh();
  });

  const reminderRecords = useMemo(() => {
    const records: ReminderRecord[] = [];

    activities.forEach(activity => {
      activity.timeline.forEach(item => {
        if (item.type === 'reminder' || (item.type === 'system' && item.content.includes('打包提醒'))) {
          const isAuto = item.content.includes('自动') || item.content.includes('出发前1天');
          const isManual = item.content.includes('手动') || item.content.includes('已发送出发前打包提醒');

          records.push({
            id: item.id,
            activityId: activity.id,
            activityName: activity.name,
            type: isAuto ? 'auto' : (isManual ? 'manual' : 'confirmed'),
            content: item.content,
            time: item.time,
            status: activity.packingReminderSent ? 'confirmed' : 'sent'
          });
        }
      });
    });

    return records.sort((a, b) => dayjs(b.time).valueOf() - dayjs(a.time).valueOf());
  }, [activities]);

  const groupedByActivity = useMemo(() => {
    const groups = new Map<string, { activityId: string; activityName: string; destination: string; startDate: string; reminders: ReminderRecord[] }>();

    reminderRecords.forEach(record => {
      if (!groups.has(record.activityId)) {
        const activity = activities.find(a => a.id === record.activityId);
        groups.set(record.activityId, {
          activityId: record.activityId,
          activityName: record.activityName,
          destination: activity?.destination || '',
          startDate: activity?.startDate || '',
          reminders: []
        });
      }
      groups.get(record.activityId)!.reminders.push(record);
    });

    return Array.from(groups.values());
  }, [reminderRecords, activities]);

  const totalAuto = reminderRecords.filter(r => r.type === 'auto').length;
  const totalManual = reminderRecords.filter(r => r.type === 'manual').length;
  const totalConfirmed = reminderRecords.filter(r => r.status === 'confirmed').length;

  const handleActivityClick = (activityId: string) => {
    Taro.navigateTo({
      url: `/pages/activity-detail/index?id=${activityId}`
    });
  };

  if (reminderRecords.length === 0) {
    return (
      <ScrollView className={styles.page} scrollY>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>🔔</Text>
          <Text className={styles.emptyTitle}>暂无提醒记录</Text>
          <Text className={styles.emptyDesc}>活动打包提醒会在这里归档显示</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.summaryCard}>
        <Text className={styles.summaryTitle}>提醒概览</Text>
        <View className={styles.summaryRow}>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryValue}>{totalAuto}</Text>
            <Text className={styles.summaryLabel}>自动提醒</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryValue}>{totalManual}</Text>
            <Text className={styles.summaryLabel}>手动提醒</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryValue}>{totalConfirmed}</Text>
            <Text className={styles.summaryLabel}>已确认</Text>
          </View>
        </View>
      </View>

      {groupedByActivity.map(group => (
        <View key={group.activityId} className={styles.activityGroup}>
          <View
            className={styles.activityHeader}
            onClick={() => handleActivityClick(group.activityId)}
          >
            <View className={styles.activityInfo}>
              <Text className={styles.activityName}>{group.activityName}</Text>
              <View className={styles.activityMeta}>
                <Text>{group.destination}</Text>
                <Text>{group.startDate}</Text>
              </View>
            </View>
            <Text className={styles.activityArrow}>{'>'}</Text>
          </View>
          <View className={styles.reminderList}>
            {group.reminders.map(reminder => (
              <View key={reminder.id} className={styles.reminderItem}>
                <View className={`${styles.reminderIcon} ${styles[reminder.type]}`}>
                  {reminder.type === 'auto' ? '⏰' : reminder.type === 'manual' ? '📩' : '✓'}
                </View>
                <View className={styles.reminderContent}>
                  <Text className={styles.reminderTitle}>{reminder.content}</Text>
                  <Text className={styles.reminderTime}>{reminder.time}</Text>
                </View>
                <View className={`${styles.reminderStatus} ${styles[reminder.status]}`}>
                  {reminder.status === 'confirmed' ? '已确认' : '已发送'}
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default ReminderCenterPage;

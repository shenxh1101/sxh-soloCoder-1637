import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, ScrollView, Textarea } from '@tarojs/components';
import Taro, { useRouter, usePullDownRefresh, useDidShow } from '@tarojs/taro';
import dayjs from 'dayjs';
import { useActivityStore } from '@/store/useActivityStore';
import { useUserStore } from '@/store/useUserStore';
import EmptyState from '@/components/EmptyState';
import type { Activity, ActivityLog } from '@/types/activity';
import styles from './index.module.scss';

const ActivityLogPage: React.FC = () => {
  const router = useRouter();
  const { getActivityById, addLog, addPhoto } = useActivityStore();
  const { currentUser } = useUserStore();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [activeDay, setActiveDay] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [logContent, setLogContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
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
      setLogs(act?.logs || []);
      setLoading(false);
      Taro.stopPullDownRefresh();
    }, 300);
  };

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      const act = getActivityById(activityId);
      setActivity(act ? { ...act } : null);
      setLogs([...(act?.logs || [])]);
      setLoading(false);
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 500);
  };

  const days = useMemo(() => {
    if (!activity) return [];
    const start = dayjs(activity.startDate);
    const end = dayjs(activity.endDate);
    const dayList: { key: string; label: string }[] = [{ key: 'all', label: '全部' }];
    
    let current = start;
    let dayNum = 1;
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      dayList.push({
        key: current.format('YYYY-MM-DD'),
        label: `D${dayNum} ${current.format('MM-DD')}`
      });
      current = current.add(1, 'day');
      dayNum++;
    }
    return dayList;
  }, [activity]);

  const filteredLogs = useMemo(() => {
    if (activeDay === 'all') return logs;
    return logs.filter(log => log.date === activeDay);
  }, [logs, activeDay]);

  const isParticipant = useMemo(() => {
    if (!currentUser || !activity) return false;
    return activity.participants.some(p => p.userId === currentUser.id);
  }, [currentUser, activity]);

  const canWriteLog = useMemo(() => {
    if (!activity) return false;
    return isParticipant && activity.status === 'ongoing';
  }, [activity, isParticipant]);

  const handleChooseImage = () => {
    if (selectedImages.length >= 9) {
      Taro.showToast({ title: '最多上传9张图片', icon: 'none' });
      return;
    }

    Taro.chooseImage({
      count: 9 - selectedImages.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        setSelectedImages([...selectedImages, ...res.tempFilePaths]);
      }
    });
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
  };

  const handlePreviewImage = (url: string) => {
    Taro.previewImage({
      current: url,
      urls: logs.flatMap(log => log.images)
    });
  };

  const handleSubmit = () => {
    if (!logContent.trim()) {
      Taro.showToast({ title: '请输入日志内容', icon: 'none' });
      return;
    }

    if (!currentUser || !activity) return;

    Taro.showLoading({ title: '发布中...' });

    setTimeout(() => {
      const newLog = addLog(activity.id, {
        activityId: activity.id,
        userId: currentUser.id,
        userName: currentUser.name,
        date: dayjs().format('YYYY-MM-DD'),
        content: logContent,
        images: selectedImages
      });

      selectedImages.forEach((imgUrl) => {
        addPhoto(activity.id, currentUser.id, currentUser.name, imgUrl);
      });

      Taro.hideLoading();
      Taro.showToast({ title: '发布成功', icon: 'success' });
      
      setShowModal(false);
      setLogContent('');
      setSelectedImages([]);
      loadData();
    }, 500);
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

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.activityName}>{activity.name}</Text>
        <Text className={styles.activityDate}>{activity.startDate} 至 {activity.endDate}</Text>
      </View>

      <View className={styles.tabs}>
        {days.map((day) => (
          <View
            key={day.key}
            className={`${styles.tabItem} ${activeDay === day.key ? styles.active : ''}`}
            onClick={() => setActiveDay(day.key)}
          >
            <Text>{day.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView scrollY className={styles.logList}>
        {loading ? (
          <View style={{ padding: '80rpx', textAlign: 'center', color: '#999' }}>
            <Text>加载中...</Text>
          </View>
        ) : filteredLogs.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.icon}>📝</Text>
            <Text className={styles.title}>暂无行程日志</Text>
            <Text className={styles.description}>
              {canWriteLog ? '快来记录今天的精彩瞬间吧' : '活动进行中才能记录日志'}
            </Text>
          </View>
        ) : (
          filteredLogs.map((log) => (
            <View key={log.id} className={styles.logCard}>
              <View className={styles.logHeader}>
                <Image
                  className={styles.avatar}
                  src={`https://picsum.photos/seed/${log.userId}/200/200`}
                  mode="aspectFill"
                />
                <View className={styles.info}>
                  <Text className={styles.name}>{log.userName}</Text>
                  <Text className={styles.time}>{log.createdAt}</Text>
                </View>
              </View>
              <Text className={styles.logContent}>{log.content}</Text>
              {log.images.length > 0 && (
                <View className={styles.logImages}>
                  {log.images.map((img, index) => (
                    <View
                      key={index}
                      className={styles.imageWrapper}
                      onClick={() => handlePreviewImage(img)}
                    >
                      <Image className={styles.image} src={img} mode="aspectFill" />
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {canWriteLog && (
        <View className={styles.writeBtn} onClick={() => setShowModal(true)}>
          <Text className={styles.icon}>✏️</Text>
        </View>
      )}

      {showModal && (
        <View className={styles.modal} onClick={() => setShowModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.title}>写行程日志</Text>
              <Text className={styles.closeBtn} onClick={() => setShowModal(false)}>✕</Text>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.label}>日志内容</Text>
              <Textarea
                className={styles.textarea}
                placeholder="记录今天的行程、感受和精彩瞬间..."
                value={logContent}
                onInput={(e) => setLogContent(e.detail.value)}
                maxlength={1000}
                autoHeight
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.label}>上传照片 ({selectedImages.length}/9)</Text>
              <View className={styles.imagePreview}>
                {selectedImages.map((img, index) => (
                  <View key={index} className={styles.imageWrapper}>
                    <Image className={styles.image} src={img} mode="aspectFill" />
                    <View className={styles.removeBtn} onClick={() => handleRemoveImage(index)}>
                      ✕
                    </View>
                  </View>
                ))}
                {selectedImages.length < 9 && (
                  <View className={styles.addBtn} onClick={handleChooseImage}>
                    <Text className={styles.icon}>+</Text>
                  </View>
                )}
              </View>
            </View>

            <View
              className={`${styles.submitBtn} ${!logContent.trim() ? styles.disabled : ''}`}
              onClick={handleSubmit}
            >
              <Text>发布日志</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ActivityLogPage;

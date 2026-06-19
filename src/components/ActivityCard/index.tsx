import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import classnames from 'classnames';
import type { Activity } from '@/types/activity';
import GradeBadge from '@/components/GradeBadge';
import styles from './index.module.scss';

interface ActivityCardProps {
  activity: Activity;
  onClick?: () => void;
}

const statusText: Record<string, string> = {
  upcoming: '即将开始',
  ongoing: '进行中',
  completed: '已完成',
  cancelled: '已取消'
};

const statusColor: Record<string, string> = {
  upcoming: '#FF9800',
  ongoing: '#00B42A',
  completed: '#86909C',
  cancelled: '#F53F3F'
};

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/activity-detail/index?id=${activity.id}`
      });
    }
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <View className={styles.statusBadge} style={{ backgroundColor: `${statusColor[activity.status]}15`, color: statusColor[activity.status] }}>
          <Text>{statusText[activity.status]}</Text>
        </View>
        <Text className={styles.activityName}>{activity.name}</Text>
      </View>

      <View className={styles.destinationRow}>
        <Text className={styles.label}>目的地</Text>
        <Text className={styles.value}>{activity.destination}</Text>
      </View>

      <View className={styles.infoRow}>
        <View className={styles.infoItem}>
          <Text className={styles.infoIcon}>📅</Text>
          <Text className={styles.infoText}>
            {dayjs(activity.startDate).format('MM/DD')} - {dayjs(activity.endDate).format('MM/DD')}
          </Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoIcon}>👥</Text>
          <Text className={styles.infoText}>{activity.currentParticipants}/{activity.maxParticipants}人</Text>
        </View>
      </View>

      <View className={styles.infoRow}>
        <View className={styles.infoItem}>
          <Text className={styles.infoIcon}>🌤️</Text>
          <Text className={styles.infoText}>{activity.weather}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoIcon}>🌡️</Text>
          <Text className={styles.infoText}>{activity.temperature}</Text>
        </View>
      </View>

      <View className={styles.progressBar}>
        <View 
          className={styles.progressFill} 
          style={{ width: `${(activity.currentParticipants / activity.maxParticipants) * 100}%` }}
        />
      </View>

      <View className={styles.cardFooter}>
        <View className={styles.leaderInfo}>
          <Image className={styles.leaderAvatar} src={activity.leaderAvatar} mode="aspectFill" />
          <View className={styles.leaderDetail}>
            <Text className={styles.leaderName}>{activity.leaderName}</Text>
            <GradeBadge grade={activity.leaderId === 'u1' ? 'gold' : activity.leaderId === 'u2' ? 'diamond' : 'platinum'} size="sm" />
          </View>
        </View>
        {activity.ratings && (
          <View className={styles.rating}>
            <Text className={styles.ratingStar}>⭐</Text>
            <Text className={styles.ratingText}>{activity.ratings.averageRating}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ActivityCard;

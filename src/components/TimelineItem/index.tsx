import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import type { TimelineItem as TimelineItemType } from '@/types/activity';
import styles from './index.module.scss';

interface TimelineItemProps {
  item: TimelineItemType;
  isLast?: boolean;
}

const typeIcon: Record<string, string> = {
  system: '⚙️',
  log: '📝',
  photo: '📷',
  checkin: '✅'
};

const TimelineItemComponent: React.FC<TimelineItemProps> = ({ item, isLast = false }) => {
  return (
    <View className={classnames(styles.timelineItem, isLast && styles.lastItem)}>
      <View className={styles.timelineLine}>
        <View className={classnames(styles.timelineDot, styles[item.type])}>
          <Text className={styles.dotIcon}>{typeIcon[item.type]}</Text>
        </View>
        {!isLast && <View className={styles.lineConnector} />}
      </View>

      <View className={styles.timelineContent}>
        <View className={styles.contentHeader}>
          <Text className={styles.timeText}>{item.time}</Text>
          {item.userName && (
            <Text className={styles.userName}>{item.userName}</Text>
          )}
        </View>
        <Text className={styles.contentText}>{item.content}</Text>
        {item.imageUrl && (
          <Image 
            className={styles.contentImage} 
            src={item.imageUrl} 
            mode="aspectFill"
          />
        )}
      </View>
    </View>
  );
};

export default TimelineItemComponent;

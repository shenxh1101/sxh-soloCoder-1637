import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { LeaderGrade } from '@/types/user';
import { getGradeLabel, getGradeColor } from '@/utils/gradeCalculator';
import styles from './index.module.scss';

interface GradeBadgeProps {
  grade: LeaderGrade;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const GradeBadge: React.FC<GradeBadgeProps> = ({ grade, size = 'md', showLabel = true }) => {
  const color = getGradeColor(grade);
  const label = getGradeLabel(grade);

  return (
    <View className={classnames(styles.gradeBadge, styles[size])} style={{ backgroundColor: `${color}20` }}>
      <View className={styles.gradeIcon} style={{ backgroundColor: color }}>
        <Text className={styles.gradeIconText}>★</Text>
      </View>
      {showLabel && (
        <Text className={styles.gradeLabel} style={{ color }}>{label}</Text>
      )}
    </View>
  );
};

export default GradeBadge;

import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import styles from './index.module.scss';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon = '🏕️', 
  title, 
  description, 
  buttonText, 
  onButtonClick 
}) => {
  return (
    <View className={styles.emptyState}>
      <Text className={styles.emptyIcon}>{icon}</Text>
      <Text className={styles.emptyTitle}>{title}</Text>
      {description && (
        <Text className={styles.emptyDescription}>{description}</Text>
      )}
      {buttonText && (
        <Button className={styles.emptyButton} onClick={onButtonClick}>
          {buttonText}
        </Button>
      )}
    </View>
  );
};

export default EmptyState;

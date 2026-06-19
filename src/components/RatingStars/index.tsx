import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface RatingStarsProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
  onChange?: (value: number) => void;
}

const RatingStars: React.FC<RatingStarsProps> = ({ 
  value, 
  max = 5, 
  size = 'md', 
  readOnly = true,
  onChange 
}) => {
  const handleClick = (index: number) => {
    if (!readOnly && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <View className={classnames(styles.ratingStars, styles[size])}>
      {Array.from({ length: max }).map((_, index) => (
        <Text
          key={index}
          className={classnames(
            styles.star,
            index < value && styles.active,
            !readOnly && styles.clickable
          )}
          onClick={() => handleClick(index)}
        >
          ★
        </Text>
      ))}
    </View>
  );
};

export default RatingStars;

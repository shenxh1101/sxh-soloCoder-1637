import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Input, Textarea, Button, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import dayjs from 'dayjs';
import { useActivityStore } from '@/store/useActivityStore';
import { useUserStore } from '@/store/useUserStore';
import { validateCreateActivity, showValidationToast } from '@/utils/validator';
import { recommendEquipment, generateItinerary } from '@/utils/equipmentRecommender';
import { mockCurrentUser } from '@/data/mockUsers';
import type { CreateActivityForm } from '@/types/activity';
import type { EquipmentCategory } from '@/types/equipment';
import styles from './index.module.scss';

const weatherOptions = ['晴', '多云', '阴', '小雨', '中雨', '雷阵雨', '雪'];

const CreatePage: React.FC = () => {
  const { createActivity } = useActivityStore();
  const { currentUser, setCurrentUser } = useUserStore();
  const [form, setForm] = useState<CreateActivityForm>({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    maxParticipants: 4,
    description: '',
    weather: '',
    temperature: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setCurrentUser(mockCurrentUser);
    }
  }, []);

  useDidShow(() => {
    if (!currentUser) {
      setCurrentUser(mockCurrentUser);
    }
  });

  const recommendation = useMemo(() => {
    if (form.destination && form.startDate && form.endDate && form.maxParticipants > 0) {
      try {
        return recommendEquipment({
          destination: form.destination,
          startDate: form.startDate,
          endDate: form.endDate,
          participants: form.maxParticipants
        });
      } catch (error) {
        console.error('[Create] 装备推荐失败', error);
        return null;
      }
    }
    return null;
  }, [form.destination, form.startDate, form.endDate, form.maxParticipants]);

  const itinerary = useMemo(() => {
    if (form.destination && form.startDate && form.endDate && form.maxParticipants > 0) {
      try {
        return generateItinerary({
          destination: form.destination,
          startDate: form.startDate,
          endDate: form.endDate,
          participants: form.maxParticipants
        });
      } catch (error) {
        console.error('[Create] 行程单生成失败', error);
        return [];
      }
    }
    return [];
  }, [form.destination, form.startDate, form.endDate, form.maxParticipants]);

  const handleInputChange = (field: keyof CreateActivityForm, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleDatePick = (field: 'startDate' | 'endDate') => {
    Taro.showActionSheet({
      itemList: [
        dayjs().add(1, 'day').format('YYYY-MM-DD'),
        dayjs().add(2, 'day').format('YYYY-MM-DD'),
        dayjs().add(3, 'day').format('YYYY-MM-DD'),
        dayjs().add(7, 'day').format('YYYY-MM-DD'),
        dayjs().add(14, 'day').format('YYYY-MM-DD')
      ],
      success: (res) => {
        const dates = [
          dayjs().add(1, 'day').format('YYYY-MM-DD'),
          dayjs().add(2, 'day').format('YYYY-MM-DD'),
          dayjs().add(3, 'day').format('YYYY-MM-DD'),
          dayjs().add(7, 'day').format('YYYY-MM-DD'),
          dayjs().add(14, 'day').format('YYYY-MM-DD')
        ];
        handleInputChange(field, dates[res.tapIndex]);
      }
    });
  };

  const handleWeatherSelect = (weather: string) => {
    handleInputChange('weather', weather);
  };

  const adjustParticipants = (delta: number) => {
    const newValue = Math.max(1, Math.min(30, form.maxParticipants + delta));
    handleInputChange('maxParticipants', newValue);
  };

  const handleSubmit = () => {
    console.log('[Create] 提交活动创建', form);
    
    const validation = validateCreateActivity(form);
    if (!validation.isValid) {
      showValidationToast(validation.errors);
      return;
    }

    if (!currentUser) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    setSubmitting(true);

    try {
      const newActivity = createActivity(
        form,
        currentUser.id,
        currentUser.name,
        currentUser.avatar
      );

      console.log('[Create] 活动创建成功', newActivity);

      Taro.showModal({
        title: '创建成功',
        content: `活动"${form.name}"已创建，是否立即查看？`,
        confirmText: '去查看',
        cancelText: '继续创建',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({
              url: `/pages/activity-detail/index?id=${newActivity.id}`
            });
          } else {
            setForm({
              name: '',
              destination: '',
              startDate: '',
              endDate: '',
              maxParticipants: 4,
              description: '',
              weather: '',
              temperature: ''
            });
          }
        }
      });
    } catch (error) {
      console.error('[Create] 活动创建失败', error);
      Taro.showToast({
        title: '创建失败，请重试',
        icon: 'none'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    Taro.showModal({
      title: '重置表单',
      content: '确定要清空所有已填写的内容吗？',
      success: (res) => {
        if (res.confirm) {
          setForm({
            name: '',
            destination: '',
            startDate: '',
            endDate: '',
            maxParticipants: 4,
            description: '',
            weather: '',
            temperature: ''
          });
        }
      }
    });
  };

  const categoryLabels: Record<EquipmentCategory, string> = {
    tent: '帐篷',
    sleeping: '睡眠装备',
    cooking: '炊具餐具',
    clothing: '服装',
    lighting: '照明',
    firstaid: '急救',
    navigation: '导航工具',
    other: '其他'
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.tips}>
        <Text className={styles.tipsText}>
          💡 提示：填写目的地和日期后，系统将自动为您推荐装备清单和生成行程单
        </Text>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>基本信息</Text>

        <View className={styles.formItem}>
          <Text className={styles.label}>
            <Text className={styles.required}>*</Text>活动名称
          </Text>
          <Input
            className={styles.input}
            placeholder="请输入活动名称，如：黄山露营之旅"
            value={form.name}
            onInput={(e) => handleInputChange('name', e.detail.value)}
            maxlength={30}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>
            <Text className={styles.required}>*</Text>目的地
          </Text>
          <Input
            className={styles.input}
            placeholder="请输入露营目的地"
            value={form.destination}
            onInput={(e) => handleInputChange('destination', e.detail.value)}
            maxlength={50}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>
            <Text className={styles.required}>*</Text>活动日期
          </Text>
          <View className={styles.dateRow}>
            <View className={styles.dateItem}>
              <View
                className={classnames(styles.input, { [styles.active]: form.startDate })}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: form.startDate ? '#1D2129' : '#C9CDD4'
                }}
                onClick={() => handleDatePick('startDate')}
              >
                <Text>{form.startDate || '开始日期'}</Text>
              </View>
            </View>
            <View className={styles.dateItem}>
              <View
                className={classnames(styles.input, { [styles.active]: form.endDate })}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: form.endDate ? '#1D2129' : '#C9CDD4'
                }}
                onClick={() => handleDatePick('endDate')}
              >
                <Text>{form.endDate || '结束日期'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>
            <Text className={styles.required}>*</Text>人数上限
          </Text>
          <View className={styles.counterRow}>
            <View className={styles.counterBtn} onClick={() => adjustParticipants(-1)}>
              <Text>−</Text>
            </View>
            <Text className={styles.counterValue}>{form.maxParticipants}</Text>
            <View className={styles.counterBtn} onClick={() => adjustParticipants(1)}>
              <Text>+</Text>
            </View>
            <Text style={{ fontSize: '24rpx', color: '#86909C', marginLeft: '16rpx' }}>人</Text>
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>活动描述</Text>
          <Textarea
            className={styles.textarea}
            placeholder="请输入活动描述，介绍活动亮点、注意事项等"
            value={form.description}
            onInput={(e) => handleInputChange('description', e.detail.value)}
            maxlength={200}
          />
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>天气预报</Text>

        <View className={styles.formItem}>
          <Text className={styles.label}>
            <Text className={styles.required}>*</Text>天气状况
          </Text>
          <View className={styles.selectRow}>
            {weatherOptions.map(weather => (
              <View
                key={weather}
                className={classnames(styles.selectItem, form.weather === weather && styles.active)}
                onClick={() => handleWeatherSelect(weather)}
              >
                <Text>{weather}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>温度范围</Text>
          <Input
            className={styles.input}
            placeholder="如：18°C - 28°C"
            value={form.temperature}
            onInput={(e) => handleInputChange('temperature', e.detail.value)}
          />
        </View>
      </View>

      {recommendation && (
        <View className={styles.previewSection}>
          <View className={styles.previewHeader}>
            <Text className={styles.recommendTitle}>🎒 装备推荐清单</Text>
            <Text className={styles.refreshBtn} onClick={() => {
              if (recommendation) {
                Taro.showToast({ title: '已刷新推荐', icon: 'success' });
              }
            }}>
              🔄 刷新
            </Text>
          </View>

          <Text className={styles.recommendReason}>{recommendation.reason}</Text>

          <View className={styles.equipmentPreviewList}>
            {recommendation.items.map((item, index) => (
              <View key={index} className={styles.equipmentPreviewItem}>
                <View className={styles.equipmentPreviewInfo}>
                  <Text className={styles.equipmentPreviewName}>{item.equipmentName}</Text>
                  <Text className={styles.equipmentPreviewMeta}>
                    {categoryLabels[item.category]}
                    {item.isPersonal && ' · 个人装备'}
                  </Text>
                </View>
                <Text className={styles.quantityBadge}>× {item.quantity}</Text>
              </View>
            ))}
          </View>

          {itinerary.length > 0 && (
            <View className={styles.itineraryPreview}>
              <Text className={styles.itineraryTitle}>📋 行程安排</Text>
              {itinerary.slice(0, 4).map((item, index) => (
                <View key={item.id} className={styles.itineraryItem}>
                  <Text className={styles.itineraryTime}>第{item.day}天 {item.time}</Text>
                  <Text className={styles.itineraryContent}>{item.content}</Text>
                </View>
              ))}
              {itinerary.length > 4 && (
                <Text style={{ fontSize: '24rpx', color: '#86909C', textAlign: 'center', marginTop: '16rpx' }}>
                  ... 还有 {itinerary.length - 4} 项行程安排
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      <View className={styles.bottomBar}>
        <Button className={styles.secondaryBtn} onClick={handleReset}>
          重置
        </Button>
        <Button 
          className={classnames(styles.primaryBtn, submitting && styles.disabled)} 
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? '创建中...' : '发布活动'}
        </Button>
      </View>
    </ScrollView>
  );
};

export default CreatePage;

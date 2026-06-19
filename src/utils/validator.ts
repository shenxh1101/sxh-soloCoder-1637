import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import type { CreateActivityForm, ValidationResult } from '@/types/activity';

export const validateCreateActivity = (form: CreateActivityForm): ValidationResult => {
  console.log('[Validator] 开始校验活动表单', form);
  const errors: string[] = [];

  if (!form.destination || form.destination.trim() === '') {
    errors.push('目的地不能为空');
  }

  if (!form.startDate) {
    errors.push('请选择开始日期');
  } else {
    const startDate = dayjs(form.startDate);
    const tomorrow = dayjs().add(1, 'day').startOf('day');
    if (!startDate.isValid()) {
      errors.push('开始日期格式不正确');
    } else if (startDate.isBefore(tomorrow)) {
      errors.push('开始日期必须是明天及以后的日期');
    }
  }

  if (!form.endDate) {
    errors.push('请选择结束日期');
  } else if (form.startDate && form.endDate) {
    const startDate = dayjs(form.startDate);
    const endDate = dayjs(form.endDate);
    if (!endDate.isValid()) {
      errors.push('结束日期格式不正确');
    } else if (endDate.isBefore(startDate)) {
      errors.push('结束日期不能早于开始日期');
    }
  }

  if (!form.maxParticipants || form.maxParticipants <= 0 || !Number.isInteger(form.maxParticipants)) {
    errors.push('人数上限必须为正整数');
  }

  if (!form.name || form.name.trim() === '') {
    errors.push('活动名称不能为空');
  }

  console.log('[Validator] 校验结果', { isValid: errors.length === 0, errors });
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const showValidationToast = (errors: string[]) => {
  if (errors.length > 0) {
    Taro.showToast({
      title: errors[0],
      icon: 'none',
      duration: 2000
    });
  }
};

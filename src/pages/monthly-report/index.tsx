import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Picker } from '@tarojs/components';
import Taro, { usePullDownRefresh, useDidShow } from '@tarojs/taro';
import dayjs from 'dayjs';
import { useActivityStore } from '@/store/useActivityStore';
import { useEquipmentStore } from '@/store/useEquipmentStore';
import { generateMonthlyReport, exportToPDF, getReportShownMonth, setReportShownMonth } from '@/utils/reportGenerator';
import { mockActivities } from '@/data/mockActivities';
import { mockUsageRecords } from '@/data/mockEquipments';
import EmptyState from '@/components/EmptyState';
import RatingStars from '@/components/RatingStars';
import type { MonthlyReport } from '@/types/activity';
import styles from './index.module.scss';

const MonthlyReportPage: React.FC = () => {
  const { activities, setActivities } = useActivityStore();
  const { usageRecords, setUsageRecords } = useEquipmentStore();
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showAutoGenerateTip, setShowAutoGenerateTip] = useState(false);

  useEffect(() => {
    initData();
  }, []);

  useDidShow(() => {
    if (activities.length === 0) {
      initData();
    } else {
      loadReport();
    }
    
    const today = dayjs().date();
    const isFirstDayOfMonth = today === 1;
    const isCurrentMonth = selectedMonth === dayjs().format('YYYY-MM');
    const hasShownTip = getReportShownMonth();
    
    if (isFirstDayOfMonth && isCurrentMonth && !hasShownTip) {
      setShowAutoGenerateTip(true);
      setReportShownMonth();
      setTimeout(() => setShowAutoGenerateTip(false), 3000);
    } else if (isFirstDayOfMonth && isCurrentMonth && hasShownTip) {
      setShowAutoGenerateTip(false);
    }
  });

  usePullDownRefresh(() => {
    refreshData();
  });

  const initData = () => {
    setLoading(true);
    setTimeout(() => {
      setActivities(mockActivities);
      setUsageRecords(mockUsageRecords);
      loadReportData();
    }, 500);
  };

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setActivities([...mockActivities]);
      setUsageRecords([...mockUsageRecords]);
      loadReportData();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 800);
  };

  const loadReportData = () => {
    const reportData = generateMonthlyReport(mockActivities, mockUsageRecords, selectedMonth);
    setReport(reportData);
    setLoading(false);
    Taro.stopPullDownRefresh();
  };

  const loadReport = () => {
    const reportData = generateMonthlyReport(activities, usageRecords, selectedMonth);
    setReport(reportData);
  };

  const handleMonthChange = (e: { detail: { value: string } }) => {
    setSelectedMonth(e.detail.value);
  };

  useEffect(() => {
    if (activities.length > 0) {
      loadReport();
    }
  }, [selectedMonth]);

  const months = useMemo(() => {
    const monthList: string[] = [];
    for (let i = 0; i < 12; i++) {
      monthList.push(dayjs().subtract(i, 'month').format('YYYY-MM'));
    }
    return monthList;
  }, []);

  const maxEquipmentCount = useMemo(() => {
    if (!report?.equipmentUsageFrequency.length) return 1;
    return Math.max(...report.equipmentUsageFrequency.map(item => item.count), 1);
  }, [report]);



  const totalRatingCount = useMemo(() => {
    if (!report) return 0;
    return report.campRatingDistribution.reduce((sum, item) => sum + item.count, 0);
  }, [report]);

  const handleExportPDF = async () => {
    if (!report) return;
    setExporting(true);
    try {
      await exportToPDF(report);
    } catch (error) {
      console.error('导出失败', error);
      Taro.showToast({ title: '导出失败', icon: 'none' });
    } finally {
      setExporting(false);
    }
  };

  const handleShare = () => {
    Taro.showToast({ title: '分享功能开发中', icon: 'none' });
  };

  const monthActivities = useMemo(() => {
    return mockActivities.filter(a =>
      dayjs(a.startDate).format('YYYY-MM') === selectedMonth ||
      dayjs(a.endDate).format('YYYY-MM') === selectedMonth
    );
  }, [selectedMonth]);

  const isCurrentMonth = selectedMonth === dayjs().format('YYYY-MM');
  const isReportGenerated = isCurrentMonth;

  const renderCompareIndicator = (field: 'totalActivities' | 'totalParticipants' | 'equipmentUsageCount' | 'averageCampRating') => {
    if (!report?.comparison) return null;
    const direction = report.comparison[field];
    const diff = report.comparison[`${field}Diff` as keyof typeof report.comparison] as number;
    
    if (direction === 'same') return null;
    
    return (
      <View className={`${styles.compareTag} ${styles[direction]}`}>
        <Text>{direction === 'up' ? '^' : 'v'}</Text>
        <Text>{diff > 0 ? '+' : ''}{typeof diff === 'number' && field === 'averageCampRating' ? diff.toFixed(1) : diff}</Text>
      </View>
    );
  };

  if (loading && !report) {
    return (
      <ScrollView className={styles.page} scrollY>
        <View className={styles.loading}>
          <Text>加载中...</Text>
        </View>
      </ScrollView>
    );
  }

  if (!report || report.totalActivities === 0) {
    return (
      <ScrollView className={styles.page} scrollY>
        {showAutoGenerateTip && (
          <View className={styles.autoGenerateTip}>
            <Text className={styles.tipIcon}>✨</Text>
            <Text className={styles.tipText}>{dayjs().format('YYYY年M月')}月度报告已自动生成</Text>
          </View>
        )}
        <View className={styles.header}>
          <View className={styles.titleRow}>
            <Text className={styles.title}>月度报告</Text>
            <Picker
              mode="selector"
              range={months}
              value={months.indexOf(selectedMonth)}
              onChange={handleMonthChange}
            >
              <View className={styles.monthSelector}>
                <Text className={styles.monthText}>{selectedMonth}</Text>
                <Text className={styles.icon}>v</Text>
              </View>
            </Picker>
          </View>
        </View>
        {isReportGenerated && (
          <View className={styles.reportGeneratedNotice}>
            <Text className={styles.noticeIcon}>📄</Text>
            <View className={styles.noticeContent}>
              <Text className={styles.noticeTitle}>{selectedMonth} 报告已生成</Text>
              <Text className={styles.noticeDesc}>本月暂无户外活动数据</Text>
            </View>
          </View>
        )}
        <EmptyState
          icon="Chart"
          title="暂无活动数据"
          description={`${selectedMonth} 月暂无户外活动数据`}
          buttonText="去发布活动"
          onButtonClick={() => Taro.switchTab({ url: '/pages/create/index' })}
        />
      </ScrollView>
    );
  }

  return (
    <View className={styles.page}>
      {showAutoGenerateTip && (
        <View className={styles.autoGenerateTip}>
          <Text className={styles.tipIcon}>✨</Text>
          <Text className={styles.tipText}>{dayjs().format('YYYY年M月')}月度报告已自动生成</Text>
        </View>
      )}
      
      <View className={styles.header}>
        <View className={styles.titleRow}>
          <Text className={styles.title}>月度报告</Text>
          <Picker
            mode="selector"
            range={months}
            value={months.indexOf(selectedMonth)}
            onChange={handleMonthChange}
          >
            <View className={styles.monthSelector}>
              <Text className={styles.monthText}>{selectedMonth}</Text>
              <Text className={styles.icon}>▼</Text>
            </View>
          </Picker>
        </View>

        {isReportGenerated && (
          <View className={styles.generatedBadge}>
            <Text className={styles.badgeIcon}>✓</Text>
            <Text className={styles.badgeText}>已生成</Text>
          </View>
        )}

        <View className={styles.statsGrid}>
          <View className={styles.statCard}>
            <View className={styles.statHeader}>
              <Text className={styles.statValue}>
                {report.totalActivities}
                <Text className={styles.statUnit}>场</Text>
              </Text>
              {renderCompareIndicator('totalActivities')}
            </View>
            <Text className={styles.statLabel}>活动总数</Text>
          </View>
          <View className={styles.statCard}>
            <View className={styles.statHeader}>
              <Text className={styles.statValue}>
                {report.totalParticipants}
                <Text className={styles.statUnit}>人</Text>
              </Text>
              {renderCompareIndicator('totalParticipants')}
            </View>
            <Text className={styles.statLabel}>参与人数</Text>
          </View>
          <View className={styles.statCard}>
            <View className={styles.statHeader}>
              <Text className={styles.statValue}>
                {report.equipmentUsageCount}
                <Text className={styles.statUnit}>次</Text>
              </Text>
              {renderCompareIndicator('equipmentUsageCount')}
            </View>
            <Text className={styles.statLabel}>装备使用</Text>
          </View>
          <View className={styles.statCard}>
            <View className={styles.statHeader}>
              <Text className={styles.statValue}>
                {report.averageCampRating}
                <Text className={styles.statUnit}>分</Text>
              </Text>
              {renderCompareIndicator('averageCampRating')}
            </View>
            <Text className={styles.statLabel}>平均评分</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY>
        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.icon}>Camp</Text>
            本月活动
          </View>
          <View className={styles.activityList}>
            {monthActivities.slice(0, 5).map((activity) => (
              <View key={activity.id} className={styles.activityItem}>
                <View className={styles.activityIcon}>Camp</View>
                <View className={styles.activityInfo}>
                  <Text className={styles.activityName}>{activity.name}</Text>
                  <View className={styles.activityMeta}>
                    <Text>@ {activity.destination}</Text>
                    <Text>Users {activity.currentParticipants}</Text>
                  </View>
                </View>
                {activity.ratings && (
                  <View className={styles.activityRating}>
                    <RatingStars value={Math.round(activity.ratings.averageRating)} size="sm" />
                    <Text className={styles.score}>{activity.ratings.averageRating}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {report.equipmentUsageFrequency.length > 0 && (
          <View className={styles.section}>
            <View className={styles.sectionTitle}>
              <Text className={styles.icon}>Bag</Text>
              装备使用频率 Top 5
            </View>
            <View className={styles.chartContainer}>
              {report.equipmentUsageFrequency.slice(0, 5).map((item, index) => (
                <View key={item.name} className={styles.chartItem}>
                  <View className={`${styles.rank} ${styles[`rank${index + 1}`] || styles.other}`}>
                    {index + 1}
                  </View>
                  <Text className={styles.name}>{item.name}</Text>
                  <View className={styles.barContainer}>
                    <View
                      className={styles.barFill}
                      style={{ width: `${(item.count / maxEquipmentCount) * 100}%` }}
                    />
                  </View>
                  <Text className={styles.count}>{item.count}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {report.newActivitiesByLeader.length > 0 && (
          <View className={styles.section}>
            <View className={styles.sectionTitle}>
              <Text className={styles.icon}>Top</Text>
              领队活跃度排行
            </View>
            <View className={styles.leaderRanking}>
              {report.newActivitiesByLeader.slice(0, 5).map((item, index) => (
                <View key={item.name} className={styles.rankingItem}>
                  <View className={`${styles.rank} ${styles[`rank${index + 1}`] || styles.other}`}>
                    {index + 1}
                  </View>
                  <View
                    className={styles.avatar}
                    style={{
                      backgroundImage: `url(https://picsum.photos/seed/${item.name}/200/200)`,
                      backgroundSize: 'cover'
                    }}
                  />
                  <View className={styles.info}>
                    <Text className={styles.name}>{item.name}</Text>
                    <Text className={styles.stats}>组织 {item.count} 场活动</Text>
                  </View>
                  <Text className={styles.count}>{item.count}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {totalRatingCount > 0 && (
          <View className={styles.section}>
            <View className={styles.sectionTitle}>
              <Text className={styles.icon}>Star</Text>
              营地评分分布
            </View>
            <View className={styles.ratingDistribution}>
              {report.campRatingDistribution.slice().reverse().map((item) => (
                <View key={item.rating} className={styles.distributionItem}>
                  <View className={styles.starLabel}>
                    <Text className={styles.stars}>{'*'.repeat(item.rating)}</Text>
                  </View>
                  <View className={styles.bar}>
                    <View
                      className={styles.fill}
                      style={{ width: `${totalRatingCount > 0 ? (item.count / totalRatingCount) * 100 : 0}%` }}
                    />
                  </View>
                  <Text className={styles.count}>{item.count}</Text>
                  <Text className={styles.percent}>
                    {totalRatingCount > 0 ? Math.round((item.count / totalRatingCount) * 100) : 0}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: '160rpx' }} />
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={styles.btn + ' ' + styles.secondary} onClick={handleShare}>
          <Text>Share</Text>
          <Text>分享报告</Text>
        </View>
        <View
          className={styles.btn + ' ' + styles.primary + ' ' + (exporting ? '' : '')}
          onClick={handleExportPDF}
        >
          <Text>{exporting ? '...' : 'PDF'}</Text>
          <Text>{exporting ? '导出中...' : '导出PDF'}</Text>
        </View>
      </View>
    </View>
  );
};

export default MonthlyReportPage;

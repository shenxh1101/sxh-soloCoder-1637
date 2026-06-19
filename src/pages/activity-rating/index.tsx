import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, ScrollView, Textarea } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { useActivityStore } from '@/store/useActivityStore';
import { useUserStore } from '@/store/useUserStore';
import RatingStars from '@/components/RatingStars';
import EmptyState from '@/components/EmptyState';
import type { Activity, ActivityReview } from '@/types/activity';
import styles from './index.module.scss';

const ActivityRatingPage: React.FC = () => {
  const router = useRouter();
  const { getActivityById, addReview } = useActivityStore();
  const { currentUser, updateLeaderRating, incrementLeaderActivityCount } = useUserStore();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [facilitiesRating, setFacilitiesRating] = useState(5);
  const [routeRating, setRouteRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const activityId = router.params.activityId as string;

  useEffect(() => {
    loadData();
  }, [activityId]);

  useDidShow(() => {
    loadData();
  });

  const loadData = () => {
    const act = getActivityById(activityId);
    setActivity(act || null);
    
    if (act?.ratings && currentUser) {
      const existingReview = act.ratings.reviews.find(r => r.userId === currentUser.id);
      if (existingReview) {
        setFacilitiesRating(existingReview.facilities);
        setRouteRating(existingReview.route);
        setComment(existingReview.comment);
        setHasSubmitted(true);
      }
    }
  };

  const isParticipant = useMemo(() => {
    if (!currentUser || !activity) return false;
    return activity.participants.some(p => p.userId === currentUser.id);
  }, [currentUser, activity]);

  const canSubmit = useMemo(() => {
    if (!activity || !currentUser) return false;
    if (activity.status !== 'completed') return false;
    if (!isParticipant) return false;
    if (hasSubmitted) return false;
    return true;
  }, [activity, currentUser, isParticipant, hasSubmitted]);

  const ratingDistribution = useMemo(() => {
    if (!activity?.ratings) return [];
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    activity.ratings.reviews.forEach(review => {
      const avg = Math.round((review.facilities + review.route) / 2);
      distribution[avg] = (distribution[avg] || 0) + 1;
    });
    return Object.entries(distribution)
      .map(([star, count]) => ({ star: parseInt(star), count }))
      .reverse();
  }, [activity]);

  const handleSubmit = () => {
    if (!canSubmit || !currentUser || !activity) return;

    Taro.showLoading({ title: '提交中...' });

    setTimeout(() => {
      const existingReviewCount = activity.ratings?.reviews?.length || 0;
      const isFirstReviewForActivity = existingReviewCount === 0;

      addReview(activity.id, {
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        facilities: facilitiesRating,
        route: routeRating,
        comment: comment.trim()
      });

      const avgRating = (facilitiesRating + routeRating) / 2;
      updateLeaderRating(activity.leaderId, avgRating);

      if (isFirstReviewForActivity) {
        incrementLeaderActivityCount(activity.leaderId);
      }

      Taro.hideLoading();
      Taro.showToast({ title: '评分成功', icon: 'success' });
      setHasSubmitted(true);
      loadData();

      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
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
        <Text className={styles.icon}>⭐</Text>
        <Text className={styles.title}>活动评分</Text>
        <Text className={styles.subtitle}>您的评价将帮助其他营友选择活动</Text>
      </View>

      {activity.ratings && (
        <View className={styles.reviewsSection} style={{ marginTop: '-32rpx' }}>
          <View className={styles.averageRating}>
            <Text className={styles.score}>{activity.ratings.averageRating.toFixed(1)}</Text>
            <View className={styles.info}>
              <View className={styles.stars}>
                <RatingStars value={Math.round(activity.ratings.averageRating)} size="md" />
              </View>
              <Text className={styles.count}>{activity.ratings.totalReviews} 人评价</Text>
            </View>
          </View>

          <View className={styles.ratingDistribution}>
            {ratingDistribution.map((item) => (
              <View key={item.star} className={styles.distributionItem}>
                <Text className={styles.starLabel}>{item.star} 星</Text>
                <View className={styles.bar}>
                  <View
                    className={styles.fill}
                    style={{
                      width: activity.ratings && activity.ratings.totalReviews > 0
                        ? `${(item.count / activity.ratings.totalReviews) * 100}%`
                        : '0%'
                    }}
                  />
                </View>
                <Text className={styles.count}>{item.count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {canSubmit && (
        <View className={styles.formCard}>
          <View className={styles.activityInfo}>
            <View className={styles.avatar}>
              <Text>🏕️</Text>
            </View>
            <View className={styles.info}>
              <Text className={styles.name}>{activity.name}</Text>
              <Text className={styles.date}>{activity.startDate} 至 {activity.endDate}</Text>
            </View>
          </View>

          <View className={styles.ratingSection}>
            <Text className={styles.sectionTitle}>请为本次活动评分</Text>
            <View className={styles.ratingItem}>
              <View className={styles.label}>
                <Text className={styles.icon}>🏠</Text>
                <Text className={styles.text}>营地设施</Text>
              </View>
              <View className={styles.ratingControl}>
                <RatingStars
                  value={facilitiesRating}
                  size="lg"
                  readOnly={false}
                  onChange={setFacilitiesRating}
                />
                <Text className={styles.score}>{facilitiesRating}</Text>
              </View>
            </View>
            <View className={styles.ratingItem}>
              <View className={styles.label}>
                <Text className={styles.icon}>🛤️</Text>
                <Text className={styles.text}>路线规划</Text>
              </View>
              <View className={styles.ratingControl}>
                <RatingStars
                  value={routeRating}
                  size="lg"
                  readOnly={false}
                  onChange={setRouteRating}
                />
                <Text className={styles.score}>{routeRating}</Text>
              </View>
            </View>
          </View>

          <View className={styles.commentSection}>
            <Text className={styles.sectionTitle}>评价内容（选填）</Text>
            <Textarea
              className={styles.textarea}
              placeholder="分享您的露营体验，帮助其他营友..."
              value={comment}
              onInput={(e) => setComment(e.detail.value)}
              maxlength={500}
              autoHeight
            />
            <Text className={styles.charCount}>{comment.length}/500</Text>
          </View>
        </View>
      )}

      {hasSubmitted && (
        <View className={styles.formCard}>
          <View style={{ textAlign: 'center', padding: '32rpx' }}>
            <Text style={{ fontSize: '80rpx', marginBottom: '16rpx' }}>✅</Text>
            <Text style={{ fontSize: '32rpx', fontWeight: '600', color: '#333', marginBottom: '8rpx' }}>
              感谢您的评价！
            </Text>
            <Text style={{ fontSize: '26rpx', color: '#999' }}>
              营地设施: {facilitiesRating} 星 | 路线规划: {routeRating} 星
            </Text>
          </View>
        </View>
      )}

      {activity.ratings && activity.ratings.reviews.length > 0 && (
        <View className={styles.reviewsSection}>
          <Text className={styles.sectionTitle}>全部评价 ({activity.ratings.totalReviews})</Text>
          {activity.ratings.reviews.map((review: ActivityReview) => (
            <View key={review.id} className={styles.reviewItem}>
              <View className={styles.reviewHeader}>
                <Image className={styles.avatar} src={review.userAvatar} mode="aspectFill" />
                <View className={styles.info}>
                  <Text className={styles.name}>{review.userName}</Text>
                  <Text className={styles.time}>{review.createdAt}</Text>
                </View>
              </View>
              <View className={styles.reviewRatings}>
                <View className={styles.ratingTag}>
                  <Text>设施</Text>
                  <RatingStars value={review.facilities} size="sm" />
                  <Text className={styles.score}>{review.facilities}</Text>
                </View>
                <View className={styles.ratingTag}>
                  <Text>路线</Text>
                  <RatingStars value={review.route} size="sm" />
                  <Text className={styles.score}>{review.route}</Text>
                </View>
              </View>
              {review.comment && (
                <Text className={styles.reviewContent}>{review.comment}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {canSubmit && (
        <View className={styles.bottomBar}>
          <View
            className={`${styles.submitBtn} ${!canSubmit ? styles.disabled : ''}`}
            onClick={handleSubmit}
          >
            <Text>提交评分</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default ActivityRatingPage;

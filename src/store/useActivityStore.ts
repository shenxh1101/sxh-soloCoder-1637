import { create } from 'zustand';
import dayjs from 'dayjs';
import type { Activity, CreateActivityForm, ActivityLog, ActivityReview, TimelineItem } from '@/types/activity';
import type { Participant, JoinApplication } from '@/types/user';
import type { EquipmentStatus } from '@/types/equipment';
import { recommendEquipment, generateItinerary } from '@/utils/equipmentRecommender';

interface ActivityState {
  activities: Activity[];
  currentActivity: Activity | null;
  setActivities: (activities: Activity[]) => void;
  setCurrentActivity: (activity: Activity | null) => void;
  getActivityById: (id: string) => Activity | undefined;
  createActivity: (form: CreateActivityForm, leaderId: string, leaderName: string, leaderAvatar: string) => Activity;
  applyToJoin: (activityId: string, userId: string, userName: string, userAvatar: string, message: string) => void;
  approveApplication: (activityId: string, applicationId: string) => void;
  rejectApplication: (activityId: string, applicationId: string) => void;
  updateEquipmentStatus: (activityId: string, equipmentId: string, status: EquipmentStatus) => void;
  checkInParticipant: (activityId: string, userId: string) => void;
  addLog: (activityId: string, log: Omit<ActivityLog, 'id' | 'createdAt'>) => void;
  addPhoto: (activityId: string, userId: string, userName: string, imageUrl: string) => void;
  addReview: (activityId: string, review: Omit<ActivityReview, 'id' | 'createdAt'>) => void;
  sendPackingReminder: (activityId: string) => void;
  updateActivityStatus: (activityId: string, status: Activity['status']) => void;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],
  currentActivity: null,

  setActivities: (activities) => {
    console.log('[ActivityStore] 设置活动列表', activities.length);
    set({ activities });
  },

  setCurrentActivity: (activity) => {
    console.log('[ActivityStore] 设置当前活动', activity?.id);
    set({ currentActivity: activity });
  },

  getActivityById: (id) => {
    return get().activities.find(a => a.id === id);
  },

  createActivity: (form, leaderId, leaderName, leaderAvatar) => {
    console.log('[ActivityStore] 创建活动', form);
    
    const recommendation = recommendEquipment({
      destination: form.destination,
      startDate: form.startDate,
      endDate: form.endDate,
      participants: form.maxParticipants
    });

    const itinerary = generateItinerary({
      destination: form.destination,
      startDate: form.startDate,
      endDate: form.endDate,
      participants: form.maxParticipants
    });

    const newActivity: Activity = {
      id: `act_${Date.now()}`,
      name: form.name,
      destination: form.destination,
      startDate: form.startDate,
      endDate: form.endDate,
      maxParticipants: form.maxParticipants,
      currentParticipants: 1,
      description: form.description,
      weather: form.weather,
      temperature: form.temperature,
      leaderId,
      leaderName,
      leaderAvatar,
      status: 'upcoming',
      participants: [{
        id: `p_${Date.now()}`,
        userId: leaderId,
        name: leaderName,
        avatar: leaderAvatar,
        checkedIn: false
      }],
      equipmentList: recommendation.items,
      equipmentRecommendation: recommendation,
      timeline: [{
        id: `t_${Date.now()}`,
        time: dayjs().format('YYYY-MM-DD HH:mm'),
        type: 'system',
        content: `活动"${form.name}"已创建`
      }],
      joinApplications: [],
      createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
      packingReminderSent: false,
      itinerary
    };

    set(state => ({
      activities: [newActivity, ...state.activities],
      currentActivity: newActivity
    }));

    console.log('[ActivityStore] 活动创建成功', newActivity);
    return newActivity;
  },

  applyToJoin: (activityId, userId, userName, userAvatar, message) => {
    console.log('[ActivityStore] 申请加入活动', { activityId, userId });
    
    const application: JoinApplication = {
      id: `app_${Date.now()}`,
      activityId,
      userId,
      userName,
      userAvatar,
      status: 'pending',
      applyTime: dayjs().format('YYYY-MM-DD HH:mm'),
      message
    };

    set(state => ({
      activities: state.activities.map(a => {
        if (a.id === activityId) {
          return {
            ...a,
            joinApplications: [...a.joinApplications, application],
            timeline: [
              ...a.timeline,
              {
                id: `t_${Date.now()}`,
                time: dayjs().format('YYYY-MM-DD HH:mm'),
                type: 'system',
                content: `${userName} 申请加入活动`
              }
            ]
          };
        }
        return a;
      })
    }));
  },

  approveApplication: (activityId, applicationId) => {
    console.log('[ActivityStore] 批准加入申请', { activityId, applicationId });
    
    set(state => ({
      activities: state.activities.map(a => {
        if (a.id === activityId) {
          const application = a.joinApplications.find(app => app.id === applicationId);
          if (!application) return a;

          const newParticipant: Participant = {
            id: `p_${Date.now()}`,
            userId: application.userId,
            name: application.userName,
            avatar: application.userAvatar,
            checkedIn: false
          };

          return {
            ...a,
            currentParticipants: a.currentParticipants + 1,
            participants: [...a.participants, newParticipant],
            joinApplications: a.joinApplications.map(app => 
              app.id === applicationId ? { ...app, status: 'approved' } : app
            ),
            timeline: [
              ...a.timeline,
              {
                id: `t_${Date.now()}`,
                time: dayjs().format('YYYY-MM-DD HH:mm'),
                type: 'system',
                content: `${application.userName} 已加入活动`
              }
            ]
          };
        }
        return a;
      })
    }));
  },

  rejectApplication: (activityId, applicationId) => {
    console.log('[ActivityStore] 拒绝加入申请', { activityId, applicationId });
    
    set(state => ({
      activities: state.activities.map(a => {
        if (a.id === activityId) {
          const application = a.joinApplications.find(app => app.id === applicationId);
          return {
            ...a,
            joinApplications: a.joinApplications.map(app => 
              app.id === applicationId ? { ...app, status: 'rejected' } : app
            ),
            timeline: application ? [
              ...a.timeline,
              {
                id: `t_${Date.now()}`,
                time: dayjs().format('YYYY-MM-DD HH:mm'),
                type: 'system',
                content: `${application.userName} 的加入申请被拒绝`
              }
            ] : a.timeline
          };
        }
        return a;
      })
    }));
  },

  updateEquipmentStatus: (activityId, equipmentId, status) => {
    console.log('[ActivityStore] 更新装备状态', { activityId, equipmentId, status });
    
    set(state => ({
      activities: state.activities.map(a => {
        if (a.id === activityId) {
          return {
            ...a,
            equipmentList: a.equipmentList.map(e => 
              e.equipmentId === equipmentId ? { ...e, status } : e
            )
          };
        }
        return a;
      })
    }));
  },

  checkInParticipant: (activityId, userId) => {
    console.log('[ActivityStore] 人员签到', { activityId, userId });
    
    set(state => ({
      activities: state.activities.map(a => {
        if (a.id === activityId) {
          const participant = a.participants.find(p => p.userId === userId);
          return {
            ...a,
            participants: a.participants.map(p => 
              p.userId === userId ? { 
                ...p, 
                checkedIn: true, 
                checkInTime: dayjs().format('YYYY-MM-DD HH:mm') 
              } : p
            ),
            timeline: participant ? [
              ...a.timeline,
              {
                id: `t_${Date.now()}`,
                time: dayjs().format('YYYY-MM-DD HH:mm'),
                type: 'checkin',
                userId,
                userName: participant.name,
                content: `${participant.name} 已签到`
              }
            ] : a.timeline
          };
        }
        return a;
      })
    }));
  },

  addLog: (activityId, log) => {
    console.log('[ActivityStore] 添加行程日志', { activityId });
    
    const newLog: ActivityLog = {
      ...log,
      id: `log_${Date.now()}`,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm')
    };

    const timelineItem: TimelineItem = {
      id: `t_${Date.now()}`,
      time: dayjs().format('YYYY-MM-DD HH:mm'),
      type: 'log',
      userId: log.userId,
      userName: log.userName,
      content: log.content
    };

    set(state => ({
      activities: state.activities.map(a => {
        if (a.id === activityId) {
          return {
            ...a,
            timeline: [...a.timeline, timelineItem]
          };
        }
        return a;
      })
    }));

    return newLog;
  },

  addPhoto: (activityId, userId, userName, imageUrl) => {
    console.log('[ActivityStore] 添加照片', { activityId, userId });
    
    const timelineItem: TimelineItem = {
      id: `t_${Date.now()}`,
      time: dayjs().format('YYYY-MM-DD HH:mm'),
      type: 'photo',
      userId,
      userName,
      content: `${userName} 上传了照片`,
      imageUrl
    };

    set(state => ({
      activities: state.activities.map(a => {
        if (a.id === activityId) {
          return {
            ...a,
            timeline: [...a.timeline, timelineItem]
          };
        }
        return a;
      })
    }));
  },

  addReview: (activityId, review) => {
    console.log('[ActivityStore] 添加评分', { activityId });
    
    const newReview: ActivityReview = {
      ...review,
      id: `rev_${Date.now()}`,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm')
    };

    set(state => ({
      activities: state.activities.map(a => {
        if (a.id === activityId) {
          const existingReviews = a.ratings?.reviews || [];
          const allReviews = [...existingReviews, newReview];
          const totalFacilities = allReviews.reduce((sum, r) => sum + r.facilities, 0);
          const totalRoute = allReviews.reduce((sum, r) => sum + r.route, 0);
          const count = allReviews.length;

          return {
            ...a,
            ratings: {
              facilities: Math.round((totalFacilities / count) * 10) / 10,
              route: Math.round((totalRoute / count) * 10) / 10,
              averageRating: Math.round(((totalFacilities + totalRoute) / (count * 2)) * 10) / 10,
              totalReviews: count,
              reviews: allReviews
            }
          };
        }
        return a;
      })
    }));
  },

  sendPackingReminder: (activityId) => {
    console.log('[ActivityStore] 发送打包提醒', { activityId });
    
    set(state => ({
      activities: state.activities.map(a => {
        if (a.id === activityId) {
          Taro.showToast({
            title: '已推送打包提醒',
            icon: 'success'
          });
          return {
            ...a,
            packingReminderSent: true,
            timeline: [
              ...a.timeline,
              {
                id: `t_${Date.now()}`,
                time: dayjs().format('YYYY-MM-DD HH:mm'),
                type: 'system',
                content: '已发送出发前打包提醒'
              }
            ]
          };
        }
        return a;
      })
    }));
  },

  updateActivityStatus: (activityId, status) => {
    console.log('[ActivityStore] 更新活动状态', { activityId, status });
    
    const statusText: Record<string, string> = {
      upcoming: '活动即将开始',
      ongoing: '活动进行中',
      completed: '活动已完成',
      cancelled: '活动已取消'
    };

    set(state => ({
      activities: state.activities.map(a => {
        if (a.id === activityId) {
          return {
            ...a,
            status,
            timeline: [
              ...a.timeline,
              {
                id: `t_${Date.now()}`,
                time: dayjs().format('YYYY-MM-DD HH:mm'),
                type: 'system',
                content: statusText[status]
              }
            ]
          };
        }
        return a;
      })
    }));
  }
}));

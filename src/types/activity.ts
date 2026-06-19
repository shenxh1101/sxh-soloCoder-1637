import type { Participant, JoinApplication } from './user';
import type { EquipmentListItem, EquipmentRecommendation } from './equipment';

export type ActivityStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface Activity {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  description: string;
  weather: string;
  temperature: string;
  leaderId: string;
  leaderName: string;
  leaderAvatar: string;
  status: ActivityStatus;
  participants: Participant[];
  equipmentList: EquipmentListItem[];
  equipmentRecommendation: EquipmentRecommendation;
  timeline: TimelineItem[];
  joinApplications: JoinApplication[];
  ratings?: ActivityRatings;
  logs: ActivityLog[];
  createdAt: string;
  packingReminderSent: boolean;
  itinerary: ItineraryItem[];
}

export interface ItineraryItem {
  id: string;
  day: number;
  time: string;
  content: string;
  location?: string;
}

export interface TimelineItem {
  id: string;
  time: string;
  type: 'log' | 'photo' | 'checkin' | 'system';
  userId?: string;
  userName?: string;
  content: string;
  imageUrl?: string;
}

export interface ActivityLog {
  id: string;
  activityId: string;
  userId: string;
  userName: string;
  date: string;
  content: string;
  images: string[];
  createdAt: string;
}

export interface ActivityRatings {
  facilities: number;
  route: number;
  averageRating: number;
  totalReviews: number;
  reviews: ActivityReview[];
}

export interface ActivityReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  facilities: number;
  route: number;
  comment: string;
  createdAt: string;
}

export interface CreateActivityForm {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  description: string;
  weather: string;
  temperature: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface MonthlyReport {
  month: string;
  totalActivities: number;
  totalParticipants: number;
  equipmentUsageCount: number;
  equipmentUsageFrequency: { name: string; count: number }[];
  campRatingDistribution: { rating: number; count: number }[];
  averageCampRating: number;
  newActivitiesByLeader: { name: string; count: number }[];
}

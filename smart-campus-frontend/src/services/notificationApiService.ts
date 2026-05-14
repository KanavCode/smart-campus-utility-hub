import { api } from '@/lib/axios';
import { asApiData, withServiceError } from './serviceUtils';

export interface UserNotification {
  id: number;
  event_type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: UserNotification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}

export const notificationApiService = {
  getMyNotifications: async (params?: { unread_only?: boolean; page?: number; limit?: number }): Promise<NotificationsResponse> => {
    try {
      const search = new URLSearchParams();
      if (params?.unread_only !== undefined) search.set('unread_only', String(params.unread_only));
      if (params?.page) search.set('page', String(params.page));
      if (params?.limit) search.set('limit', String(params.limit));
      const searchString = search.toString();

      const data = asApiData(await api.get(`/notifications${searchString ? `?${searchString}` : ''}`));
      return (data as { data: NotificationsResponse }).data;
    } catch (error) {
      withServiceError(error, 'Failed to load notifications');
    }
  },

  markAsRead: async (notificationId: number): Promise<void> => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
    } catch (error) {
      withServiceError(error, 'Failed to mark notification as read');
    }
  },

  markAllAsRead: async (): Promise<void> => {
    try {
      await api.patch('/notifications/read-all');
    } catch (error) {
      withServiceError(error, 'Failed to mark all notifications as read');
    }
  },
};

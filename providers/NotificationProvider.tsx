import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useEffect } from 'react';
import { Notification, supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from './AuthProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_KEY = '@kizola_notifications';

export const [NotificationProvider, useNotifications] = createContextHook(() => {
  const { user, isDemoMode } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      if (isDemoMode || !isSupabaseConfigured()) {
        // Load from AsyncStorage in demo mode
        const stored = await AsyncStorage.getItem(`${NOTIFICATIONS_KEY}_${user.id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setNotifications(parsed);
          setUnreadCount(parsed.filter((n: Notification) => !n.read).length);
        } else {
          // Create default notifications for demo
          const defaultNotifications: Notification[] = [
            {
              id: '1',
              user_id: user.id,
              title: 'Welcome to Kizola Protect',
              message: 'Your membership is now active. Explore your benefits!',
              type: 'success',
              read: false,
              created_at: new Date().toISOString(),
            },
            {
              id: '2',
              user_id: user.id,
              title: 'New Learning Resources',
              message: 'Check out our new guides on tax filing and immigration.',
              type: 'info',
              read: false,
              created_at: new Date(Date.now() - 86400000).toISOString(),
            },
          ];
          setNotifications(defaultNotifications);
          setUnreadCount(2);
          await AsyncStorage.setItem(`${NOTIFICATIONS_KEY}_${user.id}`, JSON.stringify(defaultNotifications));
        }
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const notifs = data || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isDemoMode]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      if (isDemoMode || !isSupabaseConfigured()) {
        const updated = notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        );
        setNotifications(updated);
        setUnreadCount(updated.filter(n => !n.read).length);
        await AsyncStorage.setItem(`${NOTIFICATIONS_KEY}_${user.id}`, JSON.stringify(updated));
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [user, isDemoMode, notifications]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      if (isDemoMode || !isSupabaseConfigured()) {
        const updated = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updated);
        setUnreadCount(0);
        await AsyncStorage.setItem(`${NOTIFICATIONS_KEY}_${user.id}`, JSON.stringify(updated));
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user, isDemoMode, notifications]);

  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;

    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      user_id: user.id,
      created_at: new Date().toISOString(),
    };

    try {
      if (isDemoMode || !isSupabaseConfigured()) {
        const updated = [newNotification, ...notifications];
        setNotifications(updated);
        if (!notification.read) {
          setUnreadCount(prev => prev + 1);
        }
        await AsyncStorage.setItem(`${NOTIFICATIONS_KEY}_${user.id}`, JSON.stringify(updated));
        return;
      }

      const { error } = await supabase.from('notifications').insert(newNotification);
      if (error) throw error;

      setNotifications(prev => [newNotification, ...prev]);
      if (!notification.read) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  }, [user, isDemoMode, notifications]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      if (isDemoMode || !isSupabaseConfigured()) {
        const updated = notifications.filter(n => n.id !== notificationId);
        setNotifications(updated);
        setUnreadCount(updated.filter(n => !n.read).length);
        await AsyncStorage.setItem(`${NOTIFICATIONS_KEY}_${user.id}`, JSON.stringify(updated));
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      const notif = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notif && !notif.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [user, isDemoMode, notifications]);

  useEffect(() => {
    if (user) {
      loadNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    deleteNotification,
  };
});

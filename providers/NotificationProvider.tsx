import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useEffect } from 'react';
import { Notification, supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from './AuthProvider';
import { getSecureItem, setSecureItem, SECURE_KEYS } from '@/lib/secureStorage';
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
        const stored = await getSecureItem<Notification[]>(SECURE_KEYS.NOTIFICATIONS(user.id));
        if (stored) {
          setNotifications(stored);
          setUnreadCount(stored.filter((n: Notification) => !n.read).length);
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
          await setSecureItem(SECURE_KEYS.NOTIFICATIONS(user.id), defaultNotifications);
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
        setNotifications(prev => {
          const updated = prev.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          );
          return updated;
        });
        // Recalculate unreadCount after state update
        setNotifications(prev => {
          setUnreadCount(prev.filter(n => !n.read).length);
          return prev;
        });
        // Update secure storage
        setNotifications(prev => {
          setSecureItem(SECURE_KEYS.NOTIFICATIONS(user.id), prev);
          return prev;
        });
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => {
        const updated = prev.map(n => n.id === notificationId ? { ...n, read: true } : n);
        return updated;
      });
      // Recalculate unreadCount after state update
      setNotifications(prev => {
        setUnreadCount(prev.filter(n => !n.read).length);
        return prev;
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [user, isDemoMode]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      if (isDemoMode || !isSupabaseConfigured()) {
        setNotifications(prev => {
          const updated = prev.map(n => ({ ...n, read: true }));
          return updated;
        });
        setNotifications(prev => {
          setUnreadCount(0);
          setSecureItem(SECURE_KEYS.NOTIFICATIONS(user.id), prev);
          return prev;
        });
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => {
        const updated = prev.map(n => ({ ...n, read: true }));
        return updated;
      });
      setNotifications(prev => {
        setUnreadCount(0);
        return prev;
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user, isDemoMode]);

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
        setNotifications(prev => {
          const updated = [newNotification, ...prev];
          if (!notification.read) {
            setUnreadCount(c => c + 1);
          }
          setSecureItem(SECURE_KEYS.NOTIFICATIONS(user.id), updated);
          return updated;
        });
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
  }, [user, isDemoMode]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      if (isDemoMode || !isSupabaseConfigured()) {
        setNotifications(prev => {
          const updated = prev.filter(n => n.id !== notificationId);
          setUnreadCount(updated.filter(n => !n.read).length);
          setSecureItem(SECURE_KEYS.NOTIFICATIONS(user.id), updated);
          return updated;
        });
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => {
        const updated = prev.filter(n => n.id !== notificationId);
        setUnreadCount(updated.filter(n => !n.read).length);
        return updated;
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [user, isDemoMode]);

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

// hooks/useNotifications.ts
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { NotificationData } from '../lib/deletionRequests';

export const useNotifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const notificationsRef = useRef<NotificationData[]>([]);
    useEffect(() => {
        notificationsRef.current = notifications;
    }, [notifications]);
    // Load notifications
    const loadNotifications = async () => {
        if (!user?.email) return;

        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_email', user.email)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Error loading notifications:', error);
                setError(error.message);
                return;
            }

            setNotifications(data || []);
            setUnreadCount((data || []).filter(n => !n.read).length);
            setError(null);
        } catch (err) {
            console.error('Unexpected error loading notifications:', err);
            setError('Failed to load notifications');
        } finally {
            setIsLoading(false);
        }
    };

    // Mark notification as read
    const markAsRead = async (notificationId: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', notificationId);

            if (error) {
                console.error('Error marking notification as read:', error);
                return;
            }

            // Update local state
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId ? { ...n, read: true } : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        if (!user?.email) return;

        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_email', user.email)
                .eq('read', false);

            if (error) {
                console.error('Error marking all notifications as read:', error);
                return;
            }

            // Update local state
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
        }
    };

    // Delete notification
    const deleteNotification = async (notificationId: string) => {
        try {
            // First, delete from database
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', notificationId);

            if (error) {
                console.error('Error deleting notification:', error);
                return;
            }

            // Then update local state (this will happen automatically via real-time subscription,
            // but we do it here for immediate feedback)
            const deletedNotification = notifications.find(n => n.id === notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));

            if (deletedNotification && !deletedNotification.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    };
    // Set up real-time subscription
    // Set up real-time subscription
    useEffect(() => {
        if (!user?.email) return;

        loadNotifications();

        // Add a ref to track if subscription is active
        let subscriptionActive = true;

        const subscription = supabase
            .channel(`notifications-${user.email}-${Math.random()}`) // Add random number for uniqueness
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_email=eq.${user.email}`
                },
                (payload) => {
                    if (!subscriptionActive) return; // Ignore if subscription is no longer active

                    console.log('Notification change received:', payload);

                    if (payload.eventType === 'INSERT') {
                        const newNotification = payload.new as NotificationData;
                        setNotifications(prev => [newNotification, ...prev]);
                        if (!newNotification.read) {
                            setUnreadCount(prev => prev + 1);
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        const updatedNotification = payload.new as NotificationData;
                        setNotifications(prev =>
                            prev.map(n =>
                                n.id === updatedNotification.id ? updatedNotification : n
                            )
                        );
                    } else if (payload.eventType === 'DELETE') {
                        const deletedId = payload.old.id;

                        // Use ref to get current notifications instead of stale closure
                        const deletedNotification = notificationsRef.current.find(n => n.id === deletedId);

                        // Update notifications list
                        setNotifications(prev => prev.filter(n => n.id !== deletedId));

                        // Update unread count if the deleted notification was unread
                        if (deletedNotification && !deletedNotification.read) {
                            setUnreadCount(prev => Math.max(0, prev - 1));
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            subscriptionActive = false;
            subscription.unsubscribe();
        };
    }, [user?.email]);

    return {
        notifications,
        unreadCount,
        isLoading,
        error,
        loadNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification
    };
};

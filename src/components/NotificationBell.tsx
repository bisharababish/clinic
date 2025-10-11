// components/NotificationBell.tsx
import React, { useState } from 'react';
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuSeparator,
    // Removed DropdownMenuHeader
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '../hooks/useNotifications';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../lib/supabase';

const NotificationBell: React.FC = () => {
    const {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification
    } = useNotifications();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [isOpen, setIsOpen] = useState(false);
    const [arabicNamesCache, setArabicNamesCache] = useState<Record<string, string>>({});

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            default: return 'ℹ️';
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'success': return 'text-green-600';
            case 'error': return 'text-red-600';
            case 'warning': return 'text-yellow-600';
            default: return 'text-blue-600';
        }
    };

    // Function to fetch Arabic name for a user by email
    const fetchArabicName = async (email: string): Promise<string | null> => {
        if (arabicNamesCache[email]) {
            return arabicNamesCache[email];
        }

        try {
            const { data, error } = await supabase
                .from('userinfo')
                .select('arabic_username_a, arabic_username_d')
                .eq('user_email', email)
                .single();

            if (error || !data) {
                return null;
            }

            const arabicName = [data.arabic_username_a, data.arabic_username_d]
                .filter(name => name && name.trim())
                .join(' ')
                .trim();

            if (arabicName) {
                setArabicNamesCache(prev => ({ ...prev, [email]: arabicName }));
                return arabicName;
            }

            return null;
        } catch (error) {
            console.error('Error fetching Arabic name:', error);
            return null;
        }
    };

    // Function to translate notification content
    const translateNotificationContent = (title: string, message: string) => {
        if (isRTL) {
            // Translate specific notification types
            if (title === 'New Deletion Request') {
                const translatedTitle = t('deletionRequest.newDeletionRequest');

                // Parse the message to extract email, english name, and arabic name
                const messageMatch = message.match(/(.+) has requested to delete user: (.+)\|\|\|(.+)/);
                if (messageMatch) {
                    const [, email, englishName, arabicName] = messageMatch;
                    // Use Arabic name if available and not empty, otherwise use English name
                    const displayName = arabicName && arabicName.trim() ? arabicName : englishName;
                    const translatedMessage = t('deletionRequest.deletionRequestMessage', {
                        email,
                        userName: displayName
                    });
                    return { title: translatedTitle, message: translatedMessage };
                }

                // Fallback for old format without Arabic name - try to get Arabic name from user data
                const fallbackMatch = message.match(/(.+) has requested to delete user: (.+)/);
                if (fallbackMatch) {
                    const [, email, userName] = fallbackMatch;
                    // For old notifications, we'll use the English name for now
                    // In the future, we could fetch the Arabic name from the database
                    const translatedMessage = t('deletionRequest.deletionRequestMessage', {
                        email,
                        userName
                    });
                    return { title: translatedTitle, message: translatedMessage };
                }
            }
        }

        // Return original content if no translation needed or available
        return { title, message };
    };

    const handleNotificationClick = (notificationId: string, isRead: boolean) => {
        if (!isRead) {
            markAsRead(notificationId);
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className={`w-80 max-h-96 overflow-y-auto ${isRTL ? 'text-right' : 'text-left'} ${isRTL ? 'rtl' : ''}`}
                align={isRTL ? 'start' : 'end'}
            >
                <div className="flex items-center justify-between p-3 border-b">
                    <h3 className="font-semibold">
                        {isRTL ? 'الإشعارات' : 'Notifications'}
                    </h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="h-6 px-2 text-xs"
                        >
                            <CheckCheck className="h-3 w-3 mr-1" />
                            {t('notifications.markAllRead')}
                        </Button>
                    )}
                </div>

                {isLoading ? (
                    <div className="p-4 text-center text-gray-500">
                        {isRTL ? 'جاري التحميل...' : 'Loading...'}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        {t('notifications.noNotifications')}
                    </div>
                ) : (
                    <>
                        {notifications.slice(0, 10).map((notification) => {
                            const translatedContent = translateNotificationContent(notification.title, notification.message);
                            return (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={`p-3 cursor-pointer hover:bg-gray-50 ${!notification.read ?
                                        `bg-blue-50 ${isRTL ? 'border-r-4 border-r-blue-500' : 'border-l-4 border-l-blue-500'}` : ''
                                        }`}
                                    onClick={() => handleNotificationClick(notification.id, notification.read)}
                                >
                                    <div className={`flex items-start w-full ${isRTL ? 'flex-row-reverse' : 'justify-between'}`}>
                                        <div className="flex-1">
                                            <div className={`flex items-center gap-2 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                <span className="text-sm">
                                                    {getNotificationIcon(notification.type)}
                                                </span>
                                                <span
                                                    className={`font-medium text-sm ${getNotificationColor(notification.type)}`}
                                                >
                                                    {translatedContent.title}
                                                </span>
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-600 mb-1">
                                                {translatedContent.message}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {formatDistanceToNow(new Date(notification.created_at), {
                                                    addSuffix: true
                                                })}
                                            </p>
                                        </div>
                                        <div className={`flex items-center gap-1 ${isRTL ? 'mr-2' : 'ml-2'}`}>
                                            {!notification.read && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markAsRead(notification.id);
                                                    }}
                                                    className="h-6 w-6 p-0"
                                                >
                                                    <Check className="h-3 w-3" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification(notification.id);
                                                }}
                                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            );
                        })}

                        {notifications.length > 10 && (
                            <>
                                <DropdownMenuSeparator />
                                <div className="p-2 text-center">
                                    <span className="text-xs text-gray-500">
                                        {t('notifications.showingFirst', { count: 10 })}
                                    </span>
                                </div>
                            </>
                        )}
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationBell;
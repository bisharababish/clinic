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
                            {isRTL ? 'وضع علامة قراءة على الكل' : 'Mark all read'}
                        </Button>
                    )}
                </div>

                {isLoading ? (
                    <div className="p-4 text-center text-gray-500">
                        {isRTL ? 'جاري التحميل...' : 'Loading...'}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        {isRTL ? 'لا توجد إشعارات' : 'No notifications'}
                    </div>
                ) : (
                    <>
                        {notifications.slice(0, 10).map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={`p-3 cursor-pointer hover:bg-gray-50 ${!notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                    }`}
                                onClick={() => handleNotificationClick(notification.id, notification.read)}
                            >
                                <div className="flex items-start justify-between w-full">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm">
                                                {getNotificationIcon(notification.type)}
                                            </span>
                                            <span
                                                className={`font-medium text-sm ${getNotificationColor(notification.type)}`}
                                            >
                                                {notification.title}
                                            </span>
                                            {!notification.read && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600 mb-1">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {formatDistanceToNow(new Date(notification.created_at), {
                                                addSuffix: true
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 ml-2">
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
                        ))}

                        {notifications.length > 10 && (
                            <>
                                <DropdownMenuSeparator />
                                <div className="p-2 text-center">
                                    <span className="text-xs text-gray-500">
                                        {isRTL ? 'عرض أول 10 إشعارات' : 'Showing first 10 notifications'}
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
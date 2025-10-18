import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Input } from './ui/input';
import { useToast } from '../hooks/use-toast';
import {
    Calendar,
    Clock,
    User,
    RefreshCw,
    Search,
    AlertCircle,
    CheckCircle,
    XCircle,
    Edit3,
    Trash2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AppointmentChangeLog {
    id: string;
    patient_id: string;
    patient_name: string;
    patient_email: string;
    original_appointment_id: string;
    action_type: 'reschedule' | 'cancel' | 'delete';
    original_date: string;
    original_time: string;
    new_date: string | null;
    new_time: string | null;
    original_doctor_name: string;
    original_clinic_name: string;
    reason: string | null;
    admin_notified: boolean;
    created_at: string;
    updated_at: string;
}

const AppointmentChangeLogs: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { toast } = useToast();

    const [logs, setLogs] = useState<AppointmentChangeLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<AppointmentChangeLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState<string>('all');

    // Load appointment change logs
    const loadLogs = useCallback(async () => {
        try {
            setIsLoading(true);

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                console.error('No valid session found');
                return;
            }

            const { data: logsData, error } = await supabase
                .from('appointment_change_logs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching change logs:', error);
                throw error;
            }

            setLogs(logsData || []);
            setFilteredLogs(logsData || []);
        } catch (error) {
            console.error('Error loading change logs:', error);
            toast({
                title: isRTL ? 'خطأ' : 'Error',
                description: isRTL ? 'خطأ في تحميل سجل التغييرات' : 'Error loading change logs',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [isRTL, toast]);

    // Load logs on mount
    useEffect(() => {
        loadLogs();
    }, [loadLogs]);

    // Filter logs based on search and action type
    useEffect(() => {
        let filtered = logs;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(log =>
                log.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.patient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.original_doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.original_clinic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (log.reason && log.reason.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Action filter
        if (actionFilter !== 'all') {
            filtered = filtered.filter(log => log.action_type === actionFilter);
        }

        setFilteredLogs(filtered);
    }, [logs, searchTerm, actionFilter]);

    // Mark as notified
    const markAsNotified = async (logId: string) => {
        try {
            const { error } = await supabase
                .from('appointment_change_logs')
                .update({ admin_notified: true })
                .eq('id', logId);

            if (error) throw error;

            toast({
                title: isRTL ? 'تم التحديث' : 'Updated',
                description: isRTL ? 'تم تمييز السجل كمقروء' : 'Log marked as notified',
            });

            loadLogs();
        } catch (error) {
            console.error('Error marking as notified:', error);
            toast({
                title: isRTL ? 'خطأ' : 'Error',
                description: isRTL ? 'خطأ في تحديث السجل' : 'Error updating log',
                variant: 'destructive',
            });
        }
    };

    // Get action badge variant
    const getActionBadgeVariant = (actionType: string) => {
        switch (actionType) {
            case 'reschedule':
                return 'default';
            case 'cancel':
                return 'destructive';
            case 'delete':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    // Get action icon
    const getActionIcon = (actionType: string) => {
        switch (actionType) {
            case 'reschedule':
                return <Edit3 className="h-4 w-4 text-blue-600" />;
            case 'cancel':
                return <XCircle className="h-4 w-4 text-red-600" />;
            case 'delete':
                return <Trash2 className="h-4 w-4 text-red-600" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-600" />;
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            calendar: 'gregory' // Force Gregorian calendar
        });
    };

    if (isLoading) {
        return (
            <Card dir={isRTL ? 'rtl' : 'ltr'}>
                <CardHeader>
                    <CardTitle className={`flex items-center gap-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <Calendar className="h-5 w-5" />
                        {isRTL ? 'سجل تغييرات المواعيد' : 'Appointment Change Logs'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <span className="ml-2">{isRTL ? 'جاري التحميل...' : 'Loading...'}</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card dir={isRTL ? 'rtl' : 'ltr'}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className={`flex items-center gap-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <Calendar className="h-5 w-5" />
                        {isRTL ? 'سجل تغييرات المواعيد' : 'Appointment Change Logs'} ({filteredLogs.length})
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadLogs}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        {isRTL ? 'تحديث' : 'Refresh'}
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex gap-4 mt-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={isRTL ? 'البحث في السجلات...' : 'Search logs...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                            dir={isRTL ? 'rtl' : 'ltr'}
                        />
                    </div>
                    <select
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        className="px-3 py-2 border rounded-md"
                        dir={isRTL ? 'rtl' : 'ltr'}
                    >
                        <option value="all">{isRTL ? 'جميع الإجراءات' : 'All Actions'}</option>
                        <option value="reschedule">{isRTL ? 'تغيير الموعد' : 'Reschedule'}</option>
                        <option value="cancel">{isRTL ? 'إلغاء' : 'Cancel'}</option>
                        <option value="delete">{isRTL ? 'حذف' : 'Delete'}</option>
                    </select>
                </div>
            </CardHeader>

            <CardContent>
                {filteredLogs.length === 0 ? (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {isRTL ? 'لا توجد تغييرات في المواعيد' : 'No appointment changes found'}
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="space-y-4">
                        {filteredLogs.map((log) => (
                            <div
                                key={log.id}
                                className={`p-4 border rounded-lg transition-colors ${!log.admin_notified ? 'bg-yellow-50 border-yellow-200' : 'hover:bg-muted/50'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {getActionIcon(log.action_type)}
                                            <h3 className="font-semibold text-lg">{log.patient_name}</h3>
                                            <Badge variant={getActionBadgeVariant(log.action_type)}>
                                                {isRTL ?
                                                    (log.action_type === 'reschedule' ? 'تغيير موعد' :
                                                        log.action_type === 'cancel' ? 'إلغاء' :
                                                            log.action_type === 'delete' ? 'حذف' : log.action_type) :
                                                    log.action_type
                                                }
                                            </Badge>
                                            {!log.admin_notified && (
                                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                                    {isRTL ? 'جديد' : 'New'}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                Dr. {log.original_doctor_name} - {log.original_clinic_name}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatDate(log.created_at)}
                                            </div>
                                        </div>

                                        <div className="mt-2 space-y-1">
                                            <div className="text-sm">
                                                <strong>{isRTL ? 'الموعد الأصلي' : 'Original'}:</strong> {log.original_date} at {log.original_time}
                                            </div>
                                            {log.new_date && log.new_time && (
                                                <div className="text-sm">
                                                    <strong>{isRTL ? 'الموعد الجديد' : 'New'}:</strong> {log.new_date} at {log.new_time}
                                                </div>
                                            )}
                                            {log.reason && (
                                                <div className="text-sm">
                                                    <strong>{isRTL ? 'السبب' : 'Reason'}:</strong> {log.reason}
                                                </div>
                                            )}
                                            <div className="text-xs text-muted-foreground">
                                                📧 {log.patient_email}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        {!log.admin_notified && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => markAsNotified(log.id)}
                                                className="text-green-600 hover:text-green-700"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                {isRTL ? 'مؤكد' : 'Mark as Read'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AppointmentChangeLogs;

// pages/api/admin/SettingsManagement.tsx
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Database,
    Layers,
    Settings,
    Globe,
    Mail,
    Bell,
    Shield,
    CreditCard,
    Calendar,
    RefreshCw,
    Download,
    Upload,
    FileText,
    Printer,
    User,
    Users,
    Building
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface SystemSettings {
    setting_name: string;
    setting_value: string;
    setting_type: 'text' | 'number' | 'boolean' | 'select' | 'textarea' | 'color';
    setting_group: string;
    setting_options?: string[]; // For select type settings
    setting_description?: string;
}

interface SettingsManagementProps {
    systemSettings?: SystemSettings[];
    setSystemSettings?: React.Dispatch<React.SetStateAction<SystemSettings[]>>;
    isLoading?: boolean;
    setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>;
    loadSystemSettings?: () => Promise<void>;
    logActivity?: (action: string, user: string, details: string, status: 'success' | 'failed' | 'pending') => Promise<void>;
    userEmail?: string;
}

const SettingsManagement: React.FC<SettingsManagementProps> = ({
    systemSettings: propSystemSettings,
    setSystemSettings: propSetSystemSettings,
    isLoading: propIsLoading,
    setIsLoading: propSetIsLoading,
    loadSystemSettings: propLoadSystemSettings,
    logActivity: propLogActivity,
    userEmail
}) => {
    const { toast } = useToast();
    const [systemSettings, setSystemSettings] = useState<SystemSettings[]>(propSystemSettings || []);
    const [isLoading, setIsLoading] = useState(propIsLoading || false);
    const [settingsChanged, setSettingsChanged] = useState(false);
    const [activeTab, setActiveTab] = useState("general");
    const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [backupProgress, setBackupProgress] = useState(0);
    const [isPerformingBackup, setIsPerformingBackup] = useState(false);

    // Default settings if none exist
    const defaultSettings: SystemSettings[] = [
        // General Settings
        { setting_name: "clinic_name", setting_value: "Bethlehem Med Center", setting_type: "text", setting_group: "general", setting_description: "The name of your medical center" },
        { setting_name: "clinic_address", setting_value: "123 Healthcare Avenue, Bethlehem", setting_type: "text", setting_group: "general", setting_description: "The physical address of your clinic" },
        { setting_name: "clinic_phone", setting_value: "+123 456 7890", setting_type: "text", setting_group: "general", setting_description: "Main contact number" },
        { setting_name: "clinic_email", setting_value: "info@bethlehemclinic.com", setting_type: "text", setting_group: "general", setting_description: "Main contact email" },
        { setting_name: "clinic_logo", setting_value: "/logo.png", setting_type: "text", setting_group: "general", setting_description: "Path to clinic logo image" },

        // Appointment Settings
        { setting_name: "appointment_duration", setting_value: "30", setting_type: "number", setting_group: "appointments", setting_description: "Default appointment duration in minutes" },
        { setting_name: "min_appointment_notice", setting_value: "24", setting_type: "number", setting_group: "appointments", setting_description: "Minimum hours of notice required for appointments" },
        { setting_name: "max_daily_appointments", setting_value: "50", setting_type: "number", setting_group: "appointments", setting_description: "Maximum appointments allowed per day" },
        { setting_name: "allow_weekend_appointments", setting_value: "false", setting_type: "boolean", setting_group: "appointments", setting_description: "Allow scheduling appointments on weekends" },
        { setting_name: "appointment_reminder_time", setting_value: "24", setting_type: "number", setting_group: "appointments", setting_description: "Hours before appointment to send reminder" },

        // Notification Settings
        { setting_name: "email_notifications", setting_value: "true", setting_type: "boolean", setting_group: "notifications", setting_description: "Send email notifications" },
        { setting_name: "sms_notifications", setting_value: "true", setting_type: "boolean", setting_group: "notifications", setting_description: "Send SMS notifications" },
        { setting_name: "notification_email_template", setting_value: "Default email template", setting_type: "textarea", setting_group: "notifications", setting_description: "Template for email notifications" },

        // Payment Settings
        { setting_name: "currency", setting_value: "₪", setting_type: "text", setting_group: "payments", setting_description: "Currency symbol" },
        { setting_name: "payment_methods", setting_value: "Cash,Credit Card,Insurance", setting_type: "text", setting_group: "payments", setting_description: "Comma-separated list of accepted payment methods" },
        { setting_name: "tax_rate", setting_value: "17", setting_type: "number", setting_group: "payments", setting_description: "Default tax rate percentage" },
        { setting_name: "allow_partial_payments", setting_value: "true", setting_type: "boolean", setting_group: "payments", setting_description: "Allow partial payments for services" },

        // Security Settings
        { setting_name: "session_timeout", setting_value: "30", setting_type: "number", setting_group: "security", setting_description: "Session timeout in minutes" },
        { setting_name: "require_2fa", setting_value: "false", setting_type: "boolean", setting_group: "security", setting_description: "Require two-factor authentication" },
        { setting_name: "password_expiry_days", setting_value: "90", setting_type: "number", setting_group: "security", setting_description: "Password expiry in days" },
        { setting_name: "login_attempts_before_lockout", setting_value: "5", setting_type: "number", setting_group: "security", setting_description: "Failed login attempts before account lockout" },

        // Appearance Settings
        { setting_name: "primary_color", setting_value: "#3b82f6", setting_type: "color", setting_group: "appearance", setting_description: "Primary theme color" },
        { setting_name: "secondary_color", setting_value: "#10b981", setting_type: "color", setting_group: "appearance", setting_description: "Secondary theme color" },
        { setting_name: "font_size", setting_value: "medium", setting_type: "select", setting_group: "appearance", setting_options: ["small", "medium", "large"], setting_description: "Default font size" },
        { setting_name: "dark_mode", setting_value: "false", setting_type: "boolean", setting_group: "appearance", setting_description: "Enable dark mode" },

        // System Settings
        { setting_name: "system_language", setting_value: "en", setting_type: "select", setting_group: "system", setting_options: ["en", "ar", "he"], setting_description: "Default system language" },
        { setting_name: "timezone", setting_value: "Asia/Jerusalem", setting_type: "text", setting_group: "system", setting_description: "System timezone" },
        { setting_name: "date_format", setting_value: "DD/MM/YYYY", setting_type: "select", setting_group: "system", setting_options: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"], setting_description: "Date format" },
        { setting_name: "time_format", setting_value: "24h", setting_type: "select", setting_group: "system", setting_options: ["12h", "24h"], setting_description: "Time format" },
        { setting_name: "auto_backup", setting_value: "true", setting_type: "boolean", setting_group: "system", setting_description: "Automatically backup the database daily" },
    ];

    // Initialize with default settings if none exist
    useEffect(() => {
        if ((propSystemSettings || systemSettings).length === 0) {
            // If no settings, load defaults
            updateSystemSettings(defaultSettings);
            setSettingsChanged(true);
        }
    }, [propSystemSettings, systemSettings]);

    // Use either the prop functions or local ones
    const updateSystemSettings = (newSettings: SystemSettings[] | ((prev: SystemSettings[]) => SystemSettings[])) => {
        if (propSetSystemSettings) {
            propSetSystemSettings(newSettings);
        } else {
            setSystemSettings(newSettings);
        }
    };

    const updateIsLoading = (loading: boolean) => {
        if (propSetIsLoading) {
            propSetIsLoading(loading);
        } else {
            setIsLoading(loading);
        }
    };

    // Load settings from database if needed
    const loadSystemSettings = async () => {
        if (propLoadSystemSettings) {
            await propLoadSystemSettings();
            return;
        }

        console.log('Loading system settings...');
        try {
            updateIsLoading(true);

            // Query the system_settings table
            const { data, error } = await supabase
                .from('system_settings')
                .select('*')
                .order('setting_name', { ascending: true });

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            if (data && data.length > 0) {
                updateSystemSettings(data);
                console.log('System settings loaded:', data.length);
            } else {
                // No settings in database, use defaults
                console.log('No settings found in database, using defaults');
                updateSystemSettings(defaultSettings);
                setSettingsChanged(true); // Mark as changed to prompt saving
            }
        } catch (error) {
            console.error('Error loading system settings:', error);
            toast({
                title: "Error",
                description: "Failed to load system settings. Using defaults.",
                variant: "destructive",
            });
            // Use defaults on error
            updateSystemSettings(defaultSettings);
        } finally {
            updateIsLoading(false);
        }
    };

    // Settings management
    const handleSettingChange = (name: string, value: string) => {
        updateSystemSettings(prev => prev.map(setting =>
            setting.setting_name === name ? { ...setting, setting_value: value } : setting
        ));
        setSettingsChanged(true);
    };

    const handleSaveSettings = async () => {
        try {
            updateIsLoading(true);

            // Get current settings
            const currentSettings = propSystemSettings || systemSettings;

            // Prepare updates
            const updates = currentSettings.map(setting => ({
                setting_name: setting.setting_name,
                setting_value: setting.setting_value,
                setting_type: setting.setting_type,
                setting_group: setting.setting_group,
                setting_description: setting.setting_description,
                setting_options: setting.setting_options ? setting.setting_options.join(',') : null,
                updated_at: new Date().toISOString()
            }));

            // Update in database using upsert
            const { error } = await supabase
                .from('system_settings')
                .upsert(updates);

            if (error) {
                console.error("Error saving settings:", error);
                toast({
                    title: "Error",
                    description: "Failed to save settings.",
                    variant: "destructive",
                });
                return;
            }

            // Log the activity
            await logActivity(
                "System Settings Updated",
                userEmail || "admin",
                "System settings were updated",
                "success"
            );

            toast({
                title: "Success",
                description: "Settings saved successfully.",
            });

            setSettingsChanged(false);
        } catch (error) {
            console.error("Error saving settings:", error);
            toast({
                title: "Error",
                description: "Failed to save settings.",
                variant: "destructive",
            });
        } finally {
            updateIsLoading(false);
        }
    };

    // Simulate database backup
    const handleBackupDatabase = async () => {
        setIsPerformingBackup(true);
        setBackupProgress(0);

        // Simulate backup process
        const interval = setInterval(() => {
            setBackupProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsPerformingBackup(false);
                    return 100;
                }
                return prev + 10;
            });
        }, 300);

        // Log the activity
        await logActivity(
            "Database Backup",
            userEmail || "admin",
            "Database backup was initiated",
            "success"
        );

        setTimeout(() => {
            toast({
                title: "Backup Complete",
                description: "Database backup completed successfully.",
            });
            setIsBackupDialogOpen(false);
            clearInterval(interval);
            setIsPerformingBackup(false);
            setBackupProgress(100);
        }, 3500);
    };

    // Activity logging
    const logActivity = async (action: string, user: string, details: string, status: 'success' | 'failed' | 'pending') => {
        if (propLogActivity) {
            await propLogActivity(action, user, details, status);
            return;
        }

        // Insert into the database
        try {
            const { error } = await supabase
                .from('activity_log')
                .insert({
                    action: action,
                    user_email: user,
                    details: details,
                    status: status
                });

            if (error) {
                console.error('Error logging activity:', error);
            }
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    };

    // Get current settings
    const currentSettings = propSystemSettings || systemSettings;

    // Group settings by category
    const settingsByGroup: Record<string, SystemSettings[]> = currentSettings.reduce((acc, setting) => {
        const group = setting.setting_group || 'general';
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(setting);
        return acc;
    }, {} as Record<string, SystemSettings[]>);

    // Define setting group icons and titles
    const groupMeta = {
        general: { icon: <Building className="h-5 w-5" />, title: "Clinic Information" },
        appointments: { icon: <Calendar className="h-5 w-5" />, title: "Appointment Settings" },
        notifications: { icon: <Bell className="h-5 w-5" />, title: "Notification Settings" },
        payments: { icon: <CreditCard className="h-5 w-5" />, title: "Payment Settings" },
        security: { icon: <Shield className="h-5 w-5" />, title: "Security Settings" },
        appearance: { icon: <Globe className="h-5 w-5" />, title: "Appearance & Localization" },
        system: { icon: <Settings className="h-5 w-5" />, title: "System Settings" },
    };

    return (
        <div className="space-y-6">
            {/* Header with title and save button */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
                    <p className="text-muted-foreground">
                        Configure global system settings and preferences
                    </p>
                </div>
                <Button
                    onClick={handleSaveSettings}
                    disabled={!settingsChanged || isLoading}
                    className="flex items-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        "Save Changes"
                    )}
                </Button>
            </div>

            {/* Unsaved changes alert */}
            {settingsChanged && (
                <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        You have unsaved changes. Click "Save Changes" to apply them.
                    </AlertDescription>
                </Alert>
            )}

            {/* Settings tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-7 w-full">
                    <TabsTrigger value="general" className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        <span className="hidden md:inline">General</span>
                    </TabsTrigger>
                    <TabsTrigger value="appointments" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="hidden md:inline">Appointments</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <span className="hidden md:inline">Notifications</span>
                    </TabsTrigger>
                    <TabsTrigger value="payments" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span className="hidden md:inline">Payments</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span className="hidden md:inline">Security</span>
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span className="hidden md:inline">Appearance</span>
                    </TabsTrigger>
                    <TabsTrigger value="system" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <span className="hidden md:inline">System</span>
                    </TabsTrigger>
                </TabsList>

                {/* Create tab content for each settings group */}
                {Object.entries(settingsByGroup).map(([group, settings]) => (
                    <TabsContent key={group} value={group} className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            {groupMeta[group as keyof typeof groupMeta]?.icon}
                            <h3 className="text-xl font-semibold">{groupMeta[group as keyof typeof groupMeta]?.title || group}</h3>
                        </div>

                        {settings.map(setting => (
                            <div key={setting.setting_name} className="border-b pb-6 space-y-2">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                    <div className="flex-1">
                                        <Label htmlFor={setting.setting_name} className="text-base font-medium">
                                            {setting.setting_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </Label>
                                        {setting.setting_description && (
                                            <p className="text-sm text-gray-500">{setting.setting_description}</p>
                                        )}
                                    </div>

                                    {/* Different input types based on setting type */}
                                    <div className="w-full md:w-auto">
                                        {setting.setting_type === 'boolean' ? (
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id={setting.setting_name}
                                                    checked={setting.setting_value === 'true'}
                                                    onCheckedChange={(checked) =>
                                                        handleSettingChange(setting.setting_name, checked.toString())
                                                    }
                                                />
                                                <Label htmlFor={setting.setting_name} className="text-sm font-medium">
                                                    {setting.setting_value === 'true' ? 'Enabled' : 'Disabled'}
                                                </Label>
                                            </div>
                                        ) : setting.setting_type === 'select' ? (
                                            <Select
                                                value={setting.setting_value}
                                                onValueChange={(value) =>
                                                    handleSettingChange(setting.setting_name, value)
                                                }
                                            >
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {setting.setting_options?.map(option => (
                                                        <SelectItem key={option} value={option}>
                                                            {option.replace(/\b\w/g, l => l.toUpperCase())}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : setting.setting_type === 'textarea' ? (
                                            <Textarea
                                                id={setting.setting_name}
                                                value={setting.setting_value}
                                                onChange={(e) =>
                                                    handleSettingChange(setting.setting_name, e.target.value)
                                                }
                                                className="w-full md:w-[300px] min-h-[100px]"
                                            />
                                        ) : setting.setting_type === 'color' ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    id={setting.setting_name}
                                                    value={setting.setting_value}
                                                    onChange={(e) =>
                                                        handleSettingChange(setting.setting_name, e.target.value)
                                                    }
                                                    className="w-10 h-10 rounded-md cursor-pointer"
                                                />
                                                <Input
                                                    value={setting.setting_value}
                                                    onChange={(e) =>
                                                        handleSettingChange(setting.setting_name, e.target.value)
                                                    }
                                                    className="w-[120px]"
                                                />
                                            </div>
                                        ) : (
                                            <Input
                                                id={setting.setting_name}
                                                type={setting.setting_type === 'number' ? 'number' : 'text'}
                                                value={setting.setting_value}
                                                onChange={(e) =>
                                                    handleSettingChange(setting.setting_name, e.target.value)
                                                }
                                                className="w-full md:w-[200px]"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Special system tab content with database actions */}
                        {group === 'system' && (
                            <div className="pt-6 space-y-6">
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold mb-4">Database Actions</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base">Database Backup</CardTitle>
                                                <CardDescription>Create a backup of your database</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-gray-500 mb-4">
                                                    Create a full backup of your clinic database for safekeeping
                                                </p>
                                            </CardContent>
                                            <CardFooter>
                                                <Dialog open={isBackupDialogOpen} onOpenChange={setIsBackupDialogOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" className="w-full">
                                                            <Database className="h-4 w-4 mr-2" />
                                                            Backup Now
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Database Backup</DialogTitle>
                                                            <DialogDescription>
                                                                Create a full backup of your clinic database
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        {isPerformingBackup ? (
                                                            <div className="space-y-4 py-4">
                                                                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-blue-500 rounded-full"
                                                                        style={{ width: `${backupProgress}%` }}
                                                                    ></div>
                                                                </div>
                                                                <p className="text-center">
                                                                    Backing up database... {backupProgress}%
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4 py-4">
                                                                <p>
                                                                    This will create a complete backup of your clinic database.
                                                                    The backup can be used to restore your data in case of
                                                                    an emergency.
                                                                </p>
                                                                <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                                                                    <p className="text-amber-800 text-sm">
                                                                        Performing a backup may temporarily affect system
                                                                        performance. It's recommended to run backups during
                                                                        off-peak hours.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <DialogFooter>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => setIsBackupDialogOpen(false)}
                                                                disabled={isPerformingBackup}
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                onClick={handleBackupDatabase}
                                                                disabled={isPerformingBackup}
                                                            >
                                                                {isPerformingBackup ? (
                                                                    <>
                                                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                                        Backing Up...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Database className="h-4 w-4 mr-2" />
                                                                        Start Backup
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </CardFooter>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base">Import Data</CardTitle>
                                                <CardDescription>Import data from external sources</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-gray-500 mb-4">
                                                    Import patient records, appointments, or other data
                                                </p>
                                            </CardContent>
                                            <CardFooter>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" className="w-full">
                                                            <Upload className="h-4 w-4 mr-2" />
                                                            Import Data
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Import Data</DialogTitle>
                                                            <DialogDescription>
                                                                Import data from CSV, Excel, or other formats
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-4 py-4">
                                                            <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer">
                                                                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                                                <p className="text-sm text-gray-500">
                                                                    Drag and drop files here, or click to browse
                                                                </p>
                                                                <p className="text-xs text-gray-400 mt-2">
                                                                    Supported formats: .csv, .xlsx, .json
                                                                </p>
                                                            </div>
                                                            <Select defaultValue="patients">
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select data type" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="patients">Patient Records</SelectItem>
                                                                    <SelectItem value="appointments">Appointments</SelectItem>
                                                                    <SelectItem value="doctors">Doctors</SelectItem>
                                                                    <SelectItem value="clinics">Clinics</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button variant="outline">Cancel</Button>
                                                            <Button>Begin Import</Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </CardFooter>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base">Export Data</CardTitle>
                                                <CardDescription>Export clinic data for reporting</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-gray-500 mb-4">
                                                    Export data in various formats for external use
                                                </p>
                                            </CardContent>
                                            <CardFooter>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" className="w-full">
                                                            <Download className="h-4 w-4 mr-2" />
                                                            Export Data
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Export Data</DialogTitle>
                                                            <DialogDescription>
                                                                Export clinic data in your preferred format
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-4 py-4">
                                                            <Select defaultValue="appointments">
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select data to export" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="appointments">Appointments</SelectItem>
                                                                    <SelectItem value="patients">Patient Records</SelectItem>
                                                                    <SelectItem value="financial">Financial Report</SelectItem>
                                                                    <SelectItem value="doctors">Doctors Schedule</SelectItem>
                                                                    <SelectItem value="activity">Activity Log</SelectItem>
                                                                </SelectContent>
                                                            </Select>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <Label>Start Date</Label>
                                                                    <Input type="date" />
                                                                </div>
                                                                <div>
                                                                    <Label>End Date</Label>
                                                                    <Input type="date" />
                                                                </div>
                                                            </div>

                                                            <Select defaultValue="csv">
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select format" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="csv">CSV (.csv)</SelectItem>
                                                                    <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                                                                    <SelectItem value="pdf">PDF Document (.pdf)</SelectItem>
                                                                    <SelectItem value="json">JSON (.json)</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button variant="outline">Cancel</Button>
                                                            <Button>Download Export</Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </CardFooter>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base">System Maintenance</CardTitle>
                                                <CardDescription>Maintain system performance</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-gray-500 mb-4">
                                                    Run maintenance tasks to optimize performance
                                                </p>
                                            </CardContent>
                                            <CardFooter>
                                                <Button variant="outline" className="w-full">
                                                    <Layers className="h-4 w-4 mr-2" />
                                                    Run Maintenance
                                                </Button>
                                            </CardFooter>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base">Email Templates</CardTitle>
                                                <CardDescription>Manage clinic email templates</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-gray-500 mb-4">
                                                    Configure templates for appointment reminders, etc.
                                                </p>
                                            </CardContent>
                                            <CardFooter>
                                                <Button variant="outline" className="w-full">
                                                    <Mail className="h-4 w-4 mr-2" />
                                                    Manage Templates
                                                </Button>
                                            </CardFooter>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base">Reporting</CardTitle>
                                                <CardDescription>Configure automated reports</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-gray-500 mb-4">
                                                    Set up scheduled reports and notifications
                                                </p>
                                            </CardContent>
                                            <CardFooter>
                                                <Button variant="outline" className="w-full">
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    Configure Reports
                                                </Button>
                                            </CardFooter>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base">Print Templates</CardTitle>
                                                <CardDescription>Configure print formats</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-gray-500 mb-4">
                                                    Customize receipts, prescriptions, and reports
                                                </p>
                                            </CardContent>
                                            <CardFooter>
                                                <Button variant="outline" className="w-full">
                                                    <Printer className="h-4 w-4 mr-2" />
                                                    Edit Templates
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold mb-4">User Management</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base">User Roles</CardTitle>
                                                <CardDescription>Configure user permissions</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Admin</Badge>
                                                            <span className="text-sm">Full system access</span>
                                                        </div>
                                                        <Button variant="ghost" size="sm">Edit</Button>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Doctor</Badge>
                                                            <span className="text-sm">Clinical access only</span>
                                                        </div>
                                                        <Button variant="ghost" size="sm">Edit</Button>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Secretary</Badge>
                                                            <span className="text-sm">Front desk access</span>
                                                        </div>
                                                        <Button variant="ghost" size="sm">Edit</Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter>
                                                <Button variant="outline" className="w-full">
                                                    <Users className="h-4 w-4 mr-2" />
                                                    Manage Roles
                                                </Button>
                                            </CardFooter>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base">Activity Audit</CardTitle>
                                                <CardDescription>System activity monitoring</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="text-gray-500">Latest activity:</span>
                                                        <span>System settings updated</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="text-gray-500">By:</span>
                                                        <span>admin@clinic.com</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="text-gray-500">Time:</span>
                                                        <span>{new Date().toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter>
                                                <Button variant="outline" className="w-full">
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    View Full Audit Log
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold mb-4">Integration & APIs</h3>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>API Integration Settings</CardTitle>
                                            <CardDescription>Configure external system integrations</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-medium">SMS Gateway</h4>
                                                        <p className="text-sm text-gray-500">Configure SMS notifications service</p>
                                                    </div>
                                                    <Switch checked={true} />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-medium">Payment Gateway</h4>
                                                        <p className="text-sm text-gray-500">Online payment processing</p>
                                                    </div>
                                                    <Switch checked={true} />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-medium">Laboratory Integration</h4>
                                                        <p className="text-sm text-gray-500">Connect with lab systems</p>
                                                    </div>
                                                    <Switch checked={false} />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-medium">Insurance Provider API</h4>
                                                        <p className="text-sm text-gray-500">Insurance verification system</p>
                                                    </div>
                                                    <Switch checked={false} />
                                                </div>

                                                <div className="bg-slate-50 p-4 rounded-md border border-slate-200 flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-medium">API Keys</h4>
                                                        <p className="text-sm text-gray-500">Manage API keys for external access</p>
                                                    </div>
                                                    <Button variant="outline" size="sm">
                                                        Manage Keys
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>

            {/* Fixed save button at bottom */}
            {settingsChanged && (
                <div className="sticky bottom-0 w-full bg-white border-t p-4 shadow-md flex justify-end">
                    <Button
                        onClick={handleSaveSettings}
                        disabled={isLoading}
                        size="lg"
                    >
                        {isLoading ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save All Changes"
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default SettingsManagement;
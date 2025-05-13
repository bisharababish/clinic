// pages/api/admin/SettingsManagement.tsx
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, Layers } from "lucide-react";
import { supabase } from "../../../lib/supabase";

interface SystemSettings {
    setting_name: string;
    setting_value: string;
    setting_type: 'text' | 'number' | 'boolean' | 'select';
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

            // Query the actual system_settings table
            const { data, error } = await supabase
                .from('system_settings')
                .select('*')
                .order('setting_name', { ascending: true });

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            updateSystemSettings(data || []);
            console.log('System settings loaded:', data?.length);
        } catch (error) {
            console.error('Error loading system settings:', error);
            toast({
                title: "Error",
                description: "Failed to load system settings.",
                variant: "destructive",
            });
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

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>System Settings</CardTitle>
                    <Button
                        onClick={handleSaveSettings}
                        disabled={!settingsChanged || isLoading}
                    >
                        {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
                <CardDescription>
                    Configure global system settings and preferences
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {settingsChanged && (
                        <Alert className="bg-blue-50 border-blue-200">
                            <AlertDescription>
                                You have unsaved changes. Click "Save Changes" to apply them.
                            </AlertDescription>
                        </Alert>
                    )}

                    {currentSettings.map(setting => (
                        <div key={setting.setting_name} className="border-b pb-6 space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor={setting.setting_name} className="text-base font-medium">
                                    {setting.setting_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Label>

                                {setting.setting_type === 'boolean' ? (
                                    <Switch
                                        id={setting.setting_name}
                                        checked={setting.setting_value === 'true'}
                                        onCheckedChange={(checked) =>
                                            handleSettingChange(setting.setting_name, checked.toString())
                                        }
                                    />
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
                                ) : (
                                    <Input
                                        id={setting.setting_name}
                                        type={setting.setting_type === 'number' ? 'number' : 'text'}
                                        value={setting.setting_value}
                                        onChange={(e) =>
                                            handleSettingChange(setting.setting_name, e.target.value)
                                        }
                                        className="max-w-[180px]"
                                    />
                                )}
                            </div>
                            {setting.setting_description && (
                                <p className="text-sm text-gray-500">{setting.setting_description}</p>
                            )}
                        </div>
                    ))}

                    <div className="space-y-2">
                        <Label className="text-base font-medium">Database Actions</Label>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm">
                                <Database className="h-4 w-4 mr-2" />
                                Backup Database
                            </Button>
                            <Button variant="outline" size="sm">
                                <Layers className="h-4 w-4 mr-2" />
                                Run Migrations
                            </Button>
                        </div>
                        <p className="text-sm text-gray-500">
                            Perform maintenance operations on the system database
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default SettingsManagement;
// pages/api/admin/SettingsManagement.tsx
import React, { useState, useEffect, useContext } from "react";
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
    Settings,
    Globe,
    Bell,
    Shield,
    RefreshCw,
    Download,
    Upload,
    FileText,
    Users,
    Moon,
    Sun
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ThemeContext, ThemeContextType } from "../../../components/contexts/ThemeContext";

interface SystemSettings {
    id?: number;
    setting_name: string;
    setting_value: string;
    setting_type: 'text' | 'number' | 'boolean' | 'select' | 'textarea' | 'color';
    setting_group: string;
    setting_options?: string[]; // For select type settings
    setting_description?: string;
    created_at?: string;
    updated_at?: string;
}

interface SettingsManagementProps {
    systemSettings?: SystemSettings[];
    setSystemSettings?: React.Dispatch<React.SetStateAction<SystemSettings[]>>;
    isLoading?: boolean;
    setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>;
    loadSystemSettings?: () => Promise<void>;
    logActivity?: (action: string, user: string, details: string, status: 'success' | 'failed' | 'pending') => Promise<void>;
    userEmail?: string;
    updateGlobalSettings?: (settings: Record<string, string>) => void; // Add this prop for updating global settings
}

const SettingsManagement: React.FC<SettingsManagementProps> = ({
    systemSettings: propSystemSettings,
    setSystemSettings: propSetSystemSettings,
    isLoading: propIsLoading,
    setIsLoading: propSetIsLoading,
    loadSystemSettings: propLoadSystemSettings,
    logActivity: propLogActivity,
    userEmail,
    updateGlobalSettings
}) => {
    const { toast } = useToast();
    const [systemSettings, setSystemSettings] = useState<SystemSettings[]>(propSystemSettings || []);
    const [isLoading, setIsLoading] = useState(propIsLoading || false);
    const [settingsChanged, setSettingsChanged] = useState(false);
    const [activeTab, setActiveTab] = useState("appearance");
    const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [importDataType, setImportDataType] = useState("patients");
    const [exportDataType, setExportDataType] = useState("appointments");
    const [exportFormat, setExportFormat] = useState("csv");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [activityLogs, setActivityLogs] = useState([]);
    const [systemStats, setSystemStats] = useState({
        users: 0,
        appointments: { total: 0, completed: 0, upcoming: 0 },
        lastBackup: ""
    });
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const { theme, setTheme, toggleTheme } = useContext<ThemeContextType>(ThemeContext);

    // Default settings if none exist
    const defaultSettings: SystemSettings[] = [
        // Notification Settings
        { setting_name: "email_notifications", setting_value: "true", setting_type: "boolean", setting_group: "notifications", setting_description: "Send email notifications" },
        { setting_name: "sms_notifications", setting_value: "true", setting_type: "boolean", setting_group: "notifications", setting_description: "Send SMS notifications" },
        { setting_name: "notification_email_template", setting_value: "Default email template", setting_type: "textarea", setting_group: "notifications", setting_description: "Template for email notifications" },

        // Appearance Settings
        { setting_name: "primary_color", setting_value: "#3b82f6", setting_type: "color", setting_group: "appearance", setting_description: "Primary theme color" },
        { setting_name: "secondary_color", setting_value: "#10b981", setting_type: "color", setting_group: "appearance", setting_description: "Secondary theme color" },
        { setting_name: "font_size", setting_value: "medium", setting_type: "select", setting_group: "appearance", setting_options: ["small", "medium", "large"], setting_description: "Default font size" },
        { setting_name: "dark_mode", setting_value: "false", setting_type: "boolean", setting_group: "appearance", setting_description: "Enable dark mode" },

        // System Settings

        { setting_name: "auto_backup", setting_value: "true", setting_type: "boolean", setting_group: "system", setting_description: "Automatically backup the database daily" },
    ];

    // Initialize with loading activity logs and system stats
    useEffect(() => {
        if (activeTab === "system") {
            loadActivityLogs();
            loadSystemStats();
        }
    }, [activeTab]);

    // Apply dark mode setting
    useEffect(() => {
        // Find dark mode setting
        const darkModeSetting = systemSettings.find(setting => setting.setting_name === "dark_mode");

        if (darkModeSetting && typeof setTheme === "function") {
            // Get the current theme from context
            const currentTheme = theme || "light";
            const shouldBeDark = darkModeSetting.setting_value === "true";

            // Only call setTheme if the current theme doesn't match the desired theme
            if ((shouldBeDark && currentTheme !== "dark")) {
                setTheme('dark');
            } else if ((!shouldBeDark && currentTheme !== "light")) {
                setTheme('light');
            }
        }
    }, [systemSettings, theme, setTheme]);


    // Load activity logs
    const loadActivityLogs = async () => {
        try {
            const { data, error } = await supabase
                .from('activity_log')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) {
                console.error('Error loading activity logs:', error);
                return;
            }

            if (data) {
                setActivityLogs(data);
            }
        } catch (error) {
            console.error('Error loading activity logs:', error);
        }
    };

    // Load system statistics
    const loadSystemStats = async () => {
        try {
            // Get user count
            const { data: userData, error: userError } = await supabase
                .from('userinfo')
                .select('count');

            // Get appointment stats
            const { data: appointmentData, error: appointmentError } = await supabase
                .from('appointments')
                .select('count');

            // Get completed appointments count
            const today = new Date().toISOString().split('T')[0];
            const { data: completedAppointments, error: completedError } = await supabase
                .from('appointments')
                .select('count')
                .lt('date', today)
                .eq('status', 'completed');

            // Get upcoming appointments count
            const { data: upcomingAppointments, error: upcomingError } = await supabase
                .from('appointments')
                .select('count')
                .gte('date', today);

            // Get last backup date from activity log
            const { data: backupData, error: backupError } = await supabase
                .from('activity_log')
                .select('created_at')
                .eq('action', 'Database Backup')
                .order('created_at', { ascending: false })
                .limit(1);

            if (!userError && !appointmentError && !completedError && !upcomingError) {
                setSystemStats({
                    users: userData?.[0]?.count || 0,
                    appointments: {
                        total: appointmentData?.[0]?.count || 0,
                        completed: completedAppointments?.[0]?.count || 0,
                        upcoming: upcomingAppointments?.[0]?.count || 0
                    },
                    lastBackup: backupData?.[0]?.created_at ? new Date(backupData[0].created_at).toLocaleDateString() : "Never"
                });
            }
        } catch (error) {
            console.error('Error loading system stats:', error);
        }
    };

    // Check for system_settings table and create if needed
    const ensureSystemSettingsTable = async () => {
        try {
            // Check if table exists by making a select query
            const { data, error } = await supabase
                .from('system_settings')
                .select('setting_name')
                .limit(1);

            // If error is not related to missing table, table exists but query failed
            if (error && error.code !== 'PGRST116') {
                console.error('Error checking system_settings table:', error);
                return false;
            }

            // If no error or data length > 0, table exists
            if (!error && data && data.length > 0) {
                return true;
            }

            // Table doesn't exist - show error message
            toast({
                title: "Database Setup Required",
                description: "The system_settings table does not exist. Creating it now.",
                variant: "default",
            });

            // Execute SQL to create the table via supabase
            const { error: sqlError } = await supabase.rpc('create_system_settings_table');

            if (sqlError) {
                console.error('Error creating system_settings table:', sqlError);
                toast({
                    title: "Database Error",
                    description: "Could not create the settings table. Using default values.",
                    variant: "destructive",
                });
                return false;
            }

            // Insert default settings
            return insertDefaultSettings();
        } catch (error) {
            console.error('Error ensuring system_settings table:', error);
            return false;
        }
    };

    // Insert default settings
    const insertDefaultSettings = async () => {
        try {
            // Format settings for insertion
            const settingsToInsert = defaultSettings.map(setting => ({
                setting_name: setting.setting_name,
                setting_value: setting.setting_value,
                setting_type: setting.setting_type,
                setting_group: setting.setting_group,
                setting_description: setting.setting_description,
                setting_options: setting.setting_options ? setting.setting_options.join(',') : null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }));

            // Insert settings in batches of 5 to avoid potential payload issues
            const batchSize = 5;
            let allSuccess = true;

            for (let i = 0; i < settingsToInsert.length; i += batchSize) {
                const batch = settingsToInsert.slice(i, i + batchSize);
                const { error } = await supabase
                    .from('system_settings')
                    .upsert(batch, {
                        onConflict: 'setting_name',
                        ignoreDuplicates: false  // Update existing records
                    });

                if (error) {
                    console.error(`Error inserting settings batch ${i}:`, error);
                    allSuccess = false;
                }
            }

            return allSuccess;
        } catch (error) {
            console.error('Error inserting default settings:', error);
            return false;
        }
    };

    // Initialize with settings - ensure table exists and load settings
    useEffect(() => {
        if ((propSystemSettings || systemSettings).length === 0) {
            // If no settings, load from database
            loadSystemSettings();
        }
    }, [propSystemSettings, systemSettings]);

    // Check auth status on load
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast({
                    title: "Not Logged In",
                    description: "You need to be logged in to access settings.",
                    variant: "destructive",
                });
            } else {
                console.log("Authenticated as:", session.user.email);
            }
        };

        checkAuth();
    }, []);

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

    // Load settings from database
    const loadSystemSettings = async () => {
        if (propLoadSystemSettings) {
            await propLoadSystemSettings();
            return;
        }

        try {
            updateIsLoading(true);

            // Ensure system_settings table exists
            const tableExists = await ensureSystemSettingsTable();

            if (!tableExists) {
                // If table doesn't exist and couldn't be created, use defaults
                updateSystemSettings(defaultSettings);
                toast({
                    title: "Using Default Settings",
                    description: "Could not access or create system_settings table. Using default values.",
                    variant: "default",
                });
                updateIsLoading(false);
                return;
            }

            // Query the system_settings table
            const { data, error } = await supabase
                .from('system_settings')
                .select('*')
                .order('setting_name', { ascending: true });

            if (error) {
                console.error('Error loading settings:', error);
                throw error;
            }

            if (data && data.length > 0) {
                // Process settings - convert setting_options string to array if needed
                const processedSettings = data.map(setting => ({
                    ...setting,
                    setting_options: setting.setting_options ?
                        setting.setting_options.split(',') :
                        undefined
                }));

                updateSystemSettings(processedSettings);

                toast({
                    title: "Settings Loaded",
                    description: `${processedSettings.length} settings loaded successfully.`,
                });
            } else {
                // No settings found, insert and use defaults
                await insertDefaultSettings();

                // Query again to get inserted settings with IDs
                const { data: newData, error: newError } = await supabase
                    .from('system_settings')
                    .select('*')
                    .order('setting_name', { ascending: true });

                if (newError) {
                    console.error('Error loading settings after insert:', newError);
                    updateSystemSettings(defaultSettings);
                } else if (newData && newData.length > 0) {
                    // Process settings - convert setting_options string to array if needed
                    const processedSettings = newData.map(setting => ({
                        ...setting,
                        setting_options: setting.setting_options ?
                            setting.setting_options.split(',') :
                            undefined
                    }));

                    updateSystemSettings(processedSettings);

                    toast({
                        title: "Default Settings Created",
                        description: "No settings found. Default settings have been created.",
                    });
                } else {
                    updateSystemSettings(defaultSettings);

                    toast({
                        title: "Using Default Settings",
                        description: "Could not create settings in database. Using default values.",
                        variant: "default",
                    });
                }
            }
        } catch (error) {
            console.error('Error loading system settings:', error);
            toast({
                title: "Error",
                description: "Failed to load settings. Using defaults.",
                variant: "destructive",
            });
            // Use defaults on error
            updateSystemSettings(defaultSettings);
        } finally {
            updateIsLoading(false);
        }
    };

    // Settings change handler
    const handleSettingChange = (name: string, value: string) => {
        updateSystemSettings(prev => prev.map(setting => {
            if (setting.setting_name === name) {
                return { ...setting, setting_value: value };
            }
            return setting;
        }));
        setSettingsChanged(true);

        // Special handling for dark mode
        if (name === "dark_mode" && setTheme) {
            if (typeof setTheme === "function") {
                if (value === "true") {
                    setTheme('dark');
                } else {
                    setTheme('light');
                }
            }
        }
    };

    // Save settings to database
    const handleSaveSettings = async () => {
        try {
            updateIsLoading(true);

            // Check authentication explicitly before saving
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                toast({
                    title: "Authentication Error",
                    description: "You must be logged in to save settings.",
                    variant: "destructive",
                });
                return;
            }

            // Get current settings
            const currentSettings = propSystemSettings || systemSettings;

            // Try to save each setting individually
            let successCount = 0;
            let errorCount = 0;

            for (const setting of currentSettings) {
                // Only include the necessary fields to avoid schema issues
                const { error } = await supabase
                    .from('system_settings')
                    .upsert({
                        id: setting.id, // Include ID if it exists
                        setting_name: setting.setting_name,
                        setting_value: setting.setting_value,
                        setting_type: setting.setting_type,
                        setting_group: setting.setting_group,
                        setting_description: setting.setting_description || null,
                        setting_options: setting.setting_options ? setting.setting_options.join(',') : null,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'setting_name'
                    });

                if (error) {
                    console.error(`Failed to save setting ${setting.setting_name}:`, error);
                    errorCount++;
                } else {
                    successCount++;
                }
            }

            // Update global settings context to reflect new values
            if (updateGlobalSettings) {
                const globalSettings: Record<string, string> = {};
                const globalSettingNames = ["clinic_name", "clinic_address", "clinic_phone", "clinic_email", "clinic_logo", "currency"];

                currentSettings.forEach(setting => {
                    if (globalSettingNames.includes(setting.setting_name)) {
                        globalSettings[setting.setting_name] = setting.setting_value;
                    }
                });

                updateGlobalSettings(globalSettings);
            }

            // Log activity if any settings were saved successfully
            if (successCount > 0) {
                await logActivity(
                    "System Settings Updated",
                    session.user.email,
                    `Updated ${successCount} settings successfully (${errorCount} failed)`,
                    errorCount > 0 ? "failed" : "success"
                );

                toast({
                    title: "Settings Saved",
                    description: `${successCount} settings saved successfully${errorCount > 0 ? ` (${errorCount} failed)` : ''}.`,
                });

                setSettingsChanged(false);

                // Reload settings to get fresh data
                loadSystemSettings();
            } else {
                toast({
                    title: "Error",
                    description: "Failed to save any settings.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            toast({
                title: "Error",
                description: `An unexpected error occurred: ${error.message}`,
                variant: "destructive",
            });
        } finally {
            updateIsLoading(false);
        }
    };

    // Database backup implementation
    const handleBackupDatabase = async () => {
        try {
            updateIsLoading(true);

            // Get all tables data
            const tables = [
                'userinfo',
                'clinics',
                'clinic_categories',
                'doctors',
                'doctor_availability',
                'appointments',
                'activity_log',
                'system_settings'
            ];

            const backup = {};

            // Fetch data from each table
            for (const table of tables) {
                const { data, error } = await supabase
                    .from(table)
                    .select('*');

                if (error) {
                    console.error(`Error backing up table ${table}:`, error);
                    throw new Error(`Failed to backup table ${table}: ${error.message}`);
                }

                backup[table] = data;
            }

            // Create JSON blob for download
            const backupJson = JSON.stringify(backup, null, 2);
            const blob = new Blob([backupJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            // Create download link
            const a = document.createElement('a');
            a.href = url;
            a.download = `clinic_backup_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();

            // Clean up
            URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Get session
            const { data: { session } } = await supabase.auth.getSession();

            // Log activity
            await logActivity(
                "Database Backup",
                session?.user?.email || userEmail || "admin",
                "Database backup was created",
                "success"
            );

            toast({
                title: "Backup Complete",
                description: "Database backup completed successfully.",
            });

            // Close dialog
            setIsBackupDialogOpen(false);

        } catch (error) {
            console.error("Error creating backup:", error);
            toast({
                title: "Backup Failed",
                description: error instanceof Error ? error.message : "An error occurred during backup.",
                variant: "destructive",
            });
        } finally {
            updateIsLoading(false);
        }
    };

    // Run system maintenance
    const handleRunMaintenance = async () => {
        try {
            updateIsLoading(true);

            // Get session
            const { data: { session } } = await supabase.auth.getSession();

            // Log start of maintenance
            await logActivity(
                "System Maintenance",
                session?.user?.email || userEmail || "admin",
                "System maintenance initiated",
                "pending"
            );

            // Check for appointments with non-existent doctors
            const { data: orphanedAppointments, error: appointmentsError } = await supabase
                .from('appointments')
                .select('id, doctor_id')
                .not('doctor_id', 'in', supabase.from('doctors').select('id'));

            if (appointmentsError) {
                throw new Error(`Error checking orphaned appointments: ${appointmentsError.message}`);
            }

            // Check for doctors with non-existent clinics
            const { data: orphanedDoctors, error: doctorsError } = await supabase
                .from('doctors')
                .select('id, clinic_id')
                .not('clinic_id', 'in', supabase.from('clinics').select('id'));

            if (doctorsError) {
                throw new Error(`Error checking orphaned doctors: ${doctorsError.message}`);
            }

            // Get database statistics
            const statistics = await Promise.all([
                supabase.from('appointments').select('count'),
                supabase.from('userinfo').select('count'),
                supabase.from('doctors').select('count'),
                supabase.from('clinics').select('count')
            ]);

            // Log maintenance results
            const maintenanceDetails = {
                orphanedRecords: {
                    appointments: orphanedAppointments?.length || 0,
                    doctors: orphanedDoctors?.length || 0
                },
                statistics: {
                    appointments: statistics[0]?.data?.[0]?.count || 0,
                    users: statistics[1]?.data?.[0]?.count || 0,
                    doctors: statistics[2]?.data?.[0]?.count || 0,
                    clinics: statistics[3]?.data?.[0]?.count || 0
                }
            };

            // Log completion
            await logActivity(
                "System Maintenance",
                session?.user?.email || userEmail || "admin",
                `System maintenance completed. Found ${maintenanceDetails.orphanedRecords.appointments} orphaned appointments and ${maintenanceDetails.orphanedRecords.doctors} orphaned doctors.`,
                "success"
            );

            toast({
                title: "Maintenance Complete",
                description: `System check complete. Found ${maintenanceDetails.orphanedRecords.appointments} orphaned appointments and ${maintenanceDetails.orphanedRecords.doctors} orphaned doctors.`,
            });

            // Reload system stats
            loadSystemStats();

        } catch (error) {
            console.error("Error during maintenance:", error);

            // Log failure
            await logActivity(
                "System Maintenance",
                userEmail || "admin",
                `System maintenance failed: ${error instanceof Error ? error.message : "Unknown error"}`,
                "failed"
            );

            toast({
                title: "Maintenance Failed",
                description: error instanceof Error ? error.message : "An error occurred during maintenance.",
                variant: "destructive",
            });
        } finally {
            updateIsLoading(false);
        }
    };

    // File input handlers
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleFileClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
    };

    // Import data from file
    const handleImportData = async () => {
        if (!selectedFile) {
            toast({
                title: "No File Selected",
                description: "Please select a file to import.",
                variant: "destructive",
            });
            return;
        }

        try {
            updateIsLoading(true);

            // Read file
            const fileReader = new FileReader();

            fileReader.onload = async (e) => {
                try {
                    const fileContent = e.target?.result as string;
                    let importData;

                    try {
                        importData = JSON.parse(fileContent);
                    } catch (parseError) {
                        throw new Error("Invalid JSON file. Please select a properly formatted backup file.");
                    }

                    // Check if selected table exists in import data
                    if (!importData[importDataType]) {
                        throw new Error(`No data found for ${importDataType} in import file`);
                    }

                    // Get session
                    const { data: { session } } = await supabase.auth.getSession();

                    // Log the import activity
                    await logActivity(
                        "Data Import Started",
                        session?.user?.email || userEmail || "admin",
                        `Import of ${importData[importDataType].length} records into ${importDataType} started`,
                        "pending"
                    );

                    // Import data into selected table
                    const { error } = await supabase
                        .from(importDataType)
                        .upsert(importData[importDataType], {
                            onConflict: 'id',
                            ignoreDuplicates: false // Update existing records
                        });
                    if (error) {
                        // Log the error
                        await logActivity(
                            "Data Import Failed",
                            session?.user?.email || userEmail || "admin",
                            `Import into ${importDataType} failed: ${error.message}`,
                            "failed"
                        );

                        throw error;
                    }

                    // Log activity
                    await logActivity(
                        "Data Import Completed",
                        session?.user?.email || userEmail || "admin",
                        `Imported ${importData[importDataType].length} records into ${importDataType} table`,
                        "success"
                    );

                    toast({
                        title: "Import Successful",
                        description: `${importData[importDataType].length} records successfully imported into ${importDataType} table.`,
                    });

                    // Reload stats if system_settings were imported
                    if (importDataType === 'system_settings') {
                        loadSystemSettings();
                    } else if (activeTab === 'system') {
                        loadSystemStats();
                    }

                    // Reset file selection and close dialog
                    setSelectedFile(null);
                    setIsImportDialogOpen(false);

                } catch (error) {
                    console.error("Error processing import file:", error);
                    toast({
                        title: "Import Failed",
                        description: error instanceof Error ? error.message : "Failed to process import file.",
                        variant: "destructive",
                    });
                } finally {
                    updateIsLoading(false);
                }
            };

            fileReader.onerror = () => {
                toast({
                    title: "Import Failed",
                    description: "Failed to read the selected file.",
                    variant: "destructive",
                });
                updateIsLoading(false);
            };

            fileReader.readAsText(selectedFile);

        } catch (error) {
            console.error("Error importing data:", error);
            toast({
                title: "Import Failed",
                description: error instanceof Error ? error.message : "An error occurred during import.",
                variant: "destructive",
            });
            updateIsLoading(false);
        }
    };

    // Export data to file
    const handleExportData = async () => {
        try {
            updateIsLoading(true);

            // Validate that the selected table exists
            const validTables = ['appointments', 'userinfo', 'doctors', 'clinics', 'clinic_categories', 'doctor_availability', 'activity_log', 'system_settings'];

            if (!validTables.includes(exportDataType)) {
                throw new Error("Invalid table selected for export");
            }

            // Build query
            let query = supabase.from(exportDataType).select('*');

            // Apply date filter if both dates are provided
            if (startDate && endDate) {
                // Different date columns based on table
                const dateColumn = exportDataType === 'appointments' ? 'date' : 'created_at';
                query = query.gte(dateColumn, startDate).lte(dateColumn, endDate);
            }

            // Execute query
            const { data, error } = await query;

            if (error) {
                // Get session
                const { data: { session } } = await supabase.auth.getSession();

                // Log the error
                await logActivity(
                    "Data Export Failed",
                    session?.user?.email || userEmail || "admin",
                    `Export from ${exportDataType} failed: ${error.message}`,
                    "failed"
                );

                throw error;
            }

            if (!data || data.length === 0) {
                toast({
                    title: "No Data",
                    description: "No data available for export with the selected criteria.",
                    variant: "default",
                });
                updateIsLoading(false);
                return;
            }

            // Format data based on selected format
            let outputData;
            let mimeType;
            let fileExtension;

            switch (exportFormat) {
                case 'csv':
                    outputData = convertToCSV(data);
                    mimeType = 'text/csv';
                    fileExtension = 'csv';
                    break;
                case 'excel':
                    outputData = convertToCSV(data); // Excel can open CSV files
                    mimeType = 'text/csv';
                    fileExtension = 'csv';
                    break;
                case 'json':
                default:
                    outputData = JSON.stringify(data, null, 2);
                    mimeType = 'application/json';
                    fileExtension = 'json';
                    break;
            }

            // Create download
            const blob = new Blob([outputData], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${exportDataType}_export_${new Date().toISOString().slice(0, 10)}.${fileExtension}`;
            document.body.appendChild(a);
            a.click();

            // Clean up
            URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Get session
            const { data: { session } } = await supabase.auth.getSession();

            // Log activity
            await logActivity(
                "Data Export",
                session?.user?.email || userEmail || "admin",
                `Exported ${data.length} records from ${exportDataType}`,
                "success"
            );

            toast({
                title: "Export Complete",
                description: `${data.length} records exported successfully.`,
            });

        } catch (error) {
            console.error("Error exporting data:", error);
            toast({
                title: "Export Failed",
                description: error instanceof Error ? error.message : "An error occurred during export.",
                variant: "destructive",
            });
        } finally {
            updateIsLoading(false);
        }
    };

    // Helper to convert data to CSV
    const convertToCSV = (data: Record<string, unknown>[]) => {
        if (!data || data.length === 0) return '';

        const headers = Object.keys(data[0]);
        const headerRow = headers.join(',');

        const rows = data.map(row => {
            return headers.map(header => {
                const value = row[header] === null ? '' : row[header];
                // Wrap strings in quotes and escape quotes
                return typeof value === 'string' ?
                    `"${value.replace(/"/g, '""')}"` :
                    value;
            }).join(',');
        });

        return [headerRow, ...rows].join('\n');
    };

    // Activity logging
    const logActivity = async (action: string, user: string, details: string, status: 'success' | 'failed' | 'pending') => {
        if (propLogActivity) {
            await propLogActivity(action, user, details, status);
            return;
        }

        // Insert into activity_log
        try {
            const { error } = await supabase
                .from('activity_log')
                .insert({
                    action: action,
                    user_email: user,
                    details: details,
                    status: status,
                    created_at: new Date().toISOString()
                });

            if (error) {
                console.error('Error logging activity:', error);
            }
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    };

    // Toggle dark mode
    const toggleDarkMode = () => {
        // Find dark mode setting
        const darkModeSetting = systemSettings.find(setting => setting.setting_name === "dark_mode");

        if (darkModeSetting) {
            // Toggle the value in the settings
            const newValue = darkModeSetting.setting_value === "true" ? "false" : "true";
            handleSettingChange("dark_mode", newValue);

            // Call the toggle function
            if (typeof toggleTheme === "function") {
                toggleTheme();
            }

            toast({
                title: newValue === "true" ? "Dark Mode Enabled" : "Light Mode Enabled",
                description: "Theme preference updated.",
            });
        }
    };

    // Group settings by category using useMemo
    const settingsByGroup: Record<string, SystemSettings[]> = React.useMemo(() => {
        // Start with an empty record
        const groups: Record<string, SystemSettings[]> = {};

        // Get the settings to use
        const settings = propSystemSettings || systemSettings || [];

        // Group settings by category
        settings.forEach(setting => {
            const group = setting.setting_group || 'general';
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(setting);
        });

        return groups;
    }, [propSystemSettings, systemSettings]);

    // Define setting group icons and titles
    const groupMeta = {
        notifications: { icon: <Bell className="h-5 w-5" />, title: "Notification Settings" },
        appearance: { icon: <Globe className="h-5 w-5" />, title: "Appearance & Localization" },
        system: { icon: <Settings className="h-5 w-5" />, title: "System Settings" },
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        const date = new Date(dateString);
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);

        // Check if date is today
        if (date.toDateString() === now.toDateString()) {
            return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }

        // Check if date is yesterday
        if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }

        // Check if date is within the last week
        const daysAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (daysAgo < 7) {
            return `${daysAgo} days ago`;
        }

        // Otherwise return formatted date
        return date.toLocaleDateString();
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
                <div className="flex items-center gap-2">

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
            </div>

            {/* Unsaved changes alert */}
            {settingsChanged && (
                <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900">
                    <AlertDescription className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        You have unsaved changes. Click "Save Changes" to apply them.
                    </AlertDescription>
                </Alert>
            )}

            {/* Settings tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <span className="hidden md:inline">Notifications</span>
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

                {/* Notifications Tab Content */}
                <TabsContent value="notifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {groupMeta.notifications.icon}
                                {groupMeta.notifications.title}
                            </CardTitle>
                            <CardDescription>
                                Configure email and SMS notification settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {settingsByGroup.notifications?.map((setting) => (
                                <div key={setting.setting_name} className="grid gap-2">
                                    <Label htmlFor={setting.setting_name}>
                                        {setting.setting_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </Label>
                                    {setting.setting_type === 'text' && (
                                        <Input
                                            id={setting.setting_name}
                                            value={setting.setting_value}
                                            onChange={(e) => handleSettingChange(setting.setting_name, e.target.value)}
                                            placeholder={setting.setting_description}
                                        />
                                    )}
                                    {setting.setting_type === 'textarea' && (
                                        <Textarea
                                            id={setting.setting_name}
                                            value={setting.setting_value}
                                            onChange={(e) => handleSettingChange(setting.setting_name, e.target.value)}
                                            placeholder={setting.setting_description}
                                            rows={4}
                                        />
                                    )}
                                    {setting.setting_type === 'boolean' && (
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id={setting.setting_name}
                                                checked={setting.setting_value === 'true'}
                                                onCheckedChange={(checked) => handleSettingChange(setting.setting_name, checked ? 'true' : 'false')}
                                            />
                                            <Label htmlFor={setting.setting_name} className="cursor-pointer">
                                                {setting.setting_value === 'true' ? 'Enabled' : 'Disabled'}
                                            </Label>
                                        </div>
                                    )}
                                    {setting.setting_description && (
                                        <p className="text-sm text-muted-foreground mt-1">{setting.setting_description}</p>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Appearance Tab Content */}
                <TabsContent value="appearance" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {groupMeta.appearance.icon}
                                {groupMeta.appearance.title}
                            </CardTitle>
                            <CardDescription>
                                Configure visual appearance and localization settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {settingsByGroup.appearance?.map((setting) => (
                                <div key={setting.setting_name} className="grid gap-2">
                                    <Label htmlFor={setting.setting_name}>
                                        {setting.setting_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </Label>
                                    {setting.setting_type === 'text' && (
                                        <Input
                                            id={setting.setting_name}
                                            value={setting.setting_value}
                                            onChange={(e) => handleSettingChange(setting.setting_name, e.target.value)}
                                            placeholder={setting.setting_description}
                                        />
                                    )}
                                    {setting.setting_type === 'color' && (
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id={setting.setting_name}
                                                type="color"
                                                value={setting.setting_value}
                                                onChange={(e) => handleSettingChange(setting.setting_name, e.target.value)}
                                                className="w-12 h-10 p-1"
                                            />
                                            <Input
                                                value={setting.setting_value}
                                                onChange={(e) => handleSettingChange(setting.setting_name, e.target.value)}
                                                placeholder={setting.setting_description}
                                                className="flex-1"
                                            />
                                        </div>
                                    )}
                                    {setting.setting_type === 'select' && setting.setting_options && (
                                        <Select
                                            value={setting.setting_value}
                                            onValueChange={(value) => handleSettingChange(setting.setting_name, value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an option" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {setting.setting_options.map((option) => (
                                                    <SelectItem key={option} value={option}>
                                                        {option}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                    {setting.setting_type === 'boolean' && (
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id={setting.setting_name}
                                                checked={setting.setting_value === 'true'}
                                                onCheckedChange={(checked) => handleSettingChange(setting.setting_name, checked ? 'true' : 'false')}
                                            />
                                            <Label htmlFor={setting.setting_name} className="cursor-pointer">
                                                {setting.setting_value === 'true' ? 'Enabled' : 'Disabled'}
                                            </Label>
                                        </div>
                                    )}
                                    {setting.setting_description && (
                                        <p className="text-sm text-muted-foreground mt-1">{setting.setting_description}</p>
                                    )}
                                </div>
                            ))}

                            {/* Theme preview */}
                            <div className="mt-6 pt-6 border-t">
                                <h3 className="text-lg font-medium mb-4">Theme Preview</h3>
                                <div className="grid gap-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-sm font-medium mb-2">Primary Color</h4>
                                            <div
                                                className="h-16 rounded-md"
                                                style={{
                                                    backgroundColor: settingsByGroup.appearance?.find(s => s.setting_name === 'primary_color')?.setting_value || '#3b82f6'
                                                }}
                                            ></div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium mb-2">Secondary Color</h4>
                                            <div
                                                className="h-16 rounded-md"
                                                style={{
                                                    backgroundColor: settingsByGroup.appearance?.find(s => s.setting_name === 'secondary_color')?.setting_value || '#10b981'
                                                }}
                                            ></div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* System Tab Content */}
                <TabsContent value="system" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {groupMeta.system.icon}
                                {groupMeta.system.title}
                            </CardTitle>
                            <CardDescription>
                                Configure system-level settings and maintenance options
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {settingsByGroup.system?.map((setting) => (
                                <div key={setting.setting_name} className="grid gap-2">
                                    <Label htmlFor={setting.setting_name}>
                                        {setting.setting_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </Label>
                                    {setting.setting_type === 'text' && (
                                        <Input
                                            id={setting.setting_name}
                                            value={setting.setting_value}
                                            onChange={(e) => handleSettingChange(setting.setting_name, e.target.value)}
                                            placeholder={setting.setting_description}
                                        />
                                    )}
                                    {setting.setting_type === 'select' && setting.setting_options && (
                                        <Select
                                            value={setting.setting_value}
                                            onValueChange={(value) => handleSettingChange(setting.setting_name, value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an option" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {setting.setting_options.map((option) => (
                                                    <SelectItem key={option} value={option}>
                                                        {option}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                    {setting.setting_type === 'boolean' && (
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id={setting.setting_name}
                                                checked={setting.setting_value === 'true'}
                                                onCheckedChange={(checked) => handleSettingChange(setting.setting_name, checked ? 'true' : 'false')}
                                            />
                                            <Label htmlFor={setting.setting_name} className="cursor-pointer">
                                                {setting.setting_value === 'true' ? 'Enabled' : 'Disabled'}
                                            </Label>
                                        </div>
                                    )}
                                    {setting.setting_description && (
                                        <p className="text-sm text-muted-foreground mt-1">{setting.setting_description}</p>
                                    )}
                                </div>
                            ))}

                            {/* System Maintenance Actions */}
                            <div className="mt-6 pt-6 border-t">
                                <h3 className="text-lg font-medium mb-4">System Maintenance</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Backup and Restore */}
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2 h-auto py-3"
                                        onClick={() => setIsBackupDialogOpen(true)}
                                    >
                                        <Download className="h-5 w-5" />
                                        <div className="text-left">
                                            <div>Backup Database</div>
                                            <div className="text-xs text-muted-foreground">Export all data to a JSON file</div>
                                        </div>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2 h-auto py-3"
                                        onClick={() => setIsImportDialogOpen(true)}
                                    >
                                        <Upload className="h-5 w-5" />
                                        <div className="text-left">
                                            <div>Import Data</div>
                                            <div className="text-xs text-muted-foreground">Import data from backup</div>
                                        </div>
                                    </Button>

                                    {/* Export Data */}
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="flex items-center gap-2 h-auto py-3"
                                            >
                                                <FileText className="h-5 w-5" />
                                                <div className="text-left">
                                                    <div>Export Data</div>
                                                    <div className="text-xs text-muted-foreground">Export specific data as CSV/JSON</div>
                                                </div>
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Export Data</DialogTitle>
                                                <DialogDescription>
                                                    Select what data to export and in which format
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="exportDataType">Data to Export</Label>
                                                    <Select value={exportDataType} onValueChange={setExportDataType}>
                                                        <SelectTrigger id="exportDataType">
                                                            <SelectValue placeholder="Select data to export" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="appointments">Appointments</SelectItem>
                                                            <SelectItem value="userinfo">Patients</SelectItem>
                                                            <SelectItem value="doctors">Doctors</SelectItem>
                                                            <SelectItem value="clinics">Clinics</SelectItem>
                                                            <SelectItem value="activity_log">Activity Log</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="exportFormat">Export Format</Label>
                                                    <Select value={exportFormat} onValueChange={setExportFormat}>
                                                        <SelectTrigger id="exportFormat">
                                                            <SelectValue placeholder="Select format" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="csv">CSV</SelectItem>
                                                            <SelectItem value="json">JSON</SelectItem>
                                                            <SelectItem value="excel">Excel (CSV)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="startDate">Start Date</Label>
                                                        <Input
                                                            id="startDate"
                                                            type="date"
                                                            value={startDate}
                                                            onChange={(e) => setStartDate(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="endDate">End Date</Label>
                                                        <Input
                                                            id="endDate"
                                                            type="date"
                                                            value={endDate}
                                                            onChange={(e) => setEndDate(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button onClick={handleExportData} disabled={isLoading}>
                                                    {isLoading ? (
                                                        <>
                                                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                                            Exporting...
                                                        </>
                                                    ) : (
                                                        "Export Data"
                                                    )}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    {/* Maintenance */}
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2 h-auto py-3"
                                        onClick={handleRunMaintenance}
                                    >
                                        <RefreshCw className="h-5 w-5" />
                                        <div className="text-left">
                                            <div>Run Maintenance</div>
                                            <div className="text-xs text-muted-foreground">Optimize database & clean up</div>
                                        </div>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* System Activity Overview Card - Using real data from the database */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                System Activity Overview
                            </CardTitle>
                            <CardDescription>
                                Recent activity and system health metrics
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                                    <div className="text-sm font-medium text-muted-foreground">Total Users</div>
                                    <div className="text-2xl font-bold mt-1">{systemStats.users}</div>
                                </div>
                                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                                    <div className="text-sm font-medium text-muted-foreground">Today's Appointments</div>
                                    <div className="text-2xl font-bold mt-1">{systemStats.appointments.total}</div>
                                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                        {systemStats.appointments.completed} completed, {systemStats.appointments.upcoming} upcoming
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="text-sm font-medium mb-3">Recent Activity</h3>
                                <div className="border rounded-md dark:border-gray-700">
                                    <div className="grid grid-cols-4 gap-4 p-3 bg-muted text-sm font-medium">
                                        <div>Action</div>
                                        <div>User</div>
                                        <div>Time</div>
                                        <div>Status</div>
                                    </div>
                                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {activityLogs.length > 0 ? (
                                            activityLogs.map((log) => (
                                                <div key={log.id} className="grid grid-cols-4 gap-4 p-3 text-sm">
                                                    <div>{log.action}</div>
                                                    <div>{log.user_email}</div>
                                                    <div>{formatDate(log.created_at)}</div>
                                                    <div className="flex items-center">
                                                        <div className={`h-2 w-2 rounded-full mr-2 ${log.status === 'success' ? 'bg-green-500' :
                                                            log.status === 'failed' ? 'bg-red-500' : 'bg-amber-500'
                                                            }`}></div>
                                                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-3 text-sm text-center text-muted-foreground">No recent activity found</div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-end mt-4">
                                    <Button variant="outline" size="sm" onClick={loadActivityLogs}>
                                        View Full Logs
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Backup Database Dialog */}
            <Dialog open={isBackupDialogOpen} onOpenChange={setIsBackupDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Backup Database</DialogTitle>
                        <DialogDescription>
                            Create a complete backup of all system data. This file can be used to restore the system if needed.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-900">
                            <AlertDescription className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                The backup file will contain all system data including patient information. Store it securely.
                            </AlertDescription>
                        </Alert>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBackupDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleBackupDatabase} disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                    Creating Backup...
                                </>
                            ) : (
                                "Create Backup"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Import Data Dialog */}
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import Data</DialogTitle>
                        <DialogDescription>
                            Import data from a backup file or CSV. Choose what type of data to import.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="importDataType">Data Type to Import</Label>
                            <Select value={importDataType} onValueChange={setImportDataType}>
                                <SelectTrigger id="importDataType">
                                    <SelectValue placeholder="Select data type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="userinfo">Patients</SelectItem>
                                    <SelectItem value="appointments">Appointments</SelectItem>
                                    <SelectItem value="doctors">Doctors</SelectItem>
                                    <SelectItem value="clinics">Clinics</SelectItem>
                                    <SelectItem value="clinic_categories">Clinic Categories</SelectItem>
                                    <SelectItem value="doctor_availability">Doctor Availability</SelectItem>
                                    <SelectItem value="system_settings">System Settings</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div
                            className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted transition-colors"
                            onClick={handleFileClick}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept=".json,.csv"
                            />
                            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                            {selectedFile ? (
                                <p>{selectedFile.name}</p>
                            ) : (
                                <>
                                    <p className="text-sm font-medium">
                                        Click to select a file or drag and drop
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        JSON or CSV files only
                                    </p>
                                </>
                            )}
                        </div>
                        <Alert className="bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900">
                            <AlertDescription className="flex items-center gap-2 text-red-700 dark:text-red-400">
                                <Shield className="h-4 w-4" />
                                Importing data will overwrite existing records. Make sure you have a backup.
                            </AlertDescription>
                        </Alert>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleImportData} disabled={isLoading || !selectedFile}>
                            {isLoading ? (
                                <>
                                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                    Importing...
                                </>
                            ) : (
                                "Import Data"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// Default export
export default SettingsManagement;
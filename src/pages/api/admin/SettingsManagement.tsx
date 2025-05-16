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
    const [activeTab, setActiveTab] = useState("system");
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
        // System Settings
        { setting_name: "auto_backup", setting_value: "true", setting_type: "boolean", setting_group: "system", setting_description: "Automatically backup the database daily" },
        { setting_name: "dark_mode", setting_value: "false", setting_type: "boolean", setting_group: "system", setting_description: "Enable dark mode" },
        { setting_name: "primary_color", setting_value: "#3b82f6", setting_type: "color", setting_group: "system", setting_description: "Primary theme color" },
        { setting_name: "secondary_color", setting_value: "#10b981", setting_type: "color", setting_group: "system", setting_description: "Secondary theme color" },
        { setting_name: "font_size", setting_value: "medium", setting_type: "select", setting_group: "system", setting_options: ["small", "medium", "large"], setting_description: "Default font size" },
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
                throw new Error(`Error exporting data: ${error.message}`);
            }

            if (!data || data.length === 0) {
                toast({
                    title: "No Data to Export",
                    description: `No records found in ${exportDataType} table with the current criteria.`,
                    variant: "default",
                });
                updateIsLoading(false);
                return;
            }

            // Format the data based on export format
            let exportContent;
            let mimeType;
            let fileExtension;

            if (exportFormat === 'csv') {
                // Convert to CSV
                const headers = Object.keys(data[0]).join(',');
                const rows = data.map(row => Object.values(row).map(value => {
                    // Handle formatting of different types of values
                    if (value === null || value === undefined) return '';
                    if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
                    if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                    return value;
                }).join(','));

                exportContent = [headers, ...rows].join('\n');
                mimeType = 'text/csv';
                fileExtension = 'csv';
            } else {
                // JSON format
                exportContent = JSON.stringify({ [exportDataType]: data }, null, 2);
                mimeType = 'application/json';
                fileExtension = 'json';
            }

            // Create and trigger download
            const blob = new Blob([exportContent], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Create filename with date filter if applicable
            let filename = `${exportDataType}_export`;
            if (startDate && endDate) {
                filename += `_${startDate}_to_${endDate}`;
            } else {
                filename += `_${new Date().toISOString().slice(0, 10)}`;
            }
            a.download = `${filename}.${fileExtension}`;

            // Trigger download
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Get session
            const { data: { session } } = await supabase.auth.getSession();

            // Log activity
            await logActivity(
                "Data Export",
                session?.user?.email || userEmail || "admin",
                `Exported ${data.length} records from ${exportDataType} table as ${fileExtension.toUpperCase()}`,
                "success"
            );

            toast({
                title: "Export Complete",
                description: `Successfully exported ${data.length} records from ${exportDataType} table.`,
            });

            // Close dialog if open
            setIsBackupDialogOpen(false);
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

    // Activity log implementation
    const logActivity = async (action: string, user: string, details: string, status: 'success' | 'failed' | 'pending') => {
        if (propLogActivity) {
            return propLogActivity(action, user, details, status);
        }

        try {
            const { error } = await supabase
                .from('activity_log')
                .insert({
                    action,
                    user_email: user,
                    details,
                    status,
                    created_at: new Date().toISOString()
                });

            if (error) {
                console.error("Error logging activity:", error);
                return false;
            }

            // Reload logs if we're on the system tab
            if (activeTab === 'system') {
                loadActivityLogs();
            }

            return true;
        } catch (error) {
            console.error("Error logging activity:", error);
            return false;
        }
    };

    // Group settings by category for display
    const groupedSettings = systemSettings.reduce((groups, setting) => {
        if (!groups[setting.setting_group]) {
            groups[setting.setting_group] = [];
        }
        groups[setting.setting_group].push(setting);
        return groups;
    }, {} as Record<string, SystemSettings[]>);

    // Render setting input based on type
    const renderSettingInput = (setting: SystemSettings) => {
        switch (setting.setting_type) {
            case 'boolean':
                return (
                    <div className="flex items-center space-x-2">
                        <Switch
                            id={`setting-${setting.setting_name}`}
                            checked={setting.setting_value === 'true'}
                            onCheckedChange={(checked) => handleSettingChange(setting.setting_name, checked ? 'true' : 'false')}
                        />
                        <Label htmlFor={`setting-${setting.setting_name}`}>{setting.setting_value === 'true' ? 'Enabled' : 'Disabled'}</Label>
                    </div>
                );
            case 'select':
                return (
                    <Select
                        value={setting.setting_value}
                        onValueChange={(value) => handleSettingChange(setting.setting_name, value)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a value" />
                        </SelectTrigger>
                        <SelectContent>
                            {setting.setting_options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            case 'textarea':
                return (
                    <Textarea
                        id={`setting-${setting.setting_name}`}
                        value={setting.setting_value}
                        onChange={(e) => handleSettingChange(setting.setting_name, e.target.value)}
                        rows={4}
                    />
                );
            case 'color':
                return (
                    <div className="flex items-center space-x-2">
                        <Input
                            type="color"
                            id={`setting-${setting.setting_name}`}
                            value={setting.setting_value}
                            onChange={(e) => handleSettingChange(setting.setting_name, e.target.value)}
                            className="w-12 h-10 p-1"
                        />
                        <Input
                            type="text"
                            value={setting.setting_value}
                            onChange={(e) => handleSettingChange(setting.setting_name, e.target.value)}
                            className="w-full"
                        />
                    </div>
                );
            case 'number':
                return (
                    <Input
                        type="number"
                        id={`setting-${setting.setting_name}`}
                        value={setting.setting_value}
                        onChange={(e) => handleSettingChange(setting.setting_name, e.target.value)}
                    />
                );
            case 'text':
            default:
                return (
                    <Input
                        type="text"
                        id={`setting-${setting.setting_name}`}
                        value={setting.setting_value}
                        onChange={(e) => handleSettingChange(setting.setting_name, e.target.value)}
                    />
                );
        }
    };

    return (
        <div className="container mx-auto p-4 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">System Settings</CardTitle>
                    <CardDescription>
                        Configure system-wide settings for your clinic management application
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-4">
                            <TabsTrigger value="system">
                                <Database className="w-4 h-4 mr-2" />
                                System
                            </TabsTrigger>
                            <TabsTrigger value="appearance">
                                <Sun className="w-4 h-4 mr-2" />
                                Appearance
                            </TabsTrigger>
                            <TabsTrigger value="notifications">
                                <Bell className="w-4 h-4 mr-2" />
                                Notifications
                            </TabsTrigger>
                            <TabsTrigger value="security">
                                <Shield className="w-4 h-4 mr-2" />
                                Security
                            </TabsTrigger>
                            <TabsTrigger value="integrations">
                                <Globe className="w-4 h-4 mr-2" />
                                Integrations
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="system" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* System Stats Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>System Statistics</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">Users</span>
                                                <span className="font-medium">{systemStats.users}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">Total Appointments</span>
                                                <span className="font-medium">{systemStats.appointments.total}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">Completed Appointments</span>
                                                <span className="font-medium">{systemStats.appointments.completed}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">Upcoming Appointments</span>
                                                <span className="font-medium">{systemStats.appointments.upcoming}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">Last Backup</span>
                                                <span className="font-medium">{systemStats.lastBackup}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Database Actions Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Database Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Button
                                                onClick={() => setIsBackupDialogOpen(true)}
                                                className="w-full mb-2"
                                                variant="secondary"
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                Backup Database
                                            </Button>

                                            <Button
                                                onClick={() => setIsImportDialogOpen(true)}
                                                className="w-full mb-2"
                                                variant="secondary"
                                            >
                                                <Upload className="w-4 h-4 mr-2" />
                                                Import Data
                                            </Button>

                                            <Button
                                                onClick={handleRunMaintenance}
                                                className="w-full"
                                                variant="secondary"
                                                disabled={isLoading}
                                            >
                                                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                                Run Maintenance
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Recent Activity Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Recent Activity</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {activityLogs.length > 0 ? (
                                                activityLogs.map((log: {
                                                    action: string;
                                                    status: string;
                                                    created_at: string;
                                                    user_email: string;
                                                    details: string;
                                                }, index: number) => (
                                                    <div key={index} className="text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="font-medium">{log.action}</span>
                                                            <span className={`text-xs ${log.status === 'success' ? 'text-green-600' :
                                                                log.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                                                                }`}>
                                                                {log.status}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {new Date(log.created_at).toLocaleString()} - {log.user_email}
                                                        </div>
                                                        <div className="text-xs">{log.details}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-sm text-muted-foreground">No recent activity</div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* System Settings */}
                            {groupedSettings.system && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>System Configuration</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {groupedSettings.system.map((setting) => (
                                                <div key={setting.setting_name} className="space-y-2">
                                                    <Label htmlFor={`setting-${setting.setting_name}`} className="font-medium">
                                                        {setting.setting_name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                    </Label>
                                                    {renderSettingInput(setting)}
                                                    {setting.setting_description && (
                                                        <p className="text-xs text-muted-foreground">{setting.setting_description}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="appearance" className="space-y-4">
                            {groupedSettings.system && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Theme and Appearance</CardTitle>
                                        <CardDescription>
                                            Customize how the application looks
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {systemSettings
                                                .filter(setting => ['dark_mode', 'primary_color', 'secondary_color', 'font_size'].includes(setting.setting_name))
                                                .map((setting) => (
                                                    <div key={setting.setting_name} className="space-y-2">
                                                        <Label htmlFor={`setting-${setting.setting_name}`} className="font-medium">
                                                            {setting.setting_name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                        </Label>
                                                        {renderSettingInput(setting)}
                                                        {setting.setting_description && (
                                                            <p className="text-xs text-muted-foreground">{setting.setting_description}</p>
                                                        )}
                                                    </div>
                                                ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="notifications" className="space-y-4">
                            {groupedSettings.notifications ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Notification Settings</CardTitle>
                                        <CardDescription>
                                            Configure email and system notifications
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {groupedSettings.notifications.map((setting) => (
                                                <div key={setting.setting_name} className="space-y-2">
                                                    <Label htmlFor={`setting-${setting.setting_name}`} className="font-medium">
                                                        {setting.setting_name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                    </Label>
                                                    {renderSettingInput(setting)}
                                                    {setting.setting_description && (
                                                        <p className="text-xs text-muted-foreground">{setting.setting_description}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Notification Settings</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Alert>
                                            <AlertDescription>
                                                No notification settings found. Configure notification settings to receive alerts about appointments, system events, and more.
                                            </AlertDescription>
                                        </Alert>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="security" className="space-y-4">
                            {groupedSettings.security ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Security Settings</CardTitle>
                                        <CardDescription>
                                            Configure security and access control settings
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {groupedSettings.security.map((setting) => (
                                                <div key={setting.setting_name} className="space-y-2">
                                                    <Label htmlFor={`setting-${setting.setting_name}`} className="font-medium">
                                                        {setting.setting_name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                    </Label>
                                                    {renderSettingInput(setting)}
                                                    {setting.setting_description && (
                                                        <p className="text-xs text-muted-foreground">{setting.setting_description}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Security Settings</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Alert>
                                            <AlertDescription>
                                                No security settings found. Configure security settings to protect your data and control access to the system.
                                            </AlertDescription>
                                        </Alert>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="integrations" className="space-y-4">
                            {groupedSettings.integrations ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Integration Settings</CardTitle>
                                        <CardDescription>
                                            Configure external service integrations
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {groupedSettings.integrations.map((setting) => (
                                                <div key={setting.setting_name} className="space-y-2">
                                                    <Label htmlFor={`setting-${setting.setting_name}`} className="font-medium">
                                                        {setting.setting_name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                    </Label>
                                                    {renderSettingInput(setting)}
                                                    {setting.setting_description && (
                                                        <p className="text-xs text-muted-foreground">{setting.setting_description}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Integration Settings</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Alert>
                                            <AlertDescription>
                                                No integration settings found. Configure integrations with external services like payment processors, SMS providers, and calendars.
                                            </AlertDescription>
                                        </Alert>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={loadSystemSettings} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reload Settings
                            </>
                        )}
                    </Button>
                    <Button onClick={handleSaveSettings} disabled={isLoading || !settingsChanged}>
                        {isLoading ? "Saving..." : "Save Settings"}
                    </Button>
                </CardFooter>
            </Card>

            {/* Backup Database Dialog */}
            <Dialog open={isBackupDialogOpen} onOpenChange={setIsBackupDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Backup Database</DialogTitle>
                        <DialogDescription>
                            Export data for backup or transfer to another system.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="exportDataType" className="text-right">
                                Table
                            </Label>
                            <Select
                                value={exportDataType}
                                onValueChange={setExportDataType}
                            >
                                <SelectTrigger className="w-full col-span-3">
                                    <SelectValue placeholder="Select table to export" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="appointments">Appointments</SelectItem>
                                    <SelectItem value="userinfo">Users</SelectItem>
                                    <SelectItem value="doctors">Doctors</SelectItem>
                                    <SelectItem value="clinics">Clinics</SelectItem>
                                    <SelectItem value="system_settings">System Settings</SelectItem>
                                    <SelectItem value="activity_log">Activity Logs</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="exportFormat" className="text-right">
                                Format
                            </Label>
                            <Select
                                value={exportFormat}
                                onValueChange={setExportFormat}
                            >
                                <SelectTrigger className="w-full col-span-3">
                                    <SelectValue placeholder="Select export format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="csv">CSV</SelectItem>
                                    <SelectItem value="json">JSON</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="startDate" className="text-right">
                                Start Date
                            </Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="endDate" className="text-right">
                                End Date
                            </Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBackupDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleExportData} disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Export Data
                                </>
                            )}
                        </Button>
                        <Button onClick={handleBackupDatabase} disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Backing Up...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Full Backup
                                </>
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
                            Import data from a backup file.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="importDataType" className="text-right">
                                Target Table
                            </Label>
                            <Select
                                value={importDataType}
                                onValueChange={setImportDataType}
                            >
                                <SelectTrigger className="w-full col-span-3">
                                    <SelectValue placeholder="Select table to import into" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="appointments">Appointments</SelectItem>
                                    <SelectItem value="userinfo">Users</SelectItem>
                                    <SelectItem value="doctors">Doctors</SelectItem>
                                    <SelectItem value="clinics">Clinics</SelectItem>
                                    <SelectItem value="system_settings">System Settings</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div
                            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-secondary/20 transition-colors"
                            onClick={handleFileClick}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept=".json"
                            />
                            <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm font-medium">
                                {selectedFile ? selectedFile.name : "Click or drag & drop to upload JSON backup file"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Only .json files exported by this system are supported
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleImportData}
                            disabled={isLoading || !selectedFile}
                        >
                            {isLoading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Import Data
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SettingsManagement;
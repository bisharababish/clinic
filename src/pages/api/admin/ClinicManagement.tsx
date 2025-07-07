// pages/admin/ClinicManagement.tsx
import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useTranslation } from 'react-i18next';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "../../../lib/supabase";
import {
    Trash2,
    Edit,
    Plus,
    RefreshCw,
    Search,
    ArrowUp,
    ArrowDown,
    GripVertical
} from "lucide-react";
import "../../styles/clinicmanagement.css"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAdminState } from "../../../hooks/useAdminState";

interface ClinicInfo {
    id: string;
    name: string;
    category: string;
    description?: string;
    display_order?: number;  // ADD THIS LINE
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

interface CategoryInfo {
    id: string;
    name: string;
    display_order?: number;  // ADD THIS LINE

    is_active: boolean;
}

interface DoctorInfo {
    id: string;
    name: string;
    specialty: string;
    clinic_id: string;
    clinic_name?: string;
    email: string;
    phone?: string;
    is_available: boolean;
    price: number;
}

const ClinicManagement = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { toast } = useToast();

    // ✅ Use centralized state
    const {
        clinics,
        categories,
        isLoading,
        loadClinics,
        loadCategories,
        setIsLoading
    } = useAdminState();

    // ✅ Local state for component-specific functionality
    const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredClinics, setFilteredClinics] = useState<ClinicInfo[]>([]);
    const [activeTab, setActiveTab] = useState<"clinics" | "categories">(
        isRTL ? "clinics" : "categories"
    );

    // State for clinic form
    const [clinicFormMode, setClinicFormMode] = useState<"create" | "edit">("create");
    const [selectedClinic, setSelectedClinic] = useState<string | null>(null);
    const [clinicFormData, setClinicFormData] = useState({
        name: "",
        category_id: "",
        description: "",
        is_active: false,
        display_order: 0,    // ADD THIS LINE

    });

    // State for category form
    const [categoryFormMode, setCategoryFormMode] = useState<"create" | "edit">("create");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [categoryFormData, setCategoryFormData] = useState({
        name: "",
        is_active: true,
        display_order: 0,  // ADD THIS LINE

    });

    // Alert dialog state
    const [showDeleteClinicDialog, setShowDeleteClinicDialog] = useState(false);
    const [clinicToDelete, setClinicToDelete] = useState<string | null>(null);
    const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
    const [showDeleteDoctorDialog, setShowDeleteDoctorDialog] = useState(false);
    const [doctorToDelete, setDoctorToDelete] = useState<string | null>(null);

    // Handle search filtering
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredClinics(clinics);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = clinics.filter(clinic =>
                clinic.name.toLowerCase().includes(query) ||
                clinic.category.toLowerCase().includes(query)
            );
            setFilteredClinics(filtered);
        }
    }, [searchQuery, clinics]);

    // Load doctors from database
    const loadDoctors = async () => {
        try {
            setIsLoading(true);

            // Check if doctors table exists
            const { error: tableCheckError } = await supabase
                .from('doctors')
                .select('id')
                .limit(1);

            if (tableCheckError && tableCheckError.code === 'PGRST116') {
                // Table doesn't exist yet
                setDoctors([]);
                return;
            }

            // Query doctors with their related clinic
            const { data, error } = await supabase
                .from('doctors')
                .select(`
                    *,
                    clinics:clinic_id (name)
                `)
                .order('name', { ascending: true });

            if (error) throw error;

            // Transform to match our interface
            const mappedDoctors: DoctorInfo[] = data.map(doctor => ({
                id: doctor.id,
                name: doctor.name,
                specialty: doctor.specialty,
                clinic_id: doctor.clinic_id,
                clinic_name: doctor.clinics?.name || "Unknown Clinic",
                email: doctor.email,
                phone: doctor.phone || '',
                is_available: doctor.is_available,
                price: doctor.price
            }));

            setDoctors(mappedDoctors);
        } catch (error) {
            console.error("Error loading doctors:", error);
            toast({
                title: t('common.error'),
                description: t('clinicManagement.loadingDoctors'),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };
    // ADD THESE FUNCTIONS:
    const moveClinicUp = async (clinicId: string) => {
        const currentClinic = clinics.find(c => c.id === clinicId);
        if (!currentClinic) return;

        const currentOrder = currentClinic.display_order ?? 0;

        try {
            const { error } = await supabase
                .from('clinics')
                .update({ display_order: currentOrder - 1 })
                .eq('id', clinicId);

            if (error) throw error;

            await loadClinics(true); // Refresh clinics
            toast({
                title: t('common.success'),
                description: t('clinicManagement.orderUpdated'),
            });
        } catch (error) {
            toast({
                title: t('common.error'),
                description: t('clinicManagement.orderUpdateFailed'),
                variant: "destructive",
            });
        }
    };

    const moveClinicDown = async (clinicId: string) => {
        const currentClinic = clinics.find(c => c.id === clinicId);
        if (!currentClinic) return;

        const currentOrder = currentClinic.display_order ?? 0;

        try {
            const { error } = await supabase
                .from('clinics')
                .update({ display_order: currentOrder + 1 })
                .eq('id', clinicId);

            if (error) throw error;

            await loadClinics(true); // Refresh clinics
            toast({
                title: t('common.success'),
                description: 'Clinic moved down successfully',
            });
        } catch (error) {
            toast({
                title: t('common.error'),
                description: 'Failed to move clinic',
                variant: "destructive",
            });
        }
    };
    const moveCategoryUp = async (categoryId: string) => {
        const currentCategory = categories.find(c => c.id === categoryId);
        if (!currentCategory) return;

        const currentOrder = currentCategory.display_order ?? 0;

        try {
            const { error } = await supabase
                .from('clinic_categories')
                .update({ display_order: currentOrder - 1 })
                .eq('id', categoryId);

            if (error) throw error;

            await loadCategories(true);
            toast({
                title: t('common.success'),
                description: 'Category moved up successfully',
            });
        } catch (error) {
            toast({
                title: t('common.error'),
                description: 'Failed to move category',
                variant: "destructive",
            });
        }
    };

    const moveCategoryDown = async (categoryId: string) => {
        const currentCategory = categories.find(c => c.id === categoryId);
        if (!currentCategory) return;

        const currentOrder = currentCategory.display_order ?? 0;

        try {
            const { error } = await supabase
                .from('clinic_categories')
                .update({ display_order: currentOrder + 1 })
                .eq('id', categoryId);

            if (error) throw error;

            await loadCategories(true);
            toast({
                title: t('common.success'),
                description: 'Category moved down successfully',
            });
        } catch (error) {
            toast({
                title: t('common.error'),
                description: 'Failed to move category',
                variant: "destructive",
            });
        }
    };
    // Clinic form handlers
    const handleClinicInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // Handle number inputs properly
        if (name === 'display_order') {
            setClinicFormData(prev => ({
                ...prev,
                [name]: value === '' ? 0 : Number(value)  // CHANGE THIS LINE - use Number() instead of parseInt()
            }));
        } else {
            setClinicFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleClinicCategoryChange = (value: string) => {
        console.log("Category selected with ID:", value);

        // Find the category to log its name for debugging
        if (value) {
            const selectedCategory = categories.find(cat => cat.id === value);
            if (selectedCategory) {
                console.log("Selected category name:", selectedCategory.name);
            } else {
                console.warn("Selected category ID not found in categories list:", value);
            }
        }

        // Update form data with the selected category ID
        setClinicFormData(prev => ({ ...prev, category_id: value }));
    };

    const handleClinicActiveChange = (value: boolean) => {
        setClinicFormData(prev => ({ ...prev, is_active: value }));
    };

    const resetClinicForm = () => {
        setClinicFormMode("create");
        setSelectedClinic(null);
        setClinicFormData({
            name: "",
            category_id: "",
            description: "",
            is_active: false,
            display_order: 0    // ADD THIS LINE

        });
    };

    // FIND THIS FUNCTION AND CHANGE IT:
    const handleEditClinic = (id: string) => {
        const clinicToEdit = clinics.find((c) => c.id === id);
        if (!clinicToEdit) {
            toast({
                title: t('common.error'),
                description: t('clinicManagement.clinicNotFound'),
                variant: "destructive",
            });
            return;
        }

        setClinicFormMode("edit");
        setSelectedClinic(id);
        setClinicFormData({
            name: clinicToEdit.name,
            category_id: clinicToEdit.category,
            description: clinicToEdit.description || "",
            is_active: clinicToEdit.is_active,
            display_order: clinicToEdit.display_order ?? 0
        });
    };

    const handleDeleteClinic = (id: string) => {
        setClinicToDelete(id);
        setShowDeleteClinicDialog(true);
    };

    const confirmDeleteClinic = async () => {
        if (!clinicToDelete) return;

        try {
            setIsLoading(true);

            const doctorsInClinic = doctors.filter(d => d.clinic_id === clinicToDelete);

            if (doctorsInClinic.length > 0) {
                toast({
                    title: t('clinicManagement.cannotDelete'),
                    description: t('clinicManagement.cannotDeleteClinicWithDoctors', { count: doctorsInClinic.length }),
                    variant: "destructive",
                });
                setShowDeleteClinicDialog(false);
                return;
            }

            const { error } = await supabase
                .from('clinics')
                .delete()
                .eq('id', clinicToDelete);

            if (error) {
                toast({
                    title: t('common.error'),
                    description: t('clinicManagement.databaseError') + error.message,
                    variant: "destructive",
                });
                return;
            }

            // ✅ Let real-time subscription handle the update

            toast({
                title: t('common.success'),
                description: t('clinicManagement.clinicDeletedSuccessfully'),
            });
        } catch (error) {
            toast({
                title: t('common.error'),
                description: t('clinicManagement.failedToDeleteClinic'),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            setShowDeleteClinicDialog(false);
        }
    };

    const handleClinicSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log("Form submitted with data:", clinicFormData);

        try {
            setIsLoading(true);

            if (!clinicFormData.name || !clinicFormData.name.trim()) {
                toast({
                    title: t('common.error'),
                    description: t('clinicManagement.clinicNameRequired'),
                    variant: "destructive",
                });
                setIsLoading(false);
                return;
            }

            if (!clinicFormData.category_id) {
                toast({
                    title: t('common.error'),
                    description: t('clinicManagement.categoryRequired'),
                    variant: "destructive",
                });
                setIsLoading(false);
                return;
            }

            console.log("Looking for category with ID:", clinicFormData.category_id);
            console.log("Available categories:", categories);

            const selectedCategory = categories.find(cat => cat.id === clinicFormData.category_id);

            if (!selectedCategory) {
                console.error("Category not found with ID:", clinicFormData.category_id);
                toast({
                    title: t('common.error'),
                    description: t('clinicManagement.categoryNotFound'),
                    variant: "destructive",
                });
                setIsLoading(false);
                return;
            }

            console.log("Found category:", selectedCategory);

            // ✅ FIX: Create the object with conditional properties
            const clinicData = {
                name: clinicFormData.name,
                category_id: selectedCategory.id,
                category: selectedCategory.name,
                description: clinicFormData.description || null,
                is_active: clinicFormData.is_active,
                display_order: clinicFormData.display_order || 0,

                ...(clinicFormMode === "create"
                    ? {
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                    : {
                        updated_at: new Date().toISOString()
                    }
                )
            };

            console.log("Submitting clinic data:", clinicData);

            if (clinicFormMode === "create") {
                const { data, error } = await supabase
                    .from('clinics')
                    .insert(clinicData)
                    .select();

                console.log("Database response:", { data, error });

                if (error) {
                    console.error("Error creating clinic:", error);
                    toast({
                        title: t('common.error'),
                        description: error.message || t('clinicManagement.failedToSaveClinic'),
                        variant: "destructive",
                    });
                    setIsLoading(false);
                    return;
                }

                if (data && data.length > 0) {
                    // ✅ Let real-time subscription handle the update

                    toast({
                        title: t('common.success'),
                        description: t('clinicManagement.clinicCreatedSuccessfully'),
                    });

                    resetClinicForm();
                }
            } else if (clinicFormMode === "edit" && selectedClinic) {
                const { data, error } = await supabase
                    .from('clinics')
                    .update({
                        name: clinicFormData.name,
                        category_id: selectedCategory.id,
                        category: selectedCategory.name,
                        description: clinicFormData.description || null,
                        is_active: clinicFormData.is_active,
                        display_order: clinicFormData.display_order || 0,  // ADD THIS LINE

                        updated_at: new Date().toISOString()
                    })
                    .eq('id', selectedClinic)
                    .select();

                console.log("Database update response:", { data, error });

                if (error) {
                    console.error("Error updating clinic:", error);
                    toast({
                        title: t('common.error'),
                        description: error.message || t('clinicManagement.failedToUpdateClinic'),
                        variant: "destructive",
                    });
                    setIsLoading(false);
                    return;
                }

                if (data && data.length > 0) {
                    // ✅ Let real-time subscription handle the update

                    toast({
                        title: t('common.success'),
                        description: t('clinicManagement.clinicUpdatedSuccessfully'),
                    });

                    resetClinicForm();
                }
            }
        } catch (error) {
            console.error("Unexpected error:", error);
            toast({
                title: t('common.error'),
                description: t('clinicManagement.unexpectedError'),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Category form handlers
    const handleCategoryInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Handle number inputs properly
        if (name === 'display_order') {
            setCategoryFormData(prev => ({
                ...prev,
                [name]: value === '' ? 0 : Number(value)
            }));
        } else {
            setCategoryFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    const handleCategoryActiveChange = (value: boolean) => {
        setCategoryFormData(prev => ({ ...prev, is_active: value }));
    };

    const resetCategoryForm = () => {
        setCategoryFormMode("create");
        setSelectedCategory(null);
        setCategoryFormData({
            name: "",
            is_active: true,
            display_order: 0  // ADD THIS LINE

        });
    };

    const handleEditCategory = (id: string) => {
        const categoryToEdit = categories.find((c) => c.id === id);
        if (!categoryToEdit) {
            toast({
                title: t('common.error'),
                description: t('clinicManagement.categoryNotFound'),
                variant: "destructive",
            });
            return;
        }

        setCategoryFormMode("edit");
        setSelectedCategory(id);
        setCategoryFormData({
            name: categoryToEdit.name,
            is_active: categoryToEdit.is_active,
            display_order: categoryToEdit.display_order ?? 0  // ADD THIS LINE

        });
    };

    const handleDeleteCategory = (id: string) => {
        setCategoryToDelete(id);
        setShowDeleteCategoryDialog(true);
    };

    const confirmDeleteCategory = async () => {
        if (!categoryToDelete) return;

        try {
            setIsLoading(true);

            const categoryToDeleteObj = categories.find(c => c.id === categoryToDelete);
            if (!categoryToDeleteObj) {
                toast({
                    title: t('common.error'),
                    description: t('clinicManagement.categoryNotFound'),
                    variant: "destructive",
                });
                setShowDeleteCategoryDialog(false);
                return;
            }

            const clinicsUsingCategory = clinics.filter(clinic =>
                clinic.category === categoryToDeleteObj.name ||
                clinic.category === categoryToDelete
            );

            if (clinicsUsingCategory.length > 0) {
                const clinicNames = clinicsUsingCategory.map(c => c.name).join(", ");
                toast({
                    title: t('clinicManagement.cannotDelete'),
                    description: t('clinicManagement.cannotDeleteCategoryWithClinics', { clinics: clinicNames }),
                    variant: "destructive",
                });
                setShowDeleteCategoryDialog(false);
                return;
            }

            const { error } = await supabase
                .from('clinic_categories')
                .delete()
                .eq('id', categoryToDelete);

            if (error) {
                toast({
                    title: t('common.error'),
                    description: t('clinicManagement.databaseError') + error.message,
                    variant: "destructive",
                });
                return;
            }

            // ✅ Let real-time subscription handle the update

            toast({
                title: t('common.success'),
                description: t('clinicManagement.categoryDeletedSuccessfully'),
            });
        } catch (error) {
            toast({
                title: t('common.error'),
                description: t('clinicManagement.failedToDeleteCategory'),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            setShowDeleteCategoryDialog(false);
        }
    };

    // Doctor deletion handling
    const handleDeleteDoctor = (id: string) => {
        setDoctorToDelete(id);
        setShowDeleteDoctorDialog(true);
    };

    const confirmDeleteDoctor = async () => {
        if (!doctorToDelete) return;

        try {
            setIsLoading(true);

            // Delete the doctor
            const { error } = await supabase
                .from('doctors')
                .delete()
                .eq('id', doctorToDelete);

            if (error) {
                toast({
                    title: t('common.error'),
                    description: t('clinicManagement.databaseError') + error.message,
                    variant: "destructive",
                });
                return;
            }

            // Update state
            setDoctors(prev => prev.filter(doctor => doctor.id !== doctorToDelete));

            toast({
                title: t('common.success'),
                description: t('clinicManagement.doctorDeletedSuccessfully'),
            });
        } catch (error) {
            toast({
                title: t('common.error'),
                description: t('clinicManagement.failedToDeleteDoctor'),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            setShowDeleteDoctorDialog(false);
        }
    };

    const getCategoryNameById = (id: string) => {
        const category = categories.find(cat => cat.id === id);
        return category ? category.name : "Unknown";
    };

    const handleCategorySubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!categoryFormData.name.trim()) {
            toast({
                title: t('common.error'),
                description: t('clinicManagement.categoryNameRequired'),
                variant: "destructive",
            });
            return;
        }

        try {
            setIsLoading(true);

            if (categoryFormMode === "create") {
                const { data, error } = await supabase
                    .from('clinic_categories')
                    .insert({
                        name: categoryFormData.name,
                        is_active: categoryFormData.is_active,
                        display_order: categoryFormData.display_order || 0  // ADD THIS LINE

                    })
                    .select();

                if (error) throw error;

                if (data && data.length > 0) {
                    // ✅ Let real-time subscription handle the update
                }

                toast({
                    title: t('common.success'),
                    description: t('clinicManagement.categoryCreatedSuccessfully'),
                });

                resetCategoryForm();
            } else if (categoryFormMode === "edit" && selectedCategory) {
                const oldName = categories.find(c => c.id === selectedCategory)?.name;

                const { data, error } = await supabase
                    .from('clinic_categories')
                    .update({
                        name: categoryFormData.name,
                        is_active: categoryFormData.is_active,
                        display_order: categoryFormData.display_order || 0  // ADD THIS LINE

                    })
                    .eq('id', selectedCategory)
                    .select();

                if (error) throw error;

                if (data && data.length > 0) {
                    // ✅ Let real-time subscription handle the update

                    if (oldName && oldName !== categoryFormData.name) {
                        // Update in the database
                        const { error: updateError } = await supabase
                            .from('clinics')
                            .update({ category: categoryFormData.name })
                            .eq('category', oldName);

                        if (updateError) {
                            toast({
                                title: t('common.warning'),
                                description: "Category updated but failed to update related clinics.",
                                variant: "default",
                            });
                        } else {
                            // ✅ Force refresh clinics to ensure data consistency
                            await loadClinics(true);
                        }
                    }
                }

                toast({
                    title: t('common.success'),
                    description: t('clinicManagement.categoryUpdatedSuccessfully'),
                });

                resetCategoryForm();
            }
        } catch (error) {
            toast({
                title: t('common.error'),
                description: t('clinicManagement.failedToSaveCategory'),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Main render
    return (
        <div className={`clinic-management-container ${isRTL ? 'rtl' : ''}`}>
            <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as "clinics" | "categories")}
                className="w-full"
            >
                <TabsList className={`clinic-tabs-list ${isRTL ? "rtl" : ""}`}>
                    {isRTL ? (
                        // Arabic (RTL) - Clinics first, then Categories
                        <>
                            <TabsTrigger value="clinics">{t('clinicManagement.clinics')}</TabsTrigger>
                            <TabsTrigger value="categories">{t('clinicManagement.categories')}</TabsTrigger>
                        </>
                    ) : (
                        // English (LTR) - Categories first, then Clinics
                        <>
                            <TabsTrigger value="categories">{t('clinicManagement.categories')}</TabsTrigger>
                            <TabsTrigger value="clinics">{t('clinicManagement.clinics')}</TabsTrigger>
                        </>
                    )}
                </TabsList>

                {/* CLINICS TAB */}
                <TabsContent value="clinics" className="space-y-6">
                    <div className={`clinic-main-content ${isRTL ? 'rtl' : ''}`}>
                        {/* Clinics List */}
                        <div className="clinic-list-section">
                            <Card>
                                <CardHeader>
                                    <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <CardTitle className={isRTL ? 'text-left' : 'text-left'}>
                                            {t('clinicManagement.clinicsManagement')}
                                        </CardTitle>
                                        <div className={`clinic-header-actions ${isRTL ? 'rtl' : ''}`}>
                                            <div className="clinic-search-container">
                                                <Search className={`clinic-search-icon ${isRTL ? 'rtl' : 'ltr'}`} />
                                                <Input
                                                    placeholder={t('clinicManagement.searchClinics')}
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className={`clinic-search-input ${isRTL ? 'rtl' : ''}`}
                                                    dir={isRTL ? 'rtl' : 'ltr'}
                                                    style={{
                                                        textAlign: isRTL ? 'right' : 'left',
                                                        direction: isRTL ? 'rtl' : 'ltr'
                                                    }}
                                                />
                                            </div>
                                            <div className="clinic-action-buttons">
                                                <Button variant="outline" size="sm" onClick={() => loadClinics()} disabled={isLoading}>
                                                    <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${isLoading ? 'animate-spin' : ''}`} />
                                                    {t('common.refresh')}
                                                </Button>
                                                <Button size="sm" onClick={resetClinicForm}>
                                                    <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                                    {t('clinicManagement.addClinic')}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <CardDescription className={isRTL ? 'text-left' : 'text-left'}>
                                        {t('clinicManagement.description')}
                                    </CardDescription>
                                    {/* Clinic count */}
                                    <div
                                        className="text-sm text-gray-600 font-medium"
                                        style={{
                                            textAlign: isRTL ? 'right' : 'left',
                                            direction: isRTL ? 'rtl' : 'ltr'
                                        }}
                                    >
                                        {filteredClinics.length} {filteredClinics.length === 1 ? t('clinicManagement.clinic') : t('admin.clinics')}
                                        {searchQuery && ` (${t('clinicManagement.filtered')})`}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {filteredClinics.map((clinic) => (
                                            <div key={clinic.id} className={`clinic-item ${isRTL ? 'rtl' : ''}`}>
                                                <div className={`mb-2 sm:mb-0 ${isRTL ? 'text-right' : ''}`} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                                                    <h3 className="font-medium">{clinic.name}</h3>
                                                    <div className="text-sm text-gray-500 capitalize">
                                                        {t('clinicManagement.category')}: {clinic.category}
                                                    </div>
                                                    {clinic.description && (
                                                        <div className="text-sm text-gray-500 mt-1">{clinic.description}</div>
                                                    )}
                                                    <div className="mt-1" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                                                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${clinic.is_active
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                            }`}>
                                                            {clinic.is_active ? t('common.active') : t('common.inactive')}
                                                        </span>
                                                    </div>
                                                </div>
                                                {/* ADD THIS NEW DIV: */}
                                                <div className={`flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 ${isRTL ? 'sm:flex-row-reverse sm:space-x-reverse' : ''}`}>
                                                    <div className={`flex space-x-1 ${isRTL ? 'space-x-reverse' : ''}`}>
                                                        <Button variant="outline" size="sm" onClick={() => moveClinicUp(clinic.id)}>
                                                            <ArrowUp className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="outline" size="sm" onClick={() => moveClinicDown(clinic.id)}>
                                                            <ArrowDown className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <Button variant="outline" size="sm" onClick={() => handleEditClinic(clinic.id)}>
                                                        <Edit className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                                        {t('common.edit')}
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteClinic(clinic.id)}
                                                    >
                                                        <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                                        {t('common.delete')}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}

                                        {filteredClinics.length === 0 && (
                                            <div className={`text-center py-8 text-gray-500 ${isRTL ? 'text-right' : ''}`}>
                                                {searchQuery ? t('clinicManagement.noClinicsFoundSearch') : t('clinicManagement.noClinicFound')}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Clinic Form */}
                        <div className="clinic-form-section">
                            <Card>
                                <CardHeader>
                                    <CardTitle className={isRTL ? 'text-left' : ''}>
                                        {clinicFormMode === "create" ? t('clinicManagement.createNewClinic') : t('clinicManagement.editClinic')}
                                    </CardTitle>
                                    <CardDescription className={isRTL ? 'text-left' : ''}>
                                        {clinicFormMode === "create"
                                            ? t('clinicManagement.addNewClinicDesc')
                                            : t('clinicManagement.modifyClinicDesc')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleClinicSubmit} id="clinicForm" className={`clinic-form ${isRTL ? 'rtl' : ''}`}>
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className={isRTL ? 'text-left block' : ''}>
                                                {t('clinicManagement.clinicName')}
                                            </Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={clinicFormData.name}
                                                onChange={handleClinicInputChange}
                                                placeholder={t('clinicManagement.clinicNamePlaceholder')}
                                                required
                                                className={isRTL ? 'text-left' : ''}
                                                dir={isRTL ? 'rtl' : 'ltr'}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="category_id" className={isRTL ? 'text-left block' : ''}>
                                                {t('clinicManagement.category')}
                                            </Label>
                                            <select
                                                id="category_id"
                                                name="category_id"
                                                value={clinicFormData.category_id}
                                                onChange={(e) => handleClinicCategoryChange(e.target.value)}
                                                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL ? 'text-right' : ''}`}
                                                required
                                                dir={isRTL ? 'rtl' : 'ltr'}
                                                style={{ textAlign: isRTL ? 'right' : 'left' }}
                                            >
                                                <option value="">{t('clinicManagement.selectCategory')}</option>
                                                {categories
                                                    .filter(cat => cat.is_active)
                                                    .map(category => (
                                                        <option key={category.id} value={category.id}>
                                                            {category.name}
                                                        </option>
                                                    ))}
                                            </select>

                                            {categories.length === 0 && (
                                                <div className={`bg-amber-50 border border-amber-200 rounded-md p-4 mt-2 ${isRTL ? 'text-right' : ''}`}>
                                                    <h4 className="font-medium text-amber-800">{t('clinicManagement.noCategoriesAvailable')}</h4>
                                                    <p className="text-amber-700 text-sm mb-3">
                                                        {t('clinicManagement.categoriesRequiredMessage')}
                                                    </p>
                                                    <Button
                                                        type="button"
                                                        onClick={() => setActiveTab("categories")}
                                                        size="sm"
                                                        className="bg-amber-600 hover:bg-amber-700"
                                                    >
                                                        <Plus className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                                        {t('clinicManagement.createCategoryNow')}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description" className={isRTL ? 'text-left block' : ''}>
                                                {t('common.description')}
                                            </Label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                value={clinicFormData.description}
                                                onChange={handleClinicInputChange}
                                                placeholder={t('clinicManagement.descriptionPlaceholder')}
                                                rows={4}
                                                className={isRTL ? 'text-left' : ''}
                                                dir={isRTL ? 'rtl' : 'ltr'}
                                            />
                                        </div>
                                        {/* ADD THE DISPLAY ORDER FIELD RIGHT HERE: */}
                                        <div className="space-y-2">
                                            <Label htmlFor="display_order" className={isRTL ? 'text-left block' : ''}>
                                                {t('clinicManagement.displayOrder')}
                                            </Label>
                                            <Input
                                                id="display_order"
                                                name="display_order"
                                                type="number"
                                                value={clinicFormData.display_order || 0}
                                                onChange={handleClinicInputChange}
                                                placeholder={t('clinicManagement.displayOrderPlaceholder')}
                                                className={isRTL ? 'text-left' : ''}
                                                dir={isRTL ? 'rtl' : 'ltr'}
                                            />
                                            <p className="text-sm text-gray-500">{t('clinicManagement.displayOrderDescription')}</p>

                                        </div>
                                        <div className="space-y-2">
                                            <div className={`flex items-center justify-between ${isRTL ? '' : ''}`}>
                                                <Label htmlFor="is_active" className={isRTL ? 'text-right' : 'text-left'}>
                                                    {t('clinicManagement.activeStatus')}
                                                </Label>
                                                <div className="flex items-center">
                                                    <Switch
                                                        id="is_active"
                                                        checked={clinicFormData.is_active}
                                                        onCheckedChange={handleClinicActiveChange}
                                                        style={{
                                                            direction: 'ltr',
                                                            transform: isRTL ? 'scaleX(-1)' : 'none'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <p className={`text-sm text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                                                {clinicFormData.is_active
                                                    ? t('clinicManagement.clinicActive')
                                                    : t('clinicManagement.clinicInactive')}
                                            </p>
                                        </div>
                                    </form>
                                </CardContent>
                                <CardFooter className={`clinic-card-footer ${isRTL ? 'rtl' : ''} ${clinicFormMode === "create" ? 'create-mode' : ''}`}>
                                    {clinicFormMode === "edit" && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={resetClinicForm}
                                        >
                                            {t('common.cancel')}
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        form="clinicForm"
                                        className={clinicFormMode === "edit" ? "" : "w-full"}
                                        disabled={isLoading || categories.length === 0}
                                    >
                                        {isLoading
                                            ? t('clinicManagement.saving')
                                            : clinicFormMode === "create"
                                                ? t('clinicManagement.createClinic')
                                                : t('clinicManagement.updateClinic')
                                        }
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
                {/* CATEGORIES TAB */}
                <TabsContent value="categories" className="space-y-6">
                    <div className={`flex flex-col lg:flex-row gap-8 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
                        {/* Categories List */}
                        <div className="w-full lg:w-2/3">
                            <Card>
                                <CardHeader>
                                    <div className={`clinic-card-header-top ${isRTL ? 'rtl' : ''}`}>
                                        <CardTitle>{t('clinicManagement.clinicCategories')}</CardTitle>
                                        <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                            <Button variant="outline" size="sm" onClick={() => loadCategories()} disabled={isLoading}>
                                                <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${isLoading ? 'animate-spin' : ''}`} />
                                                {t('common.refresh')}
                                            </Button>
                                            <Button size="sm" onClick={resetCategoryForm}>
                                                <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                                {t('clinicManagement.addCategory')}
                                            </Button>
                                        </div>
                                    </div>
                                    <CardDescription style={{ textAlign: isRTL ? 'right' : 'left' }}>
                                        {t('clinicManagement.categoriesDescription')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {categories.map((category) => (
                                            <div key={category.id} className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-gray-50 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                                                <div className={`clinic-item-info ${isRTL ? 'rtl' : ''}`}>
                                                    <h3 className="font-medium">{category.name}</h3>
                                                    <div className="mt-1" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                                                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${category.is_active
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                            }`}>
                                                            {category.is_active ? t('common.active') : t('common.inactive')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={`clinic-item-actions ${isRTL ? 'rtl' : ''}`}>
                                                    <div className={`flex space-x-1 ${isRTL ? 'space-x-reverse' : ''}`}>
                                                        <Button variant="outline" size="sm" onClick={() => moveCategoryUp(category.id)}>
                                                            <ArrowUp className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="outline" size="sm" onClick={() => moveCategoryDown(category.id)}>
                                                            <ArrowDown className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <Button variant="outline" size="sm" onClick={() => handleEditCategory(category.id)}>
                                                        <Edit className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                                        {t('common.edit')}
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteCategory(category.id)}
                                                    >
                                                        <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                                        {t('common.delete')}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}

                                        {categories.length === 0 && (
                                            <div className={`text-center py-8 text-gray-500 ${isRTL ? 'text-right' : ''}`}>
                                                {t('clinicManagement.noCategoriesFound')}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Category Form */}
                        <div className="w-full lg:w-1/3">
                            <Card>
                                <CardHeader>
                                    <CardTitle className={isRTL ? 'text-left' : ''}>
                                        {categoryFormMode === "create" ? t('clinicManagement.createNewCategory') : t('clinicManagement.editCategory')}
                                    </CardTitle>
                                    <CardDescription className={isRTL ? 'text-left' : ''}>
                                        {categoryFormMode === "create"
                                            ? t('clinicManagement.addNewCategoryDesc')
                                            : t('clinicManagement.modifyCategoryDesc')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCategorySubmit} id="categoryForm" className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
                                        <div className="space-y-2">
                                            <Label htmlFor="categoryName" className={isRTL ? 'text-left block' : ''}>
                                                {t('clinicManagement.categoryName')}
                                            </Label>
                                            <Input
                                                id="categoryName"
                                                name="name"
                                                value={categoryFormData.name}
                                                onChange={handleCategoryInputChange}
                                                placeholder={t('clinicManagement.categoryNamePlaceholder')}
                                                required
                                                className={isRTL ? 'text-left' : ''}
                                                dir={isRTL ? 'rtl' : 'ltr'}
                                            />
                                        </div>
                                        {/* ADD THIS NEW FIELD: */}
                                        <div className="space-y-2">
                                            <Label htmlFor="category_display_order" className={isRTL ? 'text-left block' : ''}>
                                                {t('clinicManagement.displayOrder')}
                                            </Label>
                                            <Input
                                                id="category_display_order"
                                                name="display_order"
                                                type="number"
                                                value={categoryFormData.display_order || 0}
                                                onChange={handleCategoryInputChange}
                                                placeholder={t('clinicManagement.displayOrderPlaceholder')}
                                                className={isRTL ? 'text-left' : ''}
                                                dir={isRTL ? 'rtl' : 'ltr'}
                                            />
                                            <p className="text-sm text-gray-500">{t('clinicManagement.displayOrderDescription')}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className={`flex items-center justify-between ${isRTL ? '' : ''}`}>
                                                <Label htmlFor="categoryActive" className={isRTL ? 'text-right' : 'text-left'}>
                                                    {t('clinicManagement.activeStatus')}
                                                </Label>
                                                <div className="flex items-center">
                                                    <Switch
                                                        id="categoryActive"
                                                        checked={categoryFormData.is_active}
                                                        onCheckedChange={handleCategoryActiveChange}
                                                        style={{
                                                            direction: 'ltr',
                                                            transform: isRTL ? 'scaleX(-1)' : 'none'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <p className={`text-sm text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                                                {categoryFormData.is_active
                                                    ? t('clinicManagement.categoryActive')
                                                    : t('clinicManagement.categoryInactive')}
                                            </p>
                                        </div>
                                    </form>
                                </CardContent>
                                <CardFooter className={`flex justify-between border-t pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    {categoryFormMode === "edit" && !isRTL && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={resetCategoryForm}
                                        >
                                            {t('common.cancel')}
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        form="categoryForm"
                                        className={categoryFormMode === "edit" ? "" : "w-full"}
                                        disabled={isLoading}
                                    >
                                        {isLoading
                                            ? t('clinicManagement.saving')
                                            : categoryFormMode === "create"
                                                ? t('clinicManagement.createCategory')
                                                : t('clinicManagement.updateCategory')
                                        }
                                    </Button>
                                    {categoryFormMode === "edit" && isRTL && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={resetCategoryForm}
                                        >
                                            {t('common.cancel')}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
            {/* Alert Dialogs */}
            {/* Clinic Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteClinicDialog} onOpenChange={setShowDeleteClinicDialog}>
                <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
                    <AlertDialogHeader className={isRTL ? 'text-right' : ''}>
                        <AlertDialogTitle>{t('clinicManagement.deleteClinic')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('clinicManagement.confirmDeleteClinic')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter
                        className={`${isRTL ? 'flex-row-reverse' : ''}`}
                        style={{ gap: isRTL ? '12px' : '8px' }}
                    >
                        <AlertDialogCancel onClick={() => setShowDeleteClinicDialog(false)}>
                            {t('common.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteClinic}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isLoading}
                        >
                            {isLoading ? t('clinicManagement.deleting') : t('common.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {/* Category Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteCategoryDialog} onOpenChange={setShowDeleteCategoryDialog}>
                <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
                    <AlertDialogHeader className={isRTL ? 'text-right' : ''}>
                        <AlertDialogTitle>{t('clinicManagement.deleteCategory')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('clinicManagement.confirmDeleteCategory')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter
                        className={`${isRTL ? 'flex-row-reverse' : ''}`}
                        style={{ gap: isRTL ? '12px' : '8px' }}
                    >
                        <AlertDialogCancel onClick={() => setShowDeleteCategoryDialog(false)}>
                            {t('common.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteCategory}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isLoading}
                        >
                            {isLoading ? t('clinicManagement.deleting') : t('common.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {/* Doctor Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDoctorDialog} onOpenChange={setShowDeleteDoctorDialog}>
                <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
                    <AlertDialogHeader className={isRTL ? 'text-right' : ''}>
                        <AlertDialogTitle>{t('clinicManagement.deleteDoctor')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('clinicManagement.confirmDeleteDoctor')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter
                        className={`${isRTL ? 'flex-row-reverse' : ''}`}
                        style={{ gap: isRTL ? '12px' : '8px' }}
                    >
                        <AlertDialogCancel onClick={() => setShowDeleteDoctorDialog(false)}>
                            {t('common.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteDoctor}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isLoading}
                        >
                            {isLoading ? t('clinicManagement.deleting') : t('common.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ClinicManagement;
// pages/admin/ClinicManagement.tsx
import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
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
    Search
} from "lucide-react";
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
interface ClinicInfo {
    id: string;
    name: string;
    category: string;
    description?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

interface CategoryInfo {
    id: string;
    name: string;
    is_active: boolean;
}

const ClinicManagement = () => {
    // State for clinics
    const [clinics, setClinics] = useState<ClinicInfo[]>([]);
    const [categories, setCategories] = useState<CategoryInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredClinics, setFilteredClinics] = useState<ClinicInfo[]>([]);
    const [activeTab, setActiveTab] = useState<"clinics" | "categories">("clinics");
    // State for clinic form
    const [clinicFormMode, setClinicFormMode] = useState<"create" | "edit">("create");
    const [selectedClinic, setSelectedClinic] = useState<string | null>(null);
    const [clinicFormData, setClinicFormData] = useState({
        name: "",
        category_id: "",
        description: "",
        is_active: true,
    });

    // State for category form
    const [categoryFormMode, setCategoryFormMode] = useState<"create" | "edit">("create");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [categoryFormData, setCategoryFormData] = useState({
        name: "",
        is_active: true,
    });

    const { toast } = useToast();
    const [showDeleteClinicDialog, setShowDeleteClinicDialog] = useState(false);
    const [clinicToDelete, setClinicToDelete] = useState<string | null>(null);
    const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
    // Load clinics and categories on mount
    useEffect(() => {
        loadCategories();
        loadClinics();
    }, []);

    useEffect(() => {
        // If no categories exist and we're on the clinics tab, switch to categories tab
        if (categories.length === 0 && activeTab === "clinics") {
            setActiveTab("categories");
        }
    }, [categories, activeTab]);
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

    // Load categories from database
    const loadCategories = async () => {
        try {
            setIsLoading(true);

            // Check if categories table exists, if not create it
            const { error: tableCheckError } = await supabase
                .from('clinic_categories')
                .select('id')
                .limit(1);

            if (tableCheckError && tableCheckError.code === 'PGRST116') {
                // Table doesn't exist, create it
                await supabase.rpc('create_clinic_categories_table');
            }

            const { data, error } = await supabase
                .from('clinic_categories')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;

            setCategories(data || []);
        } catch (error) {
            console.error("Error loading categories:", error);
            toast({
                title: "Error",
                description: "Failed to load clinic categories.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Load clinics from database
    const loadClinics = async () => {
        try {
            setIsLoading(true);

            // Check if clinics table exists, if not create it
            const { error: tableCheckError } = await supabase
                .from('clinics')
                .select('id')
                .limit(1);

            if (tableCheckError && tableCheckError.code === 'PGRST116') {
                // Table doesn't exist, create it
                await supabase.rpc('create_clinics_table');
            }

            const { data, error } = await supabase
                .from('clinics')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;

            setClinics(data || []);
            setFilteredClinics(data || []);
        } catch (error) {
            console.error("Error loading clinics:", error);
            toast({
                title: "Error",
                description: "Failed to load clinics.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Clinic form handlers
    const handleClinicInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setClinicFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClinicCategoryChange = (value: string) => {
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
            is_active: true
        });
    };

    const handleEditClinic = (id: string) => {
        const clinicToEdit = clinics.find((c) => c.id === id);
        if (!clinicToEdit) {
            toast({
                title: "Error",
                description: "Clinic not found.",
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
            is_active: clinicToEdit.is_active
        });
    };

    const handleDeleteClinic = async (id: string) => {
        setClinicToDelete(id);
        setShowDeleteClinicDialog(true);


        try {
            setIsLoading(true);

            // First check if there are doctors associated with this clinic
            const { data: doctorData, error: doctorError } = await supabase
                .from('doctors')
                .select('id')
                .eq('clinic_id', id);

            if (doctorError) throw doctorError;

            if (doctorData && doctorData.length > 0) {
                toast({
                    title: "Cannot Delete",
                    description: "This clinic has doctors assigned to it. Please remove the doctors first.",
                    variant: "destructive",
                });
                return;
            }

            // If no doctors are associated, proceed with deletion
            const { error } = await supabase
                .from('clinics')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Update state
            setClinics(prev => prev.filter(clinic => clinic.id !== id));
            setFilteredClinics(prev => prev.filter(clinic => clinic.id !== id));

            toast({
                title: "Success",
                description: "Clinic deleted successfully.",
            });
        } catch (error) {
            console.error("Error deleting clinic:", error);
            toast({
                title: "Error",
                description: "Failed to delete clinic. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClinicSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            setIsLoading(true);

            if (clinicFormMode === "create") {
                // Create new clinic
                const { data, error } = await supabase
                    .from('clinics')
                    .insert({
                        name: clinicFormData.name,
                        category_id: clinicFormData.category_id,
                        description: clinicFormData.description,
                        is_active: clinicFormData.is_active,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .select();

                if (error) throw error;

                if (data && data.length > 0) {
                    setClinics(prev => [...prev, data[0]]);
                    setFilteredClinics(prev => [...prev, data[0]]);
                }

                toast({
                    title: "Success",
                    description: "Clinic created successfully.",
                });

                resetClinicForm();
            } else if (clinicFormMode === "edit" && selectedClinic) {
                // Update existing clinic
                const { data, error } = await supabase
                    .from('clinics')
                    .update({
                        name: clinicFormData.name,
                        category_id: clinicFormData.category_id,
                        description: clinicFormData.description,
                        is_active: clinicFormData.is_active,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', selectedClinic)
                    .select();

                if (error) throw error;

                if (data && data.length > 0) {
                    setClinics(prev => prev.map(c => c.id === selectedClinic ? data[0] : c));
                    setFilteredClinics(prev => prev.map(c => c.id === selectedClinic ? data[0] : c));
                }

                toast({
                    title: "Success",
                    description: "Clinic updated successfully.",
                });

                resetClinicForm();
            }
        } catch (error) {
            console.error("Error saving clinic:", error);
            toast({
                title: "Error",
                description: "Failed to save clinic. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Category form handlers
    const handleCategoryInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCategoryFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryActiveChange = (value: boolean) => {
        setCategoryFormData(prev => ({ ...prev, is_active: value }));
    };

    const resetCategoryForm = () => {
        setCategoryFormMode("create");
        setSelectedCategory(null);
        setCategoryFormData({
            name: "",
            is_active: true
        });
    };

    const handleEditCategory = (id: string) => {
        const categoryToEdit = categories.find((c) => c.id === id);
        if (!categoryToEdit) {
            toast({
                title: "Error",
                description: "Category not found.",
                variant: "destructive",
            });
            return;
        }

        setCategoryFormMode("edit");
        setSelectedCategory(id);
        setCategoryFormData({
            name: categoryToEdit.name,
            is_active: categoryToEdit.is_active
        });
    };

    const handleDeleteCategory = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
            return;
        }

        try {
            setIsLoading(true);

            // Check if there are clinics using this category
            const { data: clinicData, error: clinicError } = await supabase
                .from('clinics')
                .select('id')
                .eq('category', categories.find(c => c.id === id)?.name || '');

            if (clinicError) throw clinicError;

            if (clinicData && clinicData.length > 0) {
                toast({
                    title: "Cannot Delete",
                    description: "This category is used by one or more clinics. Please reassign those clinics first.",
                    variant: "destructive",
                });
                return;
            }

            // Delete the category
            const { error } = await supabase
                .from('clinic_categories')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Update state
            setCategories(prev => prev.filter(category => category.id !== id));

            toast({
                title: "Success",
                description: "Category deleted successfully.",
            });
        } catch (error) {
            console.error("Error deleting category:", error);
            toast({
                title: "Error",
                description: "Failed to delete category. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
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
                title: "Error",
                description: "Category name is required.",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsLoading(true);

            if (categoryFormMode === "create") {
                // Create new category
                const { data, error } = await supabase
                    .from('clinic_categories')
                    .insert({
                        name: categoryFormData.name,
                        is_active: categoryFormData.is_active
                    })
                    .select();

                if (error) throw error;

                if (data && data.length > 0) {
                    setCategories(prev => [...prev, data[0]]);
                }

                toast({
                    title: "Success",
                    description: "Category created successfully.",
                });

                resetCategoryForm();
            } else if (categoryFormMode === "edit" && selectedCategory) {
                // Update existing category
                const oldName = categories.find(c => c.id === selectedCategory)?.name;

                const { data, error } = await supabase
                    .from('clinic_categories')
                    .update({
                        name: categoryFormData.name,
                        is_active: categoryFormData.is_active
                    })
                    .eq('id', selectedCategory)
                    .select();

                if (error) throw error;

                if (data && data.length > 0) {
                    setCategories(prev => prev.map(c => c.id === selectedCategory ? data[0] : c));

                    // Update category name in all clinics using this category
                    if (oldName && oldName !== categoryFormData.name) {
                        const { error: updateError } = await supabase
                            .from('clinics')
                            .update({ category: categoryFormData.name })
                            .eq('category', oldName);

                        if (updateError) {
                            console.error("Error updating clinic categories:", updateError);
                            // Still show success for category update
                        } else {
                            // Refresh clinics to get updated category names
                            loadClinics();
                        }
                    }
                }

                toast({
                    title: "Success",
                    description: "Category updated successfully.",
                });

                resetCategoryForm();
            }
        } catch (error) {
            console.error("Error saving category:", error);
            toast({
                title: "Error",
                description: "Failed to save category. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Main render
    return (
        <div className="space-y-8">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "clinics" | "categories")} className="w-full">
                <TabsList>
                    <TabsTrigger value="clinics">Clinics</TabsTrigger>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                </TabsList>

                {/* CLINICS TAB */}
                <TabsContent value="clinics" className="space-y-6">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Clinics List */}
                        <div className="w-full lg:w-2/3">
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>Clinics Management</CardTitle>
                                        <div className="flex items-center space-x-2">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search clinics..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="pl-10 w-[250px]"
                                                />
                                            </div>
                                            <Button variant="outline" size="sm" onClick={loadClinics} disabled={isLoading}>
                                                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                                Refresh
                                            </Button>
                                            <Button size="sm" onClick={resetClinicForm}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Clinic
                                            </Button>
                                        </div>
                                    </div>
                                    <CardDescription>
                                        Manage all clinic departments
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {filteredClinics.map((clinic) => (
                                            <div key={clinic.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                                <div>
                                                    <h3 className="font-medium">{clinic.name}</h3>
                                                    <div className="text-sm text-gray-500 capitalize">Category: {clinic.category}</div>
                                                    {clinic.description && (
                                                        <div className="text-sm text-gray-500 mt-1">{clinic.description}</div>
                                                    )}
                                                    <div className="mt-1">
                                                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${clinic.is_active
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                            }`}>
                                                            {clinic.is_active ? "Active" : "Inactive"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleEditClinic(clinic.id)}>
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteClinic(clinic.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}

                                        {filteredClinics.length === 0 && (
                                            <div className="text-center py-8 text-gray-500">
                                                {searchQuery ? "No clinics found matching your search." : "No clinics found. Add a clinic to get started."}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <div className="text-sm text-gray-500">
                                        {filteredClinics.length} {filteredClinics.length === 1 ? 'clinic' : 'clinics'}
                                        {searchQuery && ' (filtered)'}
                                    </div>
                                </CardFooter>
                            </Card>
                        </div>

                        {/* Clinic Form */}
                        <div className="w-full lg:w-1/3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{clinicFormMode === "create" ? "Create New Clinic" : "Edit Clinic"}</CardTitle>
                                    <CardDescription>
                                        {clinicFormMode === "create"
                                            ? "Add a new clinic department"
                                            : "Modify existing clinic details"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleClinicSubmit} id="clinicForm" className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Clinic Name *</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={clinicFormData.name}
                                                onChange={handleClinicInputChange}
                                                placeholder="e.g. Cardiology Center"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="category">Category *</Label>
                                            <select
                                                id="category_id"
                                                name="category_id"
                                                value={clinicFormData.category_id}
                                                onChange={(e) => handleClinicCategoryChange(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            >
                                                <option value="" disabled>Select a category</option>
                                                {categories
                                                    .filter(cat => cat.is_active) // Only show active categories
                                                    .map(category => (
                                                        <option key={category.id} value={category.id}>
                                                            {category.name}
                                                        </option>
                                                    ))}
                                            </select>
                                            {/* Replace the existing "No categories" warning in the clinic form with this: */}
                                            {categories.length === 0 && (
                                                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mt-2">
                                                    <h4 className="font-medium text-amber-800">No Categories Available</h4>
                                                    <p className="text-amber-700 text-sm mb-3">
                                                        Categories must be created before you can add clinics.
                                                    </p>
                                                    <Button
                                                        type="button"
                                                        onClick={() => setActiveTab("categories")}
                                                        size="sm"
                                                        className="bg-amber-600 hover:bg-amber-700"
                                                    >
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        Create Category Now
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                value={clinicFormData.description}
                                                onChange={handleClinicInputChange}
                                                placeholder="Describe this clinic's services and specialties"
                                                rows={4}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="is_active">Active Status</Label>
                                                <Switch
                                                    id="is_active"
                                                    checked={clinicFormData.is_active}
                                                    onCheckedChange={handleClinicActiveChange}
                                                />
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {clinicFormData.is_active
                                                    ? "This clinic is visible and accepting appointments"
                                                    : "This clinic is hidden and not accepting appointments"}
                                            </p>
                                        </div>
                                    </form>
                                </CardContent>
                                <CardFooter className="flex justify-between border-t pt-4">
                                    {clinicFormMode === "edit" && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={resetClinicForm}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        form="clinicForm"
                                        className={clinicFormMode === "edit" ? "" : "w-full"}
                                        disabled={isLoading || categories.length === 0}
                                    >
                                        {isLoading
                                            ? "Saving..."
                                            : clinicFormMode === "create"
                                                ? "Create Clinic"
                                                : "Update Clinic"
                                        }
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* CATEGORIES TAB */}
                <TabsContent value="categories" className="space-y-6">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Categories List */}
                        <div className="w-full lg:w-2/3">
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>Clinic Categories</CardTitle>
                                        <div className="flex items-center space-x-2">
                                            <Button variant="outline" size="sm" onClick={loadCategories} disabled={isLoading}>
                                                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                                Refresh
                                            </Button>
                                            <Button size="sm" onClick={resetCategoryForm}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Category
                                            </Button>
                                        </div>
                                    </div>
                                    <CardDescription>
                                        Manage clinic specialties and categories
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {categories.map((category) => (
                                            <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                                <div>
                                                    <h3 className="font-medium">{category.name}</h3>
                                                    <div className="mt-1">
                                                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${category.is_active
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                            }`}>
                                                            {category.is_active ? "Active" : "Inactive"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleEditCategory(category.id)}>
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteCategory(category.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}

                                        {categories.length === 0 && (
                                            <div className="text-center py-8 text-gray-500">
                                                No categories found. Add a category to get started.
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
                                    <CardTitle>{categoryFormMode === "create" ? "Create New Category" : "Edit Category"}</CardTitle>
                                    <CardDescription>
                                        {categoryFormMode === "create"
                                            ? "Add a new clinic category"
                                            : "Modify existing category details"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCategorySubmit} id="categoryForm" className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="categoryName">Category Name *</Label>
                                            <Input
                                                id="categoryName"
                                                name="name"
                                                value={categoryFormData.name}
                                                onChange={handleCategoryInputChange}
                                                placeholder="e.g. Cardiology"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="categoryActive">Active Status</Label>
                                                <Switch
                                                    id="categoryActive"
                                                    checked={categoryFormData.is_active}
                                                    onCheckedChange={handleCategoryActiveChange}
                                                />
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {categoryFormData.is_active
                                                    ? "This category is active and available for selection"
                                                    : "This category is inactive and hidden from selection"}
                                            </p>
                                        </div>
                                    </form>
                                </CardContent>
                                <CardFooter className="flex justify-between border-t pt-4">
                                    {categoryFormMode === "edit" && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={resetCategoryForm}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        form="categoryForm"
                                        className={categoryFormMode === "edit" ? "" : "w-full"}
                                        disabled={isLoading}
                                    >
                                        {isLoading
                                            ? "Saving..."
                                            : categoryFormMode === "create"
                                                ? "Create Category"
                                                : "Update Category"
                                        }
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ClinicManagement;
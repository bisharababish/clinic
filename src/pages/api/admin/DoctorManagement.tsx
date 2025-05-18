// pages/admin/DoctorManagement.tsx
import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "../../../lib/supabase";
import {
    Trash2,
    Edit,
    Plus,
    Clock,
    RefreshCw,
    Search,
    Calendar,
    AlertTriangle
} from "lucide-react";

interface DoctorInfo {
    id: string;
    name: string;
    specialty: string;
    clinic_id: string;
    email: string;
    phone?: string;
    is_available: boolean;
    price: number;
    created_at?: string;
    updated_at?: string;
}

interface ClinicInfo {
    id: string;
    name: string;
    category: string;
    is_active: boolean;
}

interface AvailabilitySlot {
    id: string;
    doctor_id: string;
    day: string;
    start_time: string;
    end_time: string;
}

const DoctorManagement = () => {
    // State for doctors
    const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
    const [clinics, setClinics] = useState<ClinicInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredDoctors, setFilteredDoctors] = useState<DoctorInfo[]>([]);

    // State for doctor form
    const [doctorFormMode, setDoctorFormMode] = useState<"create" | "edit">("create");
    const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
    const [doctorFormData, setDoctorFormData] = useState({
        name: "",
        specialty: "",
        clinic_id: "",
        email: "",
        phone: "",
        is_available: true,
        price: 0,
    });

    // State for availability management
    const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
    const [selectedDoctorForAvailability, setSelectedDoctorForAvailability] = useState<string | null>(null);
    const [selectedDoctorName, setSelectedDoctorName] = useState("");
    const [newSlot, setNewSlot] = useState({
        day: "Monday",
        start_time: "",
        end_time: "",
    });
    const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);

    // State for delete confirmation dialog
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [doctorToDelete, setDoctorToDelete] = useState<DoctorInfo | null>(null);

    const { toast } = useToast();

    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    // Load doctors and clinics on mount
    useEffect(() => {
        loadClinics();
        loadDoctors();
    }, []);

    // Handle search filtering
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredDoctors(doctors);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = doctors.filter(doctor =>
                doctor.name.toLowerCase().includes(query) ||
                doctor.specialty.toLowerCase().includes(query) ||
                doctor.email.toLowerCase().includes(query)
            );
            setFilteredDoctors(filtered);
        }
    }, [searchQuery, doctors]);

    // Load clinics from database
    const loadClinics = async () => {
        try {
            setIsLoading(true);

            const { data, error } = await supabase
                .from('clinics')
                .select('*')
                .eq('is_active', true)
                .order('name', { ascending: true });

            if (error) throw error;

            setClinics(data || []);
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

    // Load doctors from database
    const loadDoctors = async () => {
        try {
            setIsLoading(true);

            // Check if doctors table exists, if not create it
            const { error: tableCheckError } = await supabase
                .from('doctors')
                .select('id')
                .limit(1);

            if (tableCheckError && tableCheckError.code === 'PGRST116') {
                // Table doesn't exist, create it
                await supabase.rpc('create_doctors_table');
            }

            const { data, error } = await supabase
                .from('doctors')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;

            setDoctors(data || []);
            setFilteredDoctors(data || []);
        } catch (error) {
            console.error("Error loading doctors:", error);
            toast({
                title: "Error",
                description: "Failed to load doctors.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Load availability slots for a specific doctor
    const loadAvailabilitySlots = async (doctorId: string) => {
        try {
            setIsLoading(true);

            // Check if availability_slots table exists, if not create it
            const { error: tableCheckError } = await supabase
                .from('doctor_availability')
                .select('id')
                .limit(1);

            if (tableCheckError && tableCheckError.code === 'PGRST116') {
                // Table doesn't exist, create it
                await supabase.rpc('create_doctor_availability_table');
            }

            const { data, error } = await supabase
                .from('doctor_availability')
                .select('*')
                .eq('doctor_id', doctorId)
                .order('day', { ascending: true })
                .order('start_time', { ascending: true });

            if (error) throw error;

            setAvailabilitySlots(data || []);
        } catch (error) {
            console.error("Error loading availability slots:", error);
            toast({
                title: "Error",
                description: "Failed to load availability slots.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Doctor form handlers
    const handleDoctorInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDoctorFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDoctorClinicChange = (value: string) => {
        setDoctorFormData(prev => ({ ...prev, clinic_id: value }));
    };

    const handleDoctorAvailableChange = (value: boolean) => {
        setDoctorFormData(prev => ({ ...prev, is_available: value }));
    };

    const resetDoctorForm = () => {
        setDoctorFormMode("create");
        setSelectedDoctor(null);
        setDoctorFormData({
            name: "",
            specialty: "",
            clinic_id: "",
            email: "",
            phone: "",
            is_available: true,
            price: 0
        });
    };

    const handleEditDoctor = (id: string) => {
        const doctorToEdit = doctors.find((d) => d.id === id);
        if (!doctorToEdit) {
            toast({
                title: "Error",
                description: "Doctor not found.",
                variant: "destructive",
            });
            return;
        }

        setDoctorFormMode("edit");
        setSelectedDoctor(id);
        setDoctorFormData({
            name: doctorToEdit.name,
            specialty: doctorToEdit.specialty,
            clinic_id: doctorToEdit.clinic_id,
            email: doctorToEdit.email,
            phone: doctorToEdit.phone || "",
            is_available: doctorToEdit.is_available,
            price: doctorToEdit.price
        });
    };

    // Open delete confirmation dialog
    const confirmDeleteDoctor = (doctor: DoctorInfo) => {
        setDoctorToDelete(doctor);
        setShowDeleteDialog(true);
    };

    // Handle actual doctor deletion
    const handleDeleteDoctor = async () => {
        if (!doctorToDelete) return;

        try {
            setIsLoading(true);

            // First delete all availability slots for this doctor
            const { error: availabilityError } = await supabase
                .from('doctor_availability')
                .delete()
                .eq('doctor_id', doctorToDelete.id);

            if (availabilityError) {
                console.error("Error deleting availability slots:", availabilityError);
                // Continue with doctor deletion even if availability deletion fails
            }

            // Delete the doctor
            const { error } = await supabase
                .from('doctors')
                .delete()
                .eq('id', doctorToDelete.id);

            if (error) throw error;

            // Update state
            setDoctors(prev => prev.filter(doctor => doctor.id !== doctorToDelete.id));
            setFilteredDoctors(prev => prev.filter(doctor => doctor.id !== doctorToDelete.id));

            toast({
                title: "Success",
                description: `Dr. ${doctorToDelete.name} has been deleted successfully.`,
            });

            // Close the dialog
            setShowDeleteDialog(false);
            setDoctorToDelete(null);
        } catch (error) {
            console.error("Error deleting doctor:", error);
            toast({
                title: "Error",
                description: "Failed to delete doctor. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDoctorSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Validate doctor form
        if (!doctorFormData.name.trim() || !doctorFormData.specialty.trim() || !doctorFormData.clinic_id || !doctorFormData.email.trim()) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        if (isNaN(doctorFormData.price) || doctorFormData.price < 0) {
            toast({
                title: "Validation Error",
                description: "Price must be a valid number.",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsLoading(true);

            if (doctorFormMode === "create") {
                // Create new doctor
                const { data, error } = await supabase
                    .from('doctors')
                    .insert({
                        name: doctorFormData.name,
                        specialty: doctorFormData.specialty,
                        clinic_id: doctorFormData.clinic_id,
                        email: doctorFormData.email,
                        phone: doctorFormData.phone || null,
                        is_available: doctorFormData.is_available,
                        price: Number(doctorFormData.price),
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .select();

                if (error) throw error;

                if (data && data.length > 0) {
                    setDoctors(prev => [...prev, data[0]]);
                    setFilteredDoctors(prev => [...prev, data[0]]);
                    toast({
                        title: "Success",
                        description: "Doctor created successfully. Don't forget to set their availability.",
                    });
                }

                resetDoctorForm();
            } else if (doctorFormMode === "edit" && selectedDoctor) {
                // Update existing doctor
                const { data, error } = await supabase
                    .from('doctors')
                    .update({
                        name: doctorFormData.name,
                        specialty: doctorFormData.specialty,
                        clinic_id: doctorFormData.clinic_id,
                        email: doctorFormData.email,
                        phone: doctorFormData.phone || null,
                        is_available: doctorFormData.is_available,
                        price: Number(doctorFormData.price),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', selectedDoctor)
                    .select();

                if (error) throw error;

                if (data && data.length > 0) {
                    setDoctors(prev => prev.map(d => d.id === selectedDoctor ? data[0] : d));
                    setFilteredDoctors(prev => prev.map(d => d.id === selectedDoctor ? data[0] : d));

                    toast({
                        title: "Success",
                        description: "Doctor updated successfully.",
                    });
                }

                resetDoctorForm();
            }
        } catch (error) {
            console.error("Error saving doctor:", error);
            toast({
                title: "Error",
                description: "Failed to save doctor. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Availability slot handlers
    const handleManageAvailability = (id: string) => {
        const doctor = doctors.find(d => d.id === id);
        if (!doctor) {
            toast({
                title: "Error",
                description: "Doctor not found.",
                variant: "destructive",
            });
            return;
        }

        setSelectedDoctorForAvailability(id);
        setSelectedDoctorName(doctor.name);
        loadAvailabilitySlots(id);
        setShowAvailabilityDialog(true);
    };

    const handleNewSlotChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewSlot(prev => ({ ...prev, [name]: value }));
    };

    const handleAddAvailabilitySlot = async () => {
        if (!selectedDoctorForAvailability) return;

        if (!newSlot.day || !newSlot.start_time || !newSlot.end_time) {
            toast({
                title: "Validation Error",
                description: "Please fill in all availability fields.",
                variant: "destructive",
            });
            return;
        }

        // Validate time format and that end time is after start time
        const startTime = new Date(`2023-01-01T${newSlot.start_time}`);
        const endTime = new Date(`2023-01-01T${newSlot.end_time}`);

        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            toast({
                title: "Validation Error",
                description: "Please enter valid time values.",
                variant: "destructive",
            });
            return;
        }

        if (startTime >= endTime) {
            toast({
                title: "Validation Error",
                description: "End time must be after start time.",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsLoading(true);

            const { data, error } = await supabase
                .from('doctor_availability')
                .insert({
                    doctor_id: selectedDoctorForAvailability,
                    day: newSlot.day,
                    start_time: newSlot.start_time,
                    end_time: newSlot.end_time
                })
                .select();

            if (error) throw error;

            if (data && data.length > 0) {
                setAvailabilitySlots(prev => [...prev, data[0]]);

                // Reset the form for a new entry
                setNewSlot({
                    day: newSlot.day, // Keep the same day for consecutive entries
                    start_time: "",
                    end_time: ""
                });

                toast({
                    title: "Success",
                    description: "Availability slot added successfully.",
                });
            }
        } catch (error) {
            console.error("Error adding availability slot:", error);
            toast({
                title: "Error",
                description: "Failed to add availability slot. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAvailabilitySlot = async (id: string) => {
        try {
            setIsLoading(true);

            const { error } = await supabase
                .from('doctor_availability')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setAvailabilitySlots(prev => prev.filter(slot => slot.id !== id));

            toast({
                title: "Success",
                description: "Availability slot removed successfully.",
            });
        } catch (error) {
            console.error("Error deleting availability slot:", error);
            toast({
                title: "Error",
                description: "Failed to delete availability slot. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getClinicNameById = (id: string) => {
        const clinic = clinics.find(c => c.id === id);
        return clinic ? clinic.name : "Unknown Clinic";
    };

    // Format time for display
    const formatTime = (time: string) => {
        try {
            const [hours, minutes] = time.split(':');
            const date = new Date();
            date.setHours(parseInt(hours, 10));
            date.setMinutes(parseInt(minutes, 10));
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return time;
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Doctors List */}
                <div className="w-full lg:w-2/3">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Doctors Management</CardTitle>
                                <div className="flex items-center space-x-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search doctors..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 w-[250px]"
                                        />
                                    </div>
                                    <Button variant="outline" size="sm" onClick={loadDoctors} disabled={isLoading}>
                                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </Button>
                                    <Button size="sm" onClick={resetDoctorForm}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Doctor
                                    </Button>
                                </div>
                            </div>
                            <CardDescription>
                                Manage doctors and their clinic assignments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {filteredDoctors.map((doctor) => (
                                    <div key={doctor.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                        <div>
                                            <h3 className="font-medium">{doctor.name}</h3>
                                            <div className="text-sm text-gray-500">{doctor.specialty}</div>
                                            <div className="text-sm text-gray-500">{getClinicNameById(doctor.clinic_id)}</div>
                                            <div className="mt-1 flex items-center space-x-2">
                                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${doctor.is_available
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                                    }`}>
                                                    {doctor.is_available ? "Available" : "Unavailable"}
                                                </span>
                                                <span className="text-sm font-medium">₪{doctor.price}</span>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => handleManageAvailability(doctor.id)}>
                                                <Clock className="h-4 w-4 mr-1" />
                                                Hours
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleEditDoctor(doctor.id)}>
                                                <Edit className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => confirmDeleteDoctor(doctor)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {filteredDoctors.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        {searchQuery ? "No doctors found matching your search." : "No doctors found. Add a doctor to get started."}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <div className="text-sm text-gray-500">
                                {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'}
                                {searchQuery && ' (filtered)'}
                            </div>
                        </CardFooter>
                    </Card>
                </div>

                {/* Doctor Form */}
                <div className="w-full lg:w-1/3">
                    <Card>
                        <CardHeader>
                            <CardTitle>{doctorFormMode === "create" ? "Create New Doctor" : "Edit Doctor"}</CardTitle>
                            <CardDescription>
                                {doctorFormMode === "create"
                                    ? "Add a new doctor profile"
                                    : "Modify existing doctor details"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleDoctorSubmit} id="doctorForm" className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Doctor Name </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={doctorFormData.name}
                                        onChange={handleDoctorInputChange}
                                        placeholder="Dr. Full Name"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="specialty">Specialty </Label>
                                    <Input
                                        id="specialty"
                                        name="specialty"
                                        value={doctorFormData.specialty}
                                        onChange={handleDoctorInputChange}
                                        placeholder="e.g. Cardiologist"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="clinic_id">Clinic </Label>
                                    <select
                                        id="clinic_id"
                                        name="clinic_id"
                                        value={doctorFormData.clinic_id}
                                        onChange={(e) => handleDoctorClinicChange(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="" disabled>Select a clinic</option>
                                        {clinics.map(clinic => (
                                            <option key={clinic.id} value={clinic.id}>
                                                {clinic.name} ({clinic.category})
                                            </option>
                                        ))}
                                    </select>
                                    {clinics.length === 0 && (
                                        <p className="text-sm text-amber-600">
                                            No clinics available. Please create a clinic first.
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={doctorFormData.email}
                                        onChange={handleDoctorInputChange}
                                        placeholder="doctor@example.com"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={doctorFormData.phone}
                                        onChange={handleDoctorInputChange}
                                        placeholder="e.g. +1234567890"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price">Appointment Price (₪) </Label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        value={doctorFormData.price.toString()}
                                        onChange={handleDoctorInputChange}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="is_available">Availability Status</Label>
                                        <Switch
                                            id="is_available"
                                            checked={doctorFormData.is_available}
                                            onCheckedChange={handleDoctorAvailableChange}
                                        />
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {doctorFormData.is_available
                                            ? "This doctor is available for appointments"
                                            : "This doctor is not available for appointments"}
                                    </p>
                                </div>
                            </form>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t pt-4">
                            {doctorFormMode === "edit" && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetDoctorForm}
                                >
                                    Cancel
                                </Button>
                            )}
                            <Button
                                type="submit"
                                form="doctorForm"
                                className={doctorFormMode === "edit" ? "" : "w-full"}
                                disabled={isLoading || clinics.length === 0}
                            >
                                {isLoading
                                    ? "Saving..."
                                    : doctorFormMode === "create"
                                        ? "Create Doctor"
                                        : "Update Doctor"
                                }
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            {/* Availability Dialog */}
            <Dialog open={showAvailabilityDialog} onOpenChange={setShowAvailabilityDialog}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Manage Doctor's Availability</DialogTitle>
                        <DialogDescription>
                            Set the available hours for Dr. {selectedDoctorName}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Current availability slots */}
                        <div>
                            <h3 className="text-lg font-medium mb-3">Current Availability</h3>
                            {availabilitySlots.length > 0 ? (
                                <div className="space-y-4">
                                    {weekdays.map(day => {
                                        const daySlots = availabilitySlots.filter(slot => slot.day === day);
                                        if (daySlots.length === 0) return null;

                                        return (
                                            <div key={day} className="border rounded-md p-4">
                                                <h4 className="font-medium mb-2">{day}</h4>
                                                <div className="space-y-2">
                                                    {daySlots.map(slot => (
                                                        <div key={slot.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                            <span>
                                                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                                            </span>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteAvailabilitySlot(slot.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-4 border rounded-md bg-gray-50">
                                    <p className="text-gray-500">No availability slots defined yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Add new slot */}
                        <div className="border-t pt-4">
                            <h3 className="text-lg font-medium mb-3">Add New Availability Slot</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="day">Day</Label>
                                    <select
                                        id="day"
                                        name="day"
                                        value={newSlot.day}
                                        onChange={handleNewSlotChange}
                                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {weekdays.map(day => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="start_time">Start Time</Label>
                                    <Input
                                        id="start_time"
                                        name="start_time"
                                        type="time"
                                        value={newSlot.start_time}
                                        onChange={handleNewSlotChange}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="end_time">End Time</Label>
                                    <Input
                                        id="end_time"
                                        name="end_time"
                                        type="time"
                                        value={newSlot.end_time}
                                        onChange={handleNewSlotChange}
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <Button
                                    onClick={handleAddAvailabilitySlot}
                                    disabled={isLoading || !newSlot.day || !newSlot.start_time || !newSlot.end_time}
                                >
                                    {isLoading ? "Adding..." : "Add Time Slot"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button>Done</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Confirm Deletion
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete Dr. {doctorToDelete?.name}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-gray-500">
                            This will permanently remove the doctor and all their availability slots from the system.
                        </p>
                    </div>
                    <DialogFooter className="sm:justify-between">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteDoctor}
                            disabled={isLoading}
                        >
                            {isLoading ? "Deleting..." : "Delete Doctor"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DoctorManagement;
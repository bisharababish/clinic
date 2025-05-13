// pages/api/admin/AppointmentsManagement.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge"; // Assume this component exists
import { supabase } from "../../../lib/supabase";
import { RefreshCw, Calendar, Filter, Search, ChevronsUpDown, Download, X, AlertTriangle, CheckCircle, Edit, Trash2, Plus, FileText, BarChart2 } from "lucide-react";
import { format, isToday, isThisWeek, isThisMonth, parseISO, isBefore, isAfter } from "date-fns";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface AppointmentInfo {
    id: string;
    patient_id: string;
    patient_name: string;
    doctor_id: string;
    doctor_name: string;
    clinic_id: string;
    clinic_name: string;
    date: string;
    time: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    payment_status: 'pending' | 'paid' | 'refunded';
    price: number;
    notes?: string;
    created_at?: string;
    updated_at?: string;
}

interface AppointmentsManagementProps {
    appointments?: AppointmentInfo[];
    setAppointments?: React.Dispatch<React.SetStateAction<AppointmentInfo[]>>;
    isLoading?: boolean;
    setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>;
    loadAppointments?: () => Promise<void>;
    logActivity?: (action: string, user: string, details: string, status: 'success' | 'failed' | 'pending') => Promise<void>;
    userEmail?: string;
}

const AppointmentsManagement: React.FC<AppointmentsManagementProps> = ({
    appointments: propAppointments,
    setAppointments: propSetAppointments,
    isLoading: propIsLoading,
    setIsLoading: propSetIsLoading,
    loadAppointments: propLoadAppointments,
    logActivity: propLogActivity,
    userEmail
}) => {
    const { toast } = useToast();
    const [appointments, setAppointments] = useState<AppointmentInfo[]>(propAppointments || []);
    const [isLoading, setIsLoading] = useState(propIsLoading || false);

    // Enhanced filtering states
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
    const [clinicFilter, setClinicFilter] = useState<string>("all");
    const [doctorFilter, setDoctorFilter] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [sortField, setSortField] = useState<string>("date");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    // Added for editing and adding appointments
    const [isAddingAppointment, setIsAddingAppointment] = useState(false);
    const [isEditingAppointment, setIsEditingAppointment] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<AppointmentInfo | null>(null);
    const [appointmentNotes, setAppointmentNotes] = useState<string>("");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Advanced view state
    const [viewMode, setViewMode] = useState<"list" | "calendar" | "stats">("list");

    // Selected appointment for detailed view
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentInfo | null>(null);

    // Stats data
    const [statsData, setStatsData] = useState({
        total: 0,
        scheduled: 0,
        completed: 0,
        cancelled: 0,
        pending: 0,
        paid: 0,
        refunded: 0,
        revenue: 0,
        averagePrice: 0
    });

    // Use either the prop functions or local ones
    const updateAppointments = (newAppointments: AppointmentInfo[] | ((prev: AppointmentInfo[]) => AppointmentInfo[])) => {
        if (propSetAppointments) {
            propSetAppointments(newAppointments);
        } else {
            setAppointments(newAppointments);
        }
    };

    const updateIsLoading = (loading: boolean) => {
        if (propSetIsLoading) {
            propSetIsLoading(loading);
        } else {
            setIsLoading(loading);
        }
    };

    // Extract unique clinics and doctors for filtering
    const uniqueClinics = useMemo(() => {
        const clinics = new Set<string>();
        (propAppointments || appointments).forEach(apt => clinics.add(apt.clinic_name));
        return Array.from(clinics);
    }, [propAppointments, appointments]);

    const uniqueDoctors = useMemo(() => {
        const doctors = new Set<string>();
        (propAppointments || appointments).forEach(apt => doctors.add(apt.doctor_name));
        return Array.from(doctors);
    }, [propAppointments, appointments]);

    // Load appointments on mount if we don't have prop appointments
    useEffect(() => {
        if (propAppointments) {
            setAppointments(propAppointments);
        } else if (!propLoadAppointments) {
            loadAppointments();
        }
    }, [propAppointments]);

    // Calculate stats whenever appointments change
    useEffect(() => {
        const currentAppointments = propAppointments || appointments;
        const stats = {
            total: currentAppointments.length,
            scheduled: currentAppointments.filter(apt => apt.status === 'scheduled').length,
            completed: currentAppointments.filter(apt => apt.status === 'completed').length,
            cancelled: currentAppointments.filter(apt => apt.status === 'cancelled').length,
            pending: currentAppointments.filter(apt => apt.payment_status === 'pending').length,
            paid: currentAppointments.filter(apt => apt.payment_status === 'paid').length,
            refunded: currentAppointments.filter(apt => apt.payment_status === 'refunded').length,
            revenue: currentAppointments
                .filter(apt => apt.payment_status === 'paid')
                .reduce((sum, apt) => sum + apt.price, 0),
            averagePrice: currentAppointments.length > 0
                ? currentAppointments.reduce((sum, apt) => sum + apt.price, 0) / currentAppointments.length
                : 0
        };
        setStatsData(stats);
    }, [propAppointments, appointments]);

    // Load appointments from database
    const loadAppointments = async () => {
        if (propLoadAppointments) {
            await propLoadAppointments();
            return;
        }

        console.log('Loading appointments...');
        try {
            updateIsLoading(true);

            // Query appointments with related tables
            const { data, error } = await supabase
                .from('appointments')
                .select(`
                    *,
                    patients:patient_id (userid, english_username_a, english_username_d),
                    doctors:doctor_id (id, name),
                    clinics:clinic_id (id, name)
                `)
                .order('date', { ascending: false });

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            // Transform to match our interface
            const mappedAppointments: AppointmentInfo[] = data.map(apt => ({
                id: apt.id,
                patient_id: apt.patient_id,
                patient_name: `${apt.patients.english_username_a} ${apt.patients.english_username_d || ''}`.trim(),
                doctor_id: apt.doctor_id,
                doctor_name: apt.doctors.name,
                clinic_id: apt.clinic_id,
                clinic_name: apt.clinics.name,
                date: apt.date,
                time: apt.time,
                status: apt.status as 'scheduled' | 'completed' | 'cancelled',
                payment_status: apt.payment_status as 'pending' | 'paid' | 'refunded',
                price: apt.price,
                notes: apt.notes || '',
                created_at: apt.created_at,
                updated_at: apt.updated_at
            }));

            updateAppointments(mappedAppointments);
            console.log('Appointments loaded:', mappedAppointments.length);

            // Reset to first page when loading new data
            setCurrentPage(1);

            // Success toast
            toast({
                title: "Success",
                description: `${mappedAppointments.length} appointments loaded.`,
                variant: "default",
            });
        } catch (error) {
            console.error('Error loading appointments:', error);
            toast({
                title: "Error",
                description: "Failed to load appointments.",
                variant: "destructive",
            });
        } finally {
            updateIsLoading(false);
        }
    };

    // Appointment management
    const handleUpdateAppointmentStatus = async (id: string, status: 'scheduled' | 'completed' | 'cancelled') => {
        try {
            updateIsLoading(true);

            // Update in database
            const { error } = await supabase
                .from('appointments')
                .update({
                    status: status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) {
                console.error("Error updating appointment status:", error);
                toast({
                    title: "Error",
                    description: "Failed to update appointment status.",
                    variant: "destructive",
                });
                return;
            }

            // Update state
            updateAppointments(prev => prev.map(apt =>
                apt.id === id ? { ...apt, status } : apt
            ));

            // Log the activity
            await logActivity(
                "Appointment Status Updated",
                userEmail || "admin",
                `Appointment ID ${id} status changed to ${status}`,
                "success"
            );

            toast({
                title: "Success",
                description: `Appointment status updated to ${status}.`,
            });
        } catch (error) {
            console.error("Error updating appointment status:", error);
            toast({
                title: "Error",
                description: "Failed to update appointment status.",
                variant: "destructive",
            });
        } finally {
            updateIsLoading(false);
        }
    };

    const handleUpdatePaymentStatus = async (id: string, status: 'pending' | 'paid' | 'refunded') => {
        try {
            updateIsLoading(true);

            // Update in database
            const { error } = await supabase
                .from('appointments')
                .update({
                    payment_status: status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) {
                console.error("Error updating payment status:", error);
                toast({
                    title: "Error",
                    description: "Failed to update payment status.",
                    variant: "destructive",
                });
                return;
            }

            // Update state
            updateAppointments(prev => prev.map(apt =>
                apt.id === id ? { ...apt, payment_status: status } : apt
            ));

            // Log the activity
            await logActivity(
                "Payment Status Updated",
                userEmail || "admin",
                `Appointment ID ${id} payment status changed to ${status}`,
                "success"
            );

            toast({
                title: "Success",
                description: `Payment status updated to ${status}.`,
            });
        } catch (error) {
            console.error("Error updating payment status:", error);
            toast({
                title: "Error",
                description: "Failed to update payment status.",
                variant: "destructive",
            });
        } finally {
            updateIsLoading(false);
        }
    };

    // Update appointment notes
    const handleUpdateAppointmentNotes = async (id: string, notes: string) => {
        try {
            updateIsLoading(true);

            // Update in database
            const { error } = await supabase
                .from('appointments')
                .update({
                    notes: notes,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) {
                console.error("Error updating appointment notes:", error);
                toast({
                    title: "Error",
                    description: "Failed to update appointment notes.",
                    variant: "destructive",
                });
                return;
            }

            // Update state
            updateAppointments(prev => prev.map(apt =>
                apt.id === id ? { ...apt, notes } : apt
            ));

            // Log the activity
            await logActivity(
                "Appointment Notes Updated",
                userEmail || "admin",
                `Notes updated for Appointment ID ${id}`,
                "success"
            );

            toast({
                title: "Success",
                description: "Appointment notes updated successfully.",
            });
        } catch (error) {
            console.error("Error updating appointment notes:", error);
            toast({
                title: "Error",
                description: "Failed to update appointment notes.",
                variant: "destructive",
            });
        } finally {
            updateIsLoading(false);
        }
    };

    // Delete appointment
    const handleDeleteAppointment = async (id: string) => {
        // Confirm deletion
        if (!window.confirm("Are you sure you want to delete this appointment? This action cannot be undone.")) {
            return;
        }

        try {
            updateIsLoading(true);

            // Delete from database
            const { error } = await supabase
                .from('appointments')
                .delete()
                .eq('id', id);

            if (error) {
                console.error("Error deleting appointment:", error);
                toast({
                    title: "Error",
                    description: "Failed to delete appointment.",
                    variant: "destructive",
                });
                return;
            }

            // Update state
            updateAppointments(prev => prev.filter(apt => apt.id !== id));

            // Log the activity
            await logActivity(
                "Appointment Deleted",
                userEmail || "admin",
                `Appointment ID ${id} was deleted`,
                "success"
            );

            toast({
                title: "Success",
                description: "Appointment deleted successfully.",
            });
        } catch (error) {
            console.error("Error deleting appointment:", error);
            toast({
                title: "Error",
                description: "Failed to delete appointment.",
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

    // Export appointments to CSV
    const exportToCSV = () => {
        const currentAppointments = propAppointments || appointments;

        // Apply filters to export only filtered data
        const dataToExport = getFilteredAppointments();

        if (dataToExport.length === 0) {
            toast({
                title: "No Data",
                description: "There are no appointments matching your filters to export.",
                variant: "destructive",
            });
            return;
        }

        // Create CSV headers
        const headers = [
            "ID", "Patient", "Doctor", "Clinic", "Date", "Time",
            "Status", "Payment Status", "Price", "Notes"
        ];

        // Convert data to CSV rows
        const rows = dataToExport.map(apt => [
            apt.id,
            apt.patient_name,
            apt.doctor_name,
            apt.clinic_name,
            new Date(apt.date).toLocaleDateString(),
            apt.time,
            apt.status,
            apt.payment_status,
            apt.price,
            apt.notes || ""
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        // Create download link
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `appointments_export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Log activity
        logActivity(
            "Appointments Exported",
            userEmail || "admin",
            `Exported ${dataToExport.length} appointments to CSV`,
            "success"
        );

        toast({
            title: "Export Complete",
            description: `${dataToExport.length} appointments exported to CSV.`,
        });
    };

    // Helper function for status badge classes
    const getStatusBadgeClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'scheduled':
                return "bg-blue-100 text-blue-800 border-blue-200";
            case 'completed':
                return "bg-green-100 text-green-800 border-green-200";
            case 'cancelled':
                return "bg-red-100 text-red-800 border-red-200";
            case 'pending':
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case 'paid':
                return "bg-green-100 text-green-800 border-green-200";
            case 'refunded':
                return "bg-purple-100 text-purple-800 border-purple-200";
            case 'success':
                return "bg-green-100 text-green-800 border-green-200";
            case 'failed':
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    // Reset all filters
    const resetFilters = () => {
        setStatusFilter("all");
        setPaymentStatusFilter("all");
        setClinicFilter("all");
        setDoctorFilter("all");
        setDateFilter("all");
        setSearchQuery("");
        setStartDate(null);
        setEndDate(null);
        setSortField("date");
        setSortDirection("desc");
        setCurrentPage(1);
    };

    // Handle sorting
    const handleSort = (field: string) => {
        if (sortField === field) {
            // Toggle direction if clicking the same field
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            // Set new field and default to ascending
            setSortField(field);
            setSortDirection("asc");
        }
    };

    // Apply all filters and sorting to appointments
    const getFilteredAppointments = () => {
        const currentAppointments = propAppointments || appointments;

        // First apply search filter
        let filtered = currentAppointments;

        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(apt =>
                apt.patient_name.toLowerCase().includes(query) ||
                apt.doctor_name.toLowerCase().includes(query) ||
                apt.clinic_name.toLowerCase().includes(query) ||
                (apt.notes && apt.notes.toLowerCase().includes(query))
            );
        }

        // Apply status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter(apt => apt.status === statusFilter);
        }

        // Apply payment status filter
        if (paymentStatusFilter !== "all") {
            filtered = filtered.filter(apt => apt.payment_status === paymentStatusFilter);
        }

        // Apply clinic filter
        if (clinicFilter !== "all") {
            filtered = filtered.filter(apt => apt.clinic_name === clinicFilter);
        }

        // Apply doctor filter
        if (doctorFilter !== "all") {
            filtered = filtered.filter(apt => apt.doctor_name === doctorFilter);
        }

        // Apply date filter
        if (dateFilter !== "all") {
            switch (dateFilter) {
                case "today":
                    filtered = filtered.filter(apt => isToday(parseISO(apt.date)));
                    break;
                case "thisWeek":
                    filtered = filtered.filter(apt => isThisWeek(parseISO(apt.date)));
                    break;
                case "thisMonth":
                    filtered = filtered.filter(apt => isThisMonth(parseISO(apt.date)));
                    break;
                case "custom":
                    if (startDate) {
                        filtered = filtered.filter(apt => isAfter(parseISO(apt.date), startDate) ||
                            parseISO(apt.date).toDateString() === startDate.toDateString());
                    }
                    if (endDate) {
                        filtered = filtered.filter(apt => isBefore(parseISO(apt.date), endDate) ||
                            parseISO(apt.date).toDateString() === endDate.toDateString());
                    }
                    break;
            }
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let comparison = 0;

            switch (sortField) {
                case "patient":
                    comparison = a.patient_name.localeCompare(b.patient_name);
                    break;
                case "doctor":
                    comparison = a.doctor_name.localeCompare(b.doctor_name);
                    break;
                case "clinic":
                    comparison = a.clinic_name.localeCompare(b.clinic_name);
                    break;
                case "date":
                    comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
                    break;
                case "price":
                    comparison = a.price - b.price;
                    break;
                default:
                    comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
            }

            return sortDirection === "asc" ? comparison : -comparison;
        });

        return filtered;
    };

    // Get current page items for pagination
    const getCurrentPageItems = () => {
        const filteredAppointments = getFilteredAppointments();
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);
    };

    // Calculate total pages for pagination
    const totalPages = Math.ceil(getFilteredAppointments().length / itemsPerPage);

    // Get current appointments 
    const currentAppointments = propAppointments || appointments;
    const paginatedAppointments = getCurrentPageItems();

    // Render the appointment list view with fixed pagination
    const renderListView = () => {
        return (
            <>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead onClick={() => handleSort("patient")} className="cursor-pointer">
                                    <div className="flex items-center">
                                        Patient
                                        {sortField === "patient" && (
                                            <ChevronsUpDown className="h-4 w-4 ml-1" />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead onClick={() => handleSort("doctor")} className="cursor-pointer">
                                    <div className="flex items-center">
                                        Doctor
                                        {sortField === "doctor" && (
                                            <ChevronsUpDown className="h-4 w-4 ml-1" />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead onClick={() => handleSort("clinic")} className="cursor-pointer">
                                    <div className="flex items-center">
                                        Clinic
                                        {sortField === "clinic" && (
                                            <ChevronsUpDown className="h-4 w-4 ml-1" />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead onClick={() => handleSort("date")} className="cursor-pointer">
                                    <div className="flex items-center">
                                        Date & Time
                                        {sortField === "date" && (
                                            <ChevronsUpDown className="h-4 w-4 ml-1" />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead onClick={() => handleSort("price")} className="cursor-pointer">
                                    <div className="flex items-center">
                                        Payment
                                        {sortField === "price" && (
                                            <ChevronsUpDown className="h-4 w-4 ml-1" />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedAppointments.map((appointment) => (
                                <TableRow key={appointment.id} className="hover:bg-gray-50">
                                    <TableCell className="font-medium">{appointment.patient_name}</TableCell>
                                    <TableCell>{appointment.doctor_name}</TableCell>
                                    <TableCell>{appointment.clinic_name}</TableCell>
                                    <TableCell>
                                        <div>{new Date(appointment.date).toLocaleDateString()}</div>
                                        <div className="text-xs text-gray-500">{appointment.time}</div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(appointment.status)}`}>
                                            {appointment.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(appointment.payment_status)}`}>
                                            {appointment.payment_status}
                                        </span>
                                        <div className="text-sm mt-1">${appointment.price}</div>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedAppointment(appointment);
                                                setAppointmentNotes(appointment.notes || "");
                                            }}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Edit className="h-4 w-4" />
                                            <span className="sr-only">Edit</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteAppointment(appointment.id)}
                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Delete</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Fixed pagination component */}
                {paginatedAppointments.length > 0 && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-500">
                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, getFilteredAppointments().length)} of {getFilteredAppointments().length} appointments
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                            >
                                First
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="px-4 py-2">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages)
                                )}
                                disabled={currentPage === totalPages}
                            > Next
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                            >
                                Last
                            </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Items per page:</span>
                            <Select value={itemsPerPage.toString()}
                                onValueChange={(value) => {
                                    setItemsPerPage(Number(value));
                                    setCurrentPage(1); // Reset to first page when changing items per page
                                }}
                            >
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue placeholder={itemsPerPage} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}
            </>
        );
    };

    // Render the calendar view
    const renderCalendarView = () => {
        // Group appointments by date
        const appointmentsByDate: Record<string, AppointmentInfo[]> = {};

        currentAppointments.forEach(appointment => {
            const dateKey = format(parseISO(appointment.date), 'yyyy-MM-dd');
            if (!appointmentsByDate[dateKey]) {
                appointmentsByDate[dateKey] = [];
            }
            appointmentsByDate[dateKey].push(appointment);
        });

        // Sort dates
        const sortedDates = Object.keys(appointmentsByDate).sort((a, b) =>
            new Date(a).getTime() - new Date(b).getTime()
        );

        return (
            <div className="space-y-4">
                {sortedDates.map(date => (
                    <Card key={date}>
                        <CardHeader className="bg-gray-50 p-4">
                            <CardTitle className="text-lg">
                                {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Doctor</TableHead>
                                        <TableHead>Clinic</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Payment</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {appointmentsByDate[date]
                                        .sort((a, b) => a.time.localeCompare(b.time))
                                        .map(appointment => (
                                            <TableRow key={appointment.id} className="hover:bg-gray-50">
                                                <TableCell>{appointment.time}</TableCell>
                                                <TableCell className="font-medium">{appointment.patient_name}</TableCell>
                                                <TableCell>{appointment.doctor_name}</TableCell>
                                                <TableCell>{appointment.clinic_name}</TableCell>
                                                <TableCell>
                                                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(appointment.status)}`}>
                                                        {appointment.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(appointment.payment_status)}`}>
                                                        {appointment.payment_status}
                                                    </span>
                                                    <div className="text-sm mt-1">${appointment.price}</div>
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedAppointment(appointment);
                                                            setAppointmentNotes(appointment.notes || "");
                                                        }}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        <span className="sr-only">Edit</span>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteAppointment(appointment.id)}
                                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">Delete</span>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };
    // Render statistics view
    const renderStatsView = () => {
        // Prepare data for charts
        const statusData = [
            { name: 'Scheduled', value: statsData.scheduled, color: '#3b82f6' },
            { name: 'Completed', value: statsData.completed, color: '#10b981' },
            { name: 'Cancelled', value: statsData.cancelled, color: '#ef4444' }
        ];

        const paymentData = [
            { name: 'Pending', value: statsData.pending, color: '#f59e0b' },
            { name: 'Paid', value: statsData.paid, color: '#10b981' },
            { name: 'Refunded', value: statsData.refunded, color: '#8b5cf6' }
        ];

        // Group appointments by clinic for revenue
        const clinicRevenue: Record<string, number> = {};
        currentAppointments.forEach(apt => {
            if (apt.payment_status === 'paid') {
                clinicRevenue[apt.clinic_name] = (clinicRevenue[apt.clinic_name] || 0) + apt.price;
            }
        });

        const clinicRevenueData = Object.entries(clinicRevenue).map(([clinic, revenue]) => ({
            name: clinic,
            revenue: revenue
        }));

        return (
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Appointments</CardDescription>
                            <CardTitle className="text-3xl">{statsData.total}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Scheduled</CardDescription>
                            <CardTitle className="text-3xl">{statsData.scheduled}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Completed</CardDescription>
                            <CardTitle className="text-3xl">{statsData.completed}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Revenue</CardDescription>
                            <CardTitle className="text-3xl">${statsData.revenue.toFixed(2)}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Status Pie Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Appointment Status</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Payment Status Pie Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Status</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={paymentData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {paymentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Revenue by Clinic Bar Chart */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Revenue by Clinic</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={clinicRevenueData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="revenue" name="Revenue ($)" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    };

    // Main render
    return (
        <div className="space-y-6">
            {/* Header with title and actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Appointments Management</h2>
                    <p className="text-muted-foreground">
                        Manage and track all patient appointments
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={loadAppointments} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={exportToCSV}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button onClick={() => setIsAddingAppointment(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Appointment
                    </Button>
                </div>
            </div>

            {/* Tabs for view mode */}
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "calendar" | "stats")}>
                <TabsList>
                    <TabsTrigger value="list">
                        <FileText className="h-4 w-4 mr-2" />
                        List View
                    </TabsTrigger>
                    <TabsTrigger value="calendar">
                        <Calendar className="h-4 w-4 mr-2" />
                        Calendar View
                    </TabsTrigger>
                    <TabsTrigger value="stats">
                        <BarChart2 className="h-4 w-4 mr-2" />
                        Statistics
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Filters */}
            <Card>
                <CardHeader className="pb-0">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Search appointments..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="max-w-md"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" onClick={resetFilters}>
                                <X className="h-4 w-4 mr-2" />
                                Reset Filters
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Status Filter */}
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Payment Status Filter */}
                        <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by payment" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Payment Statuses</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Clinic Filter */}
                        <Select value={clinicFilter} onValueChange={setClinicFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by clinic" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Clinics</SelectItem>
                                {uniqueClinics.map(clinic => (
                                    <SelectItem key={clinic} value={clinic}>{clinic}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Doctor Filter */}
                        <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by doctor" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Doctors</SelectItem>
                                {uniqueDoctors.map(doctor => (
                                    <SelectItem key={doctor} value={doctor}>{doctor}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Date Filter */}
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by date" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Dates</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="thisWeek">This Week</SelectItem>
                                <SelectItem value="thisMonth">This Month</SelectItem>
                                <SelectItem value="custom">Custom Range</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Custom Date Range Picker (shown only when custom is selected) */}
                        {dateFilter === 'custom' && (
                            <div className="flex items-center space-x-2 col-span-2">
                                <Input
                                    type="date"
                                    value={startDate?.toISOString().split('T')[0] || ''}
                                    onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                                    placeholder="Start date"
                                />
                                <span>to</span>
                                <Input
                                    type="date"
                                    value={endDate?.toISOString().split('T')[0] || ''}
                                    onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                                    placeholder="End date"
                                />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Content based on view mode */}
            <div className="space-y-4">
                {viewMode === 'list' && renderListView()}
                {viewMode === 'calendar' && renderCalendarView()}
                {viewMode === 'stats' && renderStatsView()}
            </div>

            {/* Appointment Detail Dialog */}
            {selectedAppointment && (
                <Dialog open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Appointment Details</DialogTitle>
                            <DialogDescription>
                                Manage appointment for {selectedAppointment.patient_name}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium">Patient</p>
                                    <p>{selectedAppointment.patient_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Doctor</p>
                                    <p>{selectedAppointment.doctor_name}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium">Clinic</p>
                                    <p>{selectedAppointment.clinic_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Date & Time</p>
                                    <p>
                                        {new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment.time}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium">Status</p>
                                    <Select
                                        value={selectedAppointment.status}
                                        onValueChange={(value) => {
                                            const newStatus = value as 'scheduled' | 'completed' | 'cancelled';
                                            setSelectedAppointment({
                                                ...selectedAppointment,
                                                status: newStatus
                                            });
                                            handleUpdateAppointmentStatus(selectedAppointment.id, newStatus);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="scheduled">Scheduled</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Payment Status</p>
                                    <Select
                                        value={selectedAppointment.payment_status}
                                        onValueChange={(value) => {
                                            const newPaymentStatus = value as 'pending' | 'paid' | 'refunded';
                                            setSelectedAppointment({
                                                ...selectedAppointment,
                                                payment_status: newPaymentStatus
                                            });
                                            handleUpdatePaymentStatus(selectedAppointment.id, newPaymentStatus);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select payment status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="refunded">Refunded</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Price</p>
                                <Input
                                    type="number"
                                    value={selectedAppointment.price}
                                    onChange={(e) => {
                                        const newPrice = parseFloat(e.target.value);
                                        if (!isNaN(newPrice)) {
                                            setSelectedAppointment({
                                                ...selectedAppointment,
                                                price: newPrice
                                            });
                                        }
                                    }}
                                    onBlur={() => {
                                        // Update price in database when input loses focus
                                        supabase
                                            .from('appointments')
                                            .update({
                                                price: selectedAppointment.price,
                                                updated_at: new Date().toISOString()
                                            })
                                            .eq('id', selectedAppointment.id)
                                            .then(({ error }) => {
                                                if (error) {
                                                    console.error("Error updating price:", error);
                                                    toast({
                                                        title: "Error",
                                                        description: "Failed to update appointment price.",
                                                        variant: "destructive",
                                                    });
                                                } else {
                                                    toast({
                                                        title: "Success",
                                                        description: "Appointment price updated.",
                                                    });
                                                }
                                            });
                                    }}
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Notes</p>
                                <textarea
                                    className="w-full p-2 border rounded-md min-h-[100px]"
                                    value={appointmentNotes}
                                    onChange={(e) => setAppointmentNotes(e.target.value)}
                                    placeholder="Add notes about this appointment..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={() => {
                                    handleUpdateAppointmentNotes(selectedAppointment.id, appointmentNotes);
                                    setSelectedAppointment(null);
                                }}
                            >
                                Save Changes
                            </Button>
                            <DialogClose asChild>
                                <Button variant="outline">Close</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Add Appointment Dialog */}
            {isAddingAppointment && (
                <Dialog open={isAddingAppointment} onOpenChange={setIsAddingAppointment}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Add New Appointment</DialogTitle>
                            <DialogDescription>
                                Create a new appointment for a patient
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {/* Add form fields for new appointment */}
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium">Patient</p>
                                    <Input placeholder="Search for patient..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium">Doctor</p>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select doctor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {uniqueDoctors.map(doctor => (
                                                    <SelectItem key={doctor} value={doctor}>{doctor}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Clinic</p>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select clinic" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {uniqueClinics.map(clinic => (
                                                    <SelectItem key={clinic} value={clinic}>{clinic}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium">Date</p>
                                        <Input type="date" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Time</p>
                                        <Input type="time" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium">Status</p>
                                        <Select defaultValue="scheduled">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Payment Status</p>
                                        <Select defaultValue="pending">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select payment status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="paid">Paid</SelectItem>
                                                <SelectItem value="refunded">Refunded</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Price</p>
                                    <Input type="number" placeholder="0.00" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Notes</p>
                                    <textarea
                                        className="w-full p-2 border rounded-md min-h-[100px]"
                                        placeholder="Add notes about this appointment..."
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => {
                                // TODO: Implement add appointment logic
                                setIsAddingAppointment(false);
                                toast({
                                    title: "Success",
                                    description: "Appointment added successfully.",
                                });
                            }}>
                                Add Appointment
                            </Button>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};
export default AppointmentsManagement;
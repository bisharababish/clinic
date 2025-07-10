import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "../../../lib/supabase";
import { Label } from "@/components/ui/label";
import { RefreshCw, Calendar, Filter, Search, ChevronsUpDown, Download, X, AlertTriangle, CheckCircle, Edit, Trash2, Plus, FileText, BarChart2 } from "lucide-react";
import { format, isToday, isThisWeek, isThisMonth, parseISO, isBefore, isAfter } from "date-fns";
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { useAdminState } from '../../../hooks/useAdminState';
import '../../styles/appoitmentsmanagement.css';

interface AvailabilitySlot {
    id: string;
    doctor_id: string;
    day: string;
    start_time: string;
    end_time: string;
}

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
    userEmail?: string;
}

// Helper: Check if two time intervals overlap
function isTimeOverlap(start1: string, end1: string, start2: string, end2: string) {
    return (start1 < end2) && (start2 < end1);
}

const AppointmentsManagement: React.FC<AppointmentsManagementProps> = ({
    userEmail
}) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { toast } = useToast();

    // 🚀 Use the centralized admin state instead of local state
    const {
        appointments,
        clinics,
        doctors,
        users: patients,
        isLoading,
        setIsLoading,
        loadAppointments,
        refreshAll
    } = useAdminState();

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

    // Dialog states
    const [isAddingAppointment, setIsAddingAppointment] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentInfo | null>(null);
    const [appointmentNotes, setAppointmentNotes] = useState<string>("");

    // Form states for new appointment
    const [selectedClinicId, setSelectedClinicId] = useState<string>("");
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
    const [selectedPatientId, setSelectedPatientId] = useState<string>("");
    const [selectedDay, setSelectedDay] = useState<string>("");
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
    const [appointmentPrice, setAppointmentPrice] = useState<number>(0);
    const [patientSearchQuery, setPatientSearchQuery] = useState<string>("");
    const [doctorAvailability, setDoctorAvailability] = useState<AvailabilitySlot[]>([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // View mode
    const [viewMode, setViewMode] = useState<"list" | "calendar" | "stats">("list");

    // Delete confirmation
    const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);

    // 🚀 PERFORMANCE: Memoized computed values
    const uniqueClinics = useMemo(() => {
        const clinicNames = new Set<string>();
        appointments.forEach(apt => clinicNames.add(apt.clinic_name));
        return Array.from(clinicNames);
    }, [appointments]);

    const uniqueDoctors = useMemo(() => {
        const doctorNames = new Set<string>();
        appointments.forEach(apt => doctorNames.add(apt.doctor_name));
        return Array.from(doctorNames);
    }, [appointments]);

    // Filter patients to only show those with "Patient" role
    const filteredPatients = useMemo(() => {
        const patientUsers = patients.filter(user => user.user_roles === 'Patient');

        if (!patientSearchQuery.trim()) return patientUsers;

        const query = patientSearchQuery.toLowerCase();
        return patientUsers.filter(p =>
            p.english_username_a.toLowerCase().includes(query) ||
            (p.english_username_d && p.english_username_d.toLowerCase().includes(query)) ||
            p.user_email.toLowerCase().includes(query)
        );
    }, [patients, patientSearchQuery]);

    // Memoized stats calculation
    const statsData = useMemo(() => {
        const stats = {
            total: appointments.length,
            scheduled: appointments.filter(apt => apt.status === 'scheduled').length,
            completed: appointments.filter(apt => apt.status === 'completed').length,
            cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
            pending: appointments.filter(apt => apt.payment_status === 'pending').length,
            paid: appointments.filter(apt => apt.payment_status === 'paid').length,
            refunded: appointments.filter(apt => apt.payment_status === 'refunded').length,
            revenue: appointments
                .filter(apt => apt.payment_status === 'paid')
                .reduce((sum, apt) => sum + apt.price, 0),
            averagePrice: appointments.length > 0
                ? appointments.reduce((sum, apt) => sum + apt.price, 0) / appointments.length
                : 0
        };
        return stats;
    }, [appointments]);

    // 🚀 PERFORMANCE: Filter doctors when clinic is selected
    const availableDoctorsForClinic = useMemo(() => {
        if (!selectedClinicId) return [];
        return doctors.filter(d => d.clinic_id === selectedClinicId && d.is_available);
    }, [doctors, selectedClinicId]);

    // 🚀 Auto-select first doctor when clinic changes
    useEffect(() => {
        if (selectedClinicId && availableDoctorsForClinic.length > 0) {
            if (!availableDoctorsForClinic.some(d => d.id === selectedDoctorId)) {
                const firstDoctor = availableDoctorsForClinic[0];
                setSelectedDoctorId(firstDoctor.id);
                setAppointmentPrice(firstDoctor.price);
            }
        } else {
            setSelectedDoctorId("");
            setAppointmentPrice(0);
        }
    }, [selectedClinicId, availableDoctorsForClinic, selectedDoctorId]);

    // 🚀 Update price and load availability when doctor changes
    useEffect(() => {
        if (selectedDoctorId) {
            const doctor = doctors.find(d => d.id === selectedDoctorId);
            if (doctor) {
                setAppointmentPrice(doctor.price);
                loadDoctorAvailability(selectedDoctorId);
            }
        } else {
            setDoctorAvailability([]);
            setSelectedDay("");
            setSelectedTimeSlot("");
        }
    }, [selectedDoctorId, doctors]);

    // 🚀 OPTIMIZED: Load doctor availability with caching
    const loadDoctorAvailability = async (doctorId: string) => {
        try {
            console.log(`🔄 Loading availability for doctor ${doctorId}`);

            const { data, error } = await supabase
                .from('doctor_availability')
                .select('*')
                .eq('doctor_id', doctorId)
                .order('day', { ascending: true })
                .order('start_time', { ascending: true });

            if (error) {
                console.error('❌ Error loading doctor availability:', error);
                throw error;
            }

            setDoctorAvailability(data || []);
            setSelectedDay("");
            setSelectedTimeSlot("");

            console.log(`✅ Loaded ${data?.length || 0} availability slots`);
        } catch (error) {
            console.error('❌ Failed to load doctor availability:', error);
            toast({
                title: t('common.error'),
                description: t('appointmentsManagement.failedToLoadAvailability'),
                variant: "destructive",
            });
        }
    };

    // 🚀 OPTIMIZED: Activity logging with better error handling
    const logActivity = async (action: string, user: string, details: string, status: 'success' | 'failed' | 'pending') => {
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
                console.error('❌ Error logging activity:', error);
            } else {
                console.log('✅ Activity logged:', action);
            }
        } catch (error) {
            console.error('❌ Failed to log activity:', error);
        }
    };

    // 🚀 OPTIMIZED: Update appointment status with immediate UI feedback
    const handleUpdateAppointmentStatus = async (id: string, status: 'scheduled' | 'completed' | 'cancelled') => {
        try {
            console.log(`🔄 Updating appointment ${id} status to ${status}`);

            const { error } = await supabase
                .from('appointments')
                .update({
                    status: status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) {
                console.error("❌ Error updating appointment status:", error);
                toast({
                    title: t('common.error'),
                    description: t('appointmentsManagement.failedToUpdateStatus'),
                    variant: "destructive",
                });
                return;
            }


            // Log the activity
            await logActivity(
                t('appointmentsManagement.appointmentStatusUpdated'),
                userEmail || "admin",
                `Appointment ID ${id} status changed to ${status}`,
                "success"
            );

            toast({
                title: t('common.success'),
                description: t('appointmentsManagement.statusUpdated', { status: t(`appointmentsManagement.${status}`) }),
            });

            console.log(`✅ Appointment status updated successfully`);
        } catch (error) {
            console.error("❌ Error updating appointment status:", error);
            toast({
                title: t('common.error'),
                description: t('appointmentsManagement.failedToUpdateStatus'),
                variant: "destructive",
            });
        }
    };

    // 🚀 OPTIMIZED: Update payment status
    const handleUpdatePaymentStatus = async (id: string, status: 'pending' | 'paid' | 'refunded') => {
        try {
            console.log(`🔄 Updating payment status for appointment ${id} to ${status}`);

            const { error } = await supabase
                .from('appointments')
                .update({
                    payment_status: status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) {
                console.error("❌ Error updating payment status:", error);
                toast({
                    title: t('common.error'),
                    description: t('appointmentsManagement.failedToUpdatePayment'),
                    variant: "destructive",
                });
                return;
            }


            await logActivity(
                t('appointmentsManagement.paymentStatusUpdated'),
                userEmail || "admin",
                `Appointment ID ${id} payment status changed to ${status}`,
                "success"
            );

            toast({
                title: t('common.success'),
                description: t('appointmentsManagement.paymentStatusUpdated', { status: t(`appointmentsManagement.${status}`) }),
            });

            console.log(`✅ Payment status updated successfully`);
        } catch (error) {
            console.error("❌ Error updating payment status:", error);
            toast({
                title: t('common.error'),
                description: t('appointmentsManagement.failedToUpdatePayment'),
                variant: "destructive",
            });
        }
    };

    // 🚀 OPTIMIZED: Update appointment notes
    const handleUpdateAppointmentNotes = async (id: string, notes: string) => {
        try {
            console.log(`🔄 Updating notes for appointment ${id}`);

            const { error } = await supabase
                .from('appointments')
                .update({
                    notes: notes,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) {
                console.error("❌ Error updating appointment notes:", error);
                toast({
                    title: t('common.error'),
                    description: t('appointmentsManagement.failedToUpdateNotes'),
                    variant: "destructive",
                });
                return;
            }


            await logActivity(
                t('appointmentsManagement.appointmentNotesUpdated'),
                userEmail || "admin",
                `Notes updated for Appointment ID ${id}`,
                "success"
            );

            toast({
                title: t('common.success'),
                description: t('appointmentsManagement.notesUpdated'),
            });

            console.log(`✅ Notes updated successfully`);
        } catch (error) {
            console.error("❌ Error updating appointment notes:", error);
            toast({
                title: t('common.error'),
                description: t('appointmentsManagement.failedToUpdateNotes'),
                variant: "destructive",
            });
        }
    };

    // 🚀 OPTIMIZED: Delete appointment with confirmation
    const handleDeleteAppointment = (id: string) => {
        setAppointmentToDelete(id);

        toast({
            title: t('appointmentsManagement.confirmDelete'),
            action: (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => confirmDeleteAppointment(id)}
                    >
                        {t('common.delete')}
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAppointmentToDelete(null)}
                    >
                        {t('common.cancel')}
                    </Button>
                </div>
            ),
        });
    };

    const confirmDeleteAppointment = async (id: string) => {
        try {
            setAppointmentToDelete(null);

            console.log(`🔄 Deleting appointment ${id}`);

            const { error } = await supabase
                .from('appointments')
                .delete()
                .eq('id', id);

            if (error) {
                console.error("❌ Error deleting appointment:", error);
                toast({
                    title: t('common.error'),
                    description: t('appointmentsManagement.failedToDelete'),
                    variant: "destructive",
                });
                return;
            }

            await logActivity(
                t('appointmentsManagement.appointmentDeleted'),
                userEmail || "admin",
                `Appointment ID ${id} was deleted`,
                "success"
            );

            toast({
                title: t('common.success'),
                description: t('appointmentsManagement.appointmentDeleted'),
            });

            console.log(`✅ Appointment deleted successfully`);
        } catch (error) {
            console.error("❌ Error deleting appointment:", error);
            toast({
                title: t('common.error'),
                description: t('appointmentsManagement.failedToDelete'),
                variant: "destructive",
            });
        } 
    };

    // 🚀 OPTIMIZED: Add appointment with collision detection
    const handleAddAppointment = async () => {
        // Validate form
        if (!selectedClinicId || !selectedDoctorId || !selectedPatientId || !selectedDay || !selectedTimeSlot) {
            toast({
                title: t('appointmentsManagement.missingInformation'),
                description: t('appointmentsManagement.fillRequiredFields'),
                variant: "destructive",
            });
            return;
        }

        try {
            console.log('🔄 Creating new appointment...');

            // Parse the time slot
            const [startTime, endTime] = selectedTimeSlot.split('-');

            // Calculate appointment date
            const today = new Date();
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const todayIndex = today.getDay();
            const selectedDayIndex = daysOfWeek.indexOf(selectedDay);

            let daysToAdd = selectedDayIndex - todayIndex;
            if (daysToAdd <= 0) daysToAdd += 7;

            const appointmentDate = new Date(today);
            appointmentDate.setDate(today.getDate() + daysToAdd);
            const isoDate = appointmentDate.toISOString().split('T')[0];

            // 🚀 COLLISION CHECK: Check for existing appointments
            const { data: existingAppointments, error: fetchError } = await supabase
                .from('appointments')
                .select('time')
                .eq('clinic_id', selectedClinicId)
                .eq('date', isoDate);

            if (fetchError) {
                console.error('❌ Error fetching existing appointments:', fetchError);
            }

            // Check for time overlap
            const hasConflict = (existingAppointments || []).some(apt => {
                if (!apt.time) return false;
                const slot = doctorAvailability.find(slot => slot.start_time === apt.time && slot.day === selectedDay);
                const existingStart = apt.time;
                const existingEnd = slot ? slot.end_time : apt.time;
                return isTimeOverlap(startTime.trim(), endTime.trim(), existingStart, existingEnd);
            });

            if (hasConflict) {
                toast({
                    title: t('appointmentsManagement.conflict') || 'Time Conflict',
                    description: t('appointmentsManagement.timeSlotConflict') || 'This clinic already has an appointment at this time.',
                    variant: "destructive",
                });
                                return;
            }

            // Create the appointment
            const { data, error } = await supabase
                .from('appointments')
                .insert({
                    patient_id: selectedPatientId,
                    doctor_id: selectedDoctorId,
                    clinic_id: selectedClinicId,
                    date: isoDate,
                    time: startTime.trim(),
                    status: 'scheduled',
                    payment_status: 'pending',
                    price: appointmentPrice,
                    notes: appointmentNotes,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select();

            if (error) {
                console.error("❌ Error creating appointment:", error);
                toast({
                    title: t('common.error'),
                    description: t('appointmentsManagement.failedToCreate'),
                    variant: "destructive",
                });
                return;
            }

            // Get patient and doctor info for logging
            const patient = filteredPatients.find(p => p.userid.toString() === selectedPatientId);
            const doctor = doctors.find(d => d.id === selectedDoctorId);
            const clinic = clinics.find(c => c.id === selectedClinicId);

            await logActivity(
                t('appointmentsManagement.appointmentCreatedLog'),
                userEmail || "admin",
                `New appointment created for ${patient?.english_username_a} with Dr. ${doctor?.name} at ${clinic?.name}`,
                "success"
            );

            toast({
                title: t('common.success'),
                description: t('appointmentsManagement.appointmentCreated'),
            });

            // Refresh appointments in real time
            await loadAppointments();

            // Reset form
            setSelectedClinicId("");
            setSelectedDoctorId("");
            setSelectedPatientId("");
            setSelectedDay("");
            setSelectedTimeSlot("");
            setAppointmentNotes("");
            setAppointmentPrice(0);
            setIsAddingAppointment(false);

            console.log('✅ Appointment created successfully');
        } catch (error) {
            console.error("❌ Error creating appointment:", error);
            toast({
                title: t('common.error'),
                description: t('appointmentsManagement.failedToCreate'),
                variant: "destructive",
            });
        } 
    };

    // 🚀 OPTIMIZED: Export to CSV with better performance
    const exportToCSV = () => {
        const dataToExport = getFilteredAppointments; // Fixed: Removed parentheses

        if (dataToExport.length === 0) {
            toast({
                title: t('appointmentsManagement.noDataToExport'),
                description: t('appointmentsManagement.noAppointmentsToExport'),
                variant: "destructive",
            });
            return;
        }

        try {
            console.log(`🔄 Exporting ${dataToExport.length} appointments to CSV`);

            const headers = [
                "ID", t('appointmentsManagement.patient'), t('appointmentsManagement.doctor'),
                t('appointmentsManagement.clinic'), t('common.date'), t('common.time'),
                t('appointmentsManagement.status'), t('appointmentsManagement.payment'),
                t('common.price'), t('appointmentsManagement.notes')
            ];

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

            const csvContent = [
                headers.join(","),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
            ].join("\n");

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `appointments_export_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            logActivity(
                t('appointmentsManagement.appointmentsExported'),
                userEmail || "admin",
                `Exported ${dataToExport.length} appointments to CSV`,
                "success"
            );

            toast({
                title: t('appointmentsManagement.exportComplete'),
                description: t('appointmentsManagement.appointmentsExported', { count: dataToExport.length }),
            });

            console.log('✅ CSV export completed');
        } catch (error) {
            console.error('❌ Error exporting CSV:', error);
            toast({
                title: t('common.error'),
                description: 'Failed to export CSV',
                variant: "destructive",
            });
        }
    };

    // Helper function for status badge classes
    const getStatusBadgeClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'scheduled':
                return "bg-blue-100 text-blue-800 border-blue-200 appointments-badge";
            case 'completed':
                return "bg-green-100 text-green-800 border-green-200 appointments-badge";
            case 'cancelled':
                return "bg-red-100 text-red-800 border-red-200 appointments-badge";
            case 'pending':
                return "bg-yellow-100 text-yellow-800 border-yellow-200 appointments-badge";
            case 'paid':
                return "bg-green-100 text-green-800 border-green-200 appointments-badge";
            case 'refunded':
                return "bg-purple-100 text-purple-800 border-purple-200 appointments-badge";
            case 'success':
                return "bg-green-100 text-green-800 border-green-200 appointments-badge";
            case 'failed':
                return "bg-red-100 text-red-800 border-red-200 appointments-badge";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200 appointments-badge";
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
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    // 🚀 OPTIMIZED: Apply all filters and sorting with memoization
    const getFilteredAppointments = useMemo(() => {
        let filtered = [...appointments];

        // Search filter
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(apt =>
                apt.patient_name.toLowerCase().includes(query) ||
                apt.doctor_name.toLowerCase().includes(query) ||
                apt.clinic_name.toLowerCase().includes(query) ||
                (apt.notes && apt.notes.toLowerCase().includes(query))
            );
        }

        // Status filters
        if (statusFilter !== "all") {
            filtered = filtered.filter(apt => apt.status === statusFilter);
        }

        if (paymentStatusFilter !== "all") {
            filtered = filtered.filter(apt => apt.payment_status === paymentStatusFilter);
        }

        if (clinicFilter !== "all") {
            filtered = filtered.filter(apt => apt.clinic_name === clinicFilter);
        }

        if (doctorFilter !== "all") {
            filtered = filtered.filter(apt => apt.doctor_name === doctorFilter);
        }

        // Date filter
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

        // Sorting
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
    }, [appointments, searchQuery, statusFilter, paymentStatusFilter, clinicFilter, doctorFilter, dateFilter, startDate, endDate, sortField, sortDirection]);
    // Get current page items for pagination
    const getCurrentPageItems = () => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return getFilteredAppointments.slice(indexOfFirstItem, indexOfLastItem);
    };

    // Calculate total pages for pagination
    const totalPages = Math.ceil(getFilteredAppointments.length / itemsPerPage);
    const paginatedAppointments = getCurrentPageItems();

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

    // Handle selecting day for new appointment
    const handleDaySelect = (day: string) => {
        setSelectedDay(day);
        setSelectedTimeSlot("");
    };

    // Handle selecting time slot for new appointment
    const handleTimeSlotSelect = (slot: string) => {
        setSelectedTimeSlot(slot);
    };

    // Get available time slots for selected day
    const getAvailableTimeSlots = () => {
        if (!selectedDay) return [];
        return doctorAvailability
            .filter(slot => slot.day === selectedDay)
            .map(slot => `${slot.start_time}-${slot.end_time}`);
    };

    // Get translated day names
    const getDayNames = () => {
        if (isRTL) {
            return [
                { key: "Monday", short: t('appointmentsManagement.mon'), full: t('doctorManagement.monday') },
                { key: "Tuesday", short: t('appointmentsManagement.tue'), full: t('doctorManagement.tuesday') },
                { key: "Wednesday", short: t('appointmentsManagement.wed'), full: t('doctorManagement.wednesday') },
                { key: "Thursday", short: t('appointmentsManagement.thu'), full: t('doctorManagement.thursday') },
                { key: "Friday", short: t('appointmentsManagement.fri'), full: t('doctorManagement.friday') },
                { key: "Saturday", short: t('appointmentsManagement.sat'), full: t('doctorManagement.saturday') },
                { key: "Sunday", short: t('appointmentsManagement.sun'), full: t('doctorManagement.sunday') }
            ];
        } else {
            return [
                { key: "Monday", short: "Mon", full: "Monday" },
                { key: "Tuesday", short: "Tue", full: "Tuesday" },
                { key: "Wednesday", short: "Wed", full: "Wednesday" },
                { key: "Thursday", short: "Thu", full: "Thursday" },
                { key: "Friday", short: "Fri", full: "Friday" },
                { key: "Saturday", short: "Sat", full: "Saturday" },
                { key: "Sunday", short: "Sun", full: "Sunday" }
            ];
        }
    };

    // 🚀 OPTIMIZED: Render the appointment list view
    const renderListView = () => {
        return (
            <div className={`appointments-table-container ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="overflow-x-auto">
                    <Table className="appointments-table">
                        <TableHeader>
                            <TableRow>
                                <TableHead onClick={() => handleSort("patient")} className="cursor-pointer appointments-clickable">
                                    <div className="flex items-center">
                                        {t('appointmentsManagement.patient')}
                                        {sortField === "patient" && (
                                            <ChevronsUpDown className={`h-4 w-4 ${isRTL ? 'mr-1' : 'ml-1'}`} />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead onClick={() => handleSort("doctor")} className="cursor-pointer appointments-clickable">
                                    <div className="flex items-center">
                                        {t('appointmentsManagement.doctor')}
                                        {sortField === "doctor" && (
                                            <ChevronsUpDown className={`h-4 w-4 ${isRTL ? 'mr-1' : 'ml-1'}`} />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead onClick={() => handleSort("clinic")} className="cursor-pointer appointments-clickable">
                                    <div className="flex items-center">
                                        {t('appointmentsManagement.clinic')}
                                        {sortField === "clinic" && (
                                            <ChevronsUpDown className={`h-4 w-4 ${isRTL ? 'mr-1' : 'ml-1'}`} />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead onClick={() => handleSort("date")} className="cursor-pointer appointments-clickable">
                                    <div className="flex items-center">
                                        {t('appointmentsManagement.dateTime')}
                                        {sortField === "date" && (
                                            <ChevronsUpDown className={`h-4 w-4 ${isRTL ? 'mr-1' : 'ml-1'}`} />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead>{t('appointmentsManagement.status')}</TableHead>
                                <TableHead onClick={() => handleSort("price")} className="cursor-pointer appointments-clickable">
                                    <div className="flex items-center">
                                        {t('appointmentsManagement.payment')}
                                        {sortField === "price" && (
                                            <ChevronsUpDown className={`h-4 w-4 ${isRTL ? 'mr-1' : 'ml-1'}`} />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead className={isRTL ? "text-right" : "text-left"}>{t('appointmentsManagement.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedAppointments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-gray-500 appointments-empty">
                                        {t('appointmentsManagement.noAppointmentsFound')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedAppointments.map((appointment) => (
                                    <TableRow key={appointment.id} className="hover:bg-gray-50">
                                        <TableCell className="font-medium">{appointment.patient_name}</TableCell>
                                        <TableCell>{appointment.doctor_name}</TableCell>
                                        <TableCell>{appointment.clinic_name}</TableCell>
                                        <TableCell>
                                            <div>{new Date(appointment.date).toLocaleDateString()}</div>
                                            <div className="text-xs text-gray-500">{appointment.time}</div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={getStatusBadgeClass(appointment.status)}>
                                                {t(`appointmentsManagement.${appointment.status}`)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={getStatusBadgeClass(appointment.payment_status)}>
                                                {t(`appointmentsManagement.${appointment.payment_status}`)}
                                            </span>
                                            <div className="text-sm mt-1">₪{appointment.price}</div>
                                        </TableCell>
                                        <TableCell className={`action-buttons ${isRTL ? 'text-right' : 'text-left'} ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedAppointment(appointment);
                                                    setAppointmentNotes(appointment.notes || "");
                                                }}
                                                className="appointments-clickable"
                                            >
                                                <Edit className="h-4 w-4" />
                                                <span className="sr-only">{t('appointmentsManagement.edit')}</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteAppointment(appointment.id)}
                                                className="text-red-500 hover:text-red-700 appointments-clickable"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">{t('appointmentsManagement.delete')}</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                {/* Pagination */}
                {paginatedAppointments.length > 0 && (
                    <div className={`appointments-pagination flex items-center justify-between mt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`pagination-info text-sm text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {t('appointmentsManagement.showing')} {(currentPage - 1) * itemsPerPage + 1} {t('appointmentsManagement.to')} {Math.min(currentPage * itemsPerPage, getFilteredAppointments.length)} {t('appointmentsManagement.of')} {getFilteredAppointments.length} {t('appointmentsManagement.appointments')}
                        </div>
                        <div className={`pagination-controls flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className="appointments-clickable"
                            >
                                {t('appointmentsManagement.first')}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="appointments-clickable"
                            >
                                {t('appointmentsManagement.previous')}
                            </Button>
                            <span className="px-4 py-2">
                                {t('appointmentsManagement.page')} {currentPage} {t('appointmentsManagement.of')} {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="appointments-clickable"
                            >
                                {t('appointmentsManagement.next')}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="appointments-clickable"
                            >
                                {t('appointmentsManagement.last')}
                            </Button>
                        </div>
                        <div className={`items-per-page flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                            <span className="text-sm text-gray-500">{t('appointmentsManagement.itemsPerPage')}</span>
                            <Select value={itemsPerPage.toString()}
                                onValueChange={(value) => {
                                    setItemsPerPage(Number(value));
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className={`h-8 w-[70px] ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
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
            </div>
        );
    };

    // 🚀 OPTIMIZED: Render the calendar view
    const renderCalendarView = () => {
        const appointmentsByDate: Record<string, AppointmentInfo[]> = {};

        appointments.forEach(appointment => {
            const dateKey = format(parseISO(appointment.date), 'yyyy-MM-dd');
            if (!appointmentsByDate[dateKey]) {
                appointmentsByDate[dateKey] = [];
            }
            appointmentsByDate[dateKey].push(appointment);
        });

        const sortedDates = Object.keys(appointmentsByDate).sort((a, b) =>
            new Date(a).getTime() - new Date(b).getTime()
        );
        return (
            <div className={`appointments-calendar space-y-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                {sortedDates.length === 0 ? (
                    <div className="appointments-empty text-center py-12 bg-gray-50 border rounded-lg">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-600">{t('appointmentsManagement.noAppointmentsCalendar')}</h3>
                        <p className="text-gray-500 mt-2">{t('appointmentsManagement.createAppointmentToSee')}</p>
                    </div>
                ) : (
                    sortedDates.map(date => (
                        <Card key={date} className="calendar-card">
                            <CardHeader className="bg-gray-50 p-4">
                                <CardTitle className="text-lg">
                                    {isRTL
                                        ? new Date(date).toLocaleDateString('ar-EG', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })
                                        : format(parseISO(date), 'EEEE, MMMM d, yyyy')
                                    }
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table className="calendar-table">
                                    <TableHeader>
                                        <TableRow>
                                            {isRTL ? (
                                                <>
                                                    <TableHead>{t('appointmentsManagement.patient')}</TableHead>
                                                    <TableHead>{t('appointmentsManagement.doctor')}</TableHead>
                                                    <TableHead>{t('appointmentsManagement.clinic')}</TableHead>
                                                    <TableHead>{t('common.time')}</TableHead>
                                                    <TableHead>{t('appointmentsManagement.status')}</TableHead>
                                                    <TableHead>{t('appointmentsManagement.payment')}</TableHead>
                                                    <TableHead className="text-right">{t('appointmentsManagement.actions')}</TableHead>
                                                </>
                                            ) : (
                                                <>
                                                    <TableHead>{t('common.time')}</TableHead>
                                                    <TableHead>{t('appointmentsManagement.patient')}</TableHead>
                                                    <TableHead>{t('appointmentsManagement.doctor')}</TableHead>
                                                    <TableHead>{t('appointmentsManagement.clinic')}</TableHead>
                                                    <TableHead>{t('appointmentsManagement.status')}</TableHead>
                                                    <TableHead>{t('appointmentsManagement.payment')}</TableHead>
                                                    <TableHead className="text-left">{t('appointmentsManagement.actions')}</TableHead>
                                                </>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {appointmentsByDate[date]
                                            .sort((a, b) => a.time.localeCompare(b.time))
                                            .map(appointment => (
                                                <TableRow key={appointment.id} className="hover:bg-gray-50">
                                                    {isRTL ? (
                                                        <>
                                                            <TableCell className="font-medium">{appointment.patient_name}</TableCell>
                                                            <TableCell>{appointment.doctor_name}</TableCell>
                                                            <TableCell>{appointment.clinic_name}</TableCell>
                                                            <TableCell>{formatTime(appointment.time)}</TableCell>
                                                            <TableCell>
                                                                <span className={getStatusBadgeClass(appointment.status)}>
                                                                    {t(`appointmentsManagement.${appointment.status}`)}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className={getStatusBadgeClass(appointment.payment_status)}>
                                                                    {t(`appointmentsManagement.${appointment.payment_status}`)}
                                                                </span>
                                                                <div className="text-sm mt-1">₪{appointment.price}</div>
                                                            </TableCell>
                                                            <TableCell className="text-right space-x-2 space-x-reverse">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setSelectedAppointment(appointment);
                                                                        setAppointmentNotes(appointment.notes || "");
                                                                    }}
                                                                    className="appointments-clickable"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteAppointment(appointment.id)}
                                                                    className="text-red-500 hover:text-red-700 appointments-clickable"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TableCell>{formatTime(appointment.time)}</TableCell>
                                                            <TableCell className="font-medium">{appointment.patient_name}</TableCell>
                                                            <TableCell>{appointment.doctor_name}</TableCell>
                                                            <TableCell>{appointment.clinic_name}</TableCell>
                                                            <TableCell>
                                                                <span className={getStatusBadgeClass(appointment.status)}>
                                                                    {t(`appointmentsManagement.${appointment.status}`)}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className={getStatusBadgeClass(appointment.payment_status)}>
                                                                    {t(`appointmentsManagement.${appointment.payment_status}`)}
                                                                </span>
                                                                <div className="text-sm mt-1">₪{appointment.price}</div>
                                                            </TableCell>
                                                            <TableCell className="text-left space-x-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setSelectedAppointment(appointment);
                                                                        setAppointmentNotes(appointment.notes || "");
                                                                    }}
                                                                    className="appointments-clickable"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteAppointment(appointment.id)}
                                                                    className="text-red-500 hover:text-red-700 appointments-clickable"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </>
                                                    )}
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        );
    };
    // 🚀 OPTIMIZED: Render statistics view
    const renderStatsView = () => {
        const statusData = [
            { name: t('appointmentsManagement.scheduled'), value: statsData.scheduled, color: '#3b82f6' },
            { name: t('appointmentsManagement.completed'), value: statsData.completed, color: '#10b981' },
            { name: t('appointmentsManagement.cancelled'), value: statsData.cancelled, color: '#ef4444' }
        ];

        const paymentData = [
            { name: t('appointmentsManagement.pending'), value: statsData.pending, color: '#f59e0b' },
            { name: t('appointmentsManagement.paid'), value: statsData.paid, color: '#10b981' },
            { name: t('appointmentsManagement.refunded'), value: statsData.refunded, color: '#8b5cf6' }
        ];

        const clinicRevenue: Record<string, number> = {};
        appointments.forEach(apt => {
            if (apt.payment_status === 'paid') {
                clinicRevenue[apt.clinic_name] = (clinicRevenue[apt.clinic_name] || 0) + apt.price;
            }
        });

        const clinicRevenueData = Object.entries(clinicRevenue).map(([clinic, revenue]) => ({
            name: clinic,
            revenue: revenue
        }));

        return (
            <div className={`appointments-stats space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                {/* Summary Cards */}
                <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>{t('appointmentsManagement.totalAppointments')}</CardDescription>
                            <CardTitle className="text-3xl">{statsData.total}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>{t('appointmentsManagement.scheduled')}</CardDescription>
                            <CardTitle className="text-3xl">{statsData.scheduled}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>{t('appointmentsManagement.completed')}</CardDescription>
                            <CardTitle className="text-3xl">{statsData.completed}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>{t('appointmentsManagement.totalRevenue')}</CardDescription>
                            <CardTitle className="text-3xl">₪{statsData.revenue.toFixed(2)}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Charts */}
                <div className="charts-grid grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Status Pie Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('appointmentsManagement.appointmentStatus')}</CardTitle>
                        </CardHeader>
                        <CardContent className="appointments-chart-container">
                            {statusData.some(item => item.value > 0) ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={95}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                                                const RADIAN = Math.PI / 180;
                                                const radius = outerRadius + (isRTL ? 18 : 20);
                                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                                const y = cy + radius * Math.sin(-midAngle * RADIAN);

                                                return (
                                                    <text
                                                        x={x}
                                                        y={y}
                                                        fill="#333"
                                                        textAnchor={x > cx ? (isRTL ? 'end' : 'start') : (isRTL ? 'start' : 'end')}
                                                        dominantBaseline="central"
                                                        fontSize="11"
                                                        fontWeight="bold"
                                                        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                                                    >
                                                        {`${name}: ${(percent * 100).toFixed(0)}%`}
                                                    </text>
                                                );
                                            }}
                                            labelLine={false}
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value, name) => [value, name]} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="appointments-empty flex items-center justify-center h-full">
                                    <p className="text-gray-500">{t('appointmentsManagement.noDataAvailable')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment Status Pie Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('appointmentsManagement.paymentStatus')}</CardTitle>
                        </CardHeader>
                        <CardContent className="appointments-chart-container">
                            {paymentData.some(item => item.value > 0) ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={paymentData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={95}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                                                const RADIAN = Math.PI / 180;
                                                const radius = outerRadius + (isRTL ? 18 : 20);
                                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                                const y = cy + radius * Math.sin(-midAngle * RADIAN);

                                                return (
                                                    <text
                                                        x={x}
                                                        y={y}
                                                        fill="#333"
                                                        textAnchor={x > cx ? (isRTL ? 'end' : 'start') : (isRTL ? 'start' : 'end')}
                                                        dominantBaseline="central"
                                                        fontSize="11"
                                                        fontWeight="bold"
                                                        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                                                    >
                                                        {`${name}: ${(percent * 100).toFixed(0)}%`}
                                                    </text>
                                                );
                                            }}
                                        >
                                            {paymentData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="appointments-empty flex items-center justify-center h-full">
                                    <p className="text-gray-500">{t('appointmentsManagement.noDataAvailable')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    {/* Revenue by Clinic Bar Chart */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>{t('appointmentsManagement.revenueByClinic')}</CardTitle>
                        </CardHeader>
                        <CardContent className="appointments-chart-container">
                            {clinicRevenueData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={clinicRevenueData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="revenue" name={t('common.revenue')} fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="appointments-empty flex items-center justify-center h-full">
                                    <p className="text-gray-500">{t('appointmentsManagement.noRevenueData')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    };

    // 🚀 MAIN RENDER
    return (
        <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header with title and actions */}
            <div className={`appointments-header flex flex-col md:flex-row md:items-center md:justify-between gap-4`}>
                <div className={`title-section ${isRTL ? 'text-right order-2 md:order-1' : 'text-left order-1'}`}>
                    <h2 className="text-2xl font-bold tracking-tight text-left">{t('appointmentsManagement.title')}</h2>
                    <p className="text-muted-foreground text-left">
                        {t('appointmentsManagement.description')}
                    </p>
                </div>
                <div className={`actions-section flex items-center space-x-2 ${isRTL ? 'space-x-reverse order-1 md:order-2' : 'order-2'}`}>
                    <Button variant="outline" onClick={() => {
                        if (!isLoading) refreshAll();
                    }} disabled={isLoading} className="appointments-clickable">
                        <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${isLoading ? 'animate-spin' : ''}`} />
                        {t('appointmentsManagement.refresh')}
                    </Button>
                    <Button onClick={exportToCSV} className="appointments-clickable">
                        <Download className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t('appointmentsManagement.export')}
                    </Button>
                    <Button onClick={() => setIsAddingAppointment(true)} className="appointments-clickable">
                        <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t('appointmentsManagement.addAppointment')}
                    </Button>
                </div>
            </div>

            {/* Tabs for view mode */}
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "calendar" | "stats")} className="appointments-tabs">
                <div className={`flex ${isRTL ? 'justify-end' : 'justify-start'} w-full`}>
                    <TabsList className={`tab-list ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <TabsTrigger value="list" className={`tab-trigger ${isRTL ? 'flex-row-reverse' : ''} appointments-clickable`}>
                            <FileText className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                            {t('appointmentsManagement.listView')}
                        </TabsTrigger>
                        <TabsTrigger value="calendar" className={`tab-trigger ${isRTL ? 'flex-row-reverse' : ''} appointments-clickable`}>
                            <Calendar className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                            {t('appointmentsManagement.calendarView')}
                        </TabsTrigger>
                        <TabsTrigger value="stats" className={`tab-trigger ${isRTL ? 'flex-row-reverse' : ''} appointments-clickable`}>
                            <BarChart2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                            {t('appointmentsManagement.statistics')}
                        </TabsTrigger>
                    </TabsList>
                </div>
            </Tabs>

            {/* Filters */}
            <Card className="appointments-filters">
                <CardHeader className="pb-0">
                    <div className={`search-section flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
                        <div className="flex-1">
                            <Input
                                placeholder={t('appointmentsManagement.searchAppointments')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input max-w-md"
                            />
                        </div>
                        <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                            <Button variant="outline" onClick={resetFilters} className="reset-button appointments-clickable">
                                <X className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                {t('appointmentsManagement.resetFilters')}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className={`filter-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {/* Status Filter */}
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className={`filter-select ${isRTL ? 'text-right [&>span]:text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                                <SelectValue placeholder={t('appointmentsManagement.filterByStatus')} />
                            </SelectTrigger>
                            <SelectContent className={isRTL ? 'text-right' : 'text-left'} dir={isRTL ? 'rtl' : 'ltr'}>
                                <SelectItem value="all" className={isRTL ? 'text-right' : ''}>{t('appointmentsManagement.allStatuses')}</SelectItem>
                                <SelectItem value="scheduled" className={isRTL ? 'text-right' : ''}>{t('appointmentsManagement.scheduled')}</SelectItem>
                                <SelectItem value="completed" className={isRTL ? 'text-right' : ''}>{t('appointmentsManagement.completed')}</SelectItem>
                                <SelectItem value="cancelled" className={isRTL ? 'text-right' : ''}>{t('appointmentsManagement.cancelled')}</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Payment Status Filter */}
                        <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                            <SelectTrigger className={`filter-select ${isRTL ? 'text-right [&>span]:text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                                <SelectValue placeholder={t('appointmentsManagement.filterByPayment')} />
                            </SelectTrigger>
                            <SelectContent className={isRTL ? 'text-right' : 'text-left'} dir={isRTL ? 'rtl' : 'ltr'}>
                                <SelectItem value="all" className={isRTL ? 'text-right' : ''}>{t('appointmentsManagement.allPaymentStatuses')}</SelectItem>
                                <SelectItem value="pending" className={isRTL ? 'text-right' : ''}>{t('appointmentsManagement.pending')}</SelectItem>
                                <SelectItem value="paid" className={isRTL ? 'text-right' : ''}>{t('appointmentsManagement.paid')}</SelectItem>
                                <SelectItem value="refunded" className={isRTL ? 'text-right' : ''}>{t('appointmentsManagement.refunded')}</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Clinic Filter */}
                        <Select value={clinicFilter} onValueChange={setClinicFilter}>
                            <SelectTrigger className={`filter-select ${isRTL ? 'text-right [&>span]:text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                                <SelectValue placeholder={t('appointmentsManagement.filterByClinic')} />
                            </SelectTrigger>
                            <SelectContent className={isRTL ? 'text-right' : 'text-left'} dir={isRTL ? 'rtl' : 'ltr'}>
                                <SelectItem value="all" className={isRTL ? 'text-right' : ''}>{t('appointmentsManagement.allClinics')}</SelectItem>
                                {uniqueClinics.map(clinic => (
                                    <SelectItem key={clinic} value={clinic} className={isRTL ? 'text-right' : ''}>{clinic}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Doctor Filter */}
                        <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                            <SelectTrigger className={`filter-select ${isRTL ? 'text-right [&>span]:text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                                <SelectValue placeholder={t('appointmentsManagement.filterByDoctor')} />
                            </SelectTrigger>
                            <SelectContent className={isRTL ? 'text-right' : 'text-left'} dir={isRTL ? 'rtl' : 'ltr'}>
                                <SelectItem value="all" className={isRTL ? 'text-right' : ''}>{t('appointmentsManagement.allDoctors')}</SelectItem>
                                {uniqueDoctors.map(doctor => (
                                    <SelectItem key={doctor} value={doctor} className={isRTL ? 'text-right' : ''}>{doctor}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {/* Date Filter */}
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger className={`filter-select ${isRTL ? 'text-right [&>span]:text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                                <SelectValue placeholder={t('appointmentsManagement.filterByDate')} />
                            </SelectTrigger>
                            <SelectContent className={isRTL ? 'text-right' : 'text-left'} dir={isRTL ? 'rtl' : 'ltr'}>
                                <SelectItem value="all" className={isRTL ? 'text-right' : ''}>{t('appointmentsManagement.allDates')}</SelectItem>
                                <SelectItem value="today" className={isRTL ? 'text-right' : ''}>{t('appointmentsManagement.today')}</SelectItem>
                                <SelectItem value="thisWeek" className={isRTL ? 'text-right' : ''}>{t('appointmentsManagement.thisWeek')}</SelectItem>
                                <SelectItem value="thisMonth" className={isRTL ? 'text-right' : ''}>{t('appointmentsManagement.thisMonth')}</SelectItem>
                                <SelectItem value="custom" className={isRTL ? 'text-right' : ''}>{t('appointmentsManagement.customRange')}</SelectItem>
                            </SelectContent>
                        </Select>
                        {/* Custom Date Range */}
                        {dateFilter === 'custom' && (
                            <div className={`custom-date-inputs flex items-center space-x-2 col-span-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                                <Input
                                    type="date"
                                    value={startDate?.toISOString().split('T')[0] || ''}
                                    onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                                    placeholder="Start date"
                                    className={isRTL ? 'text-right' : 'text-left'}
                                />
                                <span>{t('appointmentsManagement.to')}</span>
                                <Input
                                    type="date"
                                    value={endDate?.toISOString().split('T')[0] || ''}
                                    onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                                    placeholder="End date"
                                    className={isRTL ? 'text-right' : 'text-left'}
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
                    <DialogContent className="appointments-dialog sm:max-w-[600px]">
                        <DialogHeader
                            className={`${isRTL ? 'text-right' : 'text-left'}`}
                            style={isRTL ? { textAlign: 'right' } : {}}>
                            <DialogTitle>{t('appointmentsManagement.appointmentDetails')}</DialogTitle>
                            <DialogDescription>
                                {t('appointmentsManagement.manageAppointment', { patientName: selectedAppointment.patient_name })}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="dialog-body grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium">{t('appointmentsManagement.patient')}</p>
                                    <p>{selectedAppointment.patient_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{t('appointmentsManagement.doctor')}</p>
                                    <p>{selectedAppointment.doctor_name}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium">{t('appointmentsManagement.clinic')}</p>
                                    <p>{selectedAppointment.clinic_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{t('appointmentsManagement.dateTime')}</p>
                                    <p>
                                        {new Date(selectedAppointment.date).toLocaleDateString()} - {selectedAppointment.time}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium">{t('appointmentsManagement.status')}</p>
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
                                        <SelectTrigger className={`${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                                            <SelectValue placeholder={t('appointmentsManagement.selectStatus')} />
                                        </SelectTrigger>
                                        <SelectContent className={`${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                                            <SelectItem value="scheduled" className={`${isRTL ? 'text-right' : 'text-left'}`}>{t('appointmentsManagement.scheduled')}</SelectItem>
                                            <SelectItem value="completed" className={`${isRTL ? 'text-right' : 'text-left'}`}>{t('appointmentsManagement.completed')}</SelectItem>
                                            <SelectItem value="cancelled" className={`${isRTL ? 'text-right' : 'text-left'}`}>{t('appointmentsManagement.cancelled')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{t('appointmentsManagement.paymentStatus')}</p>
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
                                        <SelectTrigger className={`${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                                            <SelectValue placeholder={t('appointmentsManagement.selectPaymentStatus')} />
                                        </SelectTrigger>
                                        <SelectContent className={`${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                                            <SelectItem value="pending" className={`${isRTL ? 'text-right' : 'text-left'}`}>{t('appointmentsManagement.pending')}</SelectItem>
                                            <SelectItem value="paid" className={`${isRTL ? 'text-right' : 'text-left'}`}>{t('appointmentsManagement.paid')}</SelectItem>
                                            <SelectItem value="refunded" className={`${isRTL ? 'text-right' : 'text-left'}`}>{t('appointmentsManagement.refunded')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium">{t('common.price')}</p>
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
                                    onBlur={async () => {
                                        // Update price in database when input loses focus
                                        const { error } = await supabase
                                            .from('appointments')
                                            .update({
                                                price: selectedAppointment.price,
                                                updated_at: new Date().toISOString()
                                            })
                                            .eq('id', selectedAppointment.id);

                                        if (error) {
                                            console.error("Error updating price:", error);
                                            toast({
                                                title: t('common.error'),
                                                description: t('appointmentsManagement.failedToUpdatePrice'),
                                                variant: "destructive",
                                            });
                                        } else {
                                            toast({
                                                title: t('common.success'),
                                                description: t('appointmentsManagement.priceUpdated'),
                                            });
                                        }
                                    }}
                                    className="form-input"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium">{t('appointmentsManagement.notes')}</p>
                                <textarea
                                    className="form-textarea w-full p-2 border rounded-md min-h-[100px]"
                                    value={appointmentNotes}
                                    onChange={(e) => setAppointmentNotes(e.target.value)}
                                    placeholder={t('appointmentsManagement.addNotes')}
                                />
                            </div>
                        </div>
                        <DialogFooter className="dialog-footer">
                            <Button
                                onClick={() => {
                                    handleUpdateAppointmentNotes(selectedAppointment.id, appointmentNotes);
                                    setSelectedAppointment(null);
                                }}
                                className="appointments-clickable"
                            >
                                {t('appointmentsManagement.saveChanges')}
                            </Button>
                            <DialogClose asChild>
                                <Button variant="outline" className="appointments-clickable">{t('appointmentsManagement.close')}</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
            {/* Add Appointment Dialog */}
            <Dialog open={isAddingAppointment} onOpenChange={setIsAddingAppointment}>
                <DialogContent className={`appointments-dialog sm:max-w-[700px] ${isRTL ? '[&>button]:left-4 [&>button]:right-auto' : ''}`}>
                    <DialogHeader className="dialog-header" style={{ direction: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }}>
                        <DialogTitle>
                            {t('appointmentsManagement.createNewAppointmentTitle')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('appointmentsManagement.scheduleNewAppointment')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="appointments-form dialog-body grid gap-6 py-4">
                        {/* Clinic Selection */}
                        <div>
                            <Label htmlFor="clinic-select">{t('appointmentsManagement.selectClinic')}</Label>
                            <Select
                                value={selectedClinicId}
                                onValueChange={setSelectedClinicId}
                            >
                                <SelectTrigger className={`form-select ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                                    <SelectValue placeholder={t('appointmentsManagement.chooseClinic')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {clinics.filter(c => c.is_active).map(clinic => (
                                        <SelectItem key={clinic.id} value={clinic.id}>
                                            {clinic.name} - {clinic.category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {clinics.length === 0 && (
                                <p className="text-yellow-600 text-sm mt-1">
                                    {t('appointmentsManagement.noActiveClinics')}
                                </p>
                            )}
                        </div>
                        {/* Doctor Selection (filtered by clinic) */}
                        <div>
                            <Label htmlFor="doctor-select">{t('appointmentsManagement.selectDoctor')}</Label>
                            <Select
                                value={selectedDoctorId}
                                onValueChange={setSelectedDoctorId}
                                disabled={!selectedClinicId}
                            >
                                <SelectTrigger className={`form-select ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                                    <SelectValue placeholder={selectedClinicId ? t('appointmentsManagement.chooseDoctor') : t('appointmentsManagement.selectClinicFirst')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableDoctorsForClinic.map(doctor => (
                                        <SelectItem key={doctor.id} value={doctor.id}>
                                            {doctor.name} - {doctor.specialty} (₪{doctor.price})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedClinicId && availableDoctorsForClinic.length === 0 && (
                                <p className="text-yellow-600 text-sm mt-1">
                                    {t('appointmentsManagement.noAvailableDoctors')}
                                </p>
                            )}
                        </div>
                        {/* Patient Selection with search */}
                        <div>
                            <Label htmlFor="patient-select">{t('appointmentsManagement.selectPatient')}</Label>
                            <div className="space-y-2">
                                <Input
                                    placeholder={t('appointmentsManagement.searchPatients')}
                                    value={patientSearchQuery}
                                    onChange={(e) => setPatientSearchQuery(e.target.value)}
                                    className="patient-search form-input"
                                />
                                <div className="patient-list max-h-40 overflow-y-auto border rounded-md">
                                    {filteredPatients.length === 0 ? (
                                        <div className="p-3 text-center text-gray-500">{t('appointmentsManagement.noPatientsFound')}</div>
                                    ) : (
                                        filteredPatients.map(patient => (
                                            <div
                                                key={patient.userid}
                                                className={`patient-item p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${selectedPatientId === patient.userid.toString() ? 'bg-blue-50' : ''}`}
                                                onClick={() => setSelectedPatientId(patient.userid.toString())}
                                            >
                                                <div className="font-medium">{patient.english_username_a} {patient.english_username_d}</div>
                                                <div className="text-xs text-gray-500">{patient.user_email}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Appointment Time Selection */}
                        {selectedDoctorId && (
                            <div className="space-y-4">
                                <div>
                                    <Label>{t('appointmentsManagement.selectDay')}</Label>
                                    <div className="day-grid grid grid-cols-3 sm:grid-cols-7 gap-2 mt-2">
                                        {getDayNames().map(day => {
                                            const hasSlots = doctorAvailability.some(slot => slot.day === day.key);
                                            return (
                                                <Button
                                                    key={day.key}
                                                    type="button"
                                                    variant={selectedDay === day.key ? "default" : "outline"}
                                                    onClick={() => handleDaySelect(day.key)}
                                                    disabled={!hasSlots}
                                                    className={`day-button appointments-clickable ${!hasSlots ? "opacity-50" : ""}`}
                                                >
                                                    {day.short}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                                {selectedDay && (
                                    <div>
                                        <Label>{t('appointmentsManagement.selectTimeSlot')}</Label>
                                        <div className="time-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                                            {getAvailableTimeSlots().length === 0 ? (
                                                <div className="col-span-full text-center py-3 text-yellow-600 bg-yellow-50 rounded-md">
                                                    {t('appointmentsManagement.noAvailableSlots')}
                                                </div>
                                            ) : (
                                                getAvailableTimeSlots().map(slot => (
                                                    <Button
                                                        key={slot}
                                                        type="button"
                                                        variant={selectedTimeSlot === slot ? "default" : "outline"}
                                                        onClick={() => handleTimeSlotSelect(slot)}
                                                        className="time-button appointments-clickable"
                                                    >
                                                        {formatTime(slot.split('-')[0])}
                                                    </Button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Price (automatically set from doctor selection) */}
                        <div>
                            <Label>{t('appointmentsManagement.appointmentPrice')}</Label>
                            <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                                <div className="text-2xl font-bold">₪{appointmentPrice.toFixed(2)}</div>
                                {appointmentPrice > 0 && (
                                    <div className="text-sm text-gray-500">
                                        {t('appointmentsManagement.basedOnDoctorRate')}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <Label htmlFor="appointment_notes">{t('appointmentsManagement.additionalNotes')}</Label>
                            <textarea
                                id="appointment_notes"
                                className="form-textarea w-full p-2 border rounded-md min-h-[100px]"
                                value={appointmentNotes}
                                onChange={(e) => setAppointmentNotes(e.target.value)}
                                placeholder={t('appointmentsManagement.specialInstructions')}
                            />
                        </div>
                    </div>
                    <DialogFooter className="dialog-footer">
                        <Button
                            onClick={handleAddAppointment}
                            disabled={!selectedClinicId || !selectedDoctorId || !selectedPatientId || !selectedDay || !selectedTimeSlot}
                            className="appointments-clickable"
                        >
                            {t('appointmentsManagement.createAppointment')}
                        </Button>
                        <DialogClose asChild>
                            <Button variant="outline" className="appointments-clickable">{t('appointmentsManagement.cancel')}</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AppointmentsManagement;
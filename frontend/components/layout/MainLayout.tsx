// components/layout/MainLayout.tsx
import React from "react";
import { useLocation } from "react-router-dom";
import { Header } from "./Header";
import Footer from "./Footer";
import { useAuth } from "../../hooks/useAuth";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user } = useAuth();
  
  // Hide footer for patient role on appointments page
  const isPatientOnAppointments = 
    user?.user_roles?.toLowerCase() === 'patient' && 
    location.pathname === '/patient/dashboard';
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-4 bg-gray-50">{children}</main>
      {!isPatientOnAppointments && <Footer />}
    </div>
  );
}

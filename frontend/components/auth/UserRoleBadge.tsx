// components/UserRoleBadge.tsx
import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from 'react-i18next';

interface UserRoleBadgeProps {
  role?: string;
}

const UserRoleBadge = ({ role }: UserRoleBadgeProps) => {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Use prop role if provided, otherwise use user role
  const userRole = role || user?.role;

  if (!userRole) return null;

  const getBadgeColor = (roleType: string) => {
    const lowerRole = roleType.toLowerCase();
    switch (lowerRole) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "doctor":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "secretary":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "nurse":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "lab":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "x ray":
      case "xray":
      case "x-ray":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "ultrasound":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "patient":
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const getRoleText = (roleType: string) => {
    if (!isRTL) {
      return roleType.charAt(0).toUpperCase() + roleType.slice(1);
    }

    const arabicRoles: { [key: string]: string } = {
      'patient': 'مريض',
      'doctor': 'طبيب',
      'secretary': 'سكرتير',
      'nurse': 'ممرض',
      'lab': 'مختبر',
      'admin': 'مدير',
      'x ray': 'أشعة',
      'xray': 'أشعة',
      'x-ray': 'أشعة',
      'ultrasound': 'موجات فوق صوتية'
    };

    return arabicRoles[roleType.toLowerCase()] || roleType.charAt(0).toUpperCase() + roleType.slice(1);
  };

  return (
    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getBadgeColor(userRole)}`}>
      {getRoleText(userRole)}
    </div>
  );
};

export default UserRoleBadge;

// lib/rolePermissions.ts - Complete fixed version with doctor-specific permissions
export interface UserPermissions {
  canViewHome: boolean;
  canViewClinics: boolean;
  canViewLabs: boolean;
  canViewXray: boolean;
  canViewAboutUs: boolean;
  canViewAdmin: boolean;
  canViewAppointments: boolean;
  canViewOverview: boolean;
  canViewUsers: boolean;
  canViewDoctors: boolean;
  canCreateAppointments: boolean;
  canManageUsers: boolean;
  canManageClinics: boolean;
  canManageDoctors: boolean;
  canViewReports: boolean;
  // ✅ NEW: Doctor-specific permissions
  canViewDoctorLabs: boolean;
  canViewDoctorXray: boolean;
}

export const RolePermissions: Record<string, UserPermissions> = {
  admin: {
    canViewHome: true,
    canViewClinics: true,
    canViewLabs: true,
    canViewXray: true,
    canViewAboutUs: true,
    canViewAdmin: true,
    canViewAppointments: true,
    canViewOverview: true,
    canViewUsers: true,
    canViewDoctors: true,
    canCreateAppointments: true,
    canManageUsers: true,
    canManageClinics: true,
    canManageDoctors: true,
    canViewReports: true,
    canViewDoctorLabs: true,
    canViewDoctorXray: true
  },
  secretary: {
    canViewHome: true,
    canViewClinics: true,
    canViewLabs: false,
    canViewXray: false,
    canViewAboutUs: false,
    canViewAdmin: true,
    canViewAppointments: true,
    canViewOverview: false,
    canViewUsers: true,
    canViewDoctors: false,
    canCreateAppointments: true,
    canManageUsers: true,
    canManageClinics: true,
    canManageDoctors: false,
    canViewReports: false,
    canViewDoctorLabs: false,
    canViewDoctorXray: false
  },
  doctor: {
    canViewHome: false,
    canViewClinics: false,
    canViewLabs: false,
    canViewXray: false,
    canViewAboutUs: false,
    canViewAdmin: false,
    canViewAppointments: false,
    canViewOverview: false,
    canViewUsers: false,
    canViewDoctors: false,
    canCreateAppointments: false,
    canManageUsers: false,
    canManageClinics: false,
    canManageDoctors: false,
    canViewReports: false,
    canViewDoctorLabs: true,
    canViewDoctorXray: true
  },
  lab: {
    canViewHome: false,
    canViewClinics: false,
    canViewLabs: true,
    canViewXray: false,
    canViewAboutUs: false,
    canViewAdmin: false,
    canViewAppointments: false,
    canViewOverview: false,
    canViewUsers: false,
    canViewDoctors: false,
    canCreateAppointments: false,
    canManageUsers: false,
    canManageClinics: false,
    canManageDoctors: false,
    canViewReports: false,
    canViewDoctorLabs: false,
    canViewDoctorXray: false
  },
  "x ray": {
    canViewHome: false,
    canViewClinics: false,
    canViewLabs: false,
    canViewXray: true,
    canViewAboutUs: false,
    canViewAdmin: false,
    canViewAppointments: false,
    canViewOverview: false,
    canViewUsers: false,
    canViewDoctors: false,
    canCreateAppointments: false,
    canManageUsers: false,
    canManageClinics: false,
    canManageDoctors: false,
    canViewReports: false,
    canViewDoctorLabs: false,
    canViewDoctorXray: false
  },
  nurse: {
    canViewHome: true,
    canViewClinics: false,
    canViewLabs: false,
    canViewXray: false,
    canViewAboutUs: false,
    canViewAdmin: false,
    canViewAppointments: false,
    canViewOverview: false,
    canViewUsers: false,
    canViewDoctors: false,
    canCreateAppointments: false,
    canManageUsers: false,
    canManageClinics: false,
    canManageDoctors: false,
    canViewReports: false,
    canViewDoctorLabs: false,
    canViewDoctorXray: false
  },
  patient: {
    canViewHome: true,
    canViewClinics: true,
    canViewLabs: false,
    canViewXray: false,
    canViewAboutUs: true,
    canViewAdmin: false,
    canViewAppointments: false,
    canViewOverview: false,
    canViewUsers: false,
    canViewDoctors: false,
    canCreateAppointments: false,
    canManageUsers: false,
    canManageClinics: false,
    canManageDoctors: false,
    canViewReports: false,
    canViewDoctorLabs: false,
    canViewDoctorXray: false
  }
};

// Helper function to get permissions for a role
export const getRolePermissions = (role: string): UserPermissions => {
  const normalizedRole = role?.toLowerCase()?.trim();

  // Handle special case for x-ray role variations
  if (normalizedRole === 'xray' || normalizedRole === 'x-ray' || normalizedRole === 'x ray') {
    return RolePermissions["x ray"];
  }

  return RolePermissions[normalizedRole] || RolePermissions.patient;
};

// Helper function to check if user has specific permission
export const hasPermission = (role: string, permission: keyof UserPermissions): boolean => {
  const permissions = getRolePermissions(role);
  return permissions[permission];
};

// Helper function to get accessible routes for a role
export const getAccessibleRoutes = (role: string): string[] => {
  const permissions = getRolePermissions(role);
  const routes: string[] = [];

  if (permissions.canViewHome) routes.push('/');
  if (permissions.canViewClinics) routes.push('/clinics');
  if (permissions.canViewLabs) routes.push('/labs');
  if (permissions.canViewXray) routes.push('/xray');
  if (permissions.canViewAboutUs) routes.push('/about');
  if (permissions.canViewAdmin) routes.push('/admin');

  // ✅ NEW: Add doctor-specific routes
  if (permissions.canViewDoctorLabs) routes.push('/doctor/labs');
  if (permissions.canViewDoctorXray) routes.push('/doctor/xray');

  return routes;
};

// Helper function to get the default/primary route for a role
export const getDefaultRouteForRole = (role: string): string => {
  const normalizedRole = role?.toLowerCase()?.trim();

  switch (normalizedRole) {
    case 'lab':
      return '/labs';
    case 'x ray':
    case 'xray':
    case 'x-ray':
      return '/xray';
    case 'admin':
      return '/admin';
    case 'secretary':
      return '/admin'; // Secretary goes to admin dashboard (appointments)
    case 'doctor':
      return '/doctor/labs'; // ✅ CHANGED: Doctors go directly to their lab results page
    case 'nurse':
    case 'patient':
    default:
      return '/'; // Default to home for roles that can access it
  }
};
// utils/rolePermissions.ts
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
    canViewReports: true
  },
  secretary: {
    canViewHome: true,
    canViewClinics: true,
    canViewLabs: false,
    canViewXray: false,
    canViewAboutUs: false,
    canViewAdmin: true, // Can access admin dashboard but limited
    canViewAppointments: true, // Only appointments tab
    canViewOverview: false,
    canViewUsers: false,
    canViewDoctors: false,
    canCreateAppointments: true,
    canManageUsers: false,
    canManageClinics: false,
    canManageDoctors: false,
    canViewReports: false
  },
  doctor: {
    canViewHome: true,        // ✅ CHANGED: Doctor can see Home
    canViewClinics: false,
    canViewLabs: true,
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
    canViewReports: false
  },
  lab: {
    canViewHome: true,        // ✅ CHANGED: Lab can see Home
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
    canViewReports: false
  },
  "x ray": {
    canViewHome: true,        // ✅ CHANGED: X-ray can see Home
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
    canViewReports: false
  },
  nurse: {
    canViewHome: true,
    canViewClinics: true,
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
    canViewReports: false
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
    canViewReports: false
  }
};

// Helper function to get permissions for a role
export const getRolePermissions = (role: string): UserPermissions => {
  const normalizedRole = role?.toLowerCase()?.trim();
  
  // Handle special case for x-ray role
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
  
  return routes;
};
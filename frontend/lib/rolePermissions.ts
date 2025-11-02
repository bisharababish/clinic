// lib/rolePermissions.ts - Complete fixed version with doctor-specific permissions
export interface UserPermissions {
  canViewHome: boolean;
  canViewClinics: boolean;
  canViewLabs: boolean;
  canViewXray: boolean;
  canViewUltrasound: boolean;
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
  canViewDoctorUltrasound: boolean;
  canViewCalendar: boolean;
  canRequestUserDeletion: boolean;
  canApproveUserDeletion: boolean;
  canViewPatients: boolean; // Add this line
  canViewPreview: boolean; // NEW: Patient preview mode permission

}

export const RolePermissions: Record<string, UserPermissions> = {
  admin: {
    canViewHome: true,
    canViewClinics: true,
    canViewLabs: true,
    canViewXray: true,
    canViewUltrasound: true,
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
    canViewDoctorXray: true,
    canViewDoctorUltrasound: true,
    canViewCalendar: true,
    canRequestUserDeletion: true,
    canApproveUserDeletion: true,
    canViewPatients: true, // Add this
    canViewPreview: true, // Admin can view preview mode

  },
  secretary: {
    canViewHome: true,
    canViewClinics: true,
    canViewLabs: false,
    canViewXray: false,
    canViewUltrasound: false,
    canViewAdmin: true,
    canViewAppointments: true,
    canViewOverview: false,
    canViewUsers: true,
    canViewDoctors: false,
    canCreateAppointments: true,
    canManageUsers: false,
    canManageClinics: false,
    canManageDoctors: false,
    canViewReports: false,
    canViewDoctorLabs: false,
    canViewDoctorXray: false,
    canViewDoctorUltrasound: false,
    canViewCalendar: true,
    canRequestUserDeletion: true,
    canApproveUserDeletion: false,
    canViewPatients: false, // Add this
    canViewPreview: false, // Secretary cannot view preview mode

  },
  doctor: {
    canViewHome: false,
    canViewClinics: false,
    canViewLabs: false,
    canViewXray: false,
    canViewUltrasound: false,
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
    canViewDoctorXray: true,
    canViewDoctorUltrasound: true,
    canViewCalendar: true,
    canRequestUserDeletion: false,
    canApproveUserDeletion: false,
    canViewPatients: true, // Add this
    canViewPreview: false, // Doctor cannot view preview mode

  },
  lab: {
    canViewHome: false,
    canViewClinics: false,
    canViewLabs: true,
    canViewXray: false,
    canViewUltrasound: false,
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
    canViewDoctorXray: false,
    canViewDoctorUltrasound: false,
    canViewCalendar: false,
    canRequestUserDeletion: false,
    canApproveUserDeletion: false,
    canViewPatients: false, // Add this
    canViewPreview: false, // Lab cannot view preview mode

  },
  "x ray": {
    canViewHome: false,
    canViewClinics: false,
    canViewLabs: false,
    canViewXray: true,
    canViewUltrasound: false,
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
    canViewDoctorXray: false,
    canViewDoctorUltrasound: false,
    canViewCalendar: false,
    canRequestUserDeletion: false,
    canApproveUserDeletion: false,
    canViewPatients: false, // Add this
    canViewPreview: false, // X-ray cannot view preview mode

  },
  ultrasound: {
    canViewHome: false,
    canViewClinics: false,
    canViewLabs: false,
    canViewXray: false,
    canViewUltrasound: true,
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
    canViewDoctorXray: false,
    canViewDoctorUltrasound: false,
    canViewCalendar: false,
    canRequestUserDeletion: false,
    canApproveUserDeletion: false,
    canViewPatients: false,
    canViewPreview: false, // Ultrasound cannot view preview mode

  },
  nurse: {
    canViewHome: true,
    canViewClinics: false,
    canViewLabs: false,
    canViewXray: false,
    canViewUltrasound: false,
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
    canViewDoctorXray: false,
    canViewDoctorUltrasound: false,
    canViewCalendar: false,
    canRequestUserDeletion: false,
    canApproveUserDeletion: false,
    canViewPatients: false, // Add this
    canViewPreview: false, // Nurse cannot view preview mode

  },
  patient: {
    canViewHome: true,
    canViewClinics: true,
    canViewLabs: false,
    canViewXray: false,
    canViewUltrasound: false,
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
    canViewDoctorXray: false,
    canViewDoctorUltrasound: false,
    canViewCalendar: false,
    canRequestUserDeletion: false,
    canApproveUserDeletion: false,
    canViewPatients: false, // Add this
    canViewPreview: true, // Patient can view preview mode

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
  if (permissions.canViewUltrasound) routes.push('/ultrasound');
  if (permissions.canViewAdmin) routes.push('/admin');

  if (permissions.canViewDoctorLabs) routes.push('/doctor/labs');
  if (permissions.canViewDoctorXray) routes.push('/doctor/xray');
  if (permissions.canViewDoctorUltrasound) routes.push('/doctor/ultrasound');
  if (permissions.canViewPatients) routes.push('/doctor/patients');
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
    case 'ultrasound':
      return '/ultrasound';
    case 'admin':
      return '/admin';
    case 'secretary':
      return '/admin'; // Secretary goes to admin dashboard (appointments)
    case 'doctor':
      return '/doctor/patients'; // ✅ Doctors go directly to their patients page
    case 'nurse':
    case 'patient':
    default:
      return '/home'; // ✅ FIXED: Default to /home instead of / to avoid redirect loops
  }
};

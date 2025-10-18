# Complete User Flow Documentation - Medical Clinic Management System

## System Overview
This is a comprehensive medical clinic management system with multi-role access, bilingual support (English/Arabic), and various specialized features for different user types.

## User Roles & Permissions

### 1. **Admin** 
- **Full system access**
- **Default route**: Admin Dashboard
- **Permissions**: All features, user management, clinic management, reports

### 2. **Patient**
- **Primary users**
- **Default route**: Home/Index page
- **Permissions**: Book appointments, view health records, payment processing

### 3. **Doctor**
- **Medical professionals**
- **Default route**: Doctor-specific pages (Labs, X-Ray, Patients)
- **Permissions**: View patient data, manage lab results, X-ray results

### 4. **Secretary**
- **Administrative staff**
- **Default route**: Home page
- **Permissions**: Book appointments, manage users, access admin features

### 5. **Nurse**
- **Medical support staff**
- **Default route**: Home page
- **Permissions**: Patient search, health data management, patient creation

### 6. **Lab Technician**
- **Laboratory staff**
- **Default route**: Labs page
- **Permissions**: Lab result management only

### 7. **X-Ray Technician**
- **Imaging staff**
- **Default route**: X-Ray page
- **Permissions**: X-ray result management only

---

## Complete User Flow Map

### **Entry Points**
1. **Landing Page** → Authentication Required
2. **Direct URL Access** → Role-based redirect

### **Authentication Flow**
```
Unauthenticated User
    ↓
Auth Page (/auth)
    ↓
[Login Form] OR [Register Form]
    ↓
Authentication Check
    ↓
Role Detection & Redirect
    ↓
Default Route for Role
```

---

## Detailed User Journeys

### **🩺 PATIENT JOURNEY**

#### **Registration & First Login**
1. **Register** → `/auth` (RegisterForm)
   - Fill bilingual name fields (English + Arabic)
   - Enter email, Palestinian ID, phone (+97 format)
   - Set date of birth, gender, password
   - Email verification required
2. **Email Verification** → `/auth/callback`
3. **Auto-login** → Home page (`/`)

#### **Main Patient Activities**
1. **Home Dashboard** (`/`)
   - View health reminder notifications
   - Quick access to book appointments
   - Health status overview (if data exists)

2. **Book Appointment** (`/clinics`)
   - Browse clinic categories
   - Select clinic and doctor
   - Choose available time slots
   - View pricing and specialties

3. **Payment Process** (`/payment`)
   - Review appointment details
   - Complete payment
   - Receive confirmation

4. **Confirmation** (`/confirmation`)
   - Appointment booking confirmed
   - Receipt and details

---

### **👨‍⚕️ DOCTOR JOURNEY**

#### **Login & Redirect**
1. **Login** → `/auth`
2. **Auto-redirect** → Doctor-specific pages (no home access)

#### **Doctor Activities**
1. **Patient Management** (`/doctor/patients`)
   - Search and view patient records
   - Access health data and history

2. **Lab Results** (`/doctor/labs`)
   - View and manage lab results
   - Update patient lab data

3. **X-Ray Results** (`/doctor/xray`)
   - View and manage X-ray results
   - Update patient imaging data

---

### **👩‍⚕️ NURSE JOURNEY**

#### **Login & Access**
1. **Login** → `/auth`
2. **Redirect** → Home page (`/`)

#### **Nurse Activities**
1. **Patient Search & Management** (`/`)
   - Search patients by ID, name, phone
   - View patient health data
   - Create new patient records
   - Update patient information
   - Manage patient health conditions

2. **Health Data Management**
   - Add/edit medical conditions
   - Manage medications
   - Update health status
   - Track patient statistics

---

### **🏥 ADMIN JOURNEY**

#### **Login & Dashboard**
1. **Login** → `/auth`
2. **Redirect** → Admin Dashboard (`/admin`)

#### **Admin Activities**
1. **Dashboard Overview** (`/admin`)
   - System statistics
   - Quick access to all management features

2. **User Management** (`/admin/users`)
   - Create/edit/delete users
   - Manage user roles and permissions
   - Handle user deletion requests

3. **Clinic Management** (`/admin/clinics`)
   - Manage clinic categories
   - Add/edit clinics and doctors
   - Set pricing and availability
   - Manage clinic display order

4. **Patient Health Management** (`/admin/patient-health`)
   - View all patient health records
   - Manage health data
   - Generate health reports

5. **Appointment Management** (`/admin/appointments`)
   - View all appointments
   - Manage booking system

6. **Doctor Calendar** (`/admin/doctor-calendar`)
   - Manage doctor schedules
   - Set availability

7. **Reports & Analytics**
   - System usage reports
   - Patient statistics
   - Revenue tracking

---

### **📋 SECRETARY JOURNEY**

#### **Login & Access**
1. **Login** → `/auth`
2. **Redirect** → Home page (`/`)

#### **Secretary Activities**
1. **Appointment Management** (`/`)
   - Book appointments for patients
   - Manage appointment schedules

2. **User Management** (`/admin`)
   - Access admin features
   - Manage user accounts
   - Handle patient inquiries

3. **Clinic Operations**
   - Access clinic information
   - Support patient booking process

---

### **🧪 LAB TECHNICIAN JOURNEY**

#### **Login & Access**
1. **Login** → `/auth`
2. **Auto-redirect** → Labs page (`/labs`)

#### **Lab Technician Activities**
1. **Lab Results Management** (`/labs`)
   - View lab requests
   - Input lab results
   - Manage lab data
   - Update patient lab records

---

### **📸 X-RAY TECHNICIAN JOURNEY**

#### **Login & Access**
1. **Login** → `/auth`
2. **Auto-redirect** → X-Ray page (`/xray`)

#### **X-Ray Technician Activities**
1. **X-Ray Results Management** (`/xray`)
   - View X-ray requests
   - Input X-ray results
   - Manage imaging data
   - Update patient X-ray records

---

## Navigation & Access Control

### **Route Protection**
- **Public Routes**: `/auth`, `/auth/reset-password`, `/auth/callback`
- **Protected Routes**: All other routes require authentication
- **Role-based Access**: Each route checks user permissions

### **Default Redirects by Role**
```javascript
const defaultRoutes = {
  admin: '/admin',
  patient: '/',
  doctor: '/doctor/patients', // or labs/xray based on specialization
  secretary: '/',
  nurse: '/',
  lab: '/labs',
  'x ray': '/xray'
};
```

### **Layout Structure**
- **MainLayout**: Most pages with header, sidebar, footer
- **HeaderOnlyLayout**: Payment and confirmation pages
- **No Layout**: Auth pages

---

## Key Features & Functionality

### **🔐 Authentication & Security**
- Email verification required for new users
- Role-based access control
- Session management with Supabase
- Password reset functionality

### **🌐 Internationalization**
- Full Arabic/English support
- RTL/LTR layout switching
- Bilingual form fields
- Translated medical terms

### **📱 Responsive Design**
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interfaces

### **🏥 Medical Features**
- Palestinian ID validation
- Health condition tracking
- Medication management
- Lab and X-ray result handling
- Appointment booking system

### **💳 Payment Integration**
- Secure payment processing
- Appointment confirmation
- Receipt generation

### **📊 Data Management**
- Real-time data synchronization
- Patient health statistics
- Comprehensive reporting
- Data export capabilities

---

## User Flow Summary

1. **Entry**: All users start at authentication
2. **Role Detection**: System determines user type
3. **Redirect**: Users go to role-appropriate dashboard
4. **Task Execution**: Users perform role-specific tasks
5. **Navigation**: Role-based menu and feature access
6. **Data Management**: Secure, role-appropriate data access

This system provides a complete medical clinic management solution with proper role separation, security, and user experience optimization for all user types.

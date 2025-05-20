import React from 'react';

const UserRoleBadge: React.FC<{ role: string }> = ({ role }) => {
    const lowerRole = role.toLowerCase();

    // Determine badge styling based on role
    const getBadgeClass = () => {
        switch (lowerRole) {
            case 'admin':
                return "bg-red-100 text-red-800 border-red-200";
            case 'doctor':
                return "bg-blue-100 text-blue-800 border-blue-200";
            case 'secretary':
                return "bg-purple-100 text-purple-800 border-purple-200";
            case 'nurse':
                return "bg-teal-100 text-teal-800 border-teal-200";
            case 'lab':
                return "bg-amber-100 text-amber-800 border-amber-200";
            case 'x ray':
                return "bg-indigo-100 text-indigo-800 border-indigo-200";
            case 'patient':
                return "bg-emerald-100 text-emerald-800 border-emerald-200";
            default:
                return "bg-green-100 text-green-800 border-green-200";
        }
    };

    return (
        <span className={`inline-block px-2 py-1 text-xs rounded-full capitalize border ${getBadgeClass()}`}>
            {role}
        </span>
    );
};

export default UserRoleBadge;
// components/auth/UserRoleBadge.tsx
import { useAuth } from "@/hooks/useAuth";

const UserRoleBadge = () => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const getBadgeColor = () => {
    switch (user.role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "doctor":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "secretary":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "patient":
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };
  
  return (
    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getBadgeColor()}`}>
      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
    </div>
  );
};

export default UserRoleBadge;
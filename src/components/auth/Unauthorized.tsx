// components/auth/Unauthorized.tsx
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] p-4">
      <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
      <p className="text-lg text-gray-600 mb-6 text-center max-w-md">
        You don't have permission to access this page. Please contact an administrator if you believe this is an error.
      </p>
      <Button asChild>
        <Link to="/">Return to Home</Link>
      </Button>
    </div>
  );
};

export default Unauthorized;
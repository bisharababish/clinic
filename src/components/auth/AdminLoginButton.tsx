// components/auth/AdminLoginButton.tsx
import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "../../lib/supabase";

// Hard-coded admin credentials
const ADMIN_EMAIL = "admin@clinic.com";
const ADMIN_PASSWORD = "password123";

const AdminLoginButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check if admin is already logged in
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          const cachedUser = localStorage.getItem('clinic_user_profile');
          if (cachedUser) {
            const userObj = JSON.parse(cachedUser);
            if (userObj.role === "admin") {
              // Admin is already logged in
              console.log("Admin already logged in");
            }
          }
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

    checkAdminStatus();
  }, []);

  // Handle admin login
  const handleAdminLogin = async () => {
    if (email !== ADMIN_EMAIL) {
      toast({
        title: "Access Denied",
        description: "Invalid admin email",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLoading(true);

      // First try to authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: password
      });

      if (error) {
        if (password !== ADMIN_PASSWORD) {
          toast({
            title: "Access Denied",
            description: "Invalid admin password",
            variant: "destructive",
          });
          return false;
        }

        // If Supabase auth fails but password matches hardcoded value,
        // allow login anyway with manual session creation
        console.warn("Supabase auth error:", error);
        console.log("Using hardcoded admin authentication as fallback");
      }

      // Set admin auth in localStorage
      localStorage.setItem('clinic_user_profile', JSON.stringify({
        id: '1',
        email: ADMIN_EMAIL,
        name: 'System Admin',
        role: 'admin'
      }));

      // Set session flag to prevent redirect loops
      sessionStorage.setItem('admin_login_success', 'true');

      toast({
        title: "Admin Login Successful",
        description: "Welcome, Administrator!"
      });

      // Close dialog
      setIsOpen(false);

      // Redirect to admin dashboard
      window.location.href = "/admin";
      return true;

    } catch (err) {
      console.error("Error during admin login:", err);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAdminLogin();
  };

  // Quick access button function
  const handleQuickAccess = async () => {
    setPassword(ADMIN_PASSWORD);
    await handleAdminLogin();
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="text-xs px-2 py-1 h-8 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all"
      >
        Admin Access
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Login</DialogTitle>
            <DialogDescription>
              Secure access for clinic administrators only.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-3">Test login: password123</p>
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleQuickAccess}
                  disabled={isLoading}
                >
                  Quick Access
                </Button>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In as Admin"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminLoginButton;
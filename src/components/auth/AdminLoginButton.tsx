// components/auth/AdminLoginButton.tsx
import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "../../lib/supabase";

// Hard-coded testing credentials
const TEST_ADMIN_EMAIL = "admin@clinic.com";
const TEST_ADMIN_PASSWORD = "password123";

const AdminLoginButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState(TEST_ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Simple direct admin login for testing
  const handleDirectAdminLogin = async () => {
    // For testing, we'll just check against hardcoded credentials
    if (email === TEST_ADMIN_EMAIL && password === TEST_ADMIN_PASSWORD) {
      try {
        // First try to authenticate with Supabase for a real session token
        const { data, error } = await supabase.auth.signInWithPassword({
          email: TEST_ADMIN_EMAIL,
          password: TEST_ADMIN_PASSWORD
        });

        if (error) {
          console.warn("Supabase auth error:", error);
          console.log("Continuing with mock admin login anyway");
        }

        // Set admin auth in localStorage with correct format
        localStorage.setItem('clinic_user_profile', JSON.stringify({
          id: '1',
          email: TEST_ADMIN_EMAIL,
          name: 'System Admin',
          role: 'admin'
        }));

        // Also set a session flag to prevent redirect loops
        sessionStorage.setItem('admin_login_success', 'true');

        toast({
          title: "Admin Login Successful",
          description: "Welcome, Administrator!"
        });

        // Close dialog
        setIsOpen(false);

        // Force page reload to update authentication state
        setTimeout(() => {
          window.location.href = "/admin";
        }, 500);

        return true;
      } catch (err) {
        console.error("Error during admin login:", err);
        return false;
      }
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid admin credentials",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // For testing, use direct login
      await handleDirectAdminLogin();
    } catch (error) {
      console.error("Admin login error:", error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Quick access button function
  const handleQuickAccess = async () => {
    setIsLoading(true);

    try {
      // Try to auth with Supabase first (but continue even if it fails)
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: TEST_ADMIN_EMAIL,
          password: TEST_ADMIN_PASSWORD
        });

        if (error) {
          console.warn("Supabase auth error:", error);
          console.log("Continuing with mock admin login anyway");
        }
      } catch (e) {
        console.warn("Supabase auth attempt failed:", e);
      }

      // Set admin auth in localStorage with correct format
      localStorage.setItem('clinic_user_profile', JSON.stringify({
        id: '1',
        email: TEST_ADMIN_EMAIL,
        name: 'System Admin',
        role: 'admin'
      }));

      // Set a flag in sessionStorage to prevent redirect loops
      sessionStorage.setItem('admin_login_success', 'true');

      toast({
        title: "Admin Quick Access",
        description: "Welcome, Administrator!"
      });

      // Close dialog
      setIsOpen(false);

      // Force reload to update auth state
      setTimeout(() => {
        window.location.href = "/admin";
      }, 500);
    } catch (error) {
      console.error("Quick access error:", error);
      toast({
        title: "Quick Access Failed",
        description: "Unable to access admin account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
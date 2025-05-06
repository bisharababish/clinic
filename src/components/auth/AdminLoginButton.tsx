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

const AdminLoginButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("admin@clinic.com"); // Pre-filled admin email
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      // First, try direct login with Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Auth login error:", error);
        throw new Error("Invalid login credentials");
      }

      if (data && data.session) {
        // Check if user has admin role
        const { data: userData, error: userError } = await supabase
          .from('userinfo')
          .select('*')
          .ilike('user_email', email)
          .single();

        if (userError) {
          console.error("User data fetch error:", userError);
          throw new Error("Could not verify admin privileges");
        }

        // Check user role (case insensitive)
        const userRole = userData.user_roles.toLowerCase();
        if (userRole !== 'admin') {
          // User is not an admin, sign them out
          await supabase.auth.signOut();
          throw new Error("You don't have administrator privileges");
        }

        // Admin login successful
        // Store admin profile in localStorage
        const userObj = {
          id: userData.userid.toString(),
          email: userData.user_email,
          name: userData.english_username_a,
          role: 'admin'
        };
        localStorage.setItem('clinic_user_profile', JSON.stringify(userObj));

        toast({
          title: "Admin Login Successful",
          description: "Welcome, Administrator"
        });

        // Close dialog and reset form
        setIsOpen(false);
        setPassword("");

        // Redirect to admin dashboard
        setTimeout(() => {
          window.location.href = "/admin";
        }, 500);
      }
    } catch (error) {
      console.error("Admin login error:", error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid login credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAccess = async () => {
    setIsLoading(true);
    try {
      // Use the default admin credentials
      const defaultEmail = "admin@clinic.com";
      const defaultPassword = "password123";

      // Attempt login with default credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: defaultEmail,
        password: defaultPassword
      });

      if (error) {
        console.error("Quick access error:", error);
        throw new Error("Default admin account not found");
      }

      if (data && data.session) {
        // Get admin user data
        const { data: userData, error: userError } = await supabase
          .from('userinfo')
          .select('*')
          .ilike('user_email', defaultEmail)
          .single();

        if (userError) {
          console.error("User data fetch error:", userError);
          throw new Error("Could not verify admin account");
        }

        // Store admin profile in localStorage
        const userObj = {
          id: userData.userid.toString(),
          email: userData.user_email,
          name: userData.english_username_a,
          role: 'admin'
        };
        localStorage.setItem('clinic_user_profile', JSON.stringify(userObj));

        toast({
          title: "Admin Quick Access",
          description: "Welcome, Administrator"
        });

        // Close dialog
        setIsOpen(false);

        // Redirect to admin dashboard
        setTimeout(() => {
          window.location.href = "/admin";
        }, 500);
      }
    } catch (error) {
      console.error("Quick access error:", error);
      toast({
        title: "Quick Access Failed",
        description: error instanceof Error ? error.message : "Unable to access admin account",
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

            <div className="flex justify-between pt-2">
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
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminLoginButton;
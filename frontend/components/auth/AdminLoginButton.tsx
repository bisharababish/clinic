// components/auth/AdminLoginButton.tsx
import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Lock, Mail } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { supabase } from "../../lib/supabase";
import { useNavigate } from 'react-router-dom';

const AdminLoginButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
    if (!email || !password) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLoading(true);

      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: "Access Denied",
          description: "Invalid credentials",
          variant: "destructive",
        });
        return false;
      }

      if (!data.user) {
        toast({
          title: "Login Failed",
          description: "Authentication failed",
          variant: "destructive",
        });
        return false;
      }

      // Check if the user is an admin
      const { data: userData, error: userError } = await supabase
        .from('userinfo')
        .select('*')
        .ilike('user_email', email)
        .single();

      if (userError || !userData) {
        toast({
          title: "Access Denied",
          description: "User profile not found",
          variant: "destructive",
        });
        return false;
      }

      // Check if user has admin role
      const userRole = userData.user_roles.toLowerCase();
      if (userRole !== 'admin') {
        toast({
          title: "Access Denied",
          description: "You don't have administrator privileges",
          variant: "destructive",
        });

        // Sign out the user since they're not an admin
        await supabase.auth.signOut();
        return false;
      }

      // Set admin auth in localStorage
      localStorage.setItem('clinic_user_profile', JSON.stringify({
        id: userData.userid.toString(),
        email: userData.user_email,
        name: userData.english_username_a,
        role: 'admin'
      }));

      // Set session flag to prevent redirect loops
      sessionStorage.setItem('admin_login_success', 'true');

      toast({
        title: "Admin Login Successful",
        description: `Welcome, ${userData.english_username_a}!`,
        style: { backgroundColor: '#16a34a', color: '#fff' }, // Green bg, white text
      });

      // Close dialog
      setIsOpen(false);

      // Redirect to admin page after successful login using navigate
      navigate("/admin", { replace: true });
      return true;

    } catch (err) {
      console.error("Error during admin login:", err);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
        style: { backgroundColor: '#dc2626', color: '#fff' }, // Red bg, white text
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
                  placeholder="admin@example.com"
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
              <Button type="submit" className="w-full" disabled={isLoading}>
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

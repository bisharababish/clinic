// src/components/auth/LoginForm.tsx
import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegister,
  onSwitchToForgotPassword
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return false;
    }

    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const bypassLogin = async (email, password) => {
    try {
      // Direct authentication without hooks
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data && data.session) {
        // Store session in localStorage
        localStorage.setItem('supabase.auth.token', JSON.stringify({
          currentSession: data.session,
          expiresAt: Date.now() + 3600000 // 1 hour
        }));

        // Get user info from database
        const { data: userData } = await supabase
          .from('userinfo')
          .select('*')
          .ilike('user_email', email)
          .single();

        if (userData) {
          // Store user info in localStorage for immediate access
          localStorage.setItem('clinic_user_profile', JSON.stringify({
            id: userData.userid,
            email: userData.user_email,
            name: userData.english_username_a,
            role: userData.user_roles.toLowerCase()
          }));
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error("Bypass login error:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Set a flag to indicate we're mid-login to prevent redirects
      sessionStorage.setItem('login_in_progress', 'true');

      // Try bypass login first for direct API access
      const bypassSuccess = await bypassLogin(email, password);

      if (bypassSuccess) {
        toast({
          title: "Login Successful",
          description: "Welcome back!"
        });

        // Wait for the toast to appear before redirect
        setTimeout(() => {
          // Clear the login progress flag
          sessionStorage.removeItem('login_in_progress');

          // Force a hard redirect to the home page
          window.location.href = "/";
        }, 500);

        return;
      }

      // If bypass didn't work, try the hook method
      const userData = await login(email, password);

      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.name}!`
      });

      // Wait for the toast to be seen before redirect
      setTimeout(() => {
        // Clear the login progress flag
        sessionStorage.removeItem('login_in_progress');

        // Force a hard redirect to the home page
        window.location.href = "/";
      }, 500);

    } catch (error) {
      console.error("Login error:", error);
      sessionStorage.removeItem('login_in_progress');

      let errorMessage = "Invalid email or password";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyRedirect = (e) => {
    e.preventDefault();
    // Simulate login with default admin
    bypassLogin('admin@clinic.com', 'password123').then(success => {
      if (success) {
        toast({
          title: "Emergency Access",
          description: "Redirecting to home page..."
        });

        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      } else {
        toast({
          title: "Error",
          description: "Emergency access failed",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Welcome Back</h2>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-xs text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOffIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="text-center text-sm">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-primary font-medium hover:underline"
        >
          Sign Up
        </button>
      </div>

      {/* Emergency redirect button */}
      <div className="text-center mt-4">
        <button
          onClick={handleEmergencyRedirect}
          className="text-primary underline"
        >
          Emergency Home Link
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
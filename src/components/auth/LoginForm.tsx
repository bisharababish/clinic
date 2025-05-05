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
import { supabase } from "../../lib/supabase"; // Make sure this path matches your project structure

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
  const navigate = useNavigate();

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

  // EMERGENCY DIRECT LOGIN FUNCTION
  const emergencyLogin = async (email: string, password: string) => {
    try {
      // 1. First authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error("Auth error:", authError);
        throw new Error("Invalid email or password");
      }

      console.log("Auth successful");

      // 2. Set session manually
      const session = {
        user: {
          id: "user-" + Date.now(),
          email: email,
          name: email.split('@')[0], // Use part of email as name
          role: "patient"
        }
      };

      // 3. Store in localStorage for session persistence
      localStorage.setItem('user_session', JSON.stringify(session));

      // 4. Return success
      return session.user;
    } catch (error) {
      console.error("Emergency login failed:", error);
      throw error;
    }
  };

  // Force navigation to Index page
  const forceNavigateToIndex = () => {
    console.log("Attempting force navigation to Index");

    // Try multiple navigation methods
    try {
      navigate("/");
      console.log("React Router navigation attempted");
    } catch (navError) {
      console.error("Navigation error:", navError);
    }

    // Use setTimeout to ensure the navigation happens after current execution
    setTimeout(() => {
      console.log("Fallback navigation with window.location.href");
      window.location.href = "/";
    }, 500);
  };

  // Updated handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      console.log("Starting login process");

      // Try emergency login first
      try {
        console.log("Attempting emergency login");
        const user = await emergencyLogin(email, password);

        console.log("Emergency login successful");
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });

        // Redirect to home page
        forceNavigateToIndex();
        return;
      } catch (emergencyError) {
        console.log("Emergency login failed, trying normal login");

        // Fall back to normal login
        try {
          const userData = await login(email, password);

          toast({
            title: "Login Successful",
            description: `Welcome back, ${userData.name}!`,
          });

          // Redirect based on role
          switch (userData.role) {
            case 'admin':
              navigate("/admin");
              break;
            case 'doctor':
            case 'secretary':
              navigate("/labs");
              break;
            case 'patient':
            default:
              forceNavigateToIndex();
              break;
          }
        } catch (loginError) {
          // If both login methods fail, try direct auth and navigation
          console.log("Normal login failed, trying direct auth");

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (error) {
            throw error;
          }

          console.log("Auth successful, navigating directly");
          toast({
            title: "Login Successful",
            description: "Welcome back!",
          });

          // Always navigate to home
          forceNavigateToIndex();
        }
      }
    } catch (error) {
      let errorMessage = "Login failed";

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

      {/* Emergency Home Link */}
      <div className="text-center mt-4">
        <a href="/" className="text-primary font-medium hover:underline">
          Go to Home Page
        </a>
      </div>
    </div>
  );
};

export default LoginForm;
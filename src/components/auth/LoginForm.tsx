// src/components/auth/LoginForm.tsx - Fully fixed version
import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase"; // Import supabase

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      console.log("Login attempt with:", email);

      // 1. Check if the user exists in the database first
      const { data: dbUser, error: dbError } = await supabase
        .from('userinfo')
        .select('*')
        .ilike('user_email', email) // Case insensitive search
        .single();

      console.log("Database user check:", dbUser ? "Found" : "Not found", dbError);

      // 2. Try the login function
      try {
        const userData = await login(email, password);

        toast({
          title: "Login Successful",
          description: `Welcome back, ${userData.name}!`,
        });

        // Redirect based on role
        console.log("Redirecting user based on role:", userData.role);
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
            navigate("/");
            break;
        }
      } catch (loginError) {
        console.error("Login function error:", loginError);

        // If the login function fails but we know the user exists in the database
        if (dbUser) {
          console.log("User exists in database but login failed, trying to fix...");

          // Try to authenticate directly
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (authError) {
            console.error("Auth retry error:", authError);
            throw new Error("Invalid email or password");
          }

          // If auth succeeded but login failed, do direct navigation
          if (authData.user) {
            console.log("Auth successful, navigating directly");
            toast({
              title: "Login Successful",
              description: `Welcome back, ${dbUser.english_username_a}!`,
            });

            // Navigate based on role
            switch (dbUser.user_roles.toLowerCase()) {
              case 'admin':
                navigate("/admin");
                break;
              case 'doctor':
              case 'secretary':
                navigate("/labs");
                break;
              case 'patient':
              default:
                navigate("/");
                break;
            }
            return;
          }
        }

        // If we can't recover, throw the original error
        throw loginError;
      }
    } catch (error) {
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
    </div>
  );
};

export default LoginForm;
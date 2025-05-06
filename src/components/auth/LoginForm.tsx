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

  // Create a direct login bypass function
  const bypassLogin = async (email: string, password: string) => {
    try {
      // 1. Auth with Supabase directly
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        throw new Error('Authentication failed');
      }

      // 2. Check if profile exists
      const { data: userData, error: userError } = await supabase
        .from('userinfo')
        .select('*')
        .ilike('user_email', email)
        .single();

      // 3. If user profile doesn't exist, create one
      if (!userData || userError) {
        console.log("Creating user profile automatically");
        const currentTime = new Date().toISOString();

        // Create basic user profile
        const { error: insertError } = await supabase
          .from('userinfo')
          .insert({
            user_roles: 'Patient',
            arabic_username_a: email,
            arabic_username_b: email,
            arabic_username_c: email,
            arabic_username_d: email,
            english_username_a: email,
            english_username_b: email,
            english_username_c: email,
            english_username_d: email,
            user_email: email,
            user_phonenumber: '0000000000',
            date_of_birth: currentTime,
            gender_user: 'unknown',
            user_password: password,
            created_at: currentTime,
            updated_at: currentTime,
            pdated_at: currentTime
          });

        if (insertError) {
          console.error("Error creating profile:", insertError);
          throw new Error('Failed to create user profile');
        }
      }

      // 4. Set session token manually (force auth state)
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        currentSession: authData.session,
        expiresAt: (Date.now() + 3600 * 1000)
      }));

      return true;
    } catch (error) {
      console.error("Bypass login error:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // First try to authenticate with Supabase directly
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // If authentication is successful
      if (authData && authData.session) {
        // Get user profile info
        const { data: userData, error: userError } = await supabase
          .from('userinfo')
          .select('*')
          .ilike('user_email', email)
          .single();

        // Create profile if doesn't exist
        if (userError || !userData) {
          const currentTime = new Date().toISOString();
          await supabase.from('userinfo').insert({
            user_roles: 'Patient',
            arabic_username_a: email,
            arabic_username_b: email,
            arabic_username_c: email,
            arabic_username_d: email,
            english_username_a: email,
            english_username_b: email,
            english_username_c: email,
            english_username_d: email,
            user_email: email,
            user_phonenumber: '0000000000',
            date_of_birth: currentTime,
            gender_user: 'unknown',
            user_password: password,
            created_at: currentTime,
            updated_at: currentTime,
            pdated_at: currentTime
          });
        }

        // Show success message
        toast({
          title: "Login Successful",
          description: "Welcome back!"
        });

        // IMPORTANT: Fixed navigation - Use multiple approaches to ensure redirect works
        // 1. Set a flag in localStorage to indicate successful login
        localStorage.setItem('loginSuccess', 'true');

        // 2. Use direct window location first for maximum compatibility
        window.location.href = "/";

        // 3. Fallback to React Router navigate (may not execute due to page reload)
        setTimeout(() => {
          navigate("/");
        }, 100);
      }
    } catch (error) {
      console.error("Login error:", error);

      // Try the login function from useAuth as fallback
      try {
        await login(email, password);

        toast({
          title: "Login Successful",
          description: "Welcome back!"
        });

        // Same navigation approach for the fallback
        localStorage.setItem('loginSuccess', 'true');
        window.location.href = "/";
      } catch (loginError) {
        let errorMessage = "Invalid email or password";
        if (loginError instanceof Error) {
          errorMessage = loginError.message;
        }

        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
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

      {/* Emergency redirect button */}
      <div className="text-center mt-4">
        <a href="/" className="text-primary underline">
          Emergency Home Link
        </a>
      </div>
    </div>
  );
};

export default LoginForm;
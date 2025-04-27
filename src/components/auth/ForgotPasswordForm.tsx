
import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    // Simulate password reset
    toast({
      title: "Reset Link Sent",
      description: "If your email exists in our system, you'll receive a password reset link",
    });
    
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="w-full space-y-6 animate-fade-in">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Check Your Email</h2>
          <p className="text-sm text-muted-foreground">
            We've sent a password reset link to <span className="font-medium">{email}</span>
          </p>
        </div>
        
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Didn't receive an email? Check your spam folder or try again.
          </p>
          <Button variant="outline" onClick={() => setIsSubmitted(false)}>
            Try Again
          </Button>
          <div className="pt-2">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary font-medium hover:underline text-sm"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Forgot Password</h2>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password
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

        <Button type="submit" className="w-full">
          Send Reset Link
        </Button>
      </form>

      <div className="text-center text-sm">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-primary font-medium hover:underline"
        >
          Back to Sign In
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;

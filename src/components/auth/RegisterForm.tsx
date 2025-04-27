
import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { EyeIcon, EyeOffIcon, Mail, Lock, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  // Name fields
  const [firstNameEn, setFirstNameEn] = useState("");
  const [secondNameEn, setSecondNameEn] = useState("");
  const [thirdNameEn, setThirdNameEn] = useState("");
  const [lastNameEn, setLastNameEn] = useState("");

  const [firstNameAr, setFirstNameAr] = useState("");
  const [secondNameAr, setSecondNameAr] = useState("");
  const [thirdNameAr, setThirdNameAr] = useState("");
  const [lastNameAr, setLastNameAr] = useState("");

  // Other fields
  const [idNumber, setIdNumber] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");

  // Password fields
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordStatus, setPasswordStatus] = useState("");

  const { toast } = useToast();

  // Password strength checker
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordStatus("");
      return;
    }

    let strength = 0;

    // Length check
    if (password.length >= 8) strength += 25;

    // Complexity checks
    if (/[A-Z]/.test(password)) strength += 25; // Uppercase
    if (/[0-9]/.test(password)) strength += 25; // Number
    if (/[^A-Za-z0-9]/.test(password)) strength += 25; // Special char

    setPasswordStrength(strength);

    if (strength <= 25) {
      setPasswordStatus("Weak");
    } else if (strength <= 75) {
      setPasswordStatus("Medium");
    } else {
      setPasswordStatus("Strong");
    }
  }, [password]);

  const getPasswordStatusColor = () => {
    if (passwordStatus === "Weak") return "text-red-500";
    if (passwordStatus === "Medium") return "text-yellow-500";
    if (passwordStatus === "Strong") return "text-green-500";
    return "";
  };

  const getProgressColor = () => {
    if (passwordStrength <= 25) return "bg-red-500";
    if (passwordStrength <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordStrength < 50) {
      toast({
        title: "Weak Password",
        description: "Please choose a stronger password",
        variant: "destructive",
      });
      return;
    }

    // Simulate registration success
    toast({
      title: "Account Created",
      description: "This would connect to your backend in a real implementation",
    });

    // Reset form and switch to login
    setTimeout(() => {
      onSwitchToLogin();
    }, 2000);
  };

  return (
    <div className="w-full space-y-4 animate-fade-in">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Create an Account</h2>
        <p className="text-sm text-muted-foreground">
          Fill in your details to register for an account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* English Names */}
        <div className="space-y-2">
          <Label>Full Name (English)</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                placeholder="First Name"
                value={firstNameEn}
                onChange={(e) => setFirstNameEn(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                placeholder="Second Name"
                value={secondNameEn}
                onChange={(e) => setSecondNameEn(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                placeholder="Third Name"
                value={thirdNameEn}
                onChange={(e) => setThirdNameEn(e.target.value)}
              />
            </div>
            <div>
              <Input
                placeholder="Last Name"
                value={lastNameEn}
                onChange={(e) => setLastNameEn(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Arabic Names */}
        <div className="space-y-2">
          <Label>Full Name (Arabic)</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                placeholder="الاسم الأول"
                value={firstNameAr}
                onChange={(e) => setFirstNameAr(e.target.value)}
                dir="rtl"
                required
              />
            </div>
            <div>
              <Input
                placeholder="الاسم الثاني"
                value={secondNameAr}
                onChange={(e) => setSecondNameAr(e.target.value)}
                dir="rtl"
                required
              />
            </div>
            <div>
              <Input
                placeholder="الاسم الثالث"
                value={thirdNameAr}
                onChange={(e) => setThirdNameAr(e.target.value)}
                dir="rtl"
              />
            </div>
            <div>
              <Input
                placeholder="اسم العائلة"
                value={lastNameAr}
                onChange={(e) => setLastNameAr(e.target.value)}
                dir="rtl"
                required
              />
            </div>
          </div>
        </div>

        {/* ID Number */}
        <div className="space-y-2">
          <Label htmlFor="idNumber">ID Number</Label>
          <Input
            id="idNumber"
            type="text"
            placeholder="Enter your ID number"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            required
          />
        </div>

        {/* Email */}
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

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select onValueChange={setGender} value={gender} required>
            <SelectTrigger>
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
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
          {password && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <div className={`w-full overflow-hidden rounded-full`}>
                  <Progress
                    value={passwordStrength}
                    className={`h-1 ${getProgressColor()}`}
                  />
                </div>
                <span className={`text-xs ml-2 ${getPasswordStatusColor()}`}>
                  {passwordStatus}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Use 8+ characters with a mix of letters, numbers & symbols
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? (
                <EyeOffIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-red-500">Passwords do not match</p>
          )}
        </div>

        <Button type="submit" className="w-full">
          <UserPlus className="mr-2 h-4 w-4" />
          Create Account
        </Button>
      </form>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-primary font-medium hover:underline"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};
export default RegisterForm;
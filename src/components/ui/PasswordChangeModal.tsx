// components/ui/PasswordChangeModal.tsx
import { useState, useContext } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Alert, AlertDescription } from './alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from './dialog';
import {
    Lock,
    Eye,
    EyeOff,
    CheckCircle,
    AlertCircle,
    Loader2,
    Key,
    Shield
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../contexts/LanguageContext';

interface PasswordChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    userEmail: string;
    userName?: string;
}

export function PasswordChangeModal({
    isOpen,
    onClose,
    userEmail,
    userName
}: PasswordChangeModalProps) {
    const { t } = useTranslation();
    const { isRTL } = useContext(LanguageContext);
    const { toast } = useToast();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isChanging, setIsChanging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Password strength checker
    const checkPasswordStrength = (password: string) => {
        const minLength = password.length >= 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const score = [minLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

        return {
            score,
            minLength,
            hasUpper,
            hasLower,
            hasNumber,
            hasSpecial,
            isStrong: score >= 4
        };
    };

    const passwordStrength = checkPasswordStrength(newPassword);

    const validatePasswords = (): boolean => {
        setError(null);

        if (!currentPassword.trim()) {
            setError(isRTL ? 'يرجى إدخال كلمة المرور الحالية' : 'Please enter your current password');
            return false;
        }

        if (!newPassword.trim()) {
            setError(isRTL ? 'يرجى إدخال كلمة المرور الجديدة' : 'Please enter a new password');
            return false;
        }

        if (newPassword.length < 8) {
            setError(isRTL ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters long');
            return false;
        }

        if (!passwordStrength.isStrong) {
            setError(isRTL ? 'كلمة المرور ضعيفة. يرجى اختيار كلمة مرور أقوى' : 'Password is too weak. Please choose a stronger password');
            return false;
        }

        if (newPassword !== confirmPassword) {
            setError(isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
            return false;
        }

        if (currentPassword === newPassword) {
            setError(isRTL ? 'كلمة المرور الجديدة يجب أن تختلف عن الحالية' : 'New password must be different from current password');
            return false;
        }

        return true;
    };

    const handlePasswordChange = async () => {
        if (!validatePasswords()) return;

        setIsChanging(true);
        setError(null);

        try {
            console.log('🔐 Starting password change process...');

            // First, verify current password by attempting to sign in
            const { error: verifyError } = await supabase.auth.signInWithPassword({
                email: userEmail,
                password: currentPassword
            });

            if (verifyError) {
                console.error('❌ Current password verification failed:', verifyError);
                setError(isRTL ? 'كلمة المرور الحالية غير صحيحة' : 'Current password is incorrect');
                return;
            }

            console.log('✅ Current password verified successfully');

            // Update password
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (updateError) {
                console.error('❌ Password update failed:', updateError);
                setError(updateError.message || (isRTL ? 'فشل في تغيير كلمة المرور' : 'Failed to change password'));
                return;
            }

            console.log('✅ Password updated successfully');

            // Update password in userinfo table as well (for backup/reference)
            try {
                const { error: dbUpdateError } = await supabase
                    .from('userinfo')
                    .update({
                        user_password: newPassword,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_email', userEmail);

                if (dbUpdateError) {
                    console.warn('⚠️ Failed to update password in userinfo table:', dbUpdateError);
                    // Don't fail the entire operation for this
                } else {
                    console.log('✅ Password also updated in userinfo table');
                }
            } catch (dbError) {
                console.warn('⚠️ Database update error (non-critical):', dbError);
            }

            // Show success message
            toast({
                title: isRTL ? 'تم تغيير كلمة المرور بنجاح' : 'Password Changed Successfully',
                description: isRTL ?
                    'تم تحديث كلمة المرور الخاصة بك بنجاح' :
                    'Your password has been updated successfully',
            });

            // Reset form and close modal
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            onClose();

        } catch (error) {
            console.error('❌ Unexpected error during password change:', error);
            setError(
                error instanceof Error
                    ? error.message
                    : (isRTL ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred')
            );
        } finally {
            setIsChanging(false);
        }
    };

    const handleSkip = () => {
        // Reset form and close modal
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError(null);
        onClose();
    };

    const getPasswordStrengthColor = (score: number) => {
        if (score < 2) return 'bg-red-500';
        if (score < 4) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getPasswordStrengthText = (score: number) => {
        if (score < 2) return isRTL ? 'ضعيفة' : 'Weak';
        if (score < 4) return isRTL ? 'متوسطة' : 'Medium';
        return isRTL ? 'قوية' : 'Strong';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="max-w-md mx-auto bg-white rounded-lg shadow-xl"
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                <DialogHeader className="text-center pb-4">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Shield className="h-8 w-8 text-blue-600" />
                    </div>
                    <DialogTitle className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
                        <Key className="h-5 w-5" />
                        {isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 mt-2">
                        {isRTL ?
                            `مرحباً ${userName || 'بك'}! يمكنك تغيير كلمة المرور الخاصة بك لحماية حسابك بشكل أفضل.` :
                            `Hello ${userName || 'there'}! You can change your password to better secure your account.`
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Current Password */}
                    <div className="space-y-2">
                        <Label htmlFor="current-password" className="text-sm font-medium text-gray-700">
                            {isRTL ? 'كلمة المرور الحالية' : 'Current Password'}
                        </Label>
                        <div className="relative">
                            <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-gray-400`} />
                            <Input
                                id="current-password"
                                type={showCurrentPassword ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className={`${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'}`}
                                placeholder={isRTL ? 'أدخل كلمة المرور الحالية' : 'Enter current password'}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-0 h-full px-3 hover:bg-transparent`}
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                                {showCurrentPassword ?
                                    <EyeOff className="h-4 w-4 text-gray-400" /> :
                                    <Eye className="h-4 w-4 text-gray-400" />
                                }
                            </Button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                        <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">
                            {isRTL ? 'كلمة المرور الجديدة' : 'New Password'}
                        </Label>
                        <div className="relative">
                            <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-gray-400`} />
                            <Input
                                id="new-password"
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className={`${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'}`}
                                placeholder={isRTL ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-0 h-full px-3 hover:bg-transparent`}
                                onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                                {showNewPassword ?
                                    <EyeOff className="h-4 w-4 text-gray-400" /> :
                                    <Eye className="h-4 w-4 text-gray-400" />
                                }
                            </Button>
                        </div>

                        {/* Password Strength Indicator */}
                        {newPassword && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">
                                        {isRTL ? 'قوة كلمة المرور:' : 'Password strength:'}
                                    </span>
                                    <span className={`text-xs font-medium ${passwordStrength.score < 2 ? 'text-red-600' :
                                            passwordStrength.score < 4 ? 'text-yellow-600' :
                                                'text-green-600'
                                        }`}>
                                        {getPasswordStrengthText(passwordStrength.score)}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-1 text-xs">
                                    <div className={`flex items-center gap-1 ${passwordStrength.minLength ? 'text-green-600' : 'text-gray-400'}`}>
                                        {passwordStrength.minLength ? <CheckCircle className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border border-gray-300" />}
                                        <span>{isRTL ? '8+ أحرف' : '8+ chars'}</span>
                                    </div>
                                    <div className={`flex items-center gap-1 ${passwordStrength.hasUpper ? 'text-green-600' : 'text-gray-400'}`}>
                                        {passwordStrength.hasUpper ? <CheckCircle className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border border-gray-300" />}
                                        <span>{isRTL ? 'أحرف كبيرة' : 'Uppercase'}</span>
                                    </div>
                                    <div className={`flex items-center gap-1 ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                                        {passwordStrength.hasNumber ? <CheckCircle className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border border-gray-300" />}
                                        <span>{isRTL ? 'أرقام' : 'Numbers'}</span>
                                    </div>
                                    <div className={`flex items-center gap-1 ${passwordStrength.hasSpecial ? 'text-green-600' : 'text-gray-400'}`}>
                                        {passwordStrength.hasSpecial ? <CheckCircle className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border border-gray-300" />}
                                        <span>{isRTL ? 'رموز خاصة' : 'Special'}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                            {isRTL ? 'تأكيد كلمة المرور' : 'Confirm New Password'}
                        </Label>
                        <div className="relative">
                            <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-gray-400`} />
                            <Input
                                id="confirm-password"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'}`}
                                placeholder={isRTL ? 'أعد إدخال كلمة المرور الجديدة' : 'Re-enter new password'}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-0 h-full px-3 hover:bg-transparent`}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ?
                                    <EyeOff className="h-4 w-4 text-gray-400" /> :
                                    <Eye className="h-4 w-4 text-gray-400" />
                                }
                            </Button>
                        </div>
                        {confirmPassword && newPassword !== confirmPassword && (
                            <div className="flex items-center gap-1 text-red-600 text-xs">
                                <AlertCircle className="h-3 w-3" />
                                <span>{isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match'}</span>
                            </div>
                        )}
                    </div>

                    {/* Error Display */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            onClick={handlePasswordChange}
                            disabled={isChanging || !passwordStrength.isStrong || newPassword !== confirmPassword}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isChanging ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    {isRTL ? 'جاري التغيير...' : 'Changing...'}
                                </>
                            ) : (
                                <>
                                    <Shield className="h-4 w-4 mr-2" />
                                    {isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={handleSkip}
                            disabled={isChanging}
                            variant="outline"
                            className="flex-1"
                        >
                            {isRTL ? 'تخطي الآن' : 'Skip for Now'}
                        </Button>
                    </div>

                    {/* Security Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                        <p className="text-xs text-blue-700">
                            {isRTL ?
                                '💡 نصيحة: استخدم كلمة مرور قوية تحتوي على أحرف كبيرة وصغيرة وأرقام ورموز خاصة' :
                                '💡 Tip: Use a strong password with uppercase, lowercase, numbers, and special characters'
                            }
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
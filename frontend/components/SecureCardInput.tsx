// components/SecureCardInput.tsx - Secure card input component for CyberSource integration
import React, { useState, useRef, useEffect } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface SecureCardInputProps {
    onCardDataChange: (cardData: CardData | null) => void;
    isRTL?: boolean;
    disabled?: boolean;
}

export interface CardData {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    cardholderName: string;
}

const SecureCardInput: React.FC<SecureCardInputProps> = ({ 
    onCardDataChange, 
    isRTL = false,
    disabled = false 
}) => {
    const [cardNumber, setCardNumber] = useState('');
    const [expiryMonth, setExpiryMonth] = useState('');
    const [expiryYear, setExpiryYear] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardholderName, setCardholderName] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const cardNumberRef = useRef<HTMLInputElement>(null);
    const expiryMonthRef = useRef<HTMLInputElement>(null);
    const expiryYearRef = useRef<HTMLInputElement>(null);
    const cvvRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);

    // Validate and format card number
    const formatCardNumber = (value: string): string => {
        // Remove all non-digits
        const digits = value.replace(/\D/g, '');
        
        // Limit to 16 digits
        const limited = digits.slice(0, 16);
        
        // Add spaces every 4 digits
        return limited.replace(/(.{4})/g, '$1 ').trim();
    };

    // Validate card number (Luhn algorithm)
    const validateCardNumber = (number: string): boolean => {
        const digits = number.replace(/\D/g, '');
        if (digits.length < 13 || digits.length > 19) return false;
        
        let sum = 0;
        let isEven = false;
        
        for (let i = digits.length - 1; i >= 0; i--) {
            let digit = parseInt(digits[i]);
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0;
    };

    // Validate expiry date
    const validateExpiry = (month: string, year: string): boolean => {
        if (!month || !year) return false;
        
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        
        const expYear = parseInt('20' + year);
        const expMonth = parseInt(month);
        
        if (expYear < currentYear) return false;
        if (expYear === currentYear && expMonth < currentMonth) return false;
        if (expMonth < 1 || expMonth > 12) return false;
        
        return true;
    };

    // Validate CVV
    const validateCVV = (cvv: string): boolean => {
        const digits = cvv.replace(/\D/g, '');
        return digits.length >= 3 && digits.length <= 4;
    };

    // Update card data and validate
    useEffect(() => {
        const newErrors: Record<string, string> = {};
        
        // Validate card number
        if (cardNumber.replace(/\D/g, '').length > 0) {
            const digits = cardNumber.replace(/\D/g, '');
            if (digits.length < 13) {
                newErrors.cardNumber = isRTL ? 'رقم البطاقة قصير جداً' : 'Card number is too short';
            } else if (!validateCardNumber(cardNumber)) {
                newErrors.cardNumber = isRTL ? 'رقم البطاقة غير صحيح' : 'Invalid card number';
            }
        }
        
        // Validate expiry
        if (expiryMonth && expiryYear) {
            if (!validateExpiry(expiryMonth, expiryYear)) {
                newErrors.expiry = isRTL ? 'تاريخ انتهاء الصلاحية غير صحيح' : 'Invalid expiry date';
            }
        }
        
        // Validate CVV
        if (cvv.length > 0 && !validateCVV(cvv)) {
            newErrors.cvv = isRTL ? 'رمز CVV غير صحيح' : 'Invalid CVV';
        }
        
        // Validate cardholder name
        if (cardholderName.length > 0 && cardholderName.length < 3) {
            newErrors.cardholderName = isRTL ? 'اسم حامل البطاقة قصير جداً' : 'Cardholder name is too short';
        }
        
        setErrors(newErrors);
        
        // Check if all fields are valid
        const digits = cardNumber.replace(/\D/g, '');
        const isCardValid = digits.length >= 13 && validateCardNumber(cardNumber);
        const isExpiryValid = expiryMonth && expiryYear && validateExpiry(expiryMonth, expiryYear);
        const isCvvValid = cvv.length >= 3 && validateCVV(cvv);
        const isNameValid = cardholderName.length >= 3;
        
        if (isCardValid && isExpiryValid && isCvvValid && isNameValid && Object.keys(newErrors).length === 0) {
            onCardDataChange({
                cardNumber: digits, // Send only digits, no spaces
                expiryMonth: expiryMonth.padStart(2, '0'),
                expiryYear: expiryYear,
                cvv: cvv,
                cardholderName: cardholderName.trim()
            });
        } else {
            onCardDataChange(null);
        }
    }, [cardNumber, expiryMonth, expiryYear, cvv, cardholderName, isRTL, onCardDataChange]);

    // Detect card type (for visual feedback)
    const getCardType = (): string => {
        const digits = cardNumber.replace(/\D/g, '');
        if (digits.startsWith('4')) return 'Visa';
        if (digits.startsWith('5')) return 'Mastercard';
        if (digits.startsWith('3')) return 'American Express';
        return '';
    };

    return (
        <div className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Lock className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-blue-700">
                    {isRTL 
                        ? 'معلومات بطاقتك مشفرة وآمنة. لن يتم حفظ بيانات البطاقة.'
                        : 'Your card information is encrypted and secure. Card details are never stored.'
                    }
                </p>
            </div>

            {/* Card Number */}
            <div>
                <Label htmlFor="cardNumber" className="mb-2">
                    {isRTL ? 'رقم البطاقة' : 'Card Number'} <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                    <CreditCard className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400`} />
                    <Input
                        ref={cardNumberRef}
                        id="cardNumber"
                        type="text"
                        inputMode="numeric"
                        placeholder={isRTL ? '1234 5678 9012 3456' : '1234 5678 9012 3456'}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        maxLength={19} // 16 digits + 3 spaces
                        className={`${isRTL ? 'text-right pr-10' : 'text-left pl-10'} ${errors.cardNumber ? 'border-red-500' : ''}`}
                        disabled={disabled}
                        autoComplete="cc-number"
                    />
                </div>
                {cardNumber.replace(/\D/g, '').length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                        {getCardType() || (isRTL ? 'اكتب رقم البطاقة' : 'Enter card number')}
                    </p>
                )}
                {errors.cardNumber && (
                    <p className="text-xs text-red-500 mt-1">{errors.cardNumber}</p>
                )}
            </div>

            {/* Expiry Date and CVV */}
            <div className="grid grid-cols-2 gap-4">
                {/* Expiry Date */}
                <div>
                    <Label htmlFor="expiry" className="mb-2">
                        {isRTL ? 'تاريخ انتهاء الصلاحية' : 'Expiry Date'} <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                        <Input
                            ref={expiryMonthRef}
                            id="expiryMonth"
                            type="text"
                            inputMode="numeric"
                            placeholder={isRTL ? 'MM' : 'MM'}
                            value={expiryMonth}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                                if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
                                    setExpiryMonth(value);
                                    if (value.length === 2) expiryYearRef.current?.focus();
                                }
                            }}
                            maxLength={2}
                            className={errors.expiry ? 'border-red-500' : ''}
                            disabled={disabled}
                            autoComplete="cc-exp-month"
                        />
                        <Input
                            ref={expiryYearRef}
                            id="expiryYear"
                            type="text"
                            inputMode="numeric"
                            placeholder={isRTL ? 'YY' : 'YY'}
                            value={expiryYear}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                                setExpiryYear(value);
                                if (value.length === 2) cvvRef.current?.focus();
                            }}
                            maxLength={2}
                            className={errors.expiry ? 'border-red-500' : ''}
                            disabled={disabled}
                            autoComplete="cc-exp-year"
                        />
                    </div>
                    {errors.expiry && (
                        <p className="text-xs text-red-500 mt-1">{errors.expiry}</p>
                    )}
                </div>

                {/* CVV */}
                <div>
                    <Label htmlFor="cvv" className="mb-2">
                        {isRTL ? 'رمز CVV' : 'CVV'} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        ref={cvvRef}
                        id="cvv"
                        type="text"
                        inputMode="numeric"
                        placeholder={isRTL ? '123' : '123'}
                        value={cvv}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                            setCvv(value);
                        }}
                        maxLength={4}
                        className={errors.cvv ? 'border-red-500' : ''}
                        disabled={disabled}
                        autoComplete="cc-csc"
                    />
                    {errors.cvv && (
                        <p className="text-xs text-red-500 mt-1">{errors.cvv}</p>
                    )}
                </div>
            </div>

            {/* Cardholder Name */}
            <div>
                <Label htmlFor="cardholderName" className="mb-2">
                    {isRTL ? 'اسم حامل البطاقة' : 'Cardholder Name'} <span className="text-red-500">*</span>
                </Label>
                <Input
                    ref={nameRef}
                    id="cardholderName"
                    type="text"
                    placeholder={isRTL ? 'اسم حامل البطاقة كما هو مكتوب على البطاقة' : 'Name as it appears on card'}
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                    className={errors.cardholderName ? 'border-red-500' : ''}
                    disabled={disabled}
                    autoComplete="cc-name"
                />
                {errors.cardholderName && (
                    <p className="text-xs text-red-500 mt-1">{errors.cardholderName}</p>
                )}
            </div>

            {/* Security Notice */}
            <Alert className="bg-gray-50 border-gray-200">
                <AlertCircle className="h-4 w-4 text-gray-600" />
                <AlertDescription className="text-xs text-gray-600">
                    {isRTL 
                        ? 'جميع المعاملات محمية بتشفير SSL. لن يتم حفظ أو تخزين بيانات بطاقتك الائتمانية.'
                        : 'All transactions are protected by SSL encryption. Your card details will not be saved or stored.'
                    }
                </AlertDescription>
            </Alert>
        </div>
    );
};

export default SecureCardInput;


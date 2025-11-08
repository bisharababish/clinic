import crypto from 'crypto';

export interface HostedCheckoutOptions {
    amount: number | string;
    currency?: string;
    referenceNumber: string;
    locale?: string;
    transactionType?: string;
    successUrl?: string;
    cancelUrl?: string;
}

export interface HostedCheckoutPayload {
    endpoint: string;
    fields: Record<string, string>;
    transactionUuid: string;
    signedFieldNames: string[];
    unsignedFieldNames: string[];
    signedDateTime: string;
}

const DEFAULT_SIGNED_FIELDS = (process.env.CYBERSOURCE_SIGNED_FIELD_NAMES ||
    'access_key,profile_id,merchant_id,transaction_uuid,signed_field_names,unsigned_field_names,signed_date_time,locale,transaction_type,reference_number,amount,currency'
).split(',').map(field => field.trim()).filter(Boolean);

const DEFAULT_UNSIGNED_FIELDS = (process.env.CYBERSOURCE_UNSIGNED_FIELD_NAMES ||
    'decision,message,reason_code,transaction_id,auth_code'
).split(',').map(field => field.trim()).filter(Boolean);

const TEST_ENDPOINT = 'https://testsecureacceptance.cybersource.com/pay';
const PRODUCTION_ENDPOINT = 'https://secureacceptance.cybersource.com/pay';

const toTwoDecimals = (value: number | string): string => {
    const numeric = typeof value === 'number' ? value : parseFloat(value);
    if (Number.isNaN(numeric)) {
        throw new Error('Invalid amount supplied to hosted checkout payload generator');
    }
    return numeric.toFixed(2);
};

const sanitizeLocale = (locale?: string): string => {
    if (!locale) return 'en-us';
    return locale.toLowerCase();
};

const sanitizeTransactionType = (transactionType?: string): string => {
    if (!transactionType) return 'sale';
    return transactionType;
};

const getSecretKeyBuffer = (): Buffer => {
    const secretKey = process.env.CYBERSOURCE_SECRET_KEY;
    if (!secretKey) {
        throw new Error('CyberSource secret key is not configured');
    }

    const encoding = (process.env.CYBERSOURCE_SECRET_ENCODING || 'hex').toLowerCase();

    if (encoding === 'hex') {
        const hexRegex = /^[0-9a-f]+$/i;
        if (!hexRegex.test(secretKey)) {
            console.warn('⚠️ CYBERSOURCE_SECRET_ENCODING=hex but key is not hex – falling back to utf8');
            return Buffer.from(secretKey, 'utf8');
        }
        return Buffer.from(secretKey, 'hex');
    }

    return Buffer.from(secretKey, 'utf8');
};

const getHostedCheckoutUrl = (): string => {
    return process.env.CYBERSOURCE_ENVIRONMENT === 'production'
        ? PRODUCTION_ENDPOINT
        : TEST_ENDPOINT;
};

const buildDataToSign = (fields: Record<string, string>, signedFieldNames: string[]): string => {
    return signedFieldNames.map(field => `${field}=${fields[field] ?? ''}`).join(',');
};

export const normalizeHostedCheckoutFields = (fields: Record<string, unknown>): Record<string, string> => {
    return Object.entries(fields).reduce<Record<string, string>>((acc, [key, value]) => {
        acc[key] = value === undefined || value === null ? '' : String(value);
        return acc;
    }, {});
};

const generateSignature = (fields: Record<string, string>, signedFieldNames: string[]): string => {
    const dataToSign = buildDataToSign(fields, signedFieldNames);
    const secretBuffer = getSecretKeyBuffer();
    return crypto.createHmac('sha256', secretBuffer).update(dataToSign).digest('base64');
};

const buildTransactionUuid = (): string => {
    if (typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return crypto.randomBytes(16).toString('hex');
};

const isoDateWithoutMilliseconds = (): string => {
    return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
};

const validateConfiguration = (): void => {
    const missing: string[] = [];
    if (!process.env.CYBERSOURCE_MERCHANT_ID) missing.push('CYBERSOURCE_MERCHANT_ID');
    if (!process.env.CYBERSOURCE_PROFILE_ID) missing.push('CYBERSOURCE_PROFILE_ID');
    if (!process.env.CYBERSOURCE_ACCESS_KEY) missing.push('CYBERSOURCE_ACCESS_KEY');
    if (!process.env.CYBERSOURCE_SECRET_KEY) missing.push('CYBERSOURCE_SECRET_KEY');

    if (missing.length > 0) {
        throw new Error(`Missing CyberSource configuration values: ${missing.join(', ')}`);
    }
};

export const buildHostedCheckoutPayload = (options: HostedCheckoutOptions): HostedCheckoutPayload => {
    validateConfiguration();

    const {
        amount,
        currency = 'ILS',
        referenceNumber,
        locale,
        transactionType,
        successUrl,
        cancelUrl,
    } = options;

    if (!amount) {
        throw new Error('Amount is required to create a hosted checkout payload');
    }

    if (!referenceNumber) {
        throw new Error('Reference number is required to create a hosted checkout payload');
    }

    const signedFieldNames = DEFAULT_SIGNED_FIELDS;
    const unsignedFieldNames = DEFAULT_UNSIGNED_FIELDS;

    const transactionUuid = buildTransactionUuid();
    const formattedAmount = toTwoDecimals(amount);
    const signedDateTime = isoDateWithoutMilliseconds();

    const baseFields: Record<string, string> = {
        access_key: process.env.CYBERSOURCE_ACCESS_KEY as string,
        profile_id: process.env.CYBERSOURCE_PROFILE_ID as string,
        merchant_id: process.env.CYBERSOURCE_MERCHANT_ID as string,
        transaction_uuid: transactionUuid,
        signed_field_names: signedFieldNames.join(','),
        unsigned_field_names: unsignedFieldNames.join(','),
        signed_date_time: signedDateTime,
        locale: sanitizeLocale(locale),
        transaction_type: sanitizeTransactionType(transactionType),
        reference_number: referenceNumber,
        amount: formattedAmount,
        currency,
    };

    const signature = generateSignature(baseFields, signedFieldNames);

    const payload: Record<string, string> = {
        ...baseFields,
        signature,
    };

    if (process.env.CYBERSOURCE_ALLOW_OVERRIDE === 'true') {
        if (successUrl) {
            payload.override_custom_receipt_page = successUrl;
        }

        if (cancelUrl) {
            payload.override_custom_cancel_page = cancelUrl;
        }
    }

    return {
        endpoint: getHostedCheckoutUrl(),
        fields: payload,
        transactionUuid,
        signedFieldNames,
        unsignedFieldNames,
        signedDateTime,
    };
};

export const verifyHostedCheckoutSignature = (fields: Record<string, unknown>): boolean => {
    if (!fields) {
        return false;
    }

    const normalized = normalizeHostedCheckoutFields(fields);
    const signedFieldNamesRaw = normalized.signed_field_names || '';
    const signature = normalized.signature;

    if (!signedFieldNamesRaw || !signature) {
        return false;
    }

    const signedFieldNames = signedFieldNamesRaw.split(',').map(name => name.trim()).filter(Boolean);

    try {
        const expectedSignature = generateSignature(normalized, signedFieldNames);
        return expectedSignature === signature;
    } catch (error) {
        console.error('CyberSource signature verification error:', error);
        return false;
    }
};

import https from 'https';
import crypto from 'crypto';

const {
    CYBERSOURCE_MERCHANT_ID,
    CYBERSOURCE_PROFILE_ID,
    CYBERSOURCE_ACCESS_KEY,
    CYBERSOURCE_SECRET_KEY,
    CYBERSOURCE_ENVIRONMENT,
} = process.env;

if (!CYBERSOURCE_MERCHANT_ID || !CYBERSOURCE_PROFILE_ID || !CYBERSOURCE_ACCESS_KEY || !CYBERSOURCE_SECRET_KEY) {
    console.error('❌ Missing required CyberSource environment variables.');
    process.exit(1);
}

const isProduction = CYBERSOURCE_ENVIRONMENT === 'production';
const host = isProduction ? 'secureacceptance.cybersource.com' : 'testsecureacceptance.cybersource.com';
const path = `/secureacceptance/profiles/${CYBERSOURCE_PROFILE_ID}`;

const signedDataFields = 'access_key,profile_id,transaction_uuid,signed_field_names,unsigned_field_names,signed_date_time,locale,transaction_type,reference_number,amount,currency';
const unsignedDataFields = 'decision,message,reason_code,transaction_id,auth_code,override_custom_receipt_page,override_custom_cancel_page';

const payload = JSON.stringify({
    signed_data_fields: signedDataFields,
    unsigned_data_fields: unsignedDataFields,
});

const date = new Date().toUTCString();

const signatureString = [
    `host: ${host}`,
    `date: ${date}`,
    `(request-target): patch ${path}`,
    'content-type: application/json',
    `content-length: ${Buffer.byteLength(payload)}`,
].join('\n');

const secretBuffer = /^[0-9a-f]+$/i.test(CYBERSOURCE_SECRET_KEY)
    ? Buffer.from(CYBERSOURCE_SECRET_KEY, 'hex')
    : Buffer.from(CYBERSOURCE_SECRET_KEY, 'utf8');

const signature = crypto
    .createHmac('sha256', secretBuffer)
    .update(signatureString)
    .digest('base64');

const options: https.RequestOptions = {
    host,
    path,
    method: 'PATCH',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Date': date,
        'Host': host,
        'v-c-merchant-id': CYBERSOURCE_MERCHANT_ID,
        'Signature': `keyid="${CYBERSOURCE_ACCESS_KEY}", algorithm="HmacSHA256", headers="host date (request-target) content-type content-length", signature="${signature}"`,
    },
};

console.log('🔄 Updating Secure Acceptance profile field configuration...');

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });
    res.on('end', () => {
        console.log(`✅ CyberSource response status: ${res.statusCode}`);
        if (body) {
            console.log('📦 Response body:', body);
        }
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ Profile field configuration updated successfully.');
        } else {
            console.error('❌ Failed to update profile. Please review the response above.');
            process.exit(1);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ CyberSource request error:', error);
    process.exit(1);
});

req.write(payload);
req.end();

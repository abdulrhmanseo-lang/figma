// Moyasar Payment Configuration
// البيئة التجريبية - Test Environment

export const moyasarConfig = {
    // Test Environment Keys (مفاتيح البيئة التجريبية)
    publishableKey: 'pk_test_1KYKJzVPdM7heck2tCXCtp3y7U2SpvQy48zSi3pd',

    // Note: Secret key should be stored in environment variables for security
    // secretKey: 'sk_test_y8FH2mgKKouBMU...' // Store in .env.local

    // API Settings
    apiUrl: 'https://api.moyasar.com/v1',

    // Supported Payment Methods
    paymentMethods: ['creditcard', 'applepay', 'stcpay', 'mada'],

    // Currency
    currency: 'SAR',

    // Test Mode
    isTestMode: true
};

// Payment method icons URLs (SVG)
export const paymentIcons = {
    visa: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg',
    mastercard: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg',
    mada: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Mada_Logo.svg'
};

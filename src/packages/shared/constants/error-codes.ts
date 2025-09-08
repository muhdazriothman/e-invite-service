export const authErrors = {
    INVALID_CREDENTIALS: 'auth.invalid_credentials',
    ACCOUNT_DEACTIVATED: 'auth.account_deactivated',
    ADMIN_ACCESS_REQUIRED: 'auth.admin_access_required',
    BASIC_AUTH_REQUIRED: 'auth.basic_auth_required',
    ADMIN_CREATION_CREDENTIALS_NOT_CONFIGURED: 'auth.admin_creation_credentials_not_configured',
    INVALID_ADMIN_CREATION_CREDENTIALS: 'auth.invalid_admin_creation_credentials',
} as const;

export const userErrors = {
    EMAIL_ALREADY_EXISTS: 'user.email.already_exists',
    NOT_FOUND: 'user.not_found',
} as const;

export const paymentErrors = {
    RECORD_NOT_FOUND: 'payment.record.not_found',
    RECORD_NOT_AVAILABLE: 'payment.record.not_available',
    STATUS_NOT_VERIFIED: 'payment.status.not_verified',
} as const;

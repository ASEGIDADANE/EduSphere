import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

function environment() {
  return new checkoutNodeJssdk.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID!, // Securely load from .env
    process.env.PAYPAL_CLIENT_SECRET!
  );
}

export function paypalClient() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

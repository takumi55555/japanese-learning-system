// Stripe publishable key from environment variables
export const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || "";

// Validate that the key is present (warn only, don't crash)
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.warn(
    "VITE_STRIPE_PUBLIC_KEY is not defined in .env file. Stripe payments will not work."
  );
}

export default stripePublicKey;

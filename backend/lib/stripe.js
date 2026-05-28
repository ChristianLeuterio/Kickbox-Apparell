import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  throw new Error("Stripe secret key is missing from environment variables");
}

export const stripe = new Stripe(stripeKey);
export default stripe;
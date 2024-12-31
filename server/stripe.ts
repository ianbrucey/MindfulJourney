import Stripe from 'stripe';
import { users, subscriptions, type SelectUser } from "@db/schema";
import { db } from "@db";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

// Price IDs from your Stripe dashboard
const SUBSCRIPTION_PRICES = {
  basic: 'price_free', // Free tier doesn't need a price ID
  premium: process.env.STRIPE_PREMIUM_PRICE_ID,
  professional: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
};

export async function createCustomer(user: SelectUser) {
  const customer = await stripe.customers.create({
    email: user.email || undefined,
    metadata: {
      userId: user.id.toString(),
    },
  });

  await db.update(users)
    .set({ stripeCustomerId: customer.id })
    .where(eq(users.id, user.id));

  return customer;
}

export async function createSubscription(
  customerId: string,
  priceId: string,
  userId: number,
) {
  try {
    // Map the plan names to actual Stripe price IDs
    const actualPriceId = Object.entries(SUBSCRIPTION_PRICES).find(
      ([key]) => `price_${key}` === priceId
    )?.[1];

    if (!actualPriceId) {
      throw new Error(`Invalid price ID: ${priceId}`);
    }

    if (actualPriceId === 'price_free') {
      throw new Error("Cannot create subscription for free tier");
    }

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: actualPriceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // Store subscription info in our database
    await db.insert(subscriptions).values({
      userId,
      stripeSubscriptionId: subscription.id,
      planId: priceId === 'price_premium' ? 2 : 3, // premium or professional plan ID
      status: subscription.status,
      startDate: new Date(subscription.current_period_start * 1000),
      endDate: new Date(subscription.current_period_end * 1000),
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const payment_intent = invoice.payment_intent as Stripe.PaymentIntent;

    return {
      subscriptionId: subscription.id,
      clientSecret: payment_intent.client_secret,
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);

    // Update subscription status in our database
    await db.update(subscriptions)
      .set({ 
        status: 'cancelled',
        cancelledAt: new Date(),
      })
      .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));

    return subscription;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
}

export async function handleWebhook(rawBody: string, signature: string) {
  try {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await db.update(subscriptions)
          .set({
            status: subscription.status,
            endDate: new Date(subscription.current_period_end * 1000),
            cancelledAt: subscription.canceled_at 
              ? new Date(subscription.canceled_at * 1000)
              : null,
          })
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await db.update(subscriptions)
            .set({
              status: 'active',
              startDate: new Date(invoice.period_start * 1000),
              endDate: new Date(invoice.period_end * 1000),
            })
            .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription as string));
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await db.update(subscriptions)
            .set({ status: 'past_due' })
            .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription as string));
        }
        break;
      }
    }

    return { received: true };
  } catch (error) {
    console.error('Error handling webhook:', error);
    throw error;
  }
}
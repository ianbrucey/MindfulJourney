import { db } from "@db";
import { subscriptionPlans, users, groupMemberships, type SelectUser } from "@db/schema";
import { eq } from "drizzle-orm";

export const SUBSCRIPTION_TIERS = {
  BASIC: 'basic',
  PREMIUM: 'premium',
  PROFESSIONAL: 'professional'
} as const;

const INITIAL_SUBSCRIPTION_PLANS = [
  {
    name: SUBSCRIPTION_TIERS.BASIC,
    price: "0",
    features: [
      'Basic journaling',
      'Join up to 2 support groups',
      'Basic mood tracking',
      'Limited AI features (20 requests/month)'
    ],
    aiRequestsLimit: 20,
    groupLimit: 2,
  },
  {
    name: SUBSCRIPTION_TIERS.PREMIUM,
    price: "14.99",
    features: [
      'Unlimited AI-powered journaling',
      'Advanced sentiment analysis',
      'Unlimited support groups',
      'Focus motivation chat',
      'Advanced analytics',
      'Custom themes',
      'Ad-free experience'
    ],
    aiRequestsLimit: null, // unlimited
    groupLimit: null, // unlimited
  },
  {
    name: SUBSCRIPTION_TIERS.PROFESSIONAL,
    price: "29.99",
    features: [
      'All Premium features',
      'Priority support',
      'Group founder privileges',
      'Advanced emotional intelligence',
      'Custom guided meditations',
      'Personal wellness coach',
      'Advanced goal tracking',
      'API access'
    ],
    aiRequestsLimit: null, // unlimited
    groupLimit: null, // unlimited
  },
];

export async function initializeSubscriptionPlans() {
  const existingPlans = await db.query.subscriptionPlans.findMany();

  if (existingPlans.length === 0) {
    await db.insert(subscriptionPlans).values(INITIAL_SUBSCRIPTION_PLANS);
  }
}

export async function checkAIRequestLimit(user: SelectUser): Promise<boolean> {
  if (!user) return false;

  if (user.subscriptionTier !== SUBSCRIPTION_TIERS.BASIC) {
    return true; // Premium and Professional have unlimited requests
  }

  // For Basic tier, check the monthly limit
  const now = new Date();
  const resetDate = user.ai_requests_reset_date;

  // If it's a new month or no reset date, reset the counter
  if (!resetDate || resetDate < now) {
    await db
      .update(users)
      .set({
        aiRequestsCount: 1,
        ai_requests_reset_date: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      })
      .where(eq(users.id, user.id));
    return true;
  }

  // Check if user has exceeded the monthly limit
  if ((user.aiRequestsCount ?? 0) >= 20) {
    return false;
  }

  // Increment the counter
  await db
    .update(users)
    .set({
      aiRequestsCount: (user.aiRequestsCount ?? 0) + 1,
    })
    .where(eq(users.id, user.id));

  return true;
}

export async function checkGroupLimit(user: SelectUser): Promise<boolean> {
  if (!user) return false;

  if (user.subscriptionTier !== SUBSCRIPTION_TIERS.BASIC) {
    return true; // Premium and Professional have unlimited groups
  }

  // For Basic tier, check if they're already in 2 groups
  const membershipCount = await db.query.groupMemberships.findMany({
    where: eq(groupMemberships.userId, user.id),
  });

  return membershipCount.length < 2;
}
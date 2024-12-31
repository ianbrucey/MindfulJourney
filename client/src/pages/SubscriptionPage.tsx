import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import type { SelectSubscriptionPlan } from "@db/schema";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";

// Initialize stripe after getting the publishable key from the API
let stripePromise: Promise<any> | null = null;

function getStripe() {
  if (!stripePromise) {
    stripePromise = fetch('/api/subscription/config')
      .then(r => r.json())
      .then(({ publishableKey }) => loadStripe(publishableKey));
  }
  return stripePromise;
}

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/settings`,
        },
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button className="w-full mt-4" disabled={!stripe || isLoading}>
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          "Subscribe"
        )}
      </Button>
    </form>
  );
}

export default function SubscriptionPage() {
  const { data: plans, isLoading, error } = useQuery<SelectSubscriptionPlan[]>({
    queryKey: ["/api/subscription/plans"],
  });

  const { user } = useUser();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const createSubscriptionMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: planId }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = async (planName: string) => {
    if (planName === 'basic') {
      toast({
        title: "Basic Plan",
        description: "You're already on the basic plan!",
      });
      return;
    }

    const selectedPlan = plans?.find(p => p.name === planName);
    if (!selectedPlan?.priceId) {
      toast({
        title: "Error",
        description: "Invalid plan selected",
        variant: "destructive",
      });
      return;
    }

    setSelectedPlan(planName);
    createSubscriptionMutation.mutate(selectedPlan.priceId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Plans</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : "Failed to load subscription plans"}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AnimatedContainer>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground/90 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Select the plan that best fits your needs. Upgrade anytime to unlock more features and enhance your wellness journey.
          </p>
        </div>
      </AnimatedContainer>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {(plans || []).map((plan, index) => (
          <AnimatedContainer key={plan.id} delay={index * 0.1}>
            <Card className={`relative ${plan.name === 'premium' ? 'border-primary/50 shadow-lg' : ''}`}>
              {plan.name === 'premium' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name.charAt(0).toUpperCase() + plan.name.slice(1)}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold">${Number(plan.price).toFixed(2)}</span>
                  {Number(plan.price) > 0 && <span className="text-muted-foreground">/month</span>}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {(plan.features || []).map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {clientSecret && selectedPlan === plan.name ? (
                  <div className="w-full">
                    <Elements
                      stripe={getStripe()}
                      options={{
                        clientSecret,
                        appearance: { theme: 'stripe' },
                      }}
                    >
                      <CheckoutForm clientSecret={clientSecret} />
                    </Elements>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.name === 'premium' ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(plan.name)}
                    disabled={user?.subscriptionTier === plan.name}
                  >
                    {createSubscriptionMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    {user?.subscriptionTier === plan.name ? 'Current Plan' : 'Subscribe'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </AnimatedContainer>
        ))}
      </div>
    </div>
  );
}
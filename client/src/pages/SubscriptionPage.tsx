import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";

export default function SubscriptionPage() {
  const { data: plans = [] } = useQuery({
    queryKey: ["/api/subscription/plans"],
  });
  
  const { user } = useUser();
  const { toast } = useToast();

  const handleSubscribe = async (planName: string) => {
    // TODO: Implement subscription logic
    toast({
      title: "Coming Soon",
      description: "Subscription functionality will be available soon!",
    });
  };

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
        {plans.map((plan, index) => (
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
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.name === 'premium' ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(plan.name)}
                  disabled={user?.subscriptionTier === plan.name}
                >
                  {user?.subscriptionTier === plan.name ? 'Current Plan' : 'Subscribe'}
                </Button>
              </CardFooter>
            </Card>
          </AnimatedContainer>
        ))}
      </div>
    </div>
  );
}

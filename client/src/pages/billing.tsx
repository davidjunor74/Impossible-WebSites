import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, CreditCard, Download, Calendar, Zap, Crown, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    currency: "ZAR",
    period: "month",
    description: "Perfect for trying out the platform",
    features: [
      "1 website",
      "Basic templates",
      "Community support",
      "Basic SEO tools",
      "Standard hosting"
    ],
    limitations: ["No custom domain", "Limited AI generations", "Basic analytics"],
    icon: Zap,
    popular: false
  },
  {
    id: "professional",
    name: "Professional",
    price: 199,
    currency: "ZAR",
    period: "month",
    description: "For small businesses and professionals",
    features: [
      "5 websites",
      "Premium templates",
      "Priority support",
      "Advanced SEO tools",
      "Custom domains",
      "Advanced analytics",
      "100 AI generations/month",
      "SSL certificates"
    ],
    limitations: [],
    icon: Crown,
    popular: true
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 499,
    currency: "ZAR",
    period: "month",
    description: "For agencies and large businesses",
    features: [
      "Unlimited websites",
      "All premium templates",
      "24/7 phone support",
      "White-label options",
      "API access",
      "Team collaboration",
      "Unlimited AI generations",
      "Priority hosting",
      "Custom integrations"
    ],
    limitations: [],
    icon: Rocket,
    popular: false
  }
];

export default function Billing() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Get current user and billing info
  const { data: userBilling } = useQuery({
    queryKey: ["/api/billing/current"],
  });

  // Get invoices
  const { data: invoices } = useQuery({
    queryKey: ["/api/billing/invoices"],
  });

  // Upgrade plan mutation
  const upgradeMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiRequest("POST", "/api/billing/upgrade", { plan: planId });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        toast({
          title: "Plan Updated",
          description: "Your subscription has been updated successfully."
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Upgrade Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Cancel subscription mutation
  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/billing/cancel", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription Canceled",
        description: "Your subscription has been canceled and will expire at the end of the billing period."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const currentPlan = userBilling?.plan || "starter";

  return (
    <div className="container mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
        <p className="text-gray-600">
          Manage your subscription and billing preferences
        </p>
      </div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList>
          <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
          <TabsTrigger value="current">Current Plan</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const PlanIcon = plan.icon;
              const isCurrentPlan = currentPlan === plan.id;
              const canUpgrade = plan.id !== "starter" && !isCurrentPlan;
              
              return (
                <Card key={plan.id} className={`relative ${plan.popular ? 'border-brand-primary shadow-lg' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-brand-primary text-white">Most Popular</Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                      <PlanIcon className="w-6 h-6 text-brand-primary" />
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold">
                      {plan.price === 0 ? "Free" : `R${plan.price}`}
                      {plan.price > 0 && <span className="text-base font-normal text-gray-600">/{plan.period}</span>}
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-center text-gray-500">
                          <span className="w-4 h-4 mr-2 flex-shrink-0">×</span>
                          <span className="text-sm">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {isCurrentPlan ? (
                      <Button disabled className="w-full">
                        Current Plan
                      </Button>
                    ) : canUpgrade ? (
                      <Button
                        onClick={() => upgradeMutation.mutate(plan.id)}
                        disabled={upgradeMutation.isPending}
                        className="w-full bg-brand-primary hover:bg-brand-secondary"
                      >
                        {upgradeMutation.isPending ? "Processing..." : `Upgrade to ${plan.name}`}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => upgradeMutation.mutate(plan.id)}
                        disabled={upgradeMutation.isPending}
                        className="w-full"
                      >
                        {upgradeMutation.isPending ? "Processing..." : "Downgrade"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="bg-gray-50">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Need something custom?</h3>
                <p className="text-gray-600 mb-4">
                  Contact us for enterprise solutions, custom integrations, or volume discounts.
                </p>
                <Button variant="outline">Contact Sales</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="current" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Subscription</CardTitle>
              <CardDescription>
                Manage your active subscription and usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg capitalize">{currentPlan} Plan</h3>
                  <p className="text-gray-600">
                    {userBilling?.billing_cycle_end 
                      ? `Next billing date: ${new Date(userBilling.billing_cycle_end).toLocaleDateString()}`
                      : "Free plan - no billing cycle"
                    }
                  </p>
                </div>
                {userBilling?.status && (
                  <Badge variant={userBilling.status === "active" ? "default" : "secondary"}>
                    {userBilling.status}
                  </Badge>
                )}
              </div>

              {userBilling?.payment_method && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Payment Method</h4>
                  <div className="flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    <span>•••• •••• •••• {userBilling.payment_method.last_four}</span>
                    <Badge variant="outline" className="ml-2">
                      {userBilling.payment_method.brand}
                    </Badge>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Websites Used</h4>
                  <div className="text-2xl font-bold text-brand-primary">
                    {userBilling?.usage?.websites || 0}
                    <span className="text-sm font-normal text-gray-600">
                      / {currentPlan === "starter" ? "1" : currentPlan === "professional" ? "5" : "∞"}
                    </span>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">AI Generations This Month</h4>
                  <div className="text-2xl font-bold text-brand-primary">
                    {userBilling?.usage?.ai_generations || 0}
                    <span className="text-sm font-normal text-gray-600">
                      / {currentPlan === "starter" ? "10" : currentPlan === "professional" ? "100" : "∞"}
                    </span>
                  </div>
                </div>
              </div>

              {currentPlan !== "starter" && (
                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Subscription Management</h4>
                  <div className="flex space-x-3">
                    <Button variant="outline">Update Payment Method</Button>
                    <Button
                      variant="destructive"
                      onClick={() => cancelMutation.mutate()}
                      disabled={cancelMutation.isPending}
                    >
                      {cancelMutation.isPending ? "Canceling..." : "Cancel Subscription"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View and download your invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invoices && invoices.length > 0 ? (
                <div className="space-y-4">
                  {invoices.map((invoice: any) => (
                    <div key={invoice.id} className="flex items-center justify-between border rounded-lg p-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">Invoice #{invoice.number}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(invoice.date).toLocaleDateString()} • R{invoice.amount}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                          {invoice.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">No invoices yet</h3>
                  <p className="text-gray-600">
                    Your billing history will appear here once you subscribe to a paid plan.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
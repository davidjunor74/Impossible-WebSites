import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import AuthButton from "@/components/ui/auth-button";

const plans = [
  {
    name: "Starter",
    price: "R49",
    description: "Perfect for small businesses getting started online",
    features: [
      "1 website",
      "Free subdomain",
      "AI content generation",
      "SSL certificate",
      "Basic SEO"
    ],
    buttonText: "Get Started",
    popular: false
  },
  {
    name: "Professional",
    price: "R149",
    description: "Everything you need to grow your business",
    features: [
      "5 websites",
      "Custom domain",
      "Advanced AI features",
      "Email marketing",
      "Priority support",
      "Analytics dashboard"
    ],
    buttonText: "Get Started",
    popular: true
  },
  {
    name: "Enterprise",
    price: "R499",
    description: "For agencies and large businesses",
    features: [
      "Unlimited websites",
      "White-label solution",
      "API access",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee"
    ],
    buttonText: "Contact Sales",
    popular: false
  }
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Rock-Bottom Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            No hidden fees, no setup costs. Just honest pricing that scales with your business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'gradient-primary text-white transform scale-105 shadow-xl' : 'bg-white hover:shadow-lg'} transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-yellow-500 text-white">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className={`text-2xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </CardTitle>
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  <span className={plan.popular ? 'text-blue-200' : 'text-gray-600'}>
                    /month
                  </span>
                </div>
                <p className={plan.popular ? 'text-blue-200' : 'text-gray-600'}>
                  {plan.description}
                </p>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className={`w-5 h-5 ${plan.popular ? 'text-yellow-300' : 'text-green-500'}`} />
                      <span className={plan.popular ? 'text-white' : 'text-gray-700'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                
                {plan.name === "Enterprise" ? (
                  <Button 
                    variant={plan.popular ? "secondary" : "outline"} 
                    className="w-full py-3 font-semibold"
                  >
                    {plan.buttonText}
                  </Button>
                ) : (
                  <AuthButton 
                    mode="signup"
                    variant={plan.popular ? "secondary" : "outline"}
                    className={`w-full py-3 font-semibold ${
                      plan.popular 
                        ? 'bg-white text-primary hover:bg-gray-100' 
                        : 'border-primary text-primary hover:bg-primary hover:text-white'
                    }`}
                  >
                    {plan.buttonText}
                  </AuthButton>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            All plans include free SSL, unlimited bandwidth, and our 30-day money-back guarantee.{" "}
            <a href="#" className="text-primary hover:underline">View detailed comparison</a>
          </p>
        </div>
      </div>
    </section>
  );
}

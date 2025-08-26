import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Search, Globe, DollarSign, Star, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";

interface DomainSearchResult {
  domain: string;
  available: boolean;
  price: number;
  premium: boolean;
  suggestions: string[];
  signupIncluded?: boolean;
  renewalPrice?: number;
}

interface SignupPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

const signupPlans: SignupPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    description: "Perfect for personal projects and trying out the platform",
    features: [
      "1 website included",
      "FREE .com, .net, or .org domain (first year)",
      "Basic templates",
      "SSL certificate included",
      "Email support"
    ]
  },
  {
    id: "professional",
    name: "Professional", 
    price: 29,
    description: "Ideal for small businesses and professionals",
    features: [
      "5 websites included",
      "FREE .com, .net, or .org domain (first year)",
      "Premium templates & AI generation",
      "Custom branding",
      "Priority support",
      "Analytics dashboard"
    ],
    popular: true
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    description: "For growing businesses and agencies",
    features: [
      "Unlimited websites",
      "FREE .com, .net, or .org domain (first year)",
      "White-label solution",
      "Advanced integrations",
      "Dedicated support",
      "Custom development"
    ]
  }
];

export default function SignupWithDomain() {
  const [selectedPlan, setSelectedPlan] = useState<string>("professional");
  const [domainQuery, setDomainQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [searchResults, setSearchResults] = useState<DomainSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userInfo, setUserInfo] = useState({
    email: "",
    password: "",
    businessName: "",
    firstName: "",
    lastName: ""
  });
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Search domains with signup pricing
  const searchDomainsMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await fetch(`/api/domains/search?query=${encodeURIComponent(query)}&includeSignupPricing=true`);
      if (!response.ok) throw new Error('Failed to search domains');
      return response.json() as Promise<DomainSearchResult[]>;
    },
    onSuccess: (data) => {
      setSearchResults(data);
      setIsSearching(false);
    },
    onError: (error) => {
      toast({
        title: "Search Failed",
        description: error.message,
        variant: "destructive"
      });
      setIsSearching(false);
    }
  });

  // Complete signup mutation
  const signupMutation = useMutation({
    mutationFn: async (signupData: any) => {
      // Register user
      const userResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupData.email,
          password: signupData.password,
          name: `${signupData.firstName} ${signupData.lastName}`,
          plan: signupData.plan
        })
      });
      
      if (!userResponse.ok) throw new Error('Failed to create account');
      const user = await userResponse.json();

      // Create initial site
      const siteResponse = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupData.businessName || `${signupData.firstName}'s Website`,
          subdomain: signupData.businessName?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'mysite',
          template_id: 1,
          user_id: user.id,
          site_data: {
            businessName: signupData.businessName,
            ownerName: `${signupData.firstName} ${signupData.lastName}`
          }
        })
      });
      
      if (!siteResponse.ok) throw new Error('Failed to create initial site');
      const site = await siteResponse.json();

      // Register domain if selected
      if (signupData.domain) {
        const domainResponse = await fetch('/api/domains/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain_name: signupData.domain,
            site_id: site.id,
            user_id: user.id,
            status: "active",
            auto_renewal_enabled: true,
            ssl_enabled: true,
            nameservers: ["ns1.impossiblewebsites.com", "ns2.impossiblewebsites.com"],
            firstName: signupData.firstName,
            lastName: signupData.lastName,
            email: signupData.email,
            phone: "+1234567890", // Would collect in real signup
            address: "123 Main St",
            city: "Anytown", 
            state: "State",
            postalCode: "12345",
            country: "US"
          })
        });
        
        if (!domainResponse.ok) throw new Error('Failed to register domain');
      }

      return { user, site };
    },
    onSuccess: () => {
      toast({
        title: "Account Created Successfully!",
        description: "Welcome to ImpossibleWebsites. Your domain and website are being set up.",
      });
      setLocation('/dashboard');
    },
    onError: (error) => {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleDomainSearch = () => {
    if (!domainQuery.trim()) return;
    setIsSearching(true);
    searchDomainsMutation.mutate(domainQuery);
  };

  const handleSignup = () => {
    if (!userInfo.email || !userInfo.password || !userInfo.firstName || !userInfo.lastName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    signupMutation.mutate({
      ...userInfo,
      plan: selectedPlan,
      domain: selectedDomain
    });
  };

  const selectedPlanData = signupPlans.find(p => p.id === selectedPlan);
  const selectedDomainData = searchResults.find(d => d.domain === selectedDomain);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Start Your Website Journey
          </h1>
          <p className="text-xl text-gray-600">
            Choose your plan, get your domain, and launch your website in minutes
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Plan Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Choose Your Plan
              </CardTitle>
              <CardDescription>
                All plans include a FREE domain for the first year
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {signupPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${plan.popular ? 'ring-2 ring-blue-200' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{plan.name}</h3>
                      {plan.popular && (
                        <Badge className="bg-blue-500">Most Popular</Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold">${plan.price}</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{plan.description}</p>
                  <ul className="space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Domain Selection & Account Info */}
          <div className="space-y-6">
            {/* Domain Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Choose Your FREE Domain
                </CardTitle>
                <CardDescription>
                  Get a .com, .net, or .org domain free for the first year
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter your business or website name"
                    value={domainQuery}
                    onChange={(e) => setDomainQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleDomainSearch()}
                  />
                  <Button onClick={handleDomainSearch} disabled={isSearching}>
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedDomain === result.domain
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => result.available ? setSelectedDomain(result.domain) : null}
                      >
                        <div className="flex items-center gap-3">
                          <Globe className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{result.domain}</span>
                          {result.signupIncluded && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <Sparkles className="w-3 h-3 mr-1" />
                              FREE
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          {result.available ? (
                            <div>
                              <div className={`font-semibold ${result.signupIncluded ? 'line-through text-gray-400' : ''}`}>
                                ${result.price.toFixed(2)}/year
                              </div>
                              {result.signupIncluded && (
                                <div className="text-sm text-green-600">
                                  Then ${result.renewalPrice?.toFixed(2)}/year
                                </div>
                              )}
                            </div>
                          ) : (
                            <Badge variant="destructive">Unavailable</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Create your account to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={userInfo.firstName}
                      onChange={(e) => setUserInfo({...userInfo, firstName: e.target.value})}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={userInfo.lastName}
                      onChange={(e) => setUserInfo({...userInfo, lastName: e.target.value})}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="businessName">Business Name (Optional)</Label>
                  <Input
                    id="businessName"
                    value={userInfo.businessName}
                    onChange={(e) => setUserInfo({...userInfo, businessName: e.target.value})}
                    placeholder="My Awesome Business"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={userInfo.password}
                    onChange={(e) => setUserInfo({...userInfo, password: e.target.value})}
                    placeholder="Create a secure password"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Order Summary & Signup */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>{selectedPlanData?.name} Plan</span>
                  <span className="font-semibold">${selectedPlanData?.price}/month</span>
                </div>
                {selectedDomain && selectedDomainData && (
                  <div className="flex justify-between">
                    <span>{selectedDomain}</span>
                    <span className={`font-semibold ${selectedDomainData.signupIncluded ? 'text-green-600' : ''}`}>
                      {selectedDomainData.signupIncluded ? 'FREE' : `$${selectedDomainData.price}/year`}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${selectedPlanData?.price}/month</span>
                </div>
                {selectedDomain && selectedDomainData?.signupIncluded && (
                  <p className="text-sm text-gray-600">
                    Domain renews at ${selectedDomainData.renewalPrice?.toFixed(2)}/year after first year
                  </p>
                )}
                <Button 
                  onClick={handleSignup}
                  disabled={signupMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                  size="lg"
                >
                  {signupMutation.isPending ? "Creating Account..." : "Start Building Your Website"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
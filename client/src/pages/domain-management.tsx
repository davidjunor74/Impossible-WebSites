import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Globe, DollarSign, Calendar, AlertCircle, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface DomainSearchResult {
  domain: string;
  available: boolean;
  price: number;
  premium: boolean;
  suggestions: string[];
  signupIncluded?: boolean;
  renewalPrice?: number;
}

interface Domain {
  id: number;
  domain_name: string;
  status: string;
  registration_date: string;
  expiration_date: string;
  auto_renewal_enabled: boolean;
  customer_price: string;
  site_id: number;
  ssl_enabled: boolean;
}

interface DomainPricing {
  id: number;
  tld: string;
  customer_registration_price: string;
  customer_renewal_price: string;
  markup_percentage: string;
  premium_tld: boolean;
}

export default function DomainManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DomainSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user domains
  const { data: userDomains, isLoading: domainsLoading } = useQuery({
    queryKey: ['/api/domains/user/1'], // Assuming user ID 1 for demo
    queryFn: async () => {
      const response = await fetch('/api/domains/user/1');
      if (!response.ok) throw new Error('Failed to fetch domains');
      return response.json() as Promise<Domain[]>;
    }
  });

  // Get domain pricing
  const { data: domainPricing, isLoading: pricingLoading } = useQuery({
    queryKey: ['/api/domain-pricing'],
    queryFn: async () => {
      const response = await fetch('/api/domain-pricing');
      if (!response.ok) throw new Error('Failed to fetch pricing');
      return response.json() as Promise<DomainPricing[]>;
    }
  });

  // Search domains mutation
  const searchDomainsMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await fetch(`/api/domains/search?query=${encodeURIComponent(query)}`);
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

  // Purchase domain mutation
  const purchaseDomainMutation = useMutation({
    mutationFn: async (domainData: any) => {
      const response = await fetch('/api/domains/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(domainData)
      });
      if (!response.ok) throw new Error('Failed to purchase domain');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Domain Purchased",
        description: "Your domain has been successfully registered!",
      });
      setPurchaseDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/domains/user/1'] });
    },
    onError: (error) => {
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    searchDomainsMutation.mutate(searchQuery);
  };

  const handlePurchase = (domain: string) => {
    setSelectedDomain(domain);
    setPurchaseDialogOpen(true);
  };

  const confirmPurchase = () => {
    purchaseDomainMutation.mutate({
      domain_name: selectedDomain,
      site_id: 1, // Default site ID for demo
      user_id: 1, // Current user ID
      status: "active",
      auto_renewal_enabled: true,
      ssl_enabled: true,
      nameservers: ["ns1.impossiblewebsites.com", "ns2.impossiblewebsites.com"],
      firstName: "John",
      lastName: "Doe",
      email: "user@example.com",
      phone: "+1234567890",
      address: "123 Main St",
      city: "Anytown",
      state: "State",
      postalCode: "12345",
      country: "US"
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Domain Management</h1>
          <p className="text-muted-foreground">Manage your custom domains and explore available options</p>
        </div>
      </div>

      {/* Domain Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Available Domains
          </CardTitle>
          <CardDescription>
            Find and register the perfect domain for your website. 
            <span className="font-medium text-green-600"> .com, .net, and .org domains are FREE with new signups!</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter domain name (e.g., myawesome-business)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch} 
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Available Domains</h3>
              {searchResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{result.domain}</span>
                    {result.premium && (
                      <Badge variant="secondary" className="text-xs">Premium</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      {result.signupIncluded ? (
                        <div>
                          <div className="font-semibold text-green-600">
                            FREE with signup
                          </div>
                          <div className="text-sm text-gray-500">
                            Then ${result.renewalPrice?.toFixed(2)}/year
                          </div>
                        </div>
                      ) : (
                        <span className="font-semibold">${result.price.toFixed(2)}/year</span>
                      )}
                    </div>
                    {result.available ? (
                      <Button size="sm" onClick={() => handlePurchase(result.domain)}>
                        Purchase
                      </Button>
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

      {/* My Domains */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            My Domains
          </CardTitle>
          <CardDescription>
            Manage your registered domains and renewal settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {domainsLoading ? (
            <div className="text-center py-8">Loading your domains...</div>
          ) : userDomains && userDomains.length > 0 ? (
            <div className="space-y-4">
              {userDomains.map((domain) => (
                <div key={domain.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{domain.domain_name}</h3>
                      <Badge className={getStatusColor(domain.status)}>
                        {domain.status}
                      </Badge>
                      {domain.ssl_enabled && (
                        <Badge variant="outline" className="text-green-600">
                          SSL Enabled
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Registered: {formatDate(domain.registration_date)} • 
                      Expires: {formatDate(domain.expiration_date)}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-semibold">${domain.customer_price}/year</div>
                    <div className="flex items-center gap-1 text-sm">
                      {domain.auto_renewal_enabled ? (
                        <><Check className="w-3 h-3 text-green-600" /> Auto-renewal</>
                      ) : (
                        <><X className="w-3 h-3 text-red-600" /> Manual renewal</>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No domains yet</h3>
              <p className="text-muted-foreground">Search for available domains above to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Domain Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Domain Pricing
          </CardTitle>
          <CardDescription>
            Current pricing for popular domain extensions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pricingLoading ? (
            <div className="text-center py-8">Loading pricing...</div>
          ) : domainPricing && domainPricing.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {domainPricing.map((pricing) => (
                <div key={pricing.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-lg">{pricing.tld}</span>
                    {pricing.premium_tld && (
                      <Badge variant="secondary">Premium</Badge>
                    )}
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Registration:</span>
                      <span className="font-medium">${pricing.customer_registration_price}/year</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Renewal:</span>
                      <span className="font-medium">${pricing.customer_renewal_price}/year</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Markup:</span>
                      <span>{pricing.markup_percentage}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pricing information available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchase Dialog */}
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Domain</DialogTitle>
            <DialogDescription>
              You're about to purchase {selectedDomain}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">{selectedDomain}</span>
                <span className="font-semibold">
                  ${searchResults.find(r => r.domain === selectedDomain)?.price.toFixed(2)}/year
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Includes SSL certificate and DNS management
              </p>
            </div>
            
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Auto-renewal enabled</p>
                <p className="text-blue-700">
                  Your domain will automatically renew to prevent expiration
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setPurchaseDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmPurchase}
                disabled={purchaseDomainMutation.isPending}
                className="flex-1"
              >
                {purchaseDomainMutation.isPending ? "Processing..." : "Confirm Purchase"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
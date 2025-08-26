import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Globe, TrendingUp } from "lucide-react";
import StatsCards from "@/components/dashboard/stats-cards";
import SiteCard from "@/components/dashboard/site-card";
import type { Site } from "@shared/schema";
import { Link } from "wouter";

export default function Dashboard() {
  // TODO: Get userId from auth context
  const userId = 1; // Mock user ID

  const { data: sites, isLoading: sitesLoading } = useQuery<Site[]>({
    queryKey: ["/api/sites", { userId }],
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats", { userId }],
  });

  if (sitesLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your websites and track performance</p>
            </div>
            <Link href="/templates">
              <Button className="gradient-primary text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Website
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <StatsCards stats={stats} />
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Websites</CardTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Site
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {sites && sites.length > 0 ? (
                  <div className="space-y-4">
                    {sites.map((site) => (
                      <SiteCard key={site.id} site={site} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No websites yet</h3>
                    <p className="text-gray-600 mb-6">Get started by creating your first website</p>
                    <Button className="gradient-primary text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Website
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="ghost" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-3 text-primary" />
                  New from Template
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-3 text-primary" />
                  View Analytics
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-3 text-primary" />
                  Manage Domains
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">AI Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Need help with content? Our AI can generate copy, images, and SEO content for your sites.
                </p>
                <Button size="sm" className="w-full gradient-primary text-white">
                  Get AI Help
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

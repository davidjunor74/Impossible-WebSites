import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Infinity, 
  Globe, 
  Users, 
  TrendingUp, 
  Plus, 
  Briefcase, 
  Coffee, 
  Store, 
  ExternalLink, 
  Edit,
  BarChart3,
  Link,
  Upload,
  Bot
} from "lucide-react";

const mockSites = [
  {
    name: "Law Firm Website",
    url: "lawfirm.impossiblewebsites.com",
    status: "Live",
    icon: Briefcase,
    gradient: "bg-gradient-to-br from-blue-500 to-purple-500"
  },
  {
    name: "Coffee Shop",
    url: "cafe.impossiblewebsites.com",
    status: "Draft",
    icon: Coffee,
    gradient: "bg-gradient-to-br from-green-500 to-teal-500"
  },
  {
    name: "Retail Store",
    url: "mystore.com",
    status: "Live",
    icon: Store,
    gradient: "bg-gradient-to-br from-purple-500 to-pink-500"
  }
];

const quickActions = [
  { icon: Plus, label: "New from Template", color: "text-primary" },
  { icon: Upload, label: "Import Existing Site", color: "text-primary" },
  { icon: BarChart3, label: "View Analytics", color: "text-primary" },
  { icon: Link, label: "Manage Domains", color: "text-primary" }
];

export default function DashboardPreview() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple Dashboard, Powerful Results
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage all your websites from one clean, intuitive dashboard
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Dashboard Header */}
          <div className="bg-gray-900 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                  <Infinity className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold">Dashboard</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-300">John Doe</span>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">JD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Stats Cards */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card className="gradient-primary text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm">Active Sites</p>
                          <p className="text-3xl font-bold">3</p>
                        </div>
                        <Globe className="w-8 h-8 text-blue-200" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="gradient-secondary text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm">Monthly Visitors</p>
                          <p className="text-3xl font-bold">2.4k</p>
                        </div>
                        <Users className="w-8 h-8 text-green-200" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm">SEO Score</p>
                          <p className="text-3xl font-bold">94</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-purple-200" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Sites */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Your Websites</CardTitle>
                      <Button size="sm" className="gradient-primary text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        New Site
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockSites.map((site, index) => {
                        const Icon = site.icon;
                        return (
                          <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 ${site.gradient} rounded-lg flex items-center justify-center`}>
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{site.name}</h4>
                                <p className="text-sm text-gray-600">{site.url}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={site.status === "Live" ? "default" : "secondary"}>
                                {site.status}
                              </Badge>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {quickActions.map((action, index) => {
                      const Icon = action.icon;
                      return (
                        <Button key={index} variant="ghost" className="w-full justify-start">
                          <Icon className={`w-4 h-4 mr-3 ${action.color}`} />
                          <span className="text-gray-700">{action.label}</span>
                        </Button>
                      );
                    })}
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
                      <Bot className="w-4 h-4 mr-2" />
                      Get AI Help
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

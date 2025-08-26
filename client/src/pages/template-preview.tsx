import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Eye, ExternalLink } from "lucide-react";
import { Link } from "wouter";

interface AvailableTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  source: string;
  license: string;
  previewUrl: string;
  tags: string[];
}

export default function TemplatePreview() {
  const { id } = useParams<{ id: string }>();

  // Fetch template details from catalog
  const { data: catalogData, isLoading, error } = useQuery({
    queryKey: ['/api/templates/catalog'],
    queryFn: async () => {
      const response = await fetch('/api/templates/catalog');
      if (!response.ok) throw new Error('Failed to fetch template catalog');
      return response.json() as Promise<{ templates: AvailableTemplate[] }>;
    },
    retry: 2,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const template = catalogData?.templates.find(t => t.id === id);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Template</h1>
          <p className="text-gray-600 mb-4">Failed to load template catalog</p>
          <Link href="/import-all">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Template Not Found</h1>
          <Link href="/import-all">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/import-all">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Library
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary">{template.category}</Badge>
                  <Badge variant="outline">{template.source}</Badge>
                  <Badge className="bg-green-100 text-green-800">{template.license}</Badge>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => {
                  // Open template in editor or preview mode
                  window.open(`/site-builder?template=${template.id}`, '_blank');
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                Live Preview
              </Button>
              <Button
                onClick={() => {
                  // Import template functionality
                  const importBtn = document.createElement('a');
                  importBtn.href = `/site-builder?template=${template.id}`;
                  importBtn.click();
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Use Template
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Preview Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  Template Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-white border rounded-lg overflow-hidden">
                  {/* Enhanced preview based on template category */}
                  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 p-8">
                    {template.category === 'business' && (
                      <div className="space-y-6">
                        {/* Header */}
                        <div className="flex justify-between items-center border-b pb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-blue-600 rounded"></div>
                            <span className="font-bold text-lg">BusinessCorp</span>
                          </div>
                          <div className="flex space-x-4 text-sm">
                            <span>Home</span>
                            <span>About</span>
                            <span>Services</span>
                            <span>Contact</span>
                          </div>
                        </div>
                        {/* Hero */}
                        <div className="text-center py-12">
                          <h1 className="text-4xl font-bold mb-4">Professional Business Solutions</h1>
                          <p className="text-gray-600 mb-6">We help businesses grow with innovative strategies</p>
                          <div className="w-32 h-10 bg-blue-600 rounded mx-auto"></div>
                        </div>
                        {/* Services */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-white rounded shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded mx-auto mb-2"></div>
                            <h3 className="font-semibold">Consulting</h3>
                            <p className="text-sm text-gray-600">Expert advice</p>
                          </div>
                          <div className="text-center p-4 bg-white rounded shadow">
                            <div className="w-12 h-12 bg-green-100 rounded mx-auto mb-2"></div>
                            <h3 className="font-semibold">Strategy</h3>
                            <p className="text-sm text-gray-600">Growth planning</p>
                          </div>
                          <div className="text-center p-4 bg-white rounded shadow">
                            <div className="w-12 h-12 bg-purple-100 rounded mx-auto mb-2"></div>
                            <h3 className="font-semibold">Support</h3>
                            <p className="text-sm text-gray-600">24/7 assistance</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {template.category === 'portfolio' && (
                      <div className="space-y-6">
                        {/* Header */}
                        <div className="text-center border-b pb-6">
                          <div className="w-16 h-16 bg-purple-600 rounded-full mx-auto mb-4"></div>
                          <h1 className="text-2xl font-bold">John Designer</h1>
                          <p className="text-gray-600">Creative Professional</p>
                        </div>
                        {/* Portfolio Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="aspect-square bg-gradient-to-br from-purple-400 to-pink-400 rounded"></div>
                          <div className="aspect-square bg-gradient-to-br from-blue-400 to-cyan-400 rounded"></div>
                          <div className="aspect-square bg-gradient-to-br from-green-400 to-teal-400 rounded"></div>
                          <div className="aspect-square bg-gradient-to-br from-orange-400 to-red-400 rounded"></div>
                        </div>
                      </div>
                    )}
                    
                    {template.category === 'landing' && (
                      <div className="text-center space-y-8">
                        <div className="py-16">
                          <h1 className="text-5xl font-bold mb-4">Launch Your Dream</h1>
                          <p className="text-xl text-gray-600 mb-8">Join thousands who transformed their ideas into reality</p>
                          <div className="w-48 h-12 bg-green-600 rounded mx-auto mb-4"></div>
                          <p className="text-sm text-gray-500">No credit card required</p>
                        </div>
                        <div className="grid grid-cols-3 gap-8 py-8 border-t">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">50K+</div>
                            <div className="text-sm text-gray-600">Happy Users</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">99.9%</div>
                            <div className="text-sm text-gray-600">Uptime</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">24/7</div>
                            <div className="text-sm text-gray-600">Support</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {template.category === 'ecommerce' && (
                      <div className="space-y-6">
                        {/* Header */}
                        <div className="flex justify-between items-center border-b pb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-orange-600 rounded"></div>
                            <span className="font-bold text-lg">ShopNow</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="w-6 h-6 bg-gray-300 rounded"></div>
                            <div className="w-6 h-6 bg-gray-300 rounded"></div>
                          </div>
                        </div>
                        {/* Products */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-white rounded shadow p-3">
                            <div className="aspect-square bg-gray-200 rounded mb-2"></div>
                            <h3 className="font-semibold text-sm">Product Name</h3>
                            <p className="text-orange-600 font-bold">$99.99</p>
                          </div>
                          <div className="bg-white rounded shadow p-3">
                            <div className="aspect-square bg-gray-200 rounded mb-2"></div>
                            <h3 className="font-semibold text-sm">Product Name</h3>
                            <p className="text-orange-600 font-bold">$149.99</p>
                          </div>
                          <div className="bg-white rounded shadow p-3">
                            <div className="aspect-square bg-gray-200 rounded mb-2"></div>
                            <h3 className="font-semibold text-sm">Product Name</h3>
                            <p className="text-orange-600 font-bold">$79.99</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {(template.category === 'agency' || template.category === 'creative') && (
                      <div className="space-y-6">
                        <div className="text-center py-12">
                          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                            Creative Agency
                          </h1>
                          <p className="text-gray-600 mb-6">We bring your vision to life</p>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <div className="h-32 bg-gradient-to-r from-pink-300 to-purple-300 rounded"></div>
                            <h3 className="font-semibold">Brand Design</h3>
                            <p className="text-sm text-gray-600">Creating memorable identities</p>
                          </div>
                          <div className="space-y-4">
                            <div className="h-32 bg-gradient-to-r from-blue-300 to-cyan-300 rounded"></div>
                            <h3 className="font-semibold">Web Development</h3>
                            <p className="text-sm text-gray-600">Modern digital experiences</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="font-semibold capitalize">{template.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Source</label>
                  <p className="font-semibold">{template.source}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">License</label>
                  <p className="font-semibold text-green-600">{template.license}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-sm">{template.description}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {template.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="mr-1">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button 
                className="w-full"
                onClick={() => {
                  window.location.href = `/site-builder?template=${template.id}`;
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Import Template
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  window.open(`/site-builder?template=${template.id}&mode=edit`, '_blank');
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in Editor
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
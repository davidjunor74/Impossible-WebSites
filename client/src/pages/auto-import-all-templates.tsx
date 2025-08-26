import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Download, 
  Package,
  Eye,
  Search,
  Filter,
  Globe,
  Star,
  Users,
  Sparkles,
  Plus,
  CheckCircle,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AvailableTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  source: string;
  license: string;
  previewUrl: string;
  thumbnailUrl?: string;
  tags: string[];
}

interface TemplateSource {
  name: string;
  count: number;
  license: string;
  description: string;
  categories: string[];
}

const templateSources = [
  { name: "Start Bootstrap", count: 150, license: "MIT", description: "Professional Bootstrap templates" },
  { name: "ThemeWagon", count: 1500, license: "Commercial", description: "Massive template collection" },
  { name: "HTML5 UP", count: 80, license: "Creative Commons", description: "Modern responsive designs" },
  { name: "Free CSS", count: 1432, license: "Free", description: "Business template library" },
  { name: "Colorlib", count: 100, license: "Commercial", description: "Agency & startup templates" },
  { name: "BootstrapMade", count: 50, license: "Free Personal", description: "Professional designs" }
];

export default function AutoImportAllTemplates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [customBusinessType, setCustomBusinessType] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const { toast } = useToast();

  // Fetch available templates catalog (doesn't import, just shows what's available)
  const { data: availableTemplates, isLoading } = useQuery({
    queryKey: ['/api/templates/catalog'],
    queryFn: async () => {
      const response = await fetch('/api/templates/catalog');
      if (!response.ok) throw new Error('Failed to fetch template catalog');
      return response.json() as Promise<{ templates: AvailableTemplate[], sources: TemplateSource[] }>;
    }
  });

  // Import specific template mutation
  const importTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await fetch(`/api/templates/import/${templateId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to import template');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Template Ready!",
        description: "Template is now ready to customize and use."
      });
    }
  });

  // State for custom templates
  const [customTemplates, setCustomTemplates] = useState<AvailableTemplate[]>([]);

  // Generate custom templates mutation
  const generateCustomMutation = useMutation({
    mutationFn: async (businessType: string) => {
      const response = await fetch('/api/templates/generate-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessType })
      });
      if (!response.ok) throw new Error('Failed to generate custom templates');
      return response.json();
    },
    onSuccess: (data) => {
      // Add custom templates to display
      setCustomTemplates(prev => [...prev, ...data.templates]);
      setShowCustomInput(false);
      setCustomBusinessType('');
      toast({
        title: "Custom Templates Generated!",
        description: `Created ${data.templates.length} templates for ${data.businessType} businesses.`
      });
    }
  });

  // Combine catalog templates with custom templates
  const allTemplates = [...(availableTemplates?.templates || []), ...customTemplates];

  const filteredTemplates = allTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // For "other" category, show only custom templates
    if (selectedCategory === "other") {
      return template.source === "AI Generated" && matchesSearch;
    }
    
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    const matchesSource = selectedSource === "all" || template.source === selectedSource;
    return matchesSearch && matchesCategory && matchesSource;
  });

  const categories = Array.from(new Set(availableTemplates?.templates.map(t => t.category) || []));
  const sources = availableTemplates?.sources || [];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Package className="w-10 h-10 text-blue-600" />
          Template Library
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Browse 3,000+ professional templates from major open source libraries. Import only what you need.
        </p>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl mx-auto">
          <p className="text-sm text-blue-800">
            <strong>How to preview:</strong> Click any template card to open full preview, or use the "Preview" button for quick access.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-6 h-6" />
            Browse Templates ({availableTemplates?.templates.length || 0} Available)
          </CardTitle>
          <CardDescription>
            Search and filter professional templates from 6 major open source libraries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setShowCustomInput(e.target.value === "other");
                }}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
                <option value="other">Other Business Type</option>
              </select>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Sources</option>
                {sources.map(source => (
                  <option key={source.name} value={source.name}>{source.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Business Type Input */}
          {showCustomInput && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Custom Business Type</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your business type (e.g., Veterinary Clinic, Food Truck, Yoga Studio)"
                  value={customBusinessType}
                  onChange={(e) => setCustomBusinessType(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={() => {
                    if (customBusinessType.trim()) {
                      generateCustomMutation.mutate(customBusinessType.trim());
                    }
                  }}
                  disabled={!customBusinessType.trim() || generateCustomMutation.isPending}
                >
                  {generateCustomMutation.isPending ? 'Generating...' : 'Generate 27 Templates'}
                </Button>
              </div>
              <p className="text-sm text-blue-700 mt-2">
                Enter any business type and we'll generate custom templates using AI to match your specific industry needs.
              </p>
            </div>
          )}

          <div className="text-sm text-gray-600">
            Showing {filteredTemplates.length} of {availableTemplates?.templates.length || 0} templates
            {searchQuery && <span className="ml-2 text-blue-600">for "{searchQuery}"</span>}
            {selectedCategory !== "all" && selectedCategory !== "other" && <span className="ml-2 text-green-600">in {selectedCategory}</span>}
            {selectedCategory === "other" && customBusinessType && <span className="ml-2 text-green-600">for {customBusinessType}</span>}
            {selectedSource !== "all" && <span className="ml-2 text-purple-600">from {selectedSource}</span>}
          </div>
        </CardContent>
      </Card>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))
        ) : filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No templates found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredTemplates.slice(0, 100).map((template) => (
            <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105" 
                  onClick={() => window.open(`/template-preview/${template.id}`, '_blank')}
                  title={`Click to preview ${template.name}`}>
              <div className="h-48 relative overflow-hidden">
                <img 
                  src={template.thumbnailUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'} 
                  alt={template.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs font-medium text-gray-800 truncate">
                    {template.category.charAt(0).toUpperCase() + template.category.slice(1)} • {template.source}
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`/template-preview/${template.id}`, '_blank');
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      importTemplateMutation.mutate(template.id);
                    }}
                    disabled={importTemplateMutation.isPending}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Sources Overview */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-6 h-6" />
            Template Sources
          </CardTitle>
          <CardDescription>
            Professional templates from major open source libraries with commercial-friendly licenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.map((source, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{source.name}</h3>
                  <Badge variant="secondary">{source.license}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{source.description}</p>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">{source.count.toLocaleString()} available</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Smart Features */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            Smart Template Library
          </CardTitle>
          <CardDescription>
            Efficient browsing of 3,000+ templates without storage waste
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-500 mt-1" />
                <div>
                  <h4 className="font-semibold">Zero Storage Waste</h4>
                  <p className="text-sm text-gray-600">Browse all templates, import only what you need</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                <div>
                  <h4 className="font-semibold">Commercial Ready</h4>
                  <p className="text-sm text-gray-600">All templates verified for business use</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-yellow-500 mt-1" />
                <div>
                  <h4 className="font-semibold">On-Demand Access</h4>
                  <p className="text-sm text-gray-600">Instant preview and activation of any template</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-purple-500 mt-1" />
                <div>
                  <h4 className="font-semibold">Smart Filtering</h4>
                  <p className="text-sm text-gray-600">Advanced search across categories and sources</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
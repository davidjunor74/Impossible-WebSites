import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Download, 
  Upload, 
  Search, 
  Filter, 
  Eye, 
  Settings, 
  Plus,
  Package,
  Globe,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TemplateSource {
  name: string;
  url: string;
  license: string;
  categories: string[];
  count: number;
}

interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  template_data: any;
  color_schemes: any[];
  preview_url?: string;
  is_active: boolean;
}

export default function TemplateManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [importProgress, setImportProgress] = useState<{ [key: string]: number }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch template sources
  const { data: sourcesData } = useQuery({
    queryKey: ['/api/templates/sources'],
    queryFn: async () => {
      const response = await fetch('/api/templates/sources');
      if (!response.ok) throw new Error('Failed to fetch template sources');
      return response.json() as Promise<{ sources: TemplateSource[], industries: string[] }>;
    }
  });

  // Fetch templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/templates'],
    queryFn: async () => {
      const response = await fetch('/api/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json() as Promise<Template[]>;
    }
  });

  // Bulk import mutation
  const bulkImportMutation = useMutation({
    mutationFn: async ({ sources, templatesPerSource }: { sources: string[], templatesPerSource: number }) => {
      const response = await fetch('/api/templates/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sources, templatesPerSource })
      });
      if (!response.ok) throw new Error('Failed to import templates');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Import Successful",
        description: `Imported ${data.totalImported} templates from ${Object.keys(data.results).length} sources.`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
    },
    onError: (error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Industry template generation mutation
  const generateIndustryMutation = useMutation({
    mutationFn: async ({ industry, count }: { industry: string, count: number }) => {
      const response = await fetch('/api/templates/generate-industry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry, count })
      });
      if (!response.ok) throw new Error('Failed to generate industry templates');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Templates Generated",
        description: `Generated ${data.generatedCount} templates for ${data.industry} industry.`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleBulkImport = () => {
    if (selectedSources.length === 0) {
      toast({
        title: "No Sources Selected",
        description: "Please select at least one template source to import from.",
        variant: "destructive"
      });
      return;
    }

    bulkImportMutation.mutate({
      sources: selectedSources,
      templatesPerSource: 5
    });
  };

  const handleGenerateIndustry = (industry: string) => {
    generateIndustryMutation.mutate({
      industry,
      count: 10
    });
  };

  const filteredTemplates = templates?.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const categories = [...new Set(templates?.map(t => t.category) || [])];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Template Management</h1>
        <p className="text-gray-600">Import, customize, and manage hundreds of business templates</p>
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Templates</TabsTrigger>
          <TabsTrigger value="import">Import Templates</TabsTrigger>
          <TabsTrigger value="generate">Generate by Industry</TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Template Grid */}
            {templatesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="group hover:shadow-lg transition-shadow">
                    <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-t-lg overflow-hidden">
                      {template.preview_url ? (
                        <img 
                          src={template.preview_url} 
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary">
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        <Button size="sm" variant="secondary">
                          <Settings className="w-4 h-4 mr-1" />
                          Customize
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm truncate">{template.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-xs mb-3 line-clamp-2">{template.description}</p>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 text-xs">
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredTemplates.length === 0 && !templatesLoading && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Templates Found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search or import more templates.</p>
                <Button onClick={() => document.querySelector('[data-state="active"][value="import"]')?.click()}>
                  Import Templates
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="import">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Bulk Template Import
                </CardTitle>
                <CardDescription>
                  Import templates from popular open-source collections with commercial-use licenses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sourcesData?.sources.map((source) => (
                    <Card key={source.name} className={`cursor-pointer transition-all ${
                      selectedSources.includes(source.name) 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:shadow-md'
                    }`} onClick={() => {
                      setSelectedSources(prev => 
                        prev.includes(source.name)
                          ? prev.filter(s => s !== source.name)
                          : [...prev, source.name]
                      );
                    }}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{source.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {source.count}+ templates
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{source.license}</p>
                        <div className="flex flex-wrap gap-1">
                          {source.categories.slice(0, 3).map(category => (
                            <Badge key={category} variant="secondary" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                          {source.categories.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{source.categories.length - 3}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    {selectedSources.length} source{selectedSources.length !== 1 ? 's' : ''} selected
                  </div>
                  <Button 
                    onClick={handleBulkImport}
                    disabled={selectedSources.length === 0 || bulkImportMutation.isPending}
                  >
                    {bulkImportMutation.isPending ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Import Templates
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Import Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(importProgress).length === 0 ? (
                  <p className="text-gray-600 text-center py-4">No imports in progress</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(importProgress).map(([source, progress]) => (
                      <div key={source}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{source}</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="generate">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Generate Industry-Specific Templates
                </CardTitle>
                <CardDescription>
                  Auto-generate templates tailored for specific business industries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sourcesData?.industries.map((industry) => (
                    <Card key={industry} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold capitalize">{industry.replace('-', ' ')}</h3>
                          <Globe className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          Generate 10 professional templates for {industry.replace('-', ' ')} businesses
                        </p>
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleGenerateIndustry(industry)}
                          disabled={generateIndustryMutation.isPending}
                        >
                          {generateIndustryMutation.isPending ? (
                            <>
                              <Clock className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Generate Templates
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
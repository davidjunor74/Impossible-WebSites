import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Search, Sparkles, Globe, Briefcase, Heart, Trophy } from "lucide-react";

interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  subcategories: string[];
  templateTypes: string[];
  keywords: string[];
}

export default function UniversalTemplates() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [specificType, setSpecificType] = useState("");
  const [style, setStyle] = useState("modern");
  const [targetAudience, setTargetAudience] = useState("");
  const [purpose, setPurpose] = useState("business");
  const [bulkCategories, setBulkCategories] = useState<string[]>([]);
  const [templatesPerCategory, setTemplatesPerCategory] = useState(10);

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/template-categories"]
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: [`/api/template-categories/search?q=${encodeURIComponent(searchQuery)}`],
    enabled: searchQuery.length > 2
  });

  const generateTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/templates/generate-universal", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Template Generated",
        description: "Your custom template has been created successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed", 
        description: error.message || "Failed to generate template",
        variant: "destructive"
      });
    }
  });

  const bulkGenerateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/templates/generate-bulk", data);
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Bulk Generation Complete",
        description: `Generated ${data.saved} templates successfully!`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Bulk Generation Failed",
        description: error.message || "Failed to generate templates",
        variant: "destructive"
      });
    }
  });

  const seedAllMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/templates/seed-all");
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Template Database Seeded",
        description: `Created ${data.totalGenerated} templates for all categories!`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Seeding Failed",
        description: error.message || "Failed to seed template database",
        variant: "destructive"
      });
    }
  });

  const handleGenerateTemplate = () => {
    if (!selectedCategory || !specificType) {
      toast({
        title: "Missing Information",
        description: "Please select a category and specify the type",
        variant: "destructive"
      });
      return;
    }

    generateTemplateMutation.mutate({
      category: selectedCategory,
      subcategory: selectedSubcategory,
      specificType,
      style,
      targetAudience,
      purpose
    });
  };

  const handleBulkGenerate = () => {
    if (bulkCategories.length === 0) {
      toast({
        title: "No Categories Selected",
        description: "Please select categories for bulk generation",
        variant: "destructive"
      });
      return;
    }

    bulkGenerateMutation.mutate({
      categories: bulkCategories,
      templatesPerCategory
    });
  };

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case "business": return <Briefcase className="h-5 w-5" />;
      case "personal": return <Heart className="h-5 w-5" />;
      case "sports": return <Trophy className="h-5 w-5" />;
      case "creative": return <Sparkles className="h-5 w-5" />;
      default: return <Globe className="h-5 w-5" />;
    }
  };

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Universal Template Generator</h1>
        <p className="text-lg text-muted-foreground">
          Create templates for every business, career, sport, and personal interest imaginable
        </p>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="single">Single Template</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Generation</TabsTrigger>
          <TabsTrigger value="categories">Browse Categories</TabsTrigger>
          <TabsTrigger value="seed">Seed Database</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Custom Template</CardTitle>
              <CardDescription>
                Create a specific template for any business, career, or interest
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category: TemplateCategory) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        ?.find((cat: TemplateCategory) => cat.name === selectedCategory)
                        ?.subcategories.map((sub: string) => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specificType">Specific Type</Label>
                  <Input
                    id="specificType"
                    value={specificType}
                    onChange={(e) => setSpecificType(e.target.value)}
                    placeholder="e.g., Yoga Studio, Law Firm, Restaurant"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="style">Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                      <SelectItem value="elegant">Elegant</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., Young professionals, Families"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Select value={purpose} onValueChange={setPurpose}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portfolio">Portfolio</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="showcase">Showcase</SelectItem>
                      <SelectItem value="informational">Informational</SelectItem>
                      <SelectItem value="promotional">Promotional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleGenerateTemplate}
                disabled={generateTemplateMutation.isPending}
                className="w-full"
              >
                {generateTemplateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Template...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Template
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Template Generation</CardTitle>
              <CardDescription>
                Generate multiple templates across selected categories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Categories for Bulk Generation</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categories?.map((category: TemplateCategory) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={category.id}
                        checked={bulkCategories.includes(category.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBulkCategories([...bulkCategories, category.id]);
                          } else {
                            setBulkCategories(bulkCategories.filter(id => id !== category.id));
                          }
                        }}
                        className="rounded"
                      />
                      <label htmlFor={category.id} className="text-sm">
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="templatesPerCategory">Templates per Category</Label>
                <Input
                  id="templatesPerCategory"
                  type="number"
                  min="1"
                  max="50"
                  value={templatesPerCategory}
                  onChange={(e) => setTemplatesPerCategory(parseInt(e.target.value) || 10)}
                />
              </div>

              <Button 
                onClick={handleBulkGenerate}
                disabled={bulkGenerateMutation.isPending}
                className="w-full"
              >
                {bulkGenerateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Templates...
                  </>
                ) : (
                  <>
                    <Globe className="mr-2 h-4 w-4" />
                    Generate Bulk Templates
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Categories</CardTitle>
              <CardDescription>
                Explore all available template categories and subcategories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <Label htmlFor="search">Search Categories</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search categories, subcategories, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(searchQuery.length > 2 ? searchResults : categories)?.map((category: TemplateCategory) => (
                  <Card key={category.id} className="h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(category.id)}
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                      </div>
                      <CardDescription className="text-sm">
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium mb-2">Subcategories</h4>
                          <div className="flex flex-wrap gap-1">
                            {category.subcategories.slice(0, 6).map((sub: string) => (
                              <Badge key={sub} variant="secondary" className="text-xs">
                                {sub}
                              </Badge>
                            ))}
                            {category.subcategories.length > 6 && (
                              <Badge variant="outline" className="text-xs">
                                +{category.subcategories.length - 6} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Template Types</h4>
                          <div className="flex flex-wrap gap-1">
                            {category.templateTypes.slice(0, 4).map((type: string) => (
                              <Badge key={type} variant="outline" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seed Template Database</CardTitle>
              <CardDescription>
                Generate thousands of templates for all categories to build a comprehensive library
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">⚠️ Large Operation</h4>
                <p className="text-sm text-yellow-700">
                  This will generate templates for all categories and may take several minutes to complete.
                  It will create hundreds of templates covering every business type, career, sport, and personal interest.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">10</div>
                  <div className="text-sm text-muted-foreground">Categories</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">150+</div>
                  <div className="text-sm text-muted-foreground">Subcategories</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">80+</div>
                  <div className="text-sm text-muted-foreground">Template Types</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">1000+</div>
                  <div className="text-sm text-muted-foreground">Expected Templates</div>
                </div>
              </div>

              <Button 
                onClick={() => seedAllMutation.mutate()}
                disabled={seedAllMutation.isPending}
                className="w-full"
                variant="outline"
              >
                {seedAllMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Seeding Database...
                  </>
                ) : (
                  <>
                    <Globe className="mr-2 h-4 w-4" />
                    Seed All Templates
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
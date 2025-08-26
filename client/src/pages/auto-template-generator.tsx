import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Wand2, 
  Sparkles, 
  Zap, 
  Target, 
  Palette, 
  Globe, 
  Search,
  Plus,
  Eye,
  Download,
  Copy,
  Star,
  Clock,
  Users,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BusinessProfile {
  businessName: string;
  businessType: string;
  industry: string;
  targetAudience: string;
  description: string;
  goals: string[];
  preferredColors: string[];
  style: 'modern' | 'classic' | 'creative' | 'minimal' | 'corporate';
  features: string[];
}

interface GeneratedTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  features: string[];
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  layout: string;
  htmlContent: string;
  cssContent: string;
  generatedAt: string;
  businessProfile: BusinessProfile;
  quality: number;
}

const businessTypes = [
  "Restaurant", "Legal Services", "Healthcare", "Technology", "E-commerce",
  "Real Estate", "Education", "Fitness", "Beauty & Wellness", "Automotive",
  "Finance", "Consulting", "Creative Agency", "Non-profit", "Events",
  "Home Services", "Travel & Tourism", "Photography", "Construction", 
  "Manufacturing", "Agriculture", "Entertainment", "Sports", "Fashion"
];

const industries = [
  "Professional Services", "Healthcare & Medical", "Food & Beverage", 
  "Technology & Software", "Retail & E-commerce", "Real Estate & Property",
  "Education & Training", "Finance & Banking", "Legal & Law", "Creative & Design",
  "Manufacturing & Industrial", "Construction & Engineering", "Tourism & Hospitality",
  "Fitness & Sports", "Beauty & Personal Care", "Automotive & Transportation",
  "Agriculture & Farming", "Entertainment & Media", "Non-profit & Charity",
  "Government & Public Service"
];

const styleOptions = [
  { value: 'modern', label: 'Modern', description: 'Clean, contemporary design with bold elements' },
  { value: 'classic', label: 'Classic', description: 'Timeless, professional, traditional styling' },
  { value: 'creative', label: 'Creative', description: 'Artistic, unique, eye-catching design' },
  { value: 'minimal', label: 'Minimal', description: 'Simple, clean, focused on content' },
  { value: 'corporate', label: 'Corporate', description: 'Professional, trustworthy, business-focused' }
];

const featureOptions = [
  "Hero Section", "About Us", "Services/Products", "Team/Staff", "Testimonials",
  "Contact Form", "Gallery/Portfolio", "Blog", "Social Media Integration",
  "Online Booking", "E-commerce", "Newsletter Signup", "FAQ", "Location/Map",
  "Pricing Tables", "Call-to-Action Buttons", "Search Functionality", "Chat Widget"
];

const colorPalettes = [
  { name: 'Ocean Blue', colors: ['#0077be', '#00a8cc', '#40c4ff'] },
  { name: 'Forest Green', colors: ['#2e7d32', '#4caf50', '#81c784'] },
  { name: 'Sunset Orange', colors: ['#f57c00', '#ff9800', '#ffb74d'] },
  { name: 'Royal Purple', colors: ['#512da8', '#673ab7', '#9c27b0'] },
  { name: 'Professional Gray', colors: ['#424242', '#616161', '#757575'] },
  { name: 'Warm Red', colors: ['#c62828', '#f44336', '#e57373'] }
];

export default function AutoTemplateGenerator() {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTemplates, setGeneratedTemplates] = useState<GeneratedTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<GeneratedTemplate | null>(null);
  const { toast } = useToast();

  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    businessName: '',
    businessType: '',
    industry: '',
    targetAudience: '',
    description: '',
    goals: [],
    preferredColors: [],
    style: 'modern',
    features: []
  });

  // Auto-generate templates mutation
  const generateTemplatesMutation = useMutation({
    mutationFn: async (profile: BusinessProfile) => {
      const response = await fetch('/api/ai/generate-business-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (!response.ok) throw new Error('Failed to generate templates');
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedTemplates(data.templates || []);
      setStep(3);
      toast({
        title: "Templates Generated!",
        description: `Created ${data.templates?.length || 0} custom templates for your business.`
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate templates. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async (template: GeneratedTemplate) => {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: template.name,
          category: template.category,
          description: template.description,
          template_data: {
            html: template.htmlContent,
            css: template.cssContent,
            colorScheme: template.colorScheme,
            features: template.features
          },
          business_type: template.businessProfile.businessType,
          preview_url: `/preview/template/${template.id}`
        })
      });
      if (!response.ok) throw new Error('Failed to save template');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Template Saved",
        description: "Template has been saved to your library."
      });
    }
  });

  const handleGenerate = () => {
    if (!businessProfile.businessName || !businessProfile.businessType) {
      toast({
        title: "Missing Information",
        description: "Please fill in your business name and type.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    generateTemplatesMutation.mutate(businessProfile);
  };

  const handleProfileUpdate = (field: keyof BusinessProfile, value: any) => {
    setBusinessProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Business Information
          </CardTitle>
          <CardDescription>
            Tell us about your business to generate perfect templates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                placeholder="Your Business Name"
                value={businessProfile.businessName}
                onChange={(e) => handleProfileUpdate('businessName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="businessType">Business Type</Label>
              <Select
                value={businessProfile.businessType}
                onValueChange={(value) => handleProfileUpdate('businessType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={businessProfile.industry}
                onValueChange={(value) => handleProfileUpdate('industry', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map(industry => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                placeholder="e.g., Small businesses, Young professionals"
                value={businessProfile.targetAudience}
                onChange={(e) => handleProfileUpdate('targetAudience', e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Business Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what your business does and what makes it unique..."
              rows={3}
              value={businessProfile.description}
              onChange={(e) => handleProfileUpdate('description', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => setStep(2)} size="lg">
          Continue to Design Preferences
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Design Preferences
          </CardTitle>
          <CardDescription>
            Choose your preferred style and features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-semibold mb-3 block">Design Style</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {styleOptions.map(style => (
                <div
                  key={style.value}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    businessProfile.style === style.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleProfileUpdate('style', style.value)}
                >
                  <div className="font-medium">{style.label}</div>
                  <div className="text-sm text-gray-600 mt-1">{style.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold mb-3 block">Color Preferences</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {colorPalettes.map(palette => (
                <div
                  key={palette.name}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    businessProfile.preferredColors.includes(palette.name)
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    const colors = businessProfile.preferredColors.includes(palette.name)
                      ? businessProfile.preferredColors.filter(c => c !== palette.name)
                      : [...businessProfile.preferredColors, palette.name];
                    handleProfileUpdate('preferredColors', colors);
                  }}
                >
                  <div className="flex gap-1 mb-2">
                    {palette.colors.map(color => (
                      <div
                        key={color}
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="text-sm font-medium">{palette.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold mb-3 block">Required Features</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {featureOptions.map(feature => (
                <div
                  key={feature}
                  className={`p-2 text-sm rounded cursor-pointer transition-all ${
                    businessProfile.features.includes(feature)
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => {
                    const features = businessProfile.features.includes(feature)
                      ? businessProfile.features.filter(f => f !== feature)
                      : [...businessProfile.features, feature];
                    handleProfileUpdate('features', features);
                  }}
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button onClick={handleGenerate} size="lg" disabled={generateTemplatesMutation.isPending}>
          {generateTemplatesMutation.isPending ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Generating Templates...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Templates
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Generated Templates
          </CardTitle>
          <CardDescription>
            {generatedTemplates.length} custom templates created for {businessProfile.businessName}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {generatedTemplates.map((template, index) => (
          <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <div className="text-white text-center">
                  <h3 className="text-xl font-bold mb-2">{template.name}</h3>
                  <div className="flex gap-2 justify-center">
                    {Object.values(template.colorScheme).map((color, idx) => (
                      <div
                        key={idx}
                        className="w-4 h-4 rounded-full border-2 border-white"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <Badge className="absolute top-2 right-2 bg-white text-black">
                {template.category}
              </Badge>
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
                <p className="text-sm text-gray-600">{template.description}</p>
                
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">{template.quality}/10 Quality Score</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {template.features.slice(0, 3).map(feature => (
                    <Badge key={feature} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {template.features.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.features.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => saveTemplateMutation.mutate(template)}
                    disabled={saveTemplateMutation.isPending}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Use This
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => {
            setStep(1);
            setGeneratedTemplates([]);
            setBusinessProfile({
              businessName: '',
              businessType: '',
              industry: '',
              targetAudience: '',
              description: '',
              goals: [],
              preferredColors: [],
              style: 'modern',
              features: []
            });
          }}
        >
          Generate New Templates
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Zap className="w-10 h-10 text-blue-600" />
          AI Template Generator
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Create custom website templates tailored to your business in minutes using advanced AI
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-8 mb-4">
          {[1, 2, 3].map(stepNum => (
            <div key={stepNum} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= stepNum
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {stepNum}
              </div>
              <span className={`text-sm ${step >= stepNum ? 'text-blue-600' : 'text-gray-500'}`}>
                {stepNum === 1 ? 'Business Info' : stepNum === 2 ? 'Design Preferences' : 'Generated Templates'}
              </span>
            </div>
          ))}
        </div>
        <Progress value={(step / 3) * 100} className="w-full max-w-md mx-auto" />
      </div>

      {/* Step Content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">{selectedTemplate.name}</h3>
              <Button
                variant="outline"
                onClick={() => setSelectedTemplate(null)}
              >
                Close
              </Button>
            </div>
            <div className="p-4 h-96 overflow-auto">
              <div
                dangerouslySetInnerHTML={{ __html: selectedTemplate.htmlContent }}
                className="w-full h-full border rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
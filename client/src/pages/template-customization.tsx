import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Palette, 
  Type, 
  Layout, 
  Image as ImageIcon, 
  Code, 
  Eye, 
  Save, 
  Undo, 
  Redo,
  Download,
  Upload,
  Settings,
  Smartphone,
  Monitor,
  Tablet
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  template_data: any;
  color_schemes: any[];
  preview_url?: string;
}

interface CustomizationSettings {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    fontSize: string;
  };
  layout: {
    headerStyle: string;
    footerStyle: string;
    sidebarEnabled: boolean;
    containerWidth: string;
  };
  content: {
    siteName: string;
    tagline: string;
    heroText: string;
    aboutText: string;
  };
  features: {
    contactForm: boolean;
    newsletter: boolean;
    socialMedia: boolean;
    blog: boolean;
    ecommerce: boolean;
  };
}

const defaultSettings: CustomizationSettings = {
  colors: {
    primary: "#3b82f6",
    secondary: "#64748b",
    accent: "#10b981",
    background: "#ffffff",
    text: "#1f2937"
  },
  typography: {
    headingFont: "Inter",
    bodyFont: "Inter",
    fontSize: "16px"
  },
  layout: {
    headerStyle: "standard",
    footerStyle: "standard",
    sidebarEnabled: false,
    containerWidth: "1200px"
  },
  content: {
    siteName: "My Business",
    tagline: "Your success is our mission",
    heroText: "Welcome to our amazing business",
    aboutText: "We provide exceptional services to help your business grow."
  },
  features: {
    contactForm: true,
    newsletter: true,
    socialMedia: true,
    blog: false,
    ecommerce: false
  }
};

const fontOptions = [
  "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", 
  "Source Sans Pro", "Nunito", "Raleway", "Work Sans"
];

const colorSchemes = [
  { name: "Blue Ocean", primary: "#3b82f6", secondary: "#64748b", accent: "#06b6d4" },
  { name: "Forest Green", primary: "#10b981", secondary: "#374151", accent: "#f59e0b" },
  { name: "Sunset Orange", primary: "#f97316", secondary: "#6b7280", accent: "#ef4444" },
  { name: "Royal Purple", primary: "#8b5cf6", secondary: "#4b5563", accent: "#06b6d4" },
  { name: "Rose Gold", primary: "#ec4899", secondary: "#6b7280", accent: "#f59e0b" },
  { name: "Dark Mode", primary: "#6366f1", secondary: "#9ca3af", accent: "#10b981" }
];

export default function TemplateCustomization() {
  const [templateId, setTemplateId] = useState<number>(1);
  const [settings, setSettings] = useState<CustomizationSettings>(defaultSettings);
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isDirty, setIsDirty] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current template
  const { data: template, isLoading } = useQuery({
    queryKey: ['/api/templates', templateId],
    queryFn: async () => {
      const response = await fetch(`/api/templates/${templateId}`);
      if (!response.ok) throw new Error('Failed to fetch template');
      return response.json() as Promise<Template>;
    }
  });

  // Save customization mutation
  const saveCustomizationMutation = useMutation({
    mutationFn: async (customSettings: CustomizationSettings) => {
      const response = await fetch(`/api/templates/${templateId}/customize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customization: customSettings,
          template_data: {
            ...template?.template_data,
            customization: customSettings
          }
        })
      });
      if (!response.ok) throw new Error('Failed to save customization');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Customization Saved",
        description: "Your template customization has been saved successfully."
      });
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ['/api/templates', templateId] });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Generate preview mutation
  const generatePreviewMutation = useMutation({
    mutationFn: async (customSettings: CustomizationSettings) => {
      const response = await fetch(`/api/templates/${templateId}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customization: customSettings })
      });
      if (!response.ok) throw new Error('Failed to generate preview');
      return response.text();
    }
  });

  useEffect(() => {
    if (template?.template_data?.customization) {
      setSettings(template.template_data.customization);
    }
  }, [template]);

  const updateSettings = (section: keyof CustomizationSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setIsDirty(true);
  };

  const applyColorScheme = (scheme: typeof colorSchemes[0]) => {
    setSettings(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        primary: scheme.primary,
        secondary: scheme.secondary,
        accent: scheme.accent
      }
    }));
    setIsDirty(true);
  };

  const handleSave = () => {
    saveCustomizationMutation.mutate(settings);
  };

  const handlePreview = () => {
    generatePreviewMutation.mutate(settings);
    // Open preview in new tab
    window.open(`/preview/template/${templateId}?customized=true`, '_blank');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading template...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Template Customization</h1>
              <p className="text-gray-600">
                Customize "{template?.name}" to match your brand
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Preview Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={previewMode === "desktop" ? "default" : "ghost"}
                  onClick={() => setPreviewMode("desktop")}
                  className="px-3"
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={previewMode === "tablet" ? "default" : "ghost"}
                  onClick={() => setPreviewMode("tablet")}
                  className="px-3"
                >
                  <Tablet className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={previewMode === "mobile" ? "default" : "ghost"}
                  onClick={() => setPreviewMode("mobile")}
                  className="px-3"
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
              </div>
              
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!isDirty || saveCustomizationMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveCustomizationMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Customization Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Customization Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="colors" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="colors">Colors</TabsTrigger>
                    <TabsTrigger value="typography">Typography</TabsTrigger>
                    <TabsTrigger value="layout">Layout</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                  </TabsList>

                  <TabsContent value="colors" className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Color Schemes</Label>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {colorSchemes.map((scheme, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => applyColorScheme(scheme)}
                            className="flex items-center gap-2 p-2"
                          >
                            <div className="flex gap-1">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: scheme.primary }}
                              />
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: scheme.secondary }}
                              />
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: scheme.accent }}
                              />
                            </div>
                            <span className="text-xs">{scheme.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="primary-color">Primary Color</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="primary-color"
                            type="color"
                            value={settings.colors.primary}
                            onChange={(e) => updateSettings('colors', 'primary', e.target.value)}
                            className="w-12 h-8 p-1"
                          />
                          <Input
                            value={settings.colors.primary}
                            onChange={(e) => updateSettings('colors', 'primary', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="secondary-color">Secondary Color</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="secondary-color"
                            type="color"
                            value={settings.colors.secondary}
                            onChange={(e) => updateSettings('colors', 'secondary', e.target.value)}
                            className="w-12 h-8 p-1"
                          />
                          <Input
                            value={settings.colors.secondary}
                            onChange={(e) => updateSettings('colors', 'secondary', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="accent-color">Accent Color</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="accent-color"
                            type="color"
                            value={settings.colors.accent}
                            onChange={(e) => updateSettings('colors', 'accent', e.target.value)}
                            className="w-12 h-8 p-1"
                          />
                          <Input
                            value={settings.colors.accent}
                            onChange={(e) => updateSettings('colors', 'accent', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="typography" className="space-y-4">
                    <div>
                      <Label htmlFor="heading-font">Heading Font</Label>
                      <Select 
                        value={settings.typography.headingFont} 
                        onValueChange={(value) => updateSettings('typography', 'headingFont', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select heading font" />
                        </SelectTrigger>
                        <SelectContent>
                          {fontOptions.map(font => (
                            <SelectItem key={font} value={font}>{font}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="body-font">Body Font</Label>
                      <Select 
                        value={settings.typography.bodyFont} 
                        onValueChange={(value) => updateSettings('typography', 'bodyFont', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select body font" />
                        </SelectTrigger>
                        <SelectContent>
                          {fontOptions.map(font => (
                            <SelectItem key={font} value={font}>{font}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="font-size">Base Font Size</Label>
                      <Select 
                        value={settings.typography.fontSize} 
                        onValueChange={(value) => updateSettings('typography', 'fontSize', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select font size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="14px">Small (14px)</SelectItem>
                          <SelectItem value="16px">Medium (16px)</SelectItem>
                          <SelectItem value="18px">Large (18px)</SelectItem>
                          <SelectItem value="20px">Extra Large (20px)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="layout" className="space-y-4">
                    <div>
                      <Label htmlFor="header-style">Header Style</Label>
                      <Select 
                        value={settings.layout.headerStyle} 
                        onValueChange={(value) => updateSettings('layout', 'headerStyle', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select header style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="centered">Centered</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                          <SelectItem value="split">Split Layout</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="container-width">Container Width</Label>
                      <Select 
                        value={settings.layout.containerWidth} 
                        onValueChange={(value) => updateSettings('layout', 'containerWidth', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select container width" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1024px">Narrow (1024px)</SelectItem>
                          <SelectItem value="1200px">Standard (1200px)</SelectItem>
                          <SelectItem value="1400px">Wide (1400px)</SelectItem>
                          <SelectItem value="100%">Full Width</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="sidebar-enabled">Enable Sidebar</Label>
                      <Switch
                        id="sidebar-enabled"
                        checked={settings.layout.sidebarEnabled}
                        onCheckedChange={(checked) => updateSettings('layout', 'sidebarEnabled', checked)}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="space-y-4">
                    <div>
                      <Label htmlFor="site-name">Site Name</Label>
                      <Input
                        id="site-name"
                        value={settings.content.siteName}
                        onChange={(e) => updateSettings('content', 'siteName', e.target.value)}
                        placeholder="Your Business Name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="tagline">Tagline</Label>
                      <Input
                        id="tagline"
                        value={settings.content.tagline}
                        onChange={(e) => updateSettings('content', 'tagline', e.target.value)}
                        placeholder="Your business tagline"
                      />
                    </div>

                    <div>
                      <Label htmlFor="hero-text">Hero Text</Label>
                      <Textarea
                        id="hero-text"
                        value={settings.content.heroText}
                        onChange={(e) => updateSettings('content', 'heroText', e.target.value)}
                        placeholder="Main hero section text"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="about-text">About Text</Label>
                      <Textarea
                        id="about-text"
                        value={settings.content.aboutText}
                        onChange={(e) => updateSettings('content', 'aboutText', e.target.value)}
                        placeholder="About section text"
                        rows={4}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Label>Features</Label>
                      {Object.entries(settings.features).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <Label htmlFor={key} className="capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                          <Switch
                            id={key}
                            checked={value}
                            onCheckedChange={(checked) => updateSettings('features', key, checked)}
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Live Preview
                </CardTitle>
                <CardDescription>
                  See your changes in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`mx-auto border rounded-lg overflow-hidden bg-white ${
                  previewMode === "desktop" ? "max-w-full" : 
                  previewMode === "tablet" ? "max-w-2xl" : "max-w-sm"
                }`}>
                  {/* Preview Iframe */}
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    {generatePreviewMutation.isPending ? (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Generating preview...</p>
                      </div>
                    ) : (
                      <iframe
                        src={`/preview/template/${templateId}`}
                        className="w-full h-full border-0"
                        title="Template Preview"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Globe, 
  Languages, 
  Eye, 
  Download, 
  CheckCircle,
  Clock,
  MapPin,
  Wand2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  region: string;
}

interface TemplateLocalization {
  templateId: number;
  language: string;
  content: {
    siteName: string;
    tagline: string;
    heroText: string;
    aboutText: string;
    navigationItems: { [key: string]: string };
    buttonTexts: { [key: string]: string };
    sectionHeaders: { [key: string]: string };
    footerText: string;
    contactInfo: { [key: string]: string };
    metadata: {
      title: string;
      description: string;
      keywords: string[];
    };
  };
  htmlContent: string;
  cssContent: string;
}

const regionNames = {
  'global': 'Global',
  'americas': 'Americas',
  'europe': 'Europe', 
  'asia': 'Asia',
  'middle-east': 'Middle East',
  'africa': 'Africa'
};

const businessTypeOptions = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'legal', label: 'Legal Services' },
  { value: 'technology', label: 'Technology' },
  { value: 'retail', label: 'Retail' },
  { value: 'finance', label: 'Finance' },
  { value: 'education', label: 'Education' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'automotive', label: 'Automotive' }
];

export default function TemplateLocalization() {
  const [selectedTemplate, setSelectedTemplate] = useState<number>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [localizationProgress, setLocalizationProgress] = useState<{ [key: string]: number }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch supported languages
  const { data: languagesData } = useQuery({
    queryKey: ['/api/localization/languages'],
    queryFn: async () => {
      const response = await fetch('/api/localization/languages');
      if (!response.ok) throw new Error('Failed to fetch languages');
      return response.json() as Promise<{ languages: SupportedLanguage[] }>;
    }
  });

  // Fetch templates
  const { data: templates } = useQuery({
    queryKey: ['/api/templates'],
    queryFn: async () => {
      const response = await fetch('/api/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    }
  });

  // Fetch template localizations
  const { data: localizationsData } = useQuery({
    queryKey: ['/api/templates', selectedTemplate, 'localizations'],
    queryFn: async () => {
      const response = await fetch(`/api/templates/${selectedTemplate}/localizations`);
      if (!response.ok) throw new Error('Failed to fetch localizations');
      return response.json();
    },
    enabled: !!selectedTemplate
  });

  // Template localization mutation
  const localizeMutation = useMutation({
    mutationFn: async ({ templateId, targetLanguage, businessType }: { 
      templateId: number, 
      targetLanguage: string, 
      businessType: string 
    }) => {
      const response = await fetch(`/api/templates/${templateId}/localize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetLanguage, businessType })
      });
      if (!response.ok) throw new Error('Failed to localize template');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Localization Complete",
        description: `Template successfully localized to ${getLanguageName(data.localization.language)}.`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/templates', selectedTemplate, 'localizations'] });
      setLocalizationProgress(prev => ({ ...prev, [data.localization.language]: 100 }));
    },
    onError: (error) => {
      toast({
        title: "Localization Failed",
        description: error.message,
        variant: "destructive"
      });
      setLocalizationProgress(prev => ({ ...prev, [selectedLanguage]: 0 }));
    }
  });

  const handleLocalize = () => {
    if (!selectedTemplate || !selectedLanguage || !selectedBusinessType) {
      toast({
        title: "Missing Information",
        description: "Please select a template, target language, and business type.",
        variant: "destructive"
      });
      return;
    }

    setLocalizationProgress(prev => ({ ...prev, [selectedLanguage]: 0 }));
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setLocalizationProgress(prev => ({
        ...prev,
        [selectedLanguage]: Math.min((prev[selectedLanguage] || 0) + 20, 90)
      }));
    }, 500);

    localizeMutation.mutate({
      templateId: selectedTemplate,
      targetLanguage: selectedLanguage,
      businessType: selectedBusinessType
    });

    setTimeout(() => clearInterval(progressInterval), 3000);
  };

  const getLanguageName = (code: string) => {
    const language = languagesData?.languages.find(lang => lang.code === code);
    return language ? `${language.nativeName} (${language.name})` : code;
  };

  const filteredLanguages = selectedRegion === 'all' 
    ? languagesData?.languages || []
    : languagesData?.languages.filter(lang => lang.region === selectedRegion) || [];

  const groupedLanguages = filteredLanguages.reduce((groups, language) => {
    const region = language.region;
    if (!groups[region]) groups[region] = [];
    groups[region].push(language);
    return groups;
  }, {} as Record<string, SupportedLanguage[]>);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Languages className="w-8 h-8" />
          Multi-Language Template Localization
        </h1>
        <p className="text-gray-600">Translate your templates into 15+ languages for global reach</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Localization Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Template</label>
                <Select value={selectedTemplate.toString()} onValueChange={(value) => setSelectedTemplate(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates?.map((template: any) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Business Type</label>
                <Select value={selectedBusinessType} onValueChange={setSelectedBusinessType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Filter by Region</label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="All regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {Object.entries(regionNames).map(([code, name]) => (
                      <SelectItem key={code} value={code}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Target Language</label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose target language" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredLanguages.map((language) => (
                      <SelectItem key={language.code} value={language.code}>
                        <div className="flex items-center gap-2">
                          <span>{language.nativeName}</span>
                          <span className="text-xs text-gray-500">({language.name})</span>
                          {language.direction === 'rtl' && (
                            <Badge variant="secondary" className="text-xs">RTL</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleLocalize}
                disabled={!selectedTemplate || !selectedLanguage || !selectedBusinessType || localizeMutation.isPending}
                className="w-full"
              >
                {localizeMutation.isPending ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Localizing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Localize Template
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Progress Card */}
          {Object.keys(localizationProgress).length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Localization Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(localizationProgress).map(([language, progress]) => (
                    <div key={language}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{getLanguageName(language)}</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Language Selection & Management */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="languages" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="languages">Available Languages</TabsTrigger>
              <TabsTrigger value="existing">Existing Localizations</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="languages">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Supported Languages ({filteredLanguages.length})</CardTitle>
                    <CardDescription>
                      Choose from our comprehensive language support covering major global markets
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(groupedLanguages).map(([region, languages]) => (
                        <div key={region}>
                          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {regionNames[region] || region}
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {languages.map((language) => (
                              <Card 
                                key={language.code}
                                className={`cursor-pointer transition-all hover:shadow-md ${
                                  selectedLanguage === language.code 
                                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                                    : ''
                                }`}
                                onClick={() => setSelectedLanguage(language.code)}
                              >
                                <CardContent className="p-3">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium text-sm">{language.nativeName}</div>
                                      <div className="text-xs text-gray-500">{language.name}</div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {language.direction === 'rtl' && (
                                        <Badge variant="outline" className="text-xs">RTL</Badge>
                                      )}
                                      <Badge variant="secondary" className="text-xs">{language.code}</Badge>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="existing">
              <Card>
                <CardHeader>
                  <CardTitle>Current Localizations</CardTitle>
                  <CardDescription>
                    Manage existing localizations for the selected template
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {localizationsData?.availableLanguages?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {localizationsData.availableLanguages.map((langCode: string) => (
                        <Card key={langCode}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="font-medium">{getLanguageName(langCode)}</span>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4 mr-1" />
                                  Preview
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Download className="w-4 h-4 mr-1" />
                                  Export
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Languages className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Localizations Yet</h3>
                      <p className="text-gray-600 mb-4">Start by creating your first localization</p>
                      <Button onClick={() => document.querySelector('[value="languages"]')?.click()}>
                        Browse Languages
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview">
              <Card>
                <CardHeader>
                  <CardTitle>Localization Preview</CardTitle>
                  <CardDescription>
                    Preview how your template will look in different languages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 rounded-lg p-6 text-center">
                    <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Preview Coming Soon</h3>
                    <p className="text-gray-600">
                      Select a template and language to see a live preview of the localized content
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
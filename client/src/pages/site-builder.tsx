import { useState, useRef, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Save, 
  Eye, 
  Undo2, 
  Redo2,
  Type,
  Image,
  Layout,
  Palette,
  Settings,
  Plus,
  Trash2,
  Move,
  Copy,
  Monitor,
  Tablet,
  Smartphone,
  Wand2,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Block {
  id: string;
  type: 'hero' | 'text' | 'image' | 'gallery' | 'contact' | 'services' | 'testimonials' | 'cta';
  content: {
    title?: string;
    subtitle?: string;
    text?: string;
    buttonText?: string;
    buttonLink?: string;
    imageUrl?: string;
    imageAlt?: string;
    backgroundColor?: string;
    textColor?: string;
    alignment?: 'left' | 'center' | 'right';
  };
  style: {
    padding?: string;
    margin?: string;
    backgroundColor?: string;
    borderRadius?: string;
    boxShadow?: string;
  };
  order: number;
}

interface Site {
  id: number;
  name: string;
  subdomain: string;
  site_data: {
    blocks: Block[];
    globalStyles: {
      primaryColor: string;
      secondaryColor: string;
      fontFamily: string;
      containerWidth: string;
    };
  };
}

const blockTemplates = {
  hero: {
    type: 'hero',
    content: {
      title: 'Your Amazing Headline',
      subtitle: 'Compelling subtitle that explains your value proposition',
      buttonText: 'Get Started',
      buttonLink: '#contact',
      backgroundColor: '#1f2937',
      textColor: '#ffffff',
      alignment: 'center'
    },
    style: {
      padding: '80px 20px',
      backgroundColor: '#1f2937',
      borderRadius: '0px'
    }
  },
  text: {
    type: 'text',
    content: {
      title: 'Section Title',
      text: 'Your content goes here. Add compelling copy that engages your audience and clearly communicates your message.',
      alignment: 'left'
    },
    style: {
      padding: '40px 20px',
      backgroundColor: '#ffffff'
    }
  },
  services: {
    type: 'services',
    content: {
      title: 'Our Services',
      subtitle: 'What we offer',
      text: 'Professional services tailored to your needs',
      alignment: 'center'
    },
    style: {
      padding: '60px 20px',
      backgroundColor: '#f9fafb'
    }
  },
  contact: {
    type: 'contact',
    content: {
      title: 'Get In Touch',
      subtitle: 'Ready to start your project?',
      text: 'Contact us today for a free consultation',
      alignment: 'center'
    },
    style: {
      padding: '60px 20px',
      backgroundColor: '#ffffff'
    }
  },
  image: {
    type: 'image',
    content: {
      imageUrl: 'https://via.placeholder.com/600x400',
      imageAlt: 'Placeholder image',
      title: 'Image Block'
    },
    style: {
      padding: '40px 20px',
      backgroundColor: '#ffffff'
    }
  },
  gallery: {
    type: 'gallery',
    content: {
      title: 'Gallery',
      subtitle: 'Our work'
    },
    style: {
      padding: '60px 20px',
      backgroundColor: '#ffffff'
    }
  },
  testimonials: {
    type: 'testimonials',
    content: {
      title: 'What Our Clients Say',
      subtitle: 'Testimonials'
    },
    style: {
      padding: '60px 20px',
      backgroundColor: '#f8fafc'
    }
  },
  cta: {
    type: 'cta',
    content: {
      title: 'Ready to Get Started?',
      subtitle: 'Join thousands of satisfied customers',
      buttonText: 'Start Now',
      buttonLink: '#'
    },
    style: {
      padding: '60px 20px',
      backgroundColor: '#3b82f6'
    }
  }
};

const devicePresets = {
  desktop: { width: '1200px', label: 'Desktop' },
  tablet: { width: '768px', label: 'Tablet' },
  mobile: { width: '375px', label: 'Mobile' }
};

export default function SiteBuilder() {
  const { id } = useParams();
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<keyof typeof devicePresets>('desktop');
  const [isGenerating, setIsGenerating] = useState(false);
  const [undoStack, setUndoStack] = useState<Block[][]>([]);
  const [redoStack, setRedoStack] = useState<Block[][]>([]);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get template from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const templateId = urlParams.get('template');
  const siteId = id ? parseInt(id) : 1;

  // Fetch site data
  const { data: site, isLoading: siteLoading } = useQuery({
    queryKey: ['/api/sites', siteId],
    queryFn: async () => {
      const response = await fetch(`/api/sites/${siteId}`);
      if (!response.ok) {
        // If site doesn't exist and we have a template, that's ok - we'll create default content
        if (templateId) {
          return null;
        }
        throw new Error('Failed to fetch site');
      }
      return response.json() as Promise<Site>;
    },
    retry: false
  });

  // Fetch template data if template ID is provided
  const { data: templateData, isLoading: templateLoading } = useQuery({
    queryKey: ['/api/templates/catalog', templateId],
    queryFn: async () => {
      if (!templateId) return null;
      const response = await fetch('/api/templates/catalog');
      if (!response.ok) throw new Error('Failed to fetch template catalog');
      const catalog = await response.json();
      return catalog.templates.find((t: any) => t.id === templateId) || null;
    },
    enabled: !!templateId
  });

  const isLoading = siteLoading || templateLoading;

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [globalStyles, setGlobalStyles] = useState({
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
    fontFamily: 'Inter',
    containerWidth: '1200px'
  });

  useEffect(() => {
    if (site?.site_data?.blocks) {
      // Load from existing site
      setBlocks(site.site_data.blocks);
      if (site.site_data.globalStyles) {
        setGlobalStyles(site.site_data.globalStyles);
      }
    } else if (templateData && !site) {
      // Initialize with template content
      const templateBlocks = createTemplateBlocks(templateData);
      setBlocks(templateBlocks);
      setGlobalStyles({
        primaryColor: '#3b82f6',
        secondaryColor: '#10b981',
        fontFamily: 'Inter',
        containerWidth: '1200px'
      });
    } else if (!templateData && !site) {
      // Create default blocks for new site
      const defaultBlocks: Block[] = [
        {
          id: 'hero-1',
          type: 'hero',
          content: {
            title: 'Welcome to Your New Website',
            subtitle: 'Start building something amazing',
            buttonText: 'Get Started',
            buttonLink: '#',
          },
          style: {
            padding: '80px 20px',
            backgroundColor: '#f8fafc'
          },
          order: 0
        }
      ];
      setBlocks(defaultBlocks);
    }
  }, [site, templateData]);

  const createTemplateBlocks = (template: any): Block[] => {
    const blocks: Block[] = [];
    
    // Create hero block based on template
    blocks.push({
      id: 'hero-1',
      type: 'hero',
      content: {
        title: `Professional ${template.category.charAt(0).toUpperCase() + template.category.slice(1)} Solutions`,
        subtitle: `${template.description}`,
        buttonText: 'Get Started',
        buttonLink: '#contact',
      },
      style: {
        padding: '80px 20px',
        backgroundColor: '#f8fafc'
      },
      order: 0
    });

    // Add services block for business templates
    if (template.category === 'business') {
      blocks.push({
        id: 'services-1',
        type: 'services',
        content: {
          title: 'Our Services',
          subtitle: 'What we offer to help your business grow',
        },
        style: {
          padding: '60px 20px',
          backgroundColor: '#ffffff'
        },
        order: 1
      });
    }

    // Add contact block
    blocks.push({
      id: 'contact-1',
      type: 'contact',
      content: {
        title: 'Get In Touch',
        subtitle: 'Ready to get started? Contact us today',
        text: 'We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
      },
      style: {
        padding: '60px 20px',
        backgroundColor: '#f8fafc'
      },
      order: 2
    });

    return blocks;
  };

  // Save site mutation
  const saveSiteMutation = useMutation({
    mutationFn: async (siteData: { blocks: Block[], globalStyles: any }) => {
      const response = await fetch(`/api/sites/${siteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_data: siteData
        })
      });
      if (!response.ok) throw new Error('Failed to save site');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Site Saved",
        description: "Your changes have been saved successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sites', siteId] });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save your changes.",
        variant: "destructive"
      });
    }
  });

  // Auto-generate content mutation
  const generateContentMutation = useMutation({
    mutationFn: async ({ blockType, businessType }: { blockType: string, businessType: string }) => {
      const response = await fetch('/api/ai/generate-block-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockType,
          businessType,
          existingContent: blocks.map(b => ({ type: b.type, content: b.content }))
        })
      });
      if (!response.ok) throw new Error('Failed to generate content');
      return response.json();
    },
    onSuccess: (data, variables) => {
      const newBlock: Block = {
        id: `block-${Date.now()}`,
        type: variables.blockType as any,
        content: data.content,
        style: blockTemplates[variables.blockType]?.style || {},
        order: blocks.length
      };
      
      setUndoStack(prev => [...prev, blocks]);
      setBlocks(prev => [...prev, newBlock]);
      
      toast({
        title: "Content Generated",
        description: `AI-generated ${variables.blockType} block added to your site.`
      });
    }
  });

  const addBlock = (blockType: keyof typeof blockTemplates) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      ...blockTemplates[blockType],
      order: blocks.length
    };
    
    setUndoStack(prev => [...prev, blocks]);
    setRedoStack([]);
    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlock(newBlock.id);
  };

  const updateBlock = (blockId: string, updates: Partial<Block>) => {
    setUndoStack(prev => [...prev, blocks]);
    setRedoStack([]);
    setBlocks(prev => prev.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    ));
  };

  const deleteBlock = (blockId: string) => {
    setUndoStack(prev => [...prev, blocks]);
    setRedoStack([]);
    setBlocks(prev => prev.filter(block => block.id !== blockId));
    if (selectedBlock === blockId) {
      setSelectedBlock(null);
    }
  };

  const duplicateBlock = (blockId: string) => {
    const blockToDuplicate = blocks.find(b => b.id === blockId);
    if (!blockToDuplicate) return;
    
    const newBlock: Block = {
      ...blockToDuplicate,
      id: `block-${Date.now()}`,
      order: blocks.length
    };
    
    setUndoStack(prev => [...prev, blocks]);
    setRedoStack([]);
    setBlocks(prev => [...prev, newBlock]);
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const currentIndex = blocks.findIndex(b => b.id === blockId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    
    setUndoStack(prev => [...prev, blocks]);
    setRedoStack([]);
    
    const newBlocks = [...blocks];
    [newBlocks[currentIndex], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[currentIndex]];
    setBlocks(newBlocks);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    
    const previousState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, blocks]);
    setUndoStack(prev => prev.slice(0, -1));
    setBlocks(previousState);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, blocks]);
    setRedoStack(prev => prev.slice(0, -1));
    setBlocks(nextState);
  };

  const generateWebsitePreview = () => {
    const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${site?.name || 'Website'}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: ${globalStyles.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333;
        }
        .container { max-width: ${globalStyles.containerWidth}; margin: 0 auto; padding: 0 20px; }
        .hero { display: flex; align-items: center; justify-content: center; min-height: 80vh; text-align: center; }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9; }
        .btn { 
            display: inline-block; 
            padding: 12px 24px; 
            background: ${globalStyles.primaryColor}; 
            color: white; 
            text-decoration: none; 
            border-radius: 6px; 
            transition: background 0.3s;
        }
        .btn:hover { background: ${globalStyles.secondaryColor}; }
        .section { padding: 60px 0; }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        h2 { font-size: 2.5rem; margin-bottom: 1rem; }
        h3 { font-size: 1.5rem; margin-bottom: 1rem; }
        p { margin-bottom: 1rem; }
    </style>
</head>
<body>
    ${sortedBlocks.map(block => {
      const { content, style } = block;
      const containerStyle = `
        padding: ${style.padding || '40px 0'};
        background-color: ${style.backgroundColor || 'transparent'};
        border-radius: ${style.borderRadius || '0'};
        box-shadow: ${style.boxShadow || 'none'};
        color: ${content.textColor || 'inherit'};
      `;

      switch (block.type) {
        case 'hero':
          return `
            <section class="hero" style="${containerStyle}">
              <div class="container">
                <h1>${content.title || ''}</h1>
                <p>${content.subtitle || ''}</p>
                ${content.buttonText ? `<a href="${content.buttonLink || '#'}" class="btn">${content.buttonText}</a>` : ''}
              </div>
            </section>
          `;
        
        case 'text':
        case 'services':
        case 'contact':
          return `
            <section class="section" style="${containerStyle}">
              <div class="container">
                <div class="text-${content.alignment || 'left'}">
                  ${content.title ? `<h2>${content.title}</h2>` : ''}
                  ${content.subtitle ? `<h3>${content.subtitle}</h3>` : ''}
                  ${content.text ? `<p>${content.text}</p>` : ''}
                  ${content.buttonText ? `<a href="${content.buttonLink || '#'}" class="btn">${content.buttonText}</a>` : ''}
                </div>
              </div>
            </section>
          `;
        
        default:
          return '';
      }
    }).join('')}
</body>
</html>`;

    if (previewRef.current) {
      const doc = previewRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  };

  useEffect(() => {
    generateWebsitePreview();
  }, [blocks, globalStyles, previewDevice]);

  const selectedBlockData = selectedBlock ? blocks.find(b => b.id === selectedBlock) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading site builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top Toolbar */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">{site?.name} - Visual Editor</h1>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={undo}
              disabled={undoStack.length === 0}
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={redo}
              disabled={redoStack.length === 0}
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={previewDevice === 'desktop' ? 'default' : 'outline'}
              onClick={() => setPreviewDevice('desktop')}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={previewDevice === 'tablet' ? 'default' : 'outline'}
              onClick={() => setPreviewDevice('tablet')}
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={previewDevice === 'mobile' ? 'default' : 'outline'}
              onClick={() => setPreviewDevice('mobile')}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <Button
            onClick={() => saveSiteMutation.mutate({ blocks, globalStyles })}
            disabled={saveSiteMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>

          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Sidebar - Blocks & Tools */}
        <div className="w-80 bg-gray-50 border-r flex flex-col">
          <Tabs defaultValue="blocks" className="flex-1">
            <TabsList className="grid w-full grid-cols-3 m-2">
              <TabsTrigger value="blocks">Blocks</TabsTrigger>
              <TabsTrigger value="styles">Styles</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="blocks" className="flex-1 p-2">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Add Blocks</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {Object.entries(blockTemplates).map(([type, template]) => (
                        <Button
                          key={type}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => addBlock(type as keyof typeof blockTemplates)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Button>
                      ))}
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-600">AI Generate</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => {
                            setIsGenerating(true);
                            generateContentMutation.mutate({
                              blockType: 'hero',
                              businessType: 'professional'
                            });
                          }}
                          disabled={generateContentMutation.isPending}
                        >
                          <Wand2 className="w-4 h-4 mr-2" />
                          AI Hero Section
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => {
                            generateContentMutation.mutate({
                              blockType: 'services',
                              businessType: 'professional'
                            });
                          }}
                          disabled={generateContentMutation.isPending}
                        >
                          <Wand2 className="w-4 h-4 mr-2" />
                          AI Services
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Page Blocks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="max-h-60">
                        <div className="space-y-2">
                          {blocks.map((block, index) => (
                            <div
                              key={block.id}
                              className={`p-2 rounded border cursor-pointer transition-colors ${
                                selectedBlock === block.id
                                  ? 'bg-blue-50 border-blue-200'
                                  : 'bg-white hover:bg-gray-50'
                              }`}
                              onClick={() => setSelectedBlock(block.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium">
                                    {block.type.charAt(0).toUpperCase() + block.type.slice(1)}
                                  </span>
                                  <Badge variant="secondary" className="text-xs">
                                    {index + 1}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      duplicateBlock(block.id);
                                    }}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteBlock(block.id);
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 mt-1 truncate">
                                {block.content.title || block.content.text || 'No content'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="styles" className="flex-1 p-2">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Global Styles</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-xs font-medium">Primary Color</label>
                        <Input
                          type="color"
                          value={globalStyles.primaryColor}
                          onChange={(e) => setGlobalStyles(prev => ({
                            ...prev,
                            primaryColor: e.target.value
                          }))}
                          className="h-10"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Secondary Color</label>
                        <Input
                          type="color"
                          value={globalStyles.secondaryColor}
                          onChange={(e) => setGlobalStyles(prev => ({
                            ...prev,
                            secondaryColor: e.target.value
                          }))}
                          className="h-10"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Font Family</label>
                        <Select
                          value={globalStyles.fontFamily}
                          onValueChange={(value) => setGlobalStyles(prev => ({
                            ...prev,
                            fontFamily: value
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Inter">Inter</SelectItem>
                            <SelectItem value="Roboto">Roboto</SelectItem>
                            <SelectItem value="Open Sans">Open Sans</SelectItem>
                            <SelectItem value="Montserrat">Montserrat</SelectItem>
                            <SelectItem value="Poppins">Poppins</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {selectedBlockData && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Block Properties</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-xs font-medium">Title</label>
                          <Input
                            value={selectedBlockData.content.title || ''}
                            onChange={(e) => updateBlock(selectedBlock!, {
                              content: { ...selectedBlockData.content, title: e.target.value }
                            })}
                          />
                        </div>
                        {selectedBlockData.content.subtitle !== undefined && (
                          <div>
                            <label className="text-xs font-medium">Subtitle</label>
                            <Input
                              value={selectedBlockData.content.subtitle || ''}
                              onChange={(e) => updateBlock(selectedBlock!, {
                                content: { ...selectedBlockData.content, subtitle: e.target.value }
                              })}
                            />
                          </div>
                        )}
                        <div>
                          <label className="text-xs font-medium">Text Content</label>
                          <Textarea
                            value={selectedBlockData.content.text || ''}
                            onChange={(e) => updateBlock(selectedBlock!, {
                              content: { ...selectedBlockData.content, text: e.target.value }
                            })}
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium">Background Color</label>
                          <Input
                            type="color"
                            value={selectedBlockData.style.backgroundColor || '#ffffff'}
                            onChange={(e) => updateBlock(selectedBlock!, {
                              style: { ...selectedBlockData.style, backgroundColor: e.target.value }
                            })}
                            className="h-10"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium">Text Alignment</label>
                          <Select
                            value={selectedBlockData.content.alignment || 'left'}
                            onValueChange={(value) => updateBlock(selectedBlock!, {
                              content: { ...selectedBlockData.content, alignment: value as any }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="settings" className="flex-1 p-2">
              <ScrollArea className="h-full">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Site Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-xs font-medium">Site Name</label>
                      <Input value={site?.name || ''} disabled />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Subdomain</label>
                      <Input value={site?.subdomain || ''} disabled />
                    </div>
                    <Separator />
                    <Button className="w-full" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export HTML
                    </Button>
                  </CardContent>
                </Card>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Preview Area */}
        <div className="flex-1 bg-gray-100 p-4">
          <div className="h-full bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-200 px-4 py-2 text-sm text-gray-600 flex items-center justify-between">
              <span>Preview - {devicePresets[previewDevice].label}</span>
              <span className="text-xs">{devicePresets[previewDevice].width}</span>
            </div>
            <div className="h-full flex justify-center bg-gray-100 p-4">
              <div
                style={{
                  width: devicePresets[previewDevice].width,
                  maxWidth: '100%',
                  height: 'calc(100% - 2rem)',
                  backgroundColor: 'white',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}
              >
                <iframe
                  ref={previewRef}
                  className="w-full h-full border-0"
                  title="Website Preview"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
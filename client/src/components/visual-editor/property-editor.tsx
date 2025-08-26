import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Settings, 
  Palette, 
  Type, 
  Layout, 
  Image as ImageIcon,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import type { PageBlock } from "./drag-drop-canvas";

interface PropertyEditorProps {
  selectedBlock: PageBlock | null;
  onPropsChange: (blockId: string, newProps: Record<string, any>) => void;
}

export default function PropertyEditor({ selectedBlock, onPropsChange }: PropertyEditorProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    content: true,
    design: false,
    layout: false
  });

  if (!selectedBlock) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center text-gray-500">
          <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Block Selected</h3>
          <p className="text-sm">Click on a block in the canvas to edit its properties</p>
        </div>
      </div>
    );
  }

  const { type, props } = selectedBlock;

  const updateProp = (key: string, value: any) => {
    onPropsChange(selectedBlock.id, { [key]: value });
  };

  const updateNestedProp = (path: string[], value: any) => {
    const newProps = { ...props };
    let current = newProps;
    
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) current[path[i]] = {};
      current = current[path[i]];
    }
    
    current[path[path.length - 1]] = value;
    onPropsChange(selectedBlock.id, newProps);
  };

  const addArrayItem = (arrayKey: string, defaultItem: any) => {
    const currentArray = props[arrayKey] || [];
    updateProp(arrayKey, [...currentArray, defaultItem]);
  };

  const removeArrayItem = (arrayKey: string, index: number) => {
    const currentArray = props[arrayKey] || [];
    const newArray = currentArray.filter((_: any, i: number) => i !== index);
    updateProp(arrayKey, newArray);
  };

  const updateArrayItem = (arrayKey: string, index: number, newItem: any) => {
    const currentArray = props[arrayKey] || [];
    const newArray = [...currentArray];
    newArray[index] = newItem;
    updateProp(arrayKey, newArray);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const PropertySection = ({ title, section, icon, children }: {
    title: string;
    section: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <Card className="mb-4">
      <CardHeader 
        className="pb-3 cursor-pointer"
        onClick={() => toggleSection(section)}
      >
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            {title}
          </div>
          {expandedSections[section] ? 
            <ChevronDown className="w-4 h-4" /> : 
            <ChevronRight className="w-4 h-4" />
          }
        </CardTitle>
      </CardHeader>
      {expandedSections[section] && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );

  const renderContentProperties = () => {
    switch (type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={props.title || ''}
                onChange={(e) => updateProp('title', e.target.value)}
                placeholder="Enter hero title"
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Textarea
                id="subtitle"
                value={props.subtitle || ''}
                onChange={(e) => updateProp('subtitle', e.target.value)}
                placeholder="Enter hero subtitle"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="buttonText">Button Text</Label>
              <Input
                id="buttonText"
                value={props.buttonText || ''}
                onChange={(e) => updateProp('buttonText', e.target.value)}
                placeholder="Enter button text"
              />
            </div>
            <div>
              <Label htmlFor="backgroundImage">Background Image URL</Label>
              <Input
                id="backgroundImage"
                value={props.backgroundImage || ''}
                onChange={(e) => updateProp('backgroundImage', e.target.value)}
                placeholder="Enter image URL"
              />
            </div>
            <div>
              <Label>Overlay Opacity</Label>
              <div className="pt-2">
                <Slider
                  value={[props.overlayOpacity || 0.5]}
                  onValueChange={([value]) => updateProp('overlayOpacity', value)}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round((props.overlayOpacity || 0.5) * 100)}%
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="textAlign">Text Alignment</Label>
              <Select value={props.textAlign || 'center'} onValueChange={(value) => updateProp('textAlign', value)}>
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
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={props.content || ''}
                onChange={(e) => updateProp('content', e.target.value)}
                placeholder="Enter your content (HTML allowed)"
                rows={8}
                className="font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="textAlign">Text Alignment</Label>
              <Select value={props.textAlign || 'left'} onValueChange={(value) => updateProp('textAlign', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="justify">Justify</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'features':
        const features = props.features || [];
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Features</Label>
              <Button
                size="sm"
                onClick={() => addArrayItem('features', {
                  icon: 'star',
                  title: 'New Feature',
                  description: 'Feature description'
                })}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Feature
              </Button>
            </div>
            {features.map((feature: any, index: number) => (
              <Card key={index} className="p-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Feature {index + 1}</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeArrayItem('features', index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Feature title"
                    value={feature.title || ''}
                    onChange={(e) => updateArrayItem('features', index, { ...feature, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Feature description"
                    value={feature.description || ''}
                    onChange={(e) => updateArrayItem('features', index, { ...feature, description: e.target.value })}
                    rows={2}
                  />
                </div>
              </Card>
            ))}
            <div>
              <Label>Columns</Label>
              <Select value={props.columns?.toString() || '3'} onValueChange={(value) => updateProp('columns', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Column</SelectItem>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                  <SelectItem value="4">4 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="showIcons"
                checked={props.showIcons || false}
                onCheckedChange={(checked) => updateProp('showIcons', checked)}
              />
              <Label htmlFor="showIcons">Show Icons</Label>
            </div>
          </div>
        );

      case 'gallery':
        const images = props.images || [];
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Images</Label>
              <Button
                size="sm"
                onClick={() => addArrayItem('images', {
                  src: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
                  alt: 'Gallery image'
                })}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Image
              </Button>
            </div>
            {images.map((image: any, index: number) => (
              <Card key={index} className="p-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Image {index + 1}</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeArrayItem('images', index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Image URL"
                    value={image.src || ''}
                    onChange={(e) => updateArrayItem('images', index, { ...image, src: e.target.value })}
                  />
                  <Input
                    placeholder="Alt text"
                    value={image.alt || ''}
                    onChange={(e) => updateArrayItem('images', index, { ...image, alt: e.target.value })}
                  />
                </div>
              </Card>
            ))}
            <div>
              <Label>Layout</Label>
              <Select value={props.layout || 'grid'} onValueChange={(value) => updateProp('layout', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                  <SelectItem value="masonry">Masonry</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Columns</Label>
              <Select value={props.columns?.toString() || '3'} onValueChange={(value) => updateProp('columns', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Column</SelectItem>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                  <SelectItem value="4">4 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input
                id="videoUrl"
                value={props.videoUrl || ''}
                onChange={(e) => updateProp('videoUrl', e.target.value)}
                placeholder="YouTube, Vimeo, or direct video URL"
              />
            </div>
            <div>
              <Label>Aspect Ratio</Label>
              <Select value={props.aspectRatio || '16:9'} onValueChange={(value) => updateProp('aspectRatio', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                  <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                  <SelectItem value="1:1">1:1 (Square)</SelectItem>
                  <SelectItem value="21:9">21:9 (Ultra-wide)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="autoplay"
                checked={props.autoplay || false}
                onCheckedChange={(checked) => updateProp('autoplay', checked)}
              />
              <Label htmlFor="autoplay">Autoplay</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="controls"
                checked={props.controls !== false}
                onCheckedChange={(checked) => updateProp('controls', checked)}
              />
              <Label htmlFor="controls">Show Controls</Label>
            </div>
          </div>
        );

      case 'form':
        const fields = props.fields || [];
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Form Fields</Label>
              <Button
                size="sm"
                onClick={() => addArrayItem('fields', {
                  type: 'text',
                  name: 'field',
                  label: 'New Field',
                  required: false
                })}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Field
              </Button>
            </div>
            {fields.map((field: any, index: number) => (
              <Card key={index} className="p-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Field {index + 1}</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeArrayItem('fields', index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <Select value={field.type || 'text'} onValueChange={(value) => updateArrayItem('fields', index, { ...field, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="tel">Phone</SelectItem>
                      <SelectItem value="textarea">Textarea</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Field label"
                    value={field.label || ''}
                    onChange={(e) => updateArrayItem('fields', index, { ...field, label: e.target.value })}
                  />
                  <Input
                    placeholder="Field name"
                    value={field.name || ''}
                    onChange={(e) => updateArrayItem('fields', index, { ...field, name: e.target.value })}
                  />
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={field.required || false}
                      onCheckedChange={(checked) => updateArrayItem('fields', index, { ...field, required: checked })}
                    />
                    <Label>Required</Label>
                  </div>
                </div>
              </Card>
            ))}
            <div>
              <Label htmlFor="submitText">Submit Button Text</Label>
              <Input
                id="submitText"
                value={props.submitText || ''}
                onChange={(e) => updateProp('submitText', e.target.value)}
                placeholder="Send Message"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-500 py-8">
            <p>No properties available for this block type</p>
          </div>
        );
    }
  };

  const renderDesignProperties = () => (
    <div className="space-y-4">
      <div>
        <Label>Background Color</Label>
        <div className="flex gap-2 mt-1">
          <Input
            type="color"
            value={props.backgroundColor || '#ffffff'}
            onChange={(e) => updateProp('backgroundColor', e.target.value)}
            className="w-16 h-10 p-1 border rounded"
          />
          <Input
            value={props.backgroundColor || '#ffffff'}
            onChange={(e) => updateProp('backgroundColor', e.target.value)}
            placeholder="#ffffff"
            className="flex-1"
          />
        </div>
      </div>
      <div>
        <Label>Text Color</Label>
        <div className="flex gap-2 mt-1">
          <Input
            type="color"
            value={props.textColor || '#000000'}
            onChange={(e) => updateProp('textColor', e.target.value)}
            className="w-16 h-10 p-1 border rounded"
          />
          <Input
            value={props.textColor || '#000000'}
            onChange={(e) => updateProp('textColor', e.target.value)}
            placeholder="#000000"
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );

  const renderLayoutProperties = () => (
    <div className="space-y-4">
      <div>
        <Label>Padding</Label>
        <Select value={props.padding || 'medium'} onValueChange={(value) => updateProp('padding', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Margin</Label>
        <Select value={props.margin || 'medium'} onValueChange={(value) => updateProp('margin', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{type}</Badge>
          <h3 className="font-medium">Block Properties</h3>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <PropertySection
          title="Content"
          section="content"
          icon={<Type className="w-4 h-4" />}
        >
          {renderContentProperties()}
        </PropertySection>

        <PropertySection
          title="Design"
          section="design"
          icon={<Palette className="w-4 h-4" />}
        >
          {renderDesignProperties()}
        </PropertySection>

        <PropertySection
          title="Layout"
          section="layout"
          icon={<Layout className="w-4 h-4" />}
        >
          {renderLayoutProperties()}
        </PropertySection>
      </ScrollArea>
    </div>
  );
}
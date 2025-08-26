import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Type, 
  Image, 
  Layout, 
  Grid3X3, 
  Star, 
  MapPin, 
  Users, 
  Mail, 
  Phone,
  Calendar,
  ShoppingCart,
  Video,
  FileText,
  Search
} from "lucide-react";

export interface BlockData {
  id: string;
  type: string;
  category: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  preview: string;
  defaultProps: Record<string, any>;
  isPopular?: boolean;
  isPremium?: boolean;
}

export const blockCategories = [
  { id: 'all', name: 'All Blocks', icon: <Layout className="w-4 h-4" /> },
  { id: 'content', name: 'Content', icon: <Type className="w-4 h-4" /> },
  { id: 'media', name: 'Media', icon: <Image className="w-4 h-4" /> },
  { id: 'layout', name: 'Layout', icon: <Grid3X3 className="w-4 h-4" /> },
  { id: 'business', name: 'Business', icon: <Users className="w-4 h-4" /> },
  { id: 'forms', name: 'Forms', icon: <Mail className="w-4 h-4" /> },
  { id: 'ecommerce', name: 'E-commerce', icon: <ShoppingCart className="w-4 h-4" /> }
];

export const blockLibrary: BlockData[] = [
  // Content Blocks
  {
    id: 'hero-section',
    type: 'hero',
    category: 'content',
    name: 'Hero Section',
    description: 'Eye-catching header with title, subtitle, and call-to-action',
    icon: <Type className="w-5 h-5" />,
    preview: '/api/block-previews/hero-section.jpg',
    isPopular: true,
    defaultProps: {
      title: 'Welcome to Our Business',
      subtitle: 'We provide exceptional services for your needs',
      buttonText: 'Get Started',
      backgroundImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1920&h=600&fit=crop',
      overlayOpacity: 0.5,
      textAlign: 'center'
    }
  },
  {
    id: 'text-block',
    type: 'text',
    category: 'content',
    name: 'Text Block',
    description: 'Rich text editor for paragraphs, headings, and formatted content',
    icon: <FileText className="w-5 h-5" />,
    preview: '/api/block-previews/text-block.jpg',
    isPopular: true,
    defaultProps: {
      content: '<h2>About Our Company</h2><p>We are dedicated to providing exceptional service and value to our customers.</p>',
      textAlign: 'left',
      maxWidth: '100%'
    }
  },
  {
    id: 'feature-grid',
    type: 'features',
    category: 'content',
    name: 'Feature Grid',
    description: 'Showcase your services or features in a grid layout',
    icon: <Grid3X3 className="w-5 h-5" />,
    preview: '/api/block-previews/feature-grid.jpg',
    isPopular: true,
    defaultProps: {
      features: [
        { icon: 'star', title: 'Quality Service', description: 'We deliver top-notch quality in everything we do' },
        { icon: 'users', title: 'Expert Team', description: 'Our experienced professionals are here to help' },
        { icon: 'clock', title: 'Fast Delivery', description: 'Quick turnaround times without compromising quality' }
      ],
      columns: 3,
      showIcons: true
    }
  },

  // Media Blocks
  {
    id: 'image-gallery',
    type: 'gallery',
    category: 'media',
    name: 'Image Gallery',
    description: 'Display multiple images in an attractive grid or carousel',
    icon: <Image className="w-5 h-5" />,
    preview: '/api/block-previews/image-gallery.jpg',
    defaultProps: {
      images: [
        { src: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop', alt: 'Gallery Image 1' },
        { src: 'https://images.unsplash.com/photo-1560472355-b3400c4f3b26?w=400&h=300&fit=crop', alt: 'Gallery Image 2' },
        { src: 'https://images.unsplash.com/photo-1560472356-c4c1e9c7d67a?w=400&h=300&fit=crop', alt: 'Gallery Image 3' }
      ],
      layout: 'grid',
      columns: 3,
      showCaptions: false
    }
  },
  {
    id: 'video-embed',
    type: 'video',
    category: 'media',
    name: 'Video Player',
    description: 'Embed videos from YouTube, Vimeo, or upload your own',
    icon: <Video className="w-5 h-5" />,
    preview: '/api/block-previews/video-embed.jpg',
    defaultProps: {
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      autoplay: false,
      controls: true,
      aspectRatio: '16:9'
    }
  },

  // Layout Blocks
  {
    id: 'two-column',
    type: 'columns',
    category: 'layout',
    name: 'Two Columns',
    description: 'Split content into two side-by-side columns',
    icon: <Layout className="w-5 h-5" />,
    preview: '/api/block-previews/two-column.jpg',
    defaultProps: {
      columns: 2,
      gap: 'medium',
      verticalAlign: 'top',
      leftContent: '<h3>Left Column</h3><p>Content for the left side.</p>',
      rightContent: '<h3>Right Column</h3><p>Content for the right side.</p>'
    }
  },
  {
    id: 'spacer',
    type: 'spacer',
    category: 'layout',
    name: 'Spacer',
    description: 'Add vertical spacing between sections',
    icon: <Layout className="w-5 h-5" />,
    preview: '/api/block-previews/spacer.jpg',
    defaultProps: {
      height: 'medium',
      backgroundColor: 'transparent'
    }
  },

  // Business Blocks
  {
    id: 'testimonials',
    type: 'testimonials',
    category: 'business',
    name: 'Testimonials',
    description: 'Display customer reviews and testimonials',
    icon: <Star className="w-5 h-5" />,
    preview: '/api/block-previews/testimonials.jpg',
    isPopular: true,
    defaultProps: {
      testimonials: [
        { 
          name: 'John Smith', 
          company: 'ABC Corp', 
          content: 'Excellent service and professional team. Highly recommended!',
          rating: 5,
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
        },
        { 
          name: 'Sarah Johnson', 
          company: 'XYZ Inc', 
          content: 'Outstanding quality and attention to detail. Very satisfied with the results.',
          rating: 5,
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
        }
      ],
      layout: 'carousel',
      showRatings: true,
      showAvatars: true
    }
  },
  {
    id: 'team-members',
    type: 'team',
    category: 'business',
    name: 'Team Members',
    description: 'Showcase your team with photos and bios',
    icon: <Users className="w-5 h-5" />,
    preview: '/api/block-previews/team-members.jpg',
    defaultProps: {
      members: [
        {
          name: 'Dr. Emily Chen',
          role: 'Lead Specialist',
          bio: 'Over 10 years of experience in the field',
          photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
          social: { linkedin: '#', twitter: '#' }
        },
        {
          name: 'Michael Rodriguez',
          role: 'Senior Consultant',
          bio: 'Expert in customer relations and project management',
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
          social: { linkedin: '#' }
        }
      ],
      layout: 'grid',
      showBios: true,
      showSocial: true
    }
  },
  {
    id: 'business-hours',
    type: 'hours',
    category: 'business',
    name: 'Business Hours',
    description: 'Display your operating hours and contact information',
    icon: <Calendar className="w-5 h-5" />,
    preview: '/api/block-previews/business-hours.jpg',
    defaultProps: {
      hours: {
        monday: '9:00 AM - 6:00 PM',
        tuesday: '9:00 AM - 6:00 PM',
        wednesday: '9:00 AM - 6:00 PM',
        thursday: '9:00 AM - 6:00 PM',
        friday: '9:00 AM - 6:00 PM',
        saturday: '10:00 AM - 4:00 PM',
        sunday: 'Closed'
      },
      timezone: 'EST',
      showCurrentStatus: true
    }
  },
  {
    id: 'location-map',
    type: 'map',
    category: 'business',
    name: 'Location Map',
    description: 'Embed an interactive map showing your business location',
    icon: <MapPin className="w-5 h-5" />,
    preview: '/api/block-previews/location-map.jpg',
    defaultProps: {
      address: '123 Business Street, City, State 12345',
      latitude: 40.7128,
      longitude: -74.0060,
      zoom: 15,
      showMarker: true,
      height: 400
    }
  },

  // Form Blocks
  {
    id: 'contact-form',
    type: 'form',
    category: 'forms',
    name: 'Contact Form',
    description: 'Let customers get in touch with a customizable contact form',
    icon: <Mail className="w-5 h-5" />,
    preview: '/api/block-previews/contact-form.jpg',
    isPopular: true,
    defaultProps: {
      fields: [
        { type: 'text', name: 'name', label: 'Full Name', required: true },
        { type: 'email', name: 'email', label: 'Email Address', required: true },
        { type: 'tel', name: 'phone', label: 'Phone Number', required: false },
        { type: 'textarea', name: 'message', label: 'Message', required: true, rows: 4 }
      ],
      submitText: 'Send Message',
      successMessage: 'Thank you for your message! We\'ll get back to you soon.',
      layout: 'stacked'
    }
  },
  {
    id: 'newsletter-signup',
    type: 'newsletter',
    category: 'forms',
    name: 'Newsletter Signup',
    description: 'Collect email addresses for your newsletter or updates',
    icon: <Mail className="w-5 h-5" />,
    preview: '/api/block-previews/newsletter-signup.jpg',
    defaultProps: {
      title: 'Stay Updated',
      description: 'Subscribe to our newsletter for the latest updates and offers',
      placeholder: 'Enter your email address',
      buttonText: 'Subscribe',
      layout: 'inline'
    }
  },

  // E-commerce Blocks
  {
    id: 'product-showcase',
    type: 'products',
    category: 'ecommerce',
    name: 'Product Showcase',
    description: 'Display your products with images, prices, and descriptions',
    icon: <ShoppingCart className="w-5 h-5" />,
    preview: '/api/block-previews/product-showcase.jpg',
    isPremium: true,
    defaultProps: {
      products: [
        {
          id: 1,
          name: 'Premium Service Package',
          price: '$99.00',
          image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=300&fit=crop',
          description: 'Our most popular service package with everything you need'
        },
        {
          id: 2,
          name: 'Standard Service',
          price: '$49.00',
          image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=300&fit=crop',
          description: 'Great value service option for basic needs'
        }
      ],
      layout: 'grid',
      showPrices: true,
      showDescriptions: true
    }
  }
];

interface BlockLibraryProps {
  onDragStart: (block: BlockData) => void;
  searchQuery?: string;
  selectedCategory?: string;
}

export default function BlockLibrary({ onDragStart, searchQuery = '', selectedCategory = 'all' }: BlockLibraryProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [localSelectedCategory, setLocalSelectedCategory] = useState(selectedCategory);

  const filteredBlocks = blockLibrary.filter(block => {
    const matchesCategory = localSelectedCategory === 'all' || block.category === localSelectedCategory;
    const matchesSearch = !localSearchQuery || 
      block.name.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
      block.description.toLowerCase().includes(localSearchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const popularBlocks = filteredBlocks.filter(block => block.isPopular);
  const regularBlocks = filteredBlocks.filter(block => !block.isPopular);

  const handleDragStart = (e: React.DragEvent, block: BlockData) => {
    e.dataTransfer.setData('application/json', JSON.stringify(block));
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart(block);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search blocks..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 border-b">
        <div className="flex flex-wrap gap-2">
          {blockCategories.map((category) => (
            <Button
              key={category.id}
              variant={localSelectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setLocalSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              {category.icon}
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Block List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Popular Blocks */}
          {popularBlocks.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Popular Blocks
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {popularBlocks.map((block) => (
                  <Card
                    key={block.id}
                    className="cursor-grab hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(e) => handleDragStart(e, block)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {block.icon}
                          <CardTitle className="text-sm">{block.name}</CardTitle>
                        </div>
                        <div className="flex gap-1">
                          {block.isPopular && (
                            <Badge variant="secondary" className="text-xs">
                              Popular
                            </Badge>
                          )}
                          {block.isPremium && (
                            <Badge variant="outline" className="text-xs">
                              Premium
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-gray-600 mb-2">{block.description}</p>
                      <div className="w-full h-16 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                        Preview
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Blocks */}
          {regularBlocks.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {popularBlocks.length > 0 ? 'All Blocks' : 'Blocks'}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {regularBlocks.map((block) => (
                  <Card
                    key={block.id}
                    className="cursor-grab hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(e) => handleDragStart(e, block)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {block.icon}
                          <CardTitle className="text-sm">{block.name}</CardTitle>
                        </div>
                        {block.isPremium && (
                          <Badge variant="outline" className="text-xs">
                            Premium
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-gray-600 mb-2">{block.description}</p>
                      <div className="w-full h-16 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                        Preview
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {filteredBlocks.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">No blocks found</p>
              <p className="text-sm text-gray-400">Try adjusting your search or category filter</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
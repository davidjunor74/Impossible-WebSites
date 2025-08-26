import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Play,
  ChevronLeft,
  ChevronRight,
  Quote
} from "lucide-react";
import type { PageBlock } from "./drag-drop-canvas";

interface BlockRendererProps {
  block: PageBlock;
  isSelected: boolean;
  isPreviewMode: boolean;
  onPropsChange: (newProps: Record<string, any>) => void;
}

export default function BlockRenderer({ block, isSelected, isPreviewMode, onPropsChange }: BlockRendererProps) {
  const { type, props } = block;

  // Hero Section Block
  if (type === 'hero') {
    return (
      <div 
        className="relative h-96 bg-cover bg-center flex items-center justify-center"
        style={{ 
          backgroundImage: props.backgroundImage ? `url(${props.backgroundImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: props.overlayOpacity || 0.5 }}
        />
        <div className={`relative z-10 text-white text-${props.textAlign || 'center'} max-w-4xl px-6`}>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {props.title || 'Welcome to Our Business'}
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            {props.subtitle || 'We provide exceptional services for your needs'}
          </p>
          <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
            {props.buttonText || 'Get Started'}
          </Button>
        </div>
      </div>
    );
  }

  // Text Block
  if (type === 'text') {
    return (
      <div 
        className={`prose max-w-none text-${props.textAlign || 'left'}`}
        style={{ maxWidth: props.maxWidth || '100%' }}
        dangerouslySetInnerHTML={{ __html: props.content || '<p>Add your content here...</p>' }}
      />
    );
  }

  // Feature Grid Block
  if (type === 'features') {
    const features = props.features || [];
    const columns = props.columns || 3;
    
    return (
      <div className="py-16">
        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-8`}>
          {features.map((feature: any, index: number) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                {props.showIcons && (
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-blue-600" />
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Image Gallery Block
  if (type === 'gallery') {
    const images = props.images || [];
    const columns = props.columns || 3;
    
    return (
      <div className="py-8">
        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
          {images.map((image: any, index: number) => (
            <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={image.src} 
                alt={image.alt || `Gallery image ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              {props.showCaptions && image.caption && (
                <p className="mt-2 text-sm text-gray-600 text-center">{image.caption}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Video Embed Block
  if (type === 'video') {
    const getEmbedUrl = (url: string) => {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.includes('youtu.be') 
          ? url.split('/').pop()?.split('?')[0]
          : url.split('v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('vimeo.com')) {
        const videoId = url.split('/').pop();
        return `https://player.vimeo.com/video/${videoId}`;
      }
      return url;
    };

    return (
      <div className="py-8">
        <div 
          className="relative bg-black rounded-lg overflow-hidden"
          style={{ aspectRatio: props.aspectRatio || '16/9' }}
        >
          {props.videoUrl ? (
            <iframe
              src={getEmbedUrl(props.videoUrl)}
              className="w-full h-full"
              allowFullScreen
              title="Embedded video"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="text-center">
                <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Add a video URL to display content</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Two Column Layout Block
  if (type === 'columns') {
    return (
      <div className={`py-8 grid grid-cols-1 md:grid-cols-2 gap-${props.gap === 'small' ? '4' : props.gap === 'large' ? '12' : '8'}`}>
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: props.leftContent || '<h3>Left Column</h3><p>Content for the left side.</p>' }}
        />
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: props.rightContent || '<h3>Right Column</h3><p>Content for the right side.</p>' }}
        />
      </div>
    );
  }

  // Spacer Block
  if (type === 'spacer') {
    const height = props.height === 'small' ? 'h-8' : props.height === 'large' ? 'h-32' : 'h-16';
    return (
      <div 
        className={height}
        style={{ backgroundColor: props.backgroundColor || 'transparent' }}
      />
    );
  }

  // Testimonials Block
  if (type === 'testimonials') {
    const testimonials = props.testimonials || [];
    const [currentIndex, setCurrentIndex] = useState(0);
    
    if (props.layout === 'carousel') {
      const currentTestimonial = testimonials[currentIndex] || {};
      
      return (
        <div className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center px-6">
            <Quote className="w-12 h-12 text-gray-400 mx-auto mb-6" />
            <blockquote className="text-xl md:text-2xl font-medium text-gray-900 mb-8">
              "{currentTestimonial.content}"
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              {props.showAvatars && currentTestimonial.avatar && (
                <img 
                  src={currentTestimonial.avatar} 
                  alt={currentTestimonial.name}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="font-semibold">{currentTestimonial.name}</p>
                <p className="text-gray-600">{currentTestimonial.company}</p>
                {props.showRatings && currentTestimonial.rating && (
                  <div className="flex justify-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < currentTestimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            {testimonials.length > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentIndex(Math.min(testimonials.length - 1, currentIndex + 1))}
                  disabled={currentIndex === testimonials.length - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial: any, index: number) => (
            <Card key={index} className="p-6">
              <div className="flex items-start gap-4">
                {props.showAvatars && testimonial.avatar && (
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.company}</p>
                    {props.showRatings && testimonial.rating && (
                      <div className="flex mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Team Members Block
  if (type === 'team') {
    const members = props.members || [];
    
    return (
      <div className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {members.map((member: any, index: number) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <img 
                  src={member.photo} 
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                {props.showBios && (
                  <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                )}
                {props.showSocial && member.social && (
                  <div className="flex justify-center gap-2">
                    {Object.entries(member.social).map(([platform, url]: [string, any]) => (
                      <Button key={platform} variant="outline" size="sm">
                        {platform}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Business Hours Block
  if (type === 'hours') {
    const hours = props.hours || {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    return (
      <div className="py-8">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Business Hours
            </h3>
            <div className="space-y-2">
              {days.map(day => (
                <div key={day} className="flex justify-between items-center py-1">
                  <span className="capitalize font-medium">{day}</span>
                  <span className="text-gray-600">{hours[day] || 'Closed'}</span>
                </div>
              ))}
            </div>
            {props.timezone && (
              <p className="text-sm text-gray-500 mt-4">All times in {props.timezone}</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Location Map Block
  if (type === 'map') {
    return (
      <div className="py-8">
        <Card>
          <CardContent className="p-0">
            <div 
              className="w-full bg-gray-100 flex items-center justify-center text-gray-500"
              style={{ height: props.height || 400 }}
            >
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto mb-2" />
                <p className="font-medium">Interactive Map</p>
                <p className="text-sm">{props.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Contact Form Block
  if (type === 'form') {
    const fields = props.fields || [];
    
    return (
      <div className="py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <h3 className="text-2xl font-semibold mb-6 text-center">Contact Us</h3>
            <form className="space-y-4">
              {fields.map((field: any, index: number) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <Textarea 
                      placeholder={field.placeholder || field.label}
                      rows={field.rows || 3}
                    />
                  ) : (
                    <Input 
                      type={field.type || 'text'}
                      placeholder={field.placeholder || field.label}
                    />
                  )}
                </div>
              ))}
              <Button type="submit" className="w-full">
                {props.submitText || 'Send Message'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Newsletter Signup Block
  if (type === 'newsletter') {
    return (
      <div className="py-16 bg-blue-50">
        <div className="max-w-2xl mx-auto text-center px-6">
          <h3 className="text-2xl font-semibold mb-2">{props.title || 'Stay Updated'}</h3>
          <p className="text-gray-600 mb-6">{props.description}</p>
          <div className={`flex ${props.layout === 'inline' ? 'gap-2' : 'flex-col gap-4'} max-w-md mx-auto`}>
            <Input 
              type="email" 
              placeholder={props.placeholder || 'Enter your email address'}
              className="flex-1"
            />
            <Button>{props.buttonText || 'Subscribe'}</Button>
          </div>
        </div>
      </div>
    );
  }

  // Product Showcase Block
  if (type === 'products') {
    const products = props.products || [];
    
    return (
      <div className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product: any, index: number) => (
            <Card key={index} className="overflow-hidden">
              <div className="aspect-square bg-gray-100">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="pt-4">
                <h3 className="font-semibold mb-1">{product.name}</h3>
                {props.showPrices && (
                  <p className="text-lg font-bold text-blue-600 mb-2">{product.price}</p>
                )}
                {props.showDescriptions && (
                  <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                )}
                <Button className="w-full">Add to Cart</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Fallback for unknown block types
  return (
    <div className="py-8">
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-gray-500">Unknown block type: {type}</p>
        </CardContent>
      </Card>
    </div>
  );
}
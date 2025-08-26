import { Card, CardContent } from "@/components/ui/card";
import { 
  Bot, 
  Rocket, 
  Search, 
  CreditCard, 
  Smartphone, 
  Mail 
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Content Assistant",
    description: "Generate compelling copy, meta descriptions, and alt text with our OpenAI-powered assistant. Perfect for when you're stuck on what to write.",
    gradient: "gradient-primary"
  },
  {
    icon: Rocket,
    title: "One-Click Deploy",
    description: "Publish your site instantly to a free subdomain or connect your custom domain. Changes go live in seconds, not hours.",
    gradient: "gradient-secondary"
  },
  {
    icon: Search,
    title: "Built-in SEO",
    description: "Automatic sitemaps, meta tags, and performance optimization. We aim for 90+ Lighthouse scores on every site we build.",
    gradient: "bg-gradient-to-br from-purple-500 to-pink-500"
  },
  {
    icon: CreditCard,
    title: "SA Payment Gateways",
    description: "Accept payments through PayFast, Peach Payments, PayStack, and other local payment methods. Perfect for South African businesses.",
    gradient: "bg-gradient-to-br from-yellow-500 to-orange-500"
  },
  {
    icon: Smartphone,
    title: "Mobile Responsive",
    description: "Every template is fully responsive and optimized for mobile devices. Your site will look great on any screen size.",
    gradient: "bg-gradient-to-br from-green-500 to-teal-500"
  },
  {
    icon: Mail,
    title: "Email Marketing",
    description: "Automated email campaigns and social media posting to keep your audience engaged. Set it up once and let it run.",
    gradient: "bg-gradient-to-br from-red-500 to-pink-500"
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Succeed Online
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From AI-powered content generation to automatic SEO optimization, we've got you covered
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="bg-white hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className={`w-12 h-12 ${feature.gradient} rounded-lg flex items-center justify-center mb-6`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

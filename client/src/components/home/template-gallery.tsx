import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import type { Template } from "@shared/schema";

const categories = [
  { value: "all", label: "All" },
  { value: "legal", label: "Legal" },
  { value: "restaurant", label: "Restaurant" },
  { value: "healthcare", label: "Healthcare" },
  { value: "retail", label: "Retail" },
  { value: "services", label: "Services" }
];

export default function TemplateGallery() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: templates, isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates", selectedCategory !== "all" ? { category: selectedCategory } : {}],
  });

  const displayTemplates = templates?.slice(0, 6) || [];

  return (
    <section id="templates" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Industry-Specific Templates
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose from our curated collection of professional templates designed for South African businesses
          </p>
        </div>

        <div className="flex flex-wrap justify-center mb-12 gap-2">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
              className={selectedCategory === category.value ? "gradient-primary text-white" : ""}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayTemplates.map((template) => (
              <Card key={template.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative overflow-hidden">
                  <img 
                    src={template.preview_url} 
                    alt={template.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-4 left-4 right-4">
                      <Button size="sm" className="w-full bg-white text-gray-900 hover:bg-gray-100">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview Template
                      </Button>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <Badge variant="secondary" className="capitalize">
                      {template.category}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex -space-x-1">
                        {(template.color_schemes as any[])?.slice(0, 3).map((scheme, index) => (
                          <div 
                            key={index}
                            className="w-6 h-6 rounded-full border-2 border-white"
                            style={{ backgroundColor: scheme.primary }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {(template.color_schemes as any[])?.length} color schemes
                      </span>
                    </div>
                    
                    <Button size="sm" variant="ghost" className="text-primary hover:text-blue-600">
                      Use Template
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/templates">
            <Button variant="outline" size="lg">
              View All Templates
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

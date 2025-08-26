export interface TemplateCategory {
  value: string;
  label: string;
  description: string;
}

export const templateCategories: TemplateCategory[] = [
  {
    value: "legal",
    label: "Legal",
    description: "Professional templates for law firms, attorneys, and legal practices"
  },
  {
    value: "restaurant",
    label: "Restaurant",
    description: "Appetizing designs for restaurants, cafes, and food businesses"
  },
  {
    value: "healthcare",
    label: "Healthcare",
    description: "Trustworthy templates for medical practices, clinics, and healthcare providers"
  },
  {
    value: "retail",
    label: "Retail",
    description: "E-commerce ready templates for stores and retail businesses"
  },
  {
    value: "services",
    label: "Services",
    description: "Professional templates for service-based businesses and consultants"
  },
  {
    value: "automotive",
    label: "Automotive",
    description: "Dynamic templates for car dealerships, auto repair, and automotive services"
  },
  {
    value: "real-estate",
    label: "Real Estate",
    description: "Elegant templates for realtors, property management, and construction"
  },
  {
    value: "education",
    label: "Education",
    description: "Learning-focused templates for schools, tutoring, and training centers"
  },
  {
    value: "fitness",
    label: "Fitness & Sports",
    description: "Energetic templates for gyms, trainers, and sports organizations"
  },
  {
    value: "beauty",
    label: "Beauty & Wellness",
    description: "Stylish templates for salons, spas, and wellness centers"
  },
  {
    value: "technology",
    label: "Technology",
    description: "Modern templates for tech companies, startups, and IT services"
  },
  {
    value: "finance",
    label: "Finance",
    description: "Trusted templates for financial services, banks, and accounting"
  },
  {
    value: "non-profit",
    label: "Non-Profit",
    description: "Inspiring templates for charities, foundations, and community organizations"
  },
  {
    value: "events",
    label: "Events",
    description: "Festive templates for event planning, entertainment, and venues"
  },
  {
    value: "home-services",
    label: "Home Services",
    description: "Reliable templates for contractors, landscaping, and home improvement"
  },
  {
    value: "travel",
    label: "Travel",
    description: "Adventure-ready templates for travel agencies, hotels, and tourism"
  },
  {
    value: "pets",
    label: "Pet Services",
    description: "Friendly templates for veterinarians, pet care, and animal services"
  },
  {
    value: "agriculture",
    label: "Agriculture",
    description: "Natural templates for farms, agricultural services, and farming"
  },
  {
    value: "manufacturing",
    label: "Manufacturing",
    description: "Industrial templates for factories, equipment, and supply companies"
  },
  {
    value: "custom",
    label: "Custom Request",
    description: "AI-generated template for any business type you need"
  }
];

export function getCategoryLabel(categoryValue: string): string {
  const category = templateCategories.find(cat => cat.value === categoryValue);
  return category ? category.label : categoryValue;
}

export function getCategoryColor(categoryValue: string): string {
  const colors: Record<string, string> = {
    legal: "bg-blue-100 text-blue-800",
    restaurant: "bg-amber-100 text-amber-800",
    healthcare: "bg-green-100 text-green-800",
    retail: "bg-purple-100 text-purple-800",
    services: "bg-indigo-100 text-indigo-800"
  };
  
  return colors[categoryValue] || "bg-gray-100 text-gray-800";
}

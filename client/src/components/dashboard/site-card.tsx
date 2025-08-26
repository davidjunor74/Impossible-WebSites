import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, ExternalLink, Briefcase, Coffee, Store, Globe } from "lucide-react";
import type { Site } from "@shared/schema";

interface SiteCardProps {
  site: Site;
}

const getIconForSite = (siteName: string) => {
  if (siteName.toLowerCase().includes('law')) return Briefcase;
  if (siteName.toLowerCase().includes('coffee') || siteName.toLowerCase().includes('cafe')) return Coffee;
  if (siteName.toLowerCase().includes('store') || siteName.toLowerCase().includes('retail')) return Store;
  return Globe;
};

const getGradientForSite = (siteName: string) => {
  if (siteName.toLowerCase().includes('law')) return 'bg-gradient-to-br from-blue-500 to-purple-500';
  if (siteName.toLowerCase().includes('coffee') || siteName.toLowerCase().includes('cafe')) return 'bg-gradient-to-br from-green-500 to-teal-500';
  if (siteName.toLowerCase().includes('store') || siteName.toLowerCase().includes('retail')) return 'bg-gradient-to-br from-purple-500 to-pink-500';
  return 'bg-gradient-to-br from-gray-500 to-gray-600';
};

export default function SiteCard({ site }: SiteCardProps) {
  const Icon = getIconForSite(site.name);
  const gradient = getGradientForSite(site.name);
  
  const siteUrl = site.custom_domain 
    ? site.custom_domain 
    : `${site.subdomain}.impossiblewebsites.com`;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 ${gradient} rounded-lg flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{site.name}</h4>
              <p className="text-sm text-gray-600">{siteUrl}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500">
                  Visitors: {site.monthly_visitors || 0}
                </span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500">
                  SEO: {site.seo_score || 0}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={site.status === "live" ? "default" : site.status === "draft" ? "secondary" : "outline"}
              className={
                site.status === "live" 
                  ? "bg-green-100 text-green-800" 
                  : site.status === "draft"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }
            >
              {site.status.charAt(0).toUpperCase() + site.status.slice(1)}
            </Badge>
            <Button variant="ghost" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

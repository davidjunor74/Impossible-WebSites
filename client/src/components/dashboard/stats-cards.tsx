import { Card, CardContent } from "@/components/ui/card";
import { Globe, Users, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  stats?: {
    activeSites: number;
    totalVisitors: number;
    avgSeoScore: number;
    totalSites: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const statItems = [
    {
      title: "Active Sites",
      value: stats?.activeSites || 0,
      icon: Globe,
      gradient: "gradient-primary",
      textColor: "text-blue-100"
    },
    {
      title: "Monthly Visitors",
      value: stats?.totalVisitors ? `${(stats.totalVisitors / 1000).toFixed(1)}k` : "0",
      icon: Users,
      gradient: "gradient-secondary",
      textColor: "text-green-100"
    },
    {
      title: "SEO Score",
      value: stats?.avgSeoScore || 0,
      icon: TrendingUp,
      gradient: "bg-gradient-to-r from-purple-500 to-purple-600",
      textColor: "text-purple-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statItems.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className={`${stat.gradient} text-white`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${stat.textColor} text-sm`}>{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.textColor.replace('100', '200')}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

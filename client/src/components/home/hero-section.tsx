import { Button } from "@/components/ui/button";
import { Rocket, Play, Check } from "lucide-react";
import AuthButton from "@/components/ui/auth-button";
import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-built sites in minutes for{" "}
            <span className="text-brand-primary">next-to-nothing</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Choose from thousands of industry-specific templates, customize with AI assistance, 
            and deploy instantly. Perfect for South African businesses looking to get online fast.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
            <Link href="/templates">
              <Button className="w-full sm:w-auto gradient-primary text-white px-8 py-4 text-lg font-semibold hover:opacity-90 transition-all transform hover:scale-105">
                <Rocket className="w-5 h-5 mr-2" />
                Start Building Free
              </Button>
            </Link>
            
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-4 text-lg font-semibold">
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Custom domain included</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>AI content generation</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

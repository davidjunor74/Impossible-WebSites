import { Button } from "@/components/ui/button";
import { Infinity, Menu } from "lucide-react";
import { Link } from "wouter";
import AuthButton from "@/components/ui/auth-button";
import { useState } from "react";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <Infinity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ImpossibleWebsites</span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/templates" className="text-gray-600 hover:text-brand-primary transition-colors">
              Templates
            </Link>
            <Link href="/import-all" className="text-gray-600 hover:text-brand-primary transition-colors">
              Template Library
            </Link>
            <Link href="/auto-generator" className="text-gray-600 hover:text-brand-primary transition-colors">
              AI Generator
            </Link>
            <Link href="/site-builder" className="text-gray-600 hover:text-brand-primary transition-colors">
              Visual Editor
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-brand-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/domains" className="text-gray-600 hover:text-brand-primary transition-colors">
              Domains
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <AuthButton mode="signin" variant="ghost">
              Sign In
            </AuthButton>
            <Link href="/signup">
              <Button className="gradient-primary text-white hover:opacity-90">
                Get Started + FREE Domain
              </Button>
            </Link>
          </div>

          <Button 
            variant="ghost" 
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-4">
              <Link href="/templates" className="block text-gray-600 hover:text-brand-primary transition-colors">
                Templates
              </Link>
              <Link href="/import-all" className="block text-gray-600 hover:text-brand-primary transition-colors">
                Template Library
              </Link>
              <Link href="/auto-generator" className="block text-gray-600 hover:text-brand-primary transition-colors">
                AI Generator
              </Link>
              <Link href="/site-builder" className="block text-gray-600 hover:text-brand-primary transition-colors">
                Visual Editor
              </Link>
              <Link href="/template-localization" className="block text-gray-600 hover:text-brand-primary transition-colors">
                Multi-Language
              </Link>
              <a href="#pricing" className="block text-gray-600 hover:text-brand-primary transition-colors">
                Pricing
              </a>
              <a href="#features" className="block text-gray-600 hover:text-brand-primary transition-colors">
                Features
              </a>
              <Link href="/dashboard" className="block text-gray-600 hover:text-brand-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/domains" className="block text-gray-600 hover:text-brand-primary transition-colors">
                Domains
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                <AuthButton mode="signin" variant="outline" className="w-full">
                  Sign In
                </AuthButton>
                <Link href="/signup" className="w-full">
                  <Button className="w-full gradient-primary text-white">
                    Get Started + FREE Domain
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import TemplateSelection from "@/pages/template-selection";
import UniversalTemplates from "@/pages/universal-templates";
import SiteBuilder from "@/pages/site-builder";
import Billing from "@/pages/billing";
import Analytics from "@/pages/analytics";
import AdminDashboard from "@/pages/admin";
import DomainManagement from "@/pages/domain-management";
import SignupWithDomain from "@/pages/signup-with-domain";
import TemplateManagement from "@/pages/template-management";
import TemplateCustomization from "@/pages/template-customization";
import TemplateLocalization from "@/pages/template-localization";
import AutoTemplateGenerator from "@/pages/auto-template-generator";
import AutoImportAllTemplates from "@/pages/auto-import-all-templates";
import TemplatePreview from "@/pages/template-preview";
import NotFound from "@/pages/not-found";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  console.error("Runtime error:", error);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-4">We encountered an unexpected error.</p>
        <button 
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try again
        </button>
        <details className="mt-4 text-left text-sm text-gray-500">
          <summary>Error details</summary>
          <pre className="mt-2 whitespace-pre-wrap">{error.message}</pre>
        </details>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/templates" component={TemplateSelection} />
      <Route path="/universal-templates" component={UniversalTemplates} />
      <Route path="/site-builder" component={SiteBuilder} />
      <Route path="/site-builder/:id" component={SiteBuilder} />
      <Route path="/billing" component={Billing} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/domains" component={DomainManagement} />
      <Route path="/signup" component={SignupWithDomain} />
      <Route path="/template-management" component={TemplateManagement} />
      <Route path="/template-customization/:id?" component={TemplateCustomization} />
      <Route path="/template-localization" component={TemplateLocalization} />
      <Route path="/auto-generator" component={AutoTemplateGenerator} />
      <Route path="/import-all" component={AutoImportAllTemplates} />
      <Route path="/template-preview/:id" component={TemplatePreview} />
      <Route path="/admin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error("Application error:", error, errorInfo);
      }}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">
              <Router />
            </main>
            <Footer />
          </div>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

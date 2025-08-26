import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Infinity } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "signin" | "signup";
}

export default function AuthModal({ isOpen, onClose, mode }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(mode === "signup");
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
  });
  const { toast } = useToast();

  const authMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const endpoint = isSignUp ? "/api/auth/register" : "/api/auth/login";
      const payload = isSignUp ? data : { email: data.email, password: data.password };
      
      const response = await apiRequest("POST", endpoint, payload);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: isSignUp ? "Account created successfully!" : "Welcome back!",
        description: isSignUp ? "You can now start building your website." : "You've been signed in.",
      });
      onClose();
      // TODO: Store user data in auth context
    },
    onError: (error: Error) => {
      toast({
        title: "Authentication failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    authMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" aria-describedby="auth-description">
        <DialogHeader className="text-center space-y-4">
          <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto">
            <Infinity className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </DialogTitle>
          <p id="auth-description" className="text-gray-600">
            {isSignUp 
              ? "Create your account and build your first site" 
              : "Sign in to manage your websites"
            }
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange("email")}
                placeholder="your@email.com"
                required
              />
            </div>
            
            {isSignUp && (
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange("name")}
                  placeholder="John Doe"
                  required
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange("password")}
                placeholder={isSignUp ? "Create a strong password" : "Enter your password"}
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full gradient-primary text-white"
            disabled={authMutation.isPending}
          >
            {authMutation.isPending 
              ? (isSignUp ? "Creating Account..." : "Signing In...") 
              : (isSignUp ? "Create Account" : "Sign In")
            }
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" disabled>
            <SiGoogle className="w-4 h-4 mr-2 text-red-500" />
            Google
          </Button>
          <Button variant="outline" disabled>
            <div className="w-4 h-4 mr-2 bg-blue-500 rounded-sm"></div>
            Microsoft
          </Button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-primary hover:underline"
          >
            {isSignUp 
              ? "Already have an account? Sign in" 
              : "Don't have an account? Create one"
            }
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

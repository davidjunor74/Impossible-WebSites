import { useState } from "react";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/auth/auth-modal";

interface AuthButtonProps {
  mode: "signin" | "signup";
  variant?: "default" | "outline" | "ghost";
  children: React.ReactNode;
  className?: string;
}

export default function AuthButton({ mode, variant = "default", children, className }: AuthButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button 
        variant={variant}
        onClick={() => setIsModalOpen(true)}
        className={className}
      >
        {children}
      </Button>
      <AuthModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        mode={mode}
      />
    </>
  );
}

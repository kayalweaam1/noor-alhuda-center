import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

export default function BackButton({ to, label = "رجوع", className = "" }: BackButtonProps) {
  const [location, setLocation] = useLocation();
  
  const handleBack = () => {
    if (to) {
      setLocation(to);
    } else {
      // Go back in history
      window.history.back();
    }
  };
  
  return (
    <Button
      variant="outline"
      onClick={handleBack}
      className={`mb-4 ${className}`}
    >
      <ArrowRight className="w-4 h-4 ml-2" />
      {label}
    </Button>
  );
}

import { CheckCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface VerifiedBadgeProps {
  verified: boolean;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export default function VerifiedBadge({ 
  verified, 
  size = "md", 
  showTooltip = true 
}: VerifiedBadgeProps) {
  if (!verified) return null;

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const badge = (
    <CheckCircle 
      className={`${sizeClasses[size]} text-blue-500 fill-blue-500/20 inline-block`}
      aria-label="Verified"
    />
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center">
          {badge}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">Ověřený uživatel</p>
      </TooltipContent>
    </Tooltip>
  );
}

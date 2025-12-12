import { Badge } from "@/components/ui/badge";

interface ComingSoonOverlayProps {
  children: React.ReactNode;
  message?: string;
}

export function ComingSoonOverlay({ children, message = "Coming Soon" }: ComingSoonOverlayProps) {
  return (
    <div className="relative">
      <div className="opacity-30 blur-sm pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {message}
        </Badge>
      </div>
    </div>
  );
}

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StarRating({ rating, onChange, readonly = false, size = "md", className }: StarRatingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {[1, 2, 3].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(star)}
          className={cn(
            sizeClasses[size],
            star <= rating ? "text-yellow-400" : "text-gray-300",
            !readonly && "hover:text-yellow-400 transition-colors cursor-pointer",
            readonly && "cursor-default"
          )}
        >
          <Star className="w-full h-full" fill="currentColor" />
        </button>
      ))}
    </div>
  );
}

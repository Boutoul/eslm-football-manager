import { cn } from "@/lib/utils";

interface SkillRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  className?: string;
  label?: string;
}

export function SkillRating({ rating, onChange, readonly = false, className, label }: SkillRatingProps) {
  return (
    <div className={cn("flex justify-between items-center", className)}>
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
      <div className="flex space-x-1">
        {[1, 2, 3].map((level) => (
          <button
            key={level}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(level)}
            className={cn(
              "w-3 h-3 rounded-full transition-colors",
              level <= rating ? "bg-green-500" : "bg-gray-200",
              !readonly && "hover:bg-green-400 cursor-pointer",
              readonly && "cursor-default"
            )}
          />
        ))}
      </div>
    </div>
  );
}

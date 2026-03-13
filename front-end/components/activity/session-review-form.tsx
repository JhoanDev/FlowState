"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";

export interface SessionReviewData {
  rating: number; // 1 to 5
  notes: string;
}

interface SessionReviewFormProps {
  onSave: (data: SessionReviewData) => void;
  className?: string;
}

export function SessionReviewForm({ onSave, className }: SessionReviewFormProps) {
  const [rating, setRating] = React.useState<number>(0);
  const [hoverRating, setHoverRating] = React.useState<number>(0);
  const [notes, setNotes] = React.useState("");

  const handleSave = () => {
    if (rating > 0) onSave({ rating, notes });
  };

  return (
    <div className={cn("flex flex-col w-full max-w-lg mx-auto rounded-[var(--radius)] overflow-hidden border border-[var(--border)] bg-[var(--background)] animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out shadow-sm", className)}>
      
      {/* Header Block */}
      <div className="p-8 border-b border-[var(--border)] bg-[var(--border)]/10 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Session Complete
        </h2>
        <p className="text-sm text-[var(--foreground)]/60 mt-2 font-medium">
          How would you rate your focus?
        </p>
      </div>

      {/* Elegant Rating Block (Stars) */}
      <div className="flex items-center justify-center py-12 border-b border-[var(--border)] gap-3 bg-[var(--background)]">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => setRating(num)}
            onMouseEnter={() => setHoverRating(num)}
            onMouseLeave={() => setHoverRating(0)}
            className="group relative transition-transform duration-200 outline-none hover:scale-110 focus-visible:scale-110"
          >
            <Star
              className={cn(
                "w-14 h-14 transition-all duration-200",
                (hoverRating || rating) >= num
                  ? "fill-[var(--primary)] text-[var(--primary)]"
                  : "text-[var(--border)] fill-transparent"
              )}
            />
          </button>
        ))}
      </div>

      {/* Notes Input Block */}
      <div className="flex flex-col p-6 bg-[var(--background)]">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Log your thoughts, learnings, or blockers here... (optional)"
          className="w-full h-32 bg-transparent p-4 text-sm text-[var(--foreground)] rounded-[var(--radius)] border border-[var(--border)] focus:border-[var(--primary)] outline-none placeholder:text-[var(--foreground)]/40 resize-none transition-colors duration-200"
        />
      </div>

      {/* Save Button Block */}
      <div className="p-6 pt-0">
        <Button
          onClick={handleSave}
          disabled={rating === 0}
          className="w-full h-12 text-sm font-bold tracking-widest uppercase transition-all duration-200"
        >
          <Check className="h-5 w-5 mr-2" />
          Save to Logbook
        </Button>
      </div>

    </div>
  );
}

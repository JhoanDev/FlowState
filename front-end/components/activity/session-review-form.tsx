"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";
import type { SessionReviewData } from "@/types";

export type { SessionReviewData };

interface SessionReviewFormProps {
  onSave: (data: SessionReviewData) => void;
  className?: string;
}

export function SessionReviewForm({ onSave, className }: SessionReviewFormProps) {
  const [rating, setRating] = React.useState(0);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [notes, setNotes] = React.useState("");

  const handleSave = () => {
    if (rating > 0) onSave({ rating, notes });
  };

  return (
    <div
      className={cn(
        "flex flex-col w-full rounded-lg border border-border bg-card overflow-hidden shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className="p-10 border-b border-border bg-muted/20">
        <h2 className="text-xl font-semibold tracking-tight">Session Complete</h2>
        <p className="text-sm text-muted-foreground mt-2">
          How would you rate your focus?
        </p>
      </div>

      {/* Rating */}
      <div className="flex items-center px-10 py-10 gap-4 border-b border-border">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => setRating(num)}
            onMouseEnter={() => setHoverRating(num)}
            onMouseLeave={() => setHoverRating(0)}
            className="transition-all duration-200 outline-none hover:scale-125 active:scale-95"
          >
            <Star
              className={cn(
                "w-14 h-14 transition-all duration-200",
                (hoverRating || rating) >= num
                  ? "fill-primary text-primary"
                  : "text-muted fill-transparent hover:text-muted-foreground"
              )}
            />
          </button>
        ))}
      </div>

      {/* Notes */}
      <div className="p-10 pb-6">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Log your thoughts, learnings, or blockers... (optional)"
          className="w-full h-40 bg-transparent p-5 text-sm rounded-lg border border-input focus:ring-2 focus:ring-ring/50 focus:border-ring outline-none placeholder:text-muted-foreground resize-none transition-all duration-200"
        />
      </div>

      {/* Save */}
      <div className="px-10 pb-10">
        <Button
          onClick={handleSave}
          disabled={rating === 0}
          className="w-full gap-2.5"
          size="lg"
        >
          <Check className="h-5 w-5" />
          Save to Logbook
        </Button>
      </div>
    </div>
  );
}

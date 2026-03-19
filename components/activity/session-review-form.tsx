"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className={cn("flex flex-col h-auto lg:h-full", className)}>
      <CardHeader className="p-5 pb-0">
        <CardTitle className="text-base">Session Complete</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          How would you rate your focus?
        </p>
      </CardHeader>

      <CardContent className="p-5 pt-4 flex-1 flex flex-col gap-6 min-h-0">
        {/* Rating */}
        <div className="flex items-center gap-3 py-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => setRating(num)}
              onMouseEnter={() => setHoverRating(num)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-all duration-200 outline-none hover:scale-110 active:scale-95"
            >
              <Star
                className={cn(
                  "w-10 h-10 transition-all duration-200",
                  (hoverRating || rating) >= num
                    ? "fill-primary text-primary"
                    : "text-muted fill-transparent hover:text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>

        {/* Notes */}
        <div className="flex-1 flex flex-col min-h-0">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Log your thoughts, learnings, or blockers... (optional)"
            className="flex-1 min-h-0 bg-transparent p-4 text-sm rounded-lg border border-input focus:ring-2 focus:ring-ring/50 focus:border-ring outline-none placeholder:text-muted-foreground resize-none transition-all duration-200"
          />
        </div>

        {/* Save */}
        <div className="pt-4 border-t border-border shrink-0">
          <Button
            onClick={handleSave}
            disabled={rating === 0}
            className="w-full gap-2.5 text-sm"
            size="lg"
          >
            <Check className="h-4 w-4" />
            Save to Logbook
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

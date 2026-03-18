"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Clock, BookOpen, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActivityEntry } from "@/types";
import { useSettings } from "@/providers/settings-provider";

interface SessionReviewListProps {
  date: string | null;
  activities: ActivityEntry[];
  isLoading: boolean;
}

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-xs text-muted-foreground italic">No rating</span>;
  
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-3.5 w-3.5",
            star <= rating ? "fill-orange-400 text-orange-400" : "fill-accent text-accent-foreground"
          )}
        />
      ))}
    </div>
  );
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatTime(isoDate: string, use12h: boolean): string {
  return new Date(isoDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: use12h });
}

function EntryCard({ activity, use12h }: { activity: ActivityEntry, use12h: boolean }) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-card hover:border-muted-foreground/30 transition-colors">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Badge */}
          <Badge variant={activity.type === "WORK" ? "work" : "study"} className="text-[10px] font-bold px-1.5 py-0.5">
            {activity.type}
          </Badge>

          {/* Project/Tags */}
          {activity.projectName && (
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-md border border-border bg-background"
              style={{ color: activity.projectColor ?? undefined }}
            >
              <Layers className="h-3 w-3" />
              {activity.projectName}
            </span>
          )}
          {activity.tags.map((tag) => (
            <span
              key={tag.name}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-md border border-border bg-background"
              style={{ color: tag.color }}
            >
              <BookOpen className="h-3 w-3" />
              {tag.name}
            </span>
          ))}
        </div>

        {/* Meta info right */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-medium">{formatDuration(activity.durationSeconds)}</span>
            <span className="opacity-50">({formatTime(activity.startedAt, use12h)})</span>
          </div>
          <div className="h-4 w-[1px] bg-border" />
          <StarRating rating={activity.rating} />
        </div>
      </div>

      {/* Diary Notes */}
      <div className="mt-1 p-3 rounded-md bg-muted/50 border border-border/50 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
        {activity.notes ? (
          activity.notes
        ) : (
          <span className="text-muted-foreground italic">No diary notes were written for this session.</span>
        )}
      </div>
    </div>
  );
}

export function SessionReviewList({ date, activities, isLoading }: SessionReviewListProps) {
  const { settings } = useSettings();
  const use12h = settings?.timeFormat === "12h";

  if (!date) {
    return (
      <Card className="flex flex-col h-full items-center justify-center border-dashed">
        <div className="text-center space-y-2">
          <BookOpen className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
          <p className="text-sm font-medium text-muted-foreground">Select a day from the calendar to view its diary</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full min-h-0 bg-accent/10">
      <CardHeader className="p-5 pb-4 border-b border-border shrink-0 bg-card">
        <CardTitle className="text-lg flex items-center gap-2">
          Session Diary
          <span className="text-sm font-normal text-muted-foreground ml-2">
            ({date})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 flex-1 min-h-0 overflow-y-auto space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 rounded-lg border border-border space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-16 w-full" />
            </div>
          ))
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-full border border-dashed border-muted-foreground/30 flex items-center justify-center">
              <span className="text-muted-foreground">O_O</span>
            </div>
            <p className="text-sm text-muted-foreground">No sessions recorded on this date.</p>
          </div>
        ) : (
          activities.map((activity) => (
            <EntryCard key={activity.id} activity={activity} use12h={use12h} />
          ))
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { List } from "lucide-react";
import type { ActivityEntry } from "@/types";

interface RecentActivityProps {
  data: ActivityEntry[] | null;
  isLoading: boolean;
  title?: string;
  emptyMessage?: string;
  hideCard?: boolean;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function ActivityItem({ activity }: { activity: ActivityEntry }) {
  return (
    <div className="flex items-start gap-2 xl:gap-3 py-1.5 xl:py-2.5 px-2 xl:px-3 rounded-md border-b border-border last:border-0 transition-all duration-200 hover:bg-accent group cursor-default">
      <Badge
        variant={activity.type === "WORK" ? "work" : "study"}
        className="mt-0.5 shrink-0 text-[8px] xl:text-[10px] font-bold px-1 xl:px-1.5 py-0 xl:py-0.5 leading-none"
      >
        {activity.type === "WORK" ? "WK" : "ST"}
      </Badge>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1.5 xl:gap-2">
          <div className="flex items-center gap-1 xl:gap-1.5 min-w-0 overflow-hidden">
            {activity.projectName && (
              <span
                className="inline-flex items-center gap-1 text-[8px] xl:text-[10px] font-semibold px-1 xl:px-1.5 py-0 xl:py-0.5 rounded border border-border shrink-0 leading-none"
                style={{ color: activity.projectColor ?? undefined }}
              >
                <span
                  className="h-1 w-1 xl:h-1.5 xl:w-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: activity.projectColor ?? undefined }}
                />
                {activity.projectName}
              </span>
            )}
            {activity.tags.slice(0, 2).map((tag) => (
              <span
                key={tag.name}
                className="inline-flex items-center gap-1 text-[8px] xl:text-[10px] font-medium px-1 xl:px-1.5 py-0 xl:py-0.5 rounded border border-border shrink-0 leading-none"
                style={{ color: tag.color }}
              >
                <span
                  className="h-1 w-1 xl:h-1.5 xl:w-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
              </span>
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground shrink-0">{formatTimeAgo(activity.startedAt)}</span>
        </div>
        <div className="flex items-center gap-1.5 xl:gap-2 mt-0.5 xl:mt-1">
          <span className="text-[8px] xl:text-[10px] font-medium text-muted-foreground bg-muted px-1 xl:px-1.5 py-0 xl:py-0.5 rounded shrink-0 leading-none">
            {formatDuration(activity.durationSeconds)}
          </span>
          <span className="text-[8px] xl:text-[10px] text-muted-foreground truncate mx-0.5">
            {activity.notes}
          </span>
        </div>
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="flex items-start gap-3 py-2.5 px-3">
      <Skeleton className="h-5 w-8 rounded" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-14" />
        </div>
        <Skeleton className="h-3 w-44" />
      </div>
    </div>
  );
}

export function RecentActivity({ 
  data, 
  isLoading, 
  title = "Recent Sessions", 
  emptyMessage = "No sessions recorded yet.",
  hideCard = false
}: RecentActivityProps) {
  
  const content = (
    <>
      <div className="p-3 xl:p-4 pb-0 shrink-0">
        <h3 className="text-xs xl:text-sm font-semibold leading-none tracking-tight flex items-center gap-1.5">
          <List className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-muted-foreground" />
          {title}
        </h3>
      </div>
      <div className="p-3 xl:p-4 pt-1.5 xl:pt-2 flex-1 min-h-0 md:overflow-y-auto">
        {isLoading || !data ? (
          <div className="space-y-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <ActivitySkeleton key={i} />
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            {emptyMessage}
          </p>
        ) : (
          data.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        )}
      </div>
    </>
  );

  if (hideCard) {
    return <div className="flex flex-col min-h-0 h-full">{content}</div>;
  }

  return (
    <Card className="flex flex-col min-h-0 md:h-full">
      {content}
    </Card>
  );
}

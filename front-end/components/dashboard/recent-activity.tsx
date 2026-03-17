"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ActivityEntry } from "@/types";

interface RecentActivityProps {
  data: ActivityEntry[] | null;
  isLoading: boolean;
}

function ActivityItem({ activity }: { activity: ActivityEntry }) {
  return (
    <div className="flex items-start gap-4 py-4 -mx-2 px-3 rounded-lg border-b border-border last:border-0 transition-colors duration-200 hover:bg-accent group cursor-default">
      <Badge
        variant={activity.type === "WORK" ? "work" : "study"}
        className="mt-0.5 shrink-0 text-xs font-bold"
      >
        {activity.type === "WORK" ? "WK" : "ST"}
      </Badge>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium truncate">{activity.category}</span>
          <span className="text-xs text-muted-foreground shrink-0">{activity.timeAgo}</span>
        </div>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md shrink-0">
            {activity.duration}
          </span>
          <span className="text-sm text-muted-foreground truncate">
            {activity.notes}
          </span>
        </div>
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="flex items-start gap-4 py-4 px-3">
      <Skeleton className="h-6 w-10 rounded-md" />
      <div className="flex-1 space-y-2.5">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-4 w-56" />
      </div>
    </div>
  );
}

export function RecentActivity({ data, isLoading }: RecentActivityProps) {
  return (
    <Card className="col-span-3 flex flex-col">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your most recently completed sessions.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {isLoading || !data ? (
          <div className="space-y-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <ActivitySkeleton key={i} />
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No sessions recorded yet.
          </p>
        ) : (
          data.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        )}
      </CardContent>
    </Card>
  );
}

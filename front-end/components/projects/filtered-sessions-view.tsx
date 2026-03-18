"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getActivitiesByProject, getActivitiesByTag } from "@/services/dashboard";
import type { ActivityEntry } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Star, Activity, PlusCircle, Calendar as CalendarIcon, BookOpen, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/providers/settings-provider";

interface FilteredSessionsViewProps {
  type: "PROJECT" | "TAG" | null;
  id: number | null;
  itemName: string;
  itemColor: string;
  onClear: () => void;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}


export function FilteredSessionsView({ type, id, itemName, itemColor, onClear }: FilteredSessionsViewProps) {
  const { settings } = useSettings();
  const locale = settings?.dateFormat === "BR" ? "pt-BR" : "en-US";

  function formatDate(isoDate: string): string {
    return new Date(isoDate).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
  }

  function formatTime(isoDate: string): string {
    const d = new Date(isoDate);
    const use12h = settings?.timeFormat === "12h";
    return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "numeric", hour12: use12h }).format(d);
  }

  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!type || id === null) {
      setActivities([]);
      return;
    }

    let active = true;
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const data = type === "PROJECT" 
          ? await getActivitiesByProject(id)
          : await getActivitiesByTag(id);
        
        if (active) setActivities(data);
      } catch (err) {
        console.error(err);
        if (active) setActivities([]);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchActivities();
    return () => { active = false; };
  }, [type, id]);

  if (!type || id === null) {
    return (
      <Card className="flex flex-col h-full border-dashed items-center justify-center bg-transparent">
        <div className="text-center space-y-3 px-6 max-w-sm">
           <div className="h-14 w-14 rounded-2xl bg-accent/50 flex items-center justify-center mx-auto mb-2 text-muted-foreground/50 border border-border">
             <Activity className="h-6 w-6" />
           </div>
           <h3 className="text-lg font-bold text-foreground">Explore Data</h3>
           <p className="text-sm text-muted-foreground">
              Select a project or a tag from the left panel to filter your sessions and explore your historical tracking.
           </p>
        </div>
      </Card>
    );
  }

  // Aggregate stats
  const totalSeconds = activities.reduce((sum, s) => sum + s.durationSeconds, 0);
  const exactHours = Math.round(totalSeconds / 360) / 10;
  const sessionCount = activities.length;
  
  const rated = activities.filter(a => a.rating !== null);
  const avgRating = rated.length > 0 
    ? (rated.reduce((sum, s) => sum + s.rating!, 0) / rated.length).toFixed(1) 
    : "N/A";

  return (
    <Card className="flex flex-col h-full overflow-hidden border-border bg-card shadow-sm">
      <CardHeader className="p-5 border-b border-border/50 shrink-0 bg-transparent flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${itemColor}20` }}>
             {type === "PROJECT" ? (
               <Layers className="h-5 w-5" style={{ color: itemColor }} />
             ) : (
               <BookOpen className="h-5 w-5" style={{ color: itemColor }} />
             )}
           </div>
           <div>
             <CardTitle className="text-xl font-bold truncate max-w-[200px] xl:max-w-[300px]">
               {itemName}
             </CardTitle>
             <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">
               {type === "PROJECT" ? "Work Project" : "Study Tag"}
             </div>
           </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClear} className="text-xs h-8 px-3 text-muted-foreground hover:text-foreground">
          Clear Filter
        </Button>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 flex flex-col min-h-0 bg-accent/5">
        {/* Top Stats Banner */}
        <div className="grid grid-cols-3 divide-x divide-border/50 border-b border-border/50 bg-card shrink-0">
           <div className="p-4 flex flex-col items-center justify-center">
             <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Time</span>
             <div className="flex items-center gap-1.5 text-foreground font-mono">
               <Clock className="w-4 h-4 text-primary" />
               <span className="text-xl font-bold">{exactHours}h</span>
             </div>
           </div>
           <div className="p-4 flex flex-col items-center justify-center">
             <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Sessions</span>
             <div className="flex items-center gap-1.5 text-foreground font-mono">
               <CalendarIcon className="w-4 h-4 text-primary" />
               <span className="text-xl font-bold">{sessionCount}</span>
             </div>
           </div>
           <div className="p-4 flex flex-col items-center justify-center">
             <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Avg Rating</span>
             <div className="flex items-center gap-1.5 text-foreground font-mono">
               <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
               <span className="text-xl font-bold">{avgRating}</span>
             </div>
           </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-0">
          <h4 className="text-sm font-bold text-foreground mb-4">Historical Records</h4>
          
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-60">
               <PlusCircle className="w-8 h-8 text-muted-foreground mb-3" />
               <p className="text-sm font-semibold">No records explicitly mapped to this {type.toLowerCase()}.</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="p-3 rounded-lg border border-border/60 bg-card flex flex-col gap-2 hover:border-primary/40 transition-colors">
                 <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Project Badge */}
                      {activity.projectName && (
                         <span 
                           className={cn("text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm", 
                             type === "PROJECT" ? "text-background shadow-sm" : "bg-accent/40 text-muted-foreground"
                           )} 
                           style={{ 
                             backgroundColor: type === "PROJECT" ? (activity.projectColor || "currentColor") : undefined,
                             color: type !== "PROJECT" ? activity.projectColor || undefined : undefined
                           }}
                         >
                           {activity.projectName}
                         </span>
                      )}
                      
                      {/* Tags Badges */}
                      {activity.tags.map(t => {
                         const isTarget = type === "TAG" && t.name === itemName;
                         return (
                           <span 
                             key={t.name} 
                             className={cn("text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm", 
                               isTarget ? "text-background shadow-sm" : "bg-accent/40 text-muted-foreground"
                             )} 
                             style={{ 
                               backgroundColor: isTarget ? t.color : undefined,
                               color: !isTarget ? t.color : undefined
                             }}
                           >
                             {t.name}
                           </span>
                         );
                      })}
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                       {activity.rating && (
                          <span className="text-[11px] font-bold flex items-center gap-0.5 text-orange-400">
                             {activity.rating} <Star className="w-3 h-3 fill-orange-400" />
                          </span>
                       )}
                       <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                         <Clock className="w-3 h-3" />
                         {formatDuration(activity.durationSeconds)}
                       </span>
                    </div>
                 </div>

                 {activity.notes && (
                    <div className="text-[13px] text-foreground/90 italic whitespace-pre-wrap leading-relaxed px-0.5">
                      &quot;{activity.notes}&quot;
                    </div>
                 )}
                 
                 <div className="text-[9px] font-mono font-medium text-muted-foreground/60 uppercase text-right">
                   {formatDate(activity.startedAt)} • {formatTime(activity.startedAt)}
                 </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

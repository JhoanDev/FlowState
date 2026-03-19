"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Trophy, Briefcase, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TopRatedItem {
  id: string;
  name: string;
  color: string;
  averageRating: number;
  totalSessions: number;
}

interface TopRatedRankingProps {
  workItems: TopRatedItem[];
  studyItems: TopRatedItem[];
  isLoading: boolean;
}

export function TopRatedRanking({ workItems, studyItems, isLoading }: TopRatedRankingProps) {
  const [activeTab, setActiveTab] = useState<"WORK" | "STUDY">("WORK");

  const items = activeTab === "WORK" ? workItems : studyItems;
  const isWork = activeTab === "WORK";

  return (
    <Card className="flex flex-col h-full bg-card shadow-none border-border">
      <CardHeader className="p-4 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-3 justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            Top Rated
          </CardTitle>
          <div className="flex gap-1 bg-accent/30 p-1 rounded-md">
            <Button
              variant={isWork ? "secondary" : "ghost"}
              size="sm"
              className={cn("h-7 px-3 text-xs font-semibold", isWork && "bg-background text-foreground shadow-sm")}
              onClick={() => setActiveTab("WORK")}
            >
              <Briefcase className="w-3 h-3 mr-1.5" />
              Work
            </Button>
            <Button
              variant={!isWork ? "secondary" : "ghost"}
              size="sm"
              className={cn("h-7 px-3 text-xs font-semibold", !isWork && "bg-background text-foreground shadow-sm")}
              onClick={() => setActiveTab("STUDY")}
            >
               <BookOpen className="w-3 h-3 mr-1.5" />
               Study
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 flex-1 min-h-[220px] overflow-y-auto space-y-3">
        {isLoading ? (
           Array.from({ length: 4 }).map((_, i) => (
             <Skeleton key={i} className="h-12 w-full rounded-md" />
           ))
        ) : items.length === 0 ? (
           <div className="flex h-full items-center justify-center text-sm text-muted-foreground italic">
             No rated sessions available.
           </div>
        ) : (
           items.map((item, index) => (
             <div 
               key={item.id}
               className="flex items-center group justify-between p-3 rounded-md border border-border/60 bg-transparent hover:border-border transition-colors cursor-default"
             >
                <div className="flex items-center gap-3">
                   <span className="text-xs font-bold text-muted-foreground w-4 text-center">
                     #{index + 1}
                   </span>
                   <div 
                     className="w-2.5 h-2.5 rounded-full" 
                     style={{ backgroundColor: item.color || "currentColor" }}
                   />
                   <div className="flex flex-col">
                     <span className="text-sm font-bold text-foreground truncate max-w-[140px] leading-tight">
                       {item.name}
                     </span>
                     <span className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                       {item.totalSessions} sessions
                     </span>
                   </div>
                </div>

                <div className="flex items-center gap-1.5 bg-accent/40 px-2 py-1 rounded">
                   <Star className="h-3.5 w-3.5 text-orange-400 fill-orange-400" />
                   <span className="text-sm font-bold font-mono text-foreground">
                      {item.averageRating.toFixed(1)}
                   </span>
                </div>
             </div>
           ))
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Briefcase, BookOpen, Star } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

// silence unused imports
void Button;

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
  const router = useRouter();
  const { t } = useTranslation();

  const items = activeTab === "WORK" ? workItems : studyItems;
  const isWork = activeTab === "WORK";
  void isWork;

  return (
    <Card className="flex flex-col h-full bg-card border-border">
      <CardHeader className="p-3 xl:p-4 pb-0 shrink-0">
        <div className="flex items-center gap-2 xl:gap-3 justify-between">
          <CardTitle className="text-xs xl:text-sm flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-primary" />
            {t("dashboard.topRated")}
          </CardTitle>
          <div className={cn("relative flex p-0.5 bg-accent/30 rounded-[10px]", activeTab === "WORK" ? "theme-work" : "theme-study")}>
            {(["WORK", "STUDY"] as const).map((tab) => {
              const isActive = activeTab === tab;
              const isWorkTab = tab === "WORK";
              const Icon = isWorkTab ? Briefcase : BookOpen;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "relative z-10 flex items-center justify-center h-6 xl:h-7 px-2 xl:px-3 text-[10px] xl:text-xs font-bold transition-colors duration-200 rounded-lg",
                    isActive
                      ? "text-primary-foreground cursor-default"
                      : "text-muted-foreground hover:text-foreground cursor-pointer"
                  )}
                >
                  <Icon className="w-2.5 h-2.5 xl:w-3 xl:h-3 mr-1 xl:mr-1.5" />
                  {isWorkTab ? t("session.work") : t("session.study")}
                  {isActive && (
                    <motion.span
                      layoutId="top-rated-toggle-bg"
                      className="absolute inset-0 rounded-lg bg-primary shadow-md -z-10"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 xl:p-4 pt-3 flex-1 min-h-0 md:overflow-y-auto space-y-1.5 xl:space-y-3">
        {isLoading ? (
           Array.from({ length: 4 }).map((_, i) => (
             <Skeleton key={i} className="h-12 w-full rounded-md" />
           ))
        ) : items.length === 0 ? (
           <div className="flex h-full items-center justify-center text-sm text-muted-foreground italic">
             {t("common.empty")}
           </div>
        ) : (
           items.map((item, index) => (
             <div 
               key={item.id}
               onClick={() => router.push('/projects')}
               className="flex items-center group justify-between p-2 xl:p-3 rounded-md border border-border/60 bg-transparent hover:border-border hover:bg-accent/40 active:scale-[0.98] transition-all cursor-pointer"
             >
                <div className="flex items-center gap-2 xl:gap-3">
                   <span className="text-[10px] xl:text-xs font-bold text-muted-foreground w-3 xl:w-4 text-center">
                     #{index + 1}
                   </span>
                   <div 
                     className="w-2 h-2 xl:w-2.5 xl:h-2.5 rounded-full shrink-0" 
                     style={{ backgroundColor: item.color || "currentColor" }}
                   />
                   <div className="flex flex-col min-w-0">
                     <span className="text-xs xl:text-sm font-bold text-foreground truncate max-w-[100px] xl:max-w-[140px] leading-none">
                       {item.name}
                     </span>
                     <span className="text-[8px] xl:text-[10px] text-muted-foreground mt-1 font-medium leading-none">
                       {item.totalSessions} {t("dashboard.sessions")}
                     </span>
                   </div>
                </div>

                <div className="flex items-center gap-1 xl:gap-1.5 bg-accent/40 px-1.5 xl:px-2 py-0.5 xl:py-1 rounded shrink-0">
                   <Star className="h-2.5 w-2.5 xl:h-3.5 xl:w-3.5 text-orange-400 fill-orange-400" />
                   <span className="text-[10px] xl:text-sm font-bold font-mono text-foreground leading-none">
                      {(item.averageRating || 0).toFixed(1)}
                   </span>
                </div>
             </div>
           ))
        )}
      </CardContent>
    </Card>
  );
}

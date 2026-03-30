"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase } from "lucide-react";
import type { DistributionChart } from "@/types";
import { useTranslation } from "react-i18next";

interface DistributionChartProps {
  data: DistributionChart | null;
  isLoading: boolean;
}

function DonutRing({
  data,
  selectedSlice,
  onSelectSlice
}: {
  data: DistributionChart;
  selectedSlice: string | null;
  onSelectSlice: (slice: string | null) => void;
}) {
  const { t } = useTranslation();
  const size = 140;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let cumulativeOffset = 0;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full transition-all duration-300">
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        className="stroke-muted"
        strokeWidth={strokeWidth}
      />
      {data.slices.map((slice, i) => {
        const pct = data.total > 0 ? slice.value / data.total : 0;
        const dashLength = circumference * pct;
        const dashGap = circumference - dashLength;
        const rotation = -90 + (cumulativeOffset / data.total) * 360;
        cumulativeOffset += slice.value;
        const isSelected = selectedSlice === slice.label;
        const isDimmed = selectedSlice !== null && !isSelected;

        return (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={slice.color}
            className={cn(
              "transition-all duration-300 cursor-pointer hover:opacity-80 outline-none",
              isDimmed ? "opacity-30" : "opacity-100",
              isSelected && "stroke-[22px]"
            )}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dashLength} ${dashGap}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(${rotation} ${center} ${center})`}
            onClick={() => onSelectSlice(isSelected ? null : slice.label)}
          />
        );
      })}
      <text
        x={center}
        y={center - 6}
        textAnchor="middle"
        className="fill-foreground text-xl font-bold"
        dominantBaseline="middle"
      >
        {Number(data.total.toFixed(1))}h
      </text>
      <text
        x={center}
        y={center + 14}
        textAnchor="middle"
        className="fill-muted-foreground text-[11px]"
        dominantBaseline="middle"
      >
        {t("dashboard.total") || "total"}
      </text>
    </svg>
  );
}

export function DistributionChartCard({ data, isLoading }: DistributionChartProps) {
  const [selectedSlice, setSelectedSlice] = useState<string | null>(null);
  const { t } = useTranslation();

  const selectedData = data?.slices.find((s) => s.label === selectedSlice);

  return (
    <Card className="flex flex-col overflow-hidden h-full min-h-0 border-border bg-card">
      <CardHeader className="p-3 xl:p-4 pb-0 shrink-0">
        <CardTitle className="text-xs xl:text-sm flex items-center gap-1.5">
          <Briefcase className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-work" />
          {t("dashboard.workDistribution")}
        </CardTitle>
      </CardHeader>

      {/* Chart Section */}
      <div className="px-3 xl:px-4 pt-2 xl:pt-3 pb-5 xl:pb-6 flex-none shrink-0 flex items-center justify-start gap-5 xl:gap-8 border-b border-transparent">
        {isLoading || !data ? (
          <>
            <Skeleton className="w-full h-full max-w-[120px] xl:max-w-[140px] aspect-square rounded-full shrink-0" />
            <div className="flex-1 flex flex-col gap-2 pl-5 xl:pl-6">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          </>
        ) : (
          <>
            <div className="w-full max-w-[120px] xl:max-w-[140px] aspect-square shrink-0">
              <DonutRing
                data={data}
                selectedSlice={selectedSlice}
                onSelectSlice={setSelectedSlice}
              />
            </div>

            <div className="flex-1 min-w-0 h-full border-l border-border/40 pl-5 xl:pl-6 flex flex-col justify-center">
              {selectedData ? (() => {
                const pct = data.total > 0 ? Math.round((selectedData.value / data.total) * 100) : 0;
                return (
                  <div className="flex flex-col gap-2 xl:gap-3 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-3 h-3 shrink-0" style={{ backgroundColor: selectedData.color }} />
                      <span className="text-[11px] xl:text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">{selectedData.label}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl xl:text-4xl font-black tracking-tighter leading-none text-foreground">{Number(selectedData.value.toFixed(1))}h</span>
                      </div>
                      <span className="text-[10px] xl:text-xs font-medium text-muted-foreground">
                        <span className="text-foreground">{pct}%</span> of total
                      </span>
                    </div>
                  </div>
                );
              })() : (
                <div className="flex flex-col justify-center h-full gap-2.5 opacity-60 mix-blend-luminosity">
                  <div className="w-4 h-4 xl:w-5 xl:h-5 border-2 border-dashed border-muted-foreground shrink-0" />
                  <span className="text-[10px] xl:text-xs text-muted-foreground font-medium text-balance text-left select-none uppercase tracking-widest">
                    {t("dashboard.selectData") || "Select Data"}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Legend Scroll Section */}
      <div className="flex-1 min-h-[160px] md:min-h-0 border-t border-border bg-accent/30 flex flex-col p-3 xl:p-4 overflow-y-auto">
        {isLoading || !data ? (
          <div className="w-full space-y-2 lg:space-y-3">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ) : (
          <div className="w-full space-y-0.5 md:space-y-1">
            {data.slices.map((slice) => {
              const pct = data.total > 0 ? Math.round((slice.value / data.total) * 100) : 0;
              const isSelected = selectedSlice === slice.label;
              return (
                <div
                  key={slice.label}
                  className={cn(
                    "flex items-center justify-between group text-[10px] md:text-xs xl:text-sm cursor-pointer hover:bg-muted/50 p-1.5 -mx-1.5 rounded-md transition-colors",
                    isSelected && "bg-muted/80"
                  )}
                  onClick={() => setSelectedSlice(isSelected ? null : slice.label)}
                >
                  <div className="flex items-center gap-1.5 md:gap-2 xl:gap-2.5 min-w-0">
                    <span
                      className="h-2 w-2 md:h-2.5 md:w-2.5 xl:h-3 xl:w-3 rounded-[2px] shrink-0 transition-transform"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className={cn("font-medium truncate transition-colors duration-200", isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
                      {slice.label}
                    </span>
                  </div>
                  <span className="text-foreground tabular-nums shrink-0 ml-1.5 font-medium">{Number(slice.value.toFixed(1))}h <span className="text-muted-foreground">({pct}%)</span></span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

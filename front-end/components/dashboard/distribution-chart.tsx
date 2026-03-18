"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DistributionChart } from "@/types";

interface DistributionChartProps {
  data: DistributionChart | null;
  isLoading: boolean;
}

function DonutRing({ data, size = 140 }: { data: DistributionChart; size?: number }) {
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let cumulativeOffset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
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

        return (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={slice.color}
            className="transition-all duration-500"
            strokeWidth={strokeWidth}
            strokeDasharray={`${dashLength} ${dashGap}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(${rotation} ${center} ${center})`}
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
        {data.total}h
      </text>
      <text
        x={center}
        y={center + 14}
        textAnchor="middle"
        className="fill-muted-foreground text-[11px]"
        dominantBaseline="middle"
      >
        total
      </text>
    </svg>
  );
}

export function DistributionChartCard({ data, isLoading }: DistributionChartProps) {
  return (
    <Card className="flex flex-col overflow-hidden h-full">
      <CardHeader className="p-4 pb-0 shrink-0">
        <CardTitle className="text-sm">{data?.title ?? "Distribution"}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-3 flex-1 min-h-0 flex items-center justify-center">
        {isLoading || !data ? (
          <div className="flex items-center gap-6 w-full">
            <Skeleton className="h-[140px] w-[140px] rounded-full shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-6 w-full">
            <DonutRing data={data} />
            <div className="flex-1 min-w-0 space-y-3">
              {data.slices.map((slice) => {
                const pct = data.total > 0 ? Math.round((slice.value / data.total) * 100) : 0;
                return (
                  <div key={slice.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: slice.color }}
                      />
                      <span className="text-foreground font-medium">{slice.label}</span>
                    </div>
                    <span className="text-muted-foreground tabular-nums">{slice.value}h ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

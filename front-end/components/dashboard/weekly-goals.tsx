import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function WeeklyGoals() {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Weekly Goals</CardTitle>
        <CardDescription>
          Your progress toward target hours for this week.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sample Goal 1 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Work (FlowState app)</div>
            <div className="text-sm text-[var(--foreground)]/70">15 / 20 hours</div>
          </div>
          <div className="h-2 w-full bg-[var(--border)] overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] transition-all"
              style={{ width: "75%" }}
            />
          </div>
        </div>

        {/* Sample Goal 2 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Study (Algorithms)</div>
            <div className="text-sm text-[var(--foreground)]/70">3 / 10 hours</div>
          </div>
          <div className="h-2 w-full bg-[var(--border)] overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] transition-all"
              style={{ width: "30%" }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

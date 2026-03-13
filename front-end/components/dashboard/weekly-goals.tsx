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
        <div className="space-y-3 group cursor-default p-4 rounded-[var(--radius)] transition-colors duration-200 hover:bg-[var(--primary)]/5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold group-hover:text-[var(--primary)] transition-colors duration-200">Work (FlowState app)</div>
            <div className="text-sm font-medium text-[var(--foreground)]/70">15 / 20 hours</div>
          </div>
          <div className="h-2.5 w-full bg-[var(--border)]/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] rounded-full transition-all duration-1000 ease-out shadow-sm"
              style={{ width: "75%" }}
            />
          </div>
        </div>

        {/* Sample Goal 2 */}
        <div className="space-y-3 group cursor-default p-4 rounded-[var(--radius)] transition-colors duration-200 hover:bg-[var(--primary)]/5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold group-hover:text-blue-800 transition-colors duration-200">Study (Algorithms)</div>
            <div className="text-sm font-medium text-[var(--foreground)]/70">3 / 10 hours</div>
          </div>
          <div className="h-2.5 w-full bg-[var(--border)]/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-800 rounded-full transition-all duration-1000 ease-out shadow-sm"
              style={{ width: "30%" }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

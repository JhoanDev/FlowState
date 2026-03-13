import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const sampleActivities = [
  {
    id: 1,
    type: "WORK",
    category: "FlowState (Next.js)",
    duration: "2h 15m",
    timeAgo: "2 hours ago",
    note: "Built dashboard components following flat design.",
  },
  {
    id: 2,
    type: "STUDY",
    category: "Competitive Programming",
    duration: "45m",
    timeAgo: "5 hours ago",
    note: "Solved DP problems on LeetCode.",
  },
  {
    id: 3,
    type: "WORK",
    category: "Rust Tauri Core",
    duration: "1h 30m",
    timeAgo: "Yesterday",
    note: "Setup SQLite plugin and DB connections.",
  },
];

export function RecentActivity() {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          A log of your most recently completed sessions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sampleActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4">
              <div
                className={`flex h-10 w-10 items-center justify-center shrink-0 border border-[var(--border)] text-xs font-bold ${
                  activity.type === "WORK"
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "bg-[#2563eb]/10 text-[#2563eb]" // Using a blue shade for Study explicitly just as example, ideally from tokens
                }`}
              >
                {activity.type === "WORK" ? "WK" : "ST"}
              </div>
              <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{activity.category}</span>
                  <span className="text-xs text-[var(--foreground)]/50">
                    {activity.timeAgo}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 bg-[var(--border)]/50">
                    {activity.duration}
                  </span>
                  <span className="text-xs text-[var(--foreground)]/70 truncate border-l border-[var(--border)] pl-2">
                    {activity.note}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

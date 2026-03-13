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
            <div key={activity.id} className="flex items-start gap-4 group cursor-default p-4 rounded-[var(--radius)] hover:bg-[var(--primary)]/5 transition-colors duration-200">
              <div
                className={`flex h-12 w-12 items-center justify-center shrink-0 rounded-[var(--radius)] border border-[var(--border)] text-xs font-bold transition-transform duration-200 group-hover:scale-105 shadow-sm ${
                  activity.type === "WORK"
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "bg-blue-800/10 text-blue-800"
                }`}
              >
                {activity.type === "WORK" ? "WK" : "ST"}
              </div>
              <div className="flex flex-col gap-1.5 w-full min-w-0 justify-center">
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-bold truncate pr-2 group-hover:text-[var(--primary)] transition-colors duration-200">{activity.category}</span>
                  <span className="text-xs font-medium text-[var(--foreground)]/50 shrink-0">
                    {activity.timeAgo}
                  </span>
                </div>
                <div className="flex items-center gap-3 w-full">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-[var(--radius)] bg-[var(--border)]/30 shrink-0 text-[var(--foreground)]/80">
                    {activity.duration}
                  </span>
                  <span className="text-sm text-[var(--foreground)]/60 truncate border-l-2 border-[var(--border)]/30 pl-3">
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

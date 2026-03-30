"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, X, Target, Check, Pencil } from "lucide-react";
import type { WeeklyGoal, WeeklyGoalInput, SessionType, Project, Tag } from "@/types";
import { useTranslation } from "react-i18next";

// ─── Types ──────────────────────────────────────────────────────

interface CurrentWeekGoalsProps {
  goals: WeeklyGoal[] | null;
  projects: Project[];
  tags: Tag[];
  isLoading: boolean;
  onAdd: (input: WeeklyGoalInput) => void;
  onEdit: (id: number, data: { targetHours?: number }) => void;
  onRemove: (id: number) => void;
}

// ─── Add Goal Form ──────────────────────────────────────────────

function AddGoalForm({
  projects,
  tags,
  onAdd,
}: {
  projects: Project[];
  tags: Tag[];
  onAdd: (input: WeeklyGoalInput) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [type, setType] = React.useState<SessionType>("WORK");
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [targetHours, setTargetHours] = React.useState("");
  const { t } = useTranslation();

  const options = type === "WORK"
    ? projects.map((p) => ({ id: p.id, name: p.name, color: p.color }))
    : tags.map((t) => ({ id: t.id, name: t.name, color: t.color }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedId === null || !targetHours) return;
    const hours = parseInt(targetHours, 10);
    if (isNaN(hours) || hours <= 0) return;
    onAdd({
      type,
      targetHours: hours,
      projectId: type === "WORK" ? selectedId : null,
      tagId: type === "STUDY" ? selectedId : null,
    });
    setSelectedId(null);
    setTargetHours("");
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-4 w-4" />
        {t("goals.addGoal")}
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 rounded-lg border border-border bg-card">
      {/* Type toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setType("WORK"); setSelectedId(null); }}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-md border transition-colors duration-200",
            type === "WORK"
              ? "bg-work/10 text-work border-work/30"
              : "bg-transparent text-muted-foreground border-border hover:bg-accent"
          )}
        >
          {t("session.work")}
        </button>
        <button
          type="button"
          onClick={() => { setType("STUDY"); setSelectedId(null); }}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-md border transition-colors duration-200",
            type === "STUDY"
              ? "bg-study/10 text-study border-study/30"
              : "bg-transparent text-muted-foreground border-border hover:bg-accent"
          )}
        >
          {t("session.study")}
        </button>
      </div>

      {/* Reference select (project or tag) */}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setSelectedId(opt.id)}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border transition-colors duration-200 max-w-[180px]",
              selectedId === opt.id
                ? type === "WORK"
                  ? "bg-work/10 text-work border-work/30"
                  : "bg-study/10 text-study border-study/30"
                : "border-border text-muted-foreground hover:bg-accent"
            )}
          >
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: opt.color }}
            />
            <span className="truncate">{opt.name}</span>
          </button>
        ))}
      </div>

      {/* Target hours + actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="number"
          min={1}
          max={168}
          value={targetHours}
          onChange={(e) => setTargetHours(e.target.value)}
          placeholder={t("goals.targetHours")}
          className="w-24 sm:w-32 h-9 text-xs sm:text-sm"
        />
        <span className="text-xs sm:text-sm text-muted-foreground">{t("dashboard.hours")} / {t("goals.days").replace("dias", "semana").replace("days", "week")}</span>
        <div className="flex-1 min-w-[20px]" />
        <Button type="submit" size="sm" className="h-9 gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3" disabled={selectedId === null || !targetHours}>
          <Check className="h-4 w-4" />
          {t("common.add")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

// ─── Single Goal Row ────────────────────────────────────────────

function GoalRow({
  goal,
  onEdit,
  onRemove,
}: {
  goal: WeeklyGoal;
  onEdit: (id: number, data: { targetHours?: number }) => void;
  onRemove: (id: number) => void;
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState(String(goal.targetHours));
  const { t } = useTranslation();

  const percentage = Math.min(
    100,
    Math.round((goal.currentHours / goal.targetHours) * 100)
  );
  const isComplete = goal.currentHours >= goal.targetHours;
  const isWork = goal.type === "WORK";

  const handleSave = () => {
    const hours = parseInt(editTarget, 10);
    if (!isNaN(hours) && hours > 0 && hours !== goal.targetHours) {
      onEdit(goal.id, { targetHours: hours });
    }
    setIsEditing(false);
  };

  return (
    <div className="group p-4 rounded-lg border border-border hover:border-muted-foreground/20 transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span
            className={cn(
              "h-3 w-3 rounded-full shrink-0",
              isWork ? "bg-work" : "bg-study"
            )}
          />
          <span className="text-sm font-medium">{goal.label}</span>
          <Badge variant={isWork ? "work" : "study"}>
            {isWork ? t("session.work") : t("session.study")}
          </Badge>
          {isComplete && (
            <Badge variant="default" className="bg-success/10 text-success border-success/30">
              {t("common.confirm")}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
          {isEditing ? (
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                min={1}
                max={168}
                value={editTarget}
                onChange={(e) => setEditTarget(e.target.value)}
                className="w-20 h-7 text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") setIsEditing(false);
                }}
                autoFocus
              />
              <button
                onClick={handleSave}
                className="p-1 rounded text-primary hover:bg-primary/10 transition-colors duration-200"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded text-muted-foreground hover:bg-accent transition-colors duration-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <>
              <span className="text-sm tabular-nums text-muted-foreground">
                {goal.currentHours}/{goal.targetHours}h
              </span>
              <span className="text-sm font-medium tabular-nums">
                {percentage}%
              </span>
              <button
                onClick={() => {
                  setEditTarget(String(goal.targetHours));
                  setIsEditing(true);
                }}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onRemove(goal.id)}
                className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      <Progress
        value={percentage}
        className="h-2.5"
        indicatorClassName={cn(
          isComplete ? "bg-success" : isWork ? "bg-work" : "bg-study"
        )}
      />
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

export function CurrentWeekGoals({
  goals,
  projects,
  tags,
  isLoading,
  onAdd,
  onEdit,
  onRemove,
}: CurrentWeekGoalsProps) {
  const { t } = useTranslation();
  return (
    <Card className="flex flex-col h-auto lg:h-full">
      <CardHeader className="p-3 xl:p-4 pb-0 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs xl:text-sm flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-primary" />
            {t("goals.weeklyGoals")}
          </CardTitle>
          <span className="text-[10px] xl:text-xs text-muted-foreground">{t("dashboard.today") || "Current Week"}</span>
        </div>
      </CardHeader>

      <CardContent className="p-3 xl:p-4 pt-3 flex-1 flex flex-col gap-4 min-h-0">
        {/* Add form */}
        <AddGoalForm projects={projects} tags={tags} onAdd={onAdd} />

        {/* Goals list */}
        <div className="flex-1 md:overflow-y-auto min-h-0 space-y-3">
          {isLoading || !goals ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 rounded-lg border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-2.5 w-full rounded-full" />
              </div>
            ))
          ) : goals.length === 0 ? (
            <p className="text-base text-muted-foreground py-8 text-center">
              {t("goals.noGoals")}
            </p>
          ) : (
            goals.map((goal) => (
              <GoalRow
                key={goal.id}
                goal={goal}
                onEdit={onEdit}
                onRemove={onRemove}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

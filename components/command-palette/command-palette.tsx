"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  Folder,
  Flame,
  BookOpen,
  Settings,
  Play,
  Sun,
  Moon,
  Search,
  ArrowRight,
  Command,
} from "lucide-react";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { useSettings } from "@/providers/settings-provider";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface CommandItem {
  id: string;
  group: "navigation" | "actions";
  label: string;
  icon: React.ElementType;
  shortcut?: string;
  action: () => void;
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/25 text-primary rounded-sm px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function CommandPalette() {
  const { isOpen, close } = useCommandPalette();
  const { settings, updateSetting } = useSettings();
  const router = useRouter();
  const { t } = useTranslation();
  const [query, setQuery] = React.useState("");
  const [activeIdx, setActiveIdx] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Reset state on open/close
  React.useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveIdx(0);
      // Delay focus slightly to let animation start
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const navigate = React.useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router]
  );

  const toggleTheme = React.useCallback(() => {
    if (!settings) return;
    const next = settings.theme === "dark" ? "light" : "dark";
    updateSetting("theme", next);
    close();
  }, [settings, updateSetting, close]);

  const commands: CommandItem[] = React.useMemo(
    () => [
      // Navigation
      { id: "nav-dashboard", group: "navigation", label: t("nav.dashboard"), icon: LayoutDashboard, action: () => navigate("/") },
      { id: "nav-session", group: "navigation", label: t("nav.session"), icon: Target, action: () => navigate("/session") },
      { id: "nav-projects", group: "navigation", label: t("nav.projects"), icon: Folder, action: () => navigate("/projects") },
      { id: "nav-goals", group: "navigation", label: t("nav.goals"), icon: Flame, action: () => navigate("/goals") },
      { id: "nav-logbook", group: "navigation", label: t("nav.logbook"), icon: BookOpen, action: () => navigate("/logbook") },
      { id: "nav-settings", group: "navigation", label: t("nav.settings"), icon: Settings, action: () => navigate("/settings") },
      // Actions
      {
        id: "action-start-work",
        group: "actions",
        label: t("commandPalette.startWork"),
        icon: Play,
        action: () => navigate("/session?type=WORK"),
      },
      {
        id: "action-start-study",
        group: "actions",
        label: t("commandPalette.startStudy"),
        icon: Play,
        action: () => navigate("/session?type=STUDY"),
      },
      {
        id: "action-toggle-theme",
        group: "actions",
        label: t("commandPalette.toggleTheme"),
        icon: settings?.theme === "dark" ? Sun : Moon,
        shortcut: "",
        action: toggleTheme,
      },
    ],
    [t, navigate, toggleTheme, settings?.theme]
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [commands, query]);

  // Group filtered results
  const navItems = filtered.filter((c) => c.group === "navigation");
  const actionItems = filtered.filter((c) => c.group === "actions");
  const flatFiltered = [...navItems, ...actionItems];

  // Sync active index when filtered list changes
  React.useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => (i + 1) % Math.max(1, flatFiltered.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => (i - 1 + Math.max(1, flatFiltered.length)) % Math.max(1, flatFiltered.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        flatFiltered[activeIdx]?.action();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, flatFiltered, activeIdx, close]);

  // Scroll active item into view
  React.useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  function renderGroup(items: CommandItem[], label: string, offset: number) {
    if (!items.length) return null;
    return (
      <div>
        <p className="px-3 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        {items.map((item, i) => {
          const globalIdx = offset + i;
          const Icon = item.icon;
          const isActive = activeIdx === globalIdx;
          return (
            <button
              key={item.id}
              data-idx={globalIdx}
              onClick={item.action}
              onMouseEnter={() => setActiveIdx(globalIdx)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors duration-100 text-left cursor-pointer",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-accent"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors duration-100",
                  isActive
                    ? "bg-primary/15 border-primary/30 text-primary"
                    : "bg-muted border-border text-muted-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="flex-1 min-w-0 truncate font-medium">
                {highlight(item.label, query)}
              </span>
              {isActive && (
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary/60" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="Command Palette"
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.3 }}
            className="fixed inset-x-4 top-[15%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-[560px] z-50"
          >
            <div className="bg-card/95 backdrop-blur-md border border-border emissive-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border shrink-0">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("commandPalette.placeholder")}
                  className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                <kbd className="hidden sm:flex items-center gap-1 shrink-0 text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5">
                  <span>Esc</span>
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="overflow-y-auto p-2 flex-1">
                {flatFiltered.length === 0 ? (
                  <div className="py-12 flex flex-col items-center gap-3 text-muted-foreground">
                    <Command className="h-8 w-8 opacity-30" />
                    <p className="text-sm">{t("commandPalette.noResults")}</p>
                  </div>
                ) : (
                  <>
                    {renderGroup(navItems, t("commandPalette.navigation"), 0)}
                    {renderGroup(actionItems, t("commandPalette.actions"), navItems.length)}
                  </>
                )}
              </div>

              {/* Footer hint */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/30 shrink-0 text-[10px] text-muted-foreground gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="border border-border rounded px-1 py-0.5 font-mono">↑↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="border border-border rounded px-1 py-0.5 font-mono">↵</kbd>
                    Select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="border border-border rounded px-1 py-0.5 font-mono">Esc</kbd>
                    Close
                  </span>
                </div>
                <span className="flex items-center gap-1 shrink-0">
                  <kbd className="border border-border rounded px-1 py-0.5 font-mono">⌘K</kbd>
                  Toggle
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/providers/settings-provider";

interface TimePickerProps {
  value: string; // "HH:MM" (24h internally)
  onChange: (time: string) => void;
  className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const { settings } = useSettings();
  const is12hFormat = settings?.timeFormat === "12h";

  // Parse internal 24h value
  const [internalH, internalM] = (value || "00:00").split(":");
  let parsedHour = parseInt(internalH, 10);
  if (isNaN(parsedHour)) parsedHour = 0;
  const mm = internalM || "00";

  // Calculate external display state based on format
  const isPM = parsedHour >= 12;
  const displayHour = is12hFormat
    ? (parsedHour % 12 === 0 ? 12 : parsedHour % 12).toString()
    : parsedHour.toString().padStart(2, "0");

  const [localHour, setLocalHour] = React.useState(displayHour);
  const [localMinute, setLocalMinute] = React.useState(mm);

  // Sync display state when external value or format changes
  React.useEffect(() => {
    let ph = parseInt(value.split(":")[0] || "0", 10);
    if (isNaN(ph)) ph = 0;
    const pm = value.split(":")[1] || "00";
    
    setLocalMinute(pm);
    
    if (is12hFormat) {
      setLocalHour((ph % 12 === 0 ? 12 : ph % 12).toString());
    } else {
      setLocalHour(ph.toString().padStart(2, "0"));
    }
  }, [value, is12hFormat]);

  const commitChange = (h: string, m: string, pmMode: boolean) => {
    let parsedH = parseInt(h, 10);
    if (isNaN(parsedH)) parsedH = 0;
    let parsedM = parseInt(m, 10);
    if (isNaN(parsedM)) parsedM = 0;

    if (is12hFormat) {
      if (parsedH === 12) {
        parsedH = pmMode ? 12 : 0;
      } else if (pmMode) {
        parsedH += 12;
      }
    }

    // boundary checks
    parsedH = Math.max(0, Math.min(23, parsedH));
    parsedM = Math.max(0, Math.min(59, parsedM));

    onChange(`${String(parsedH).padStart(2, "0")}:${String(parsedM).padStart(2, "0")}`);
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalHour(val); // let them type
  };

  const handleHourBlur = () => {
    let parsedH = parseInt(localHour, 10);
    if (isNaN(parsedH)) parsedH = is12hFormat ? 12 : 0;
    
    if (is12hFormat) {
      parsedH = Math.max(1, Math.min(12, parsedH));
      setLocalHour(parsedH.toString());
    } else {
      parsedH = Math.max(0, Math.min(23, parsedH));
      setLocalHour(parsedH.toString().padStart(2, "0"));
    }
    
    commitChange(parsedH.toString(), localMinute, isPM);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalMinute(e.target.value);
  };

  const handleMinuteBlur = () => {
    let parsedM = parseInt(localMinute, 10);
    if (isNaN(parsedM)) parsedM = 0;
    parsedM = Math.max(0, Math.min(59, parsedM));
    const padded = parsedM.toString().padStart(2, "0");
    setLocalMinute(padded);
    commitChange(localHour, padded, isPM);
  };

  const toggleAmPm = () => {
    commitChange(localHour, localMinute, !isPM);
  };

  return (
    <div className={cn("flex items-center gap-1.5 h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-ring/50 focus-within:border-ring", className)}>
      <Clock className="w-4 h-4 text-muted-foreground shrink-0 mr-0.5" />
      <input
        type="text"
        inputMode="numeric"
        value={localHour}
        onChange={handleHourChange}
        onBlur={handleHourBlur}
        className="w-8 text-center bg-transparent border-none outline-none font-mono text-foreground placeholder:text-muted-foreground/50 p-0 shadow-none focus-visible:ring-0"
        maxLength={2}
      />
      <span className="text-muted-foreground font-bold">:</span>
      <input
        type="text"
        inputMode="numeric"
        value={localMinute}
        onChange={handleMinuteChange}
        onBlur={handleMinuteBlur}
        className="w-8 text-center bg-transparent border-none outline-none font-mono text-foreground placeholder:text-muted-foreground/50 p-0 shadow-none focus-visible:ring-0"
        maxLength={2}
      />
      
      {is12hFormat && (
        <button
          type="button"
          onClick={toggleAmPm}
          className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-accent text-muted-foreground hover:bg-primary/20 hover:text-primary px-2 py-1 rounded transition-colors"
        >
          {isPM ? "PM" : "AM"}
        </button>
      )}
    </div>
  );
}

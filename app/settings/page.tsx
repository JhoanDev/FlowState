"use client";

import * as React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { useAsync } from "@/hooks/use-async";
import { getSettings, exportDataVault, importDataVault, wipeAllData } from "@/services/settingsService";
import type { ThemeOption, LanguageOption, TimeFormatOption } from "@/types";
import { Palette, Globe, Clock, ShieldAlert, Monitor, Moon, Sun, Download, Upload, Trash2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/providers/settings-provider";

export default function SettingsPage() {
  const { settings, updateSetting, isLoading: isLoadingInitial } = useSettings();
  
  const [isExporting, setIsExporting] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const [isWiping, setIsWiping] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  const handleUpdate = async <K extends keyof NonNullable<typeof settings>>(key: K, value: NonNullable<typeof settings>[K]) => {
    if (!settings) return;
    await updateSetting(key, value);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleExport = async () => {
    setIsExporting(true);
    const success = await exportDataVault();
    setIsExporting(false);
    if (!success) {
      alert("Export failed or cancelled.");
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    const success = await importDataVault();
    setIsImporting(false);
    if (success) {
      if (process.env.NODE_ENV === "development") {
        alert("Backup restored!\n\nPlease close the app and restart the 'npm run tauri dev' terminal to load the new database.");
      }
    } else {
      alert("Restore failed or cancelled.");
    }
  };

  const [showWipeDialog, setShowWipeDialog] = React.useState(false);

  const handleWipeConfirm = async () => {
    setIsWiping(true);
    await wipeAllData();
    setIsWiping(false);
    setShowWipeDialog(false);
  };

  return (
    <AppLayout title="Settings" subtitle="Configure preferences and manage local data">
      <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        
        {/* Left Column */}
        <div className="space-y-8">
          {/* Section: Appearance (DISABLED/COMING SOON) */}
          <section className="space-y-4 relative opacity-50 select-none grayscale-[0.2]" aria-disabled="true">
             <div className="absolute inset-0 z-10 cursor-not-allowed"></div>
             
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Appearance & Localization
                </h3>
                <span className="text-[10px] uppercase font-bold bg-accent text-muted-foreground px-2 py-0.5 rounded-sm">Coming Soon</span>
             </div>
             
             <div className="bg-card border border-border rounded-xl divide-y divide-border">
                {/* Theme Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-6">
                   <div>
                     <p className="text-base font-semibold text-foreground">Theme</p>
                     <p className="text-sm text-muted-foreground mt-1">Select the color scheme.</p>
                   </div>
                   <div className="flex bg-accent/30 p-1 rounded-lg shrink-0">
                      <button 
                        onClick={() => handleUpdate("theme", "light")}
                        className={cn("flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-all", settings?.theme === "light" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                      >
                        <Sun className="w-4 h-4" /> Light
                      </button>
                      <button 
                        onClick={() => handleUpdate("theme", "dark")}
                        className={cn("flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-all", settings?.theme === "dark" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                      >
                        <Moon className="w-4 h-4" /> Dark
                      </button>
                      <button 
                        onClick={() => handleUpdate("theme", "system")}
                        className={cn("flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-all", settings?.theme === "system" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                      >
                        <Monitor className="w-4 h-4" /> System
                      </button>
                   </div>
                </div>

                {/* Language Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-6">
                   <div>
                     <p className="text-base font-semibold text-foreground">Language</p>
                     <p className="text-sm text-muted-foreground mt-1">Interface language.</p>
                   </div>
                   <div className="flex bg-accent/30 p-1 rounded-lg shrink-0">
                      <button onClick={() => handleUpdate("language", "en")} className={cn("px-4 py-2 text-sm font-bold rounded-md transition-all", settings?.language === "en" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>English</button>
                      <button onClick={() => handleUpdate("language", "pt")} className={cn("px-4 py-2 text-sm font-bold rounded-md transition-all", settings?.language === "pt" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>Português</button>
                   </div>
                </div>
             </div>
          </section>

          {/* Section: Session Config */}
          <section className="space-y-4">
             <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
               <Clock className="w-4 h-4" /> Session Configuration
             </h3>
             
             <div className="bg-card border border-border rounded-xl divide-y divide-border">
                {/* Time Format */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-6">
                   <div>
                     <p className="text-base font-semibold text-foreground">Time Format</p>
                     <p className="text-sm text-muted-foreground mt-1">12-hour or 24-hour clocks.</p>
                   </div>
                   <div className="flex bg-accent/30 p-1 rounded-lg shrink-0">
                      <button onClick={() => handleUpdate("timeFormat", "12h")} className={cn("px-6 py-2 text-sm font-bold rounded-md transition-all", settings?.timeFormat === "12h" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>12 AM</button>
                      <button onClick={() => handleUpdate("timeFormat", "24h")} className={cn("px-6 py-2 text-sm font-bold rounded-md transition-all", settings?.timeFormat === "24h" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>24:00</button>
                   </div>
                </div>

                {/* Date Format */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-6">
                   <div>
                     <p className="text-base font-semibold text-foreground">Date Format</p>
                     <p className="text-sm text-muted-foreground mt-1">Layout for calendars and histories.</p>
                   </div>
                   <div className="flex bg-accent/30 p-1 rounded-lg shrink-0">
                      <button onClick={() => handleUpdate("dateFormat", "US")} className={cn("px-6 py-2 text-sm font-bold rounded-md transition-all", settings?.dateFormat === "US" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>US (MM/DD)</button>
                      <button onClick={() => handleUpdate("dateFormat", "BR")} className={cn("px-6 py-2 text-sm font-bold rounded-md transition-all", settings?.dateFormat === "BR" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>BR (DD/MM)</button>
                   </div>
                </div>

                {/* Strict Mode */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-6">
                   <div>
                     <p className="text-base font-semibold text-foreground">Strict Mode</p>
                     <p className="text-sm text-muted-foreground mt-1">Force full-screen focus.</p>
                   </div>
                   <div className="flex bg-accent/30 p-1 rounded-lg shrink-0">
                      <button onClick={() => handleUpdate("strictModeDefault", false)} className={cn("px-6 py-2 text-sm font-bold rounded-md transition-all", !settings?.strictModeDefault ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>Off</button>
                      <button onClick={() => handleUpdate("strictModeDefault", true)} className={cn("px-6 py-2 text-sm font-bold rounded-md transition-all", settings?.strictModeDefault ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>On</button>
                   </div>
                </div>
             </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-8 flex flex-col h-full">
          {/* Section: Data Vault */}
          <section className="space-y-4 flex-1">
             <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
               <ShieldAlert className="w-4 h-4 text-emerald-500" /> Data Vault
             </h3>
             
             <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-6 h-[calc(100%-32px)] justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    FlowState operates entirely offline. Your data is stored locally on this machine. Backup your progress across devices safely.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <button 
                       onClick={handleExport} disabled={isExporting}
                       className="flex items-center justify-center gap-2 h-14 bg-accent/30 hover:bg-accent/60 border border-border rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                     >
                       <Upload className="w-5 h-5 text-primary" />
                       {isExporting ? "Exporting..." : "Export"}
                     </button>
                     
                     <button 
                       onClick={handleImport} disabled={isImporting}
                       className="flex items-center justify-center gap-2 h-14 bg-accent/30 hover:bg-accent/60 border border-border rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                     >
                       <Download className="w-5 h-5 text-primary" />
                       {isImporting ? "Restoring..." : "Restore"}
                     </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-border flex flex-col xl:flex-row items-center justify-between gap-4">
                   <div className="text-sm text-foreground font-medium text-center xl:text-left">
                     Irreversible action to wipe DB.
                   </div>
                   <button 
                     onClick={() => setShowWipeDialog(true)}
                     className="flex items-center gap-2 px-6 h-12 bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground border border-destructive/20 rounded-lg text-sm font-bold transition-colors shrink-0 w-full xl:w-auto justify-center"
                   >
                     <Trash2 className="w-4 h-4" />
                     Wipe Local Data
                   </button>
                </div>
             </div>
          </section>

          {/* Action Footer */}
          <div className="flex justify-end items-center gap-4 pt-2">
             <span className={cn("text-sm font-bold text-green-500 flex items-center gap-2 transition-opacity duration-300", saveSuccess ? "opacity-100" : "opacity-0")}>
                <CheckCircle2 className="w-5 h-5" /> Saved instantly
             </span>
             {/* Note: Save button is removed because updates happen instantly via handleUpdate */}
          </div>
        </div>

      </div>

      {/* Custom Wipe Confirmation Modal */}
      {showWipeDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
           <div className="bg-card border border-border w-full max-w-md p-6 rounded-xl shadow-xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
              
              <div className="flex flex-col items-center text-center gap-4">
                 <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive border border-destructive/20">
                   <ShieldAlert className="w-8 h-8" />
                 </div>
                 <div>
                   <h2 className="text-xl font-bold text-foreground">Wipe All Local Data?</h2>
                   <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                     This action is strictly <strong className="text-foreground">irreversible</strong>. 
                     All your historical sessions, tags, and projects will be permanently deleted from this machine's local storage.
                   </p>
                 </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                 <Button 
                   variant="outline" 
                   className="flex-1 h-11 border-border" 
                   onClick={() => setShowWipeDialog(false)} 
                   disabled={isWiping}
                 >
                   Cancel
                 </Button>
                 <Button 
                   variant="destructive" 
                   className="flex-1 h-11 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold" 
                   onClick={handleWipeConfirm} 
                   disabled={isWiping}
                 >
                   {isWiping ? "Erasing..." : "Yes, Wipe everything"}
                 </Button>
              </div>

           </div>
        </div>
      )}

    </AppLayout>
  );
}

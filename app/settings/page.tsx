"use client";

import * as React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { getSettings, exportDataVault, importDataVault, wipeAllData } from "@/services/settingsService";
import type { ThemeOption, LanguageOption, TimeFormatOption } from "@/types";
import { Palette, Globe, Clock, ShieldAlert, Monitor, Moon, Sun, Download, Upload, Trash2, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/providers/settings-provider";
import { useTranslation } from "react-i18next";

// silence unused import warning – getSettings may be used in future refactor
void getSettings;

export default function SettingsPage() {
  const { settings, updateSetting, isLoading: isLoadingInitial } = useSettings();
  const { t } = useTranslation();

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
    <AppLayout title={t("settings.title")} subtitle={t("settings.subtitle")}>
      <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        
        {/* Left Column */}
        <div className="space-y-8">
          {/* Section: Appearance */}
          <section className="space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Palette className="w-4 h-4" /> {t("settings.appearance")}
                </h3>
             </div>
             
             <div className="bg-card border border-border rounded-xl divide-y divide-border">
                {/* Theme Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 gap-4 sm:gap-6">
                   <div>
                     <p className="text-base font-semibold text-foreground">{t("settings.theme")}</p>
                     <p className="text-sm text-muted-foreground mt-1">{t("settings.themeDesc")}</p>
                   </div>
                   <div className="relative flex p-0.5 xl:p-1 bg-accent/30 rounded-[10px] shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                      <button
                        onClick={() => handleUpdate("theme", "light")}
                        className={cn("relative z-10 flex flex-1 items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors duration-200", settings?.theme === "light" ? "text-primary-foreground cursor-default" : "text-muted-foreground hover:text-foreground cursor-pointer")}
                      >
                        <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> {t("settings.light")}
                        {settings?.theme === "light" && <motion.span layoutId="settings-theme" className="absolute inset-0 rounded-lg bg-primary shadow-md -z-10" transition={{ type: "spring", bounce: 0.15, duration: 0.5 }} />}
                      </button>
                      <button
                        onClick={() => handleUpdate("theme", "dark")}
                        className={cn("relative z-10 flex flex-1 items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors duration-200", settings?.theme === "dark" ? "text-primary-foreground cursor-default" : "text-muted-foreground hover:text-foreground cursor-pointer")}
                      >
                        <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> {t("settings.dark")}
                        {settings?.theme === "dark" && <motion.span layoutId="settings-theme" className="absolute inset-0 rounded-lg bg-primary shadow-md -z-10" transition={{ type: "spring", bounce: 0.15, duration: 0.5 }} />}
                      </button>
                      <button
                        onClick={() => handleUpdate("theme", "system")}
                        className={cn("relative z-10 flex flex-1 items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors duration-200", settings?.theme === "system" ? "text-primary-foreground cursor-default" : "text-muted-foreground hover:text-foreground cursor-pointer")}
                      >
                        <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> {t("settings.system")}
                        {settings?.theme === "system" && <motion.span layoutId="settings-theme" className="absolute inset-0 rounded-lg bg-primary shadow-md -z-10" transition={{ type: "spring", bounce: 0.15, duration: 0.5 }} />}
                      </button>
                   </div>
                </div>

                {/* Language Row — NOW ACTIVE */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 gap-4 sm:gap-6">
                   <div>
                     <p className="text-base font-semibold text-foreground">{t("settings.language")}</p>
                     <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                       <Globe className="w-3.5 h-3.5 shrink-0" />
                       {t("settings.languageDesc")}
                     </p>
                   </div>
                   <div className="relative flex p-0.5 xl:p-1 bg-accent/30 rounded-[10px] shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                      <button
                        onClick={() => handleUpdate("language", "en")}
                        className={cn("relative z-10 flex-1 text-center px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors duration-200 cursor-pointer", settings?.language === "en" ? "text-primary-foreground cursor-default" : "text-muted-foreground hover:text-foreground")}
                      >
                        English
                        {settings?.language === "en" && <motion.span layoutId="settings-language" className="absolute inset-0 rounded-lg bg-primary shadow-md -z-10" transition={{ type: "spring", bounce: 0.15, duration: 0.5 }} />}
                      </button>
                      <button
                        onClick={() => handleUpdate("language", "pt")}
                        className={cn("relative z-10 flex-1 text-center px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors duration-200 cursor-pointer", settings?.language === "pt" ? "text-primary-foreground cursor-default" : "text-muted-foreground hover:text-foreground")}
                      >
                        Português
                        {settings?.language === "pt" && <motion.span layoutId="settings-language" className="absolute inset-0 rounded-lg bg-primary shadow-md -z-10" transition={{ type: "spring", bounce: 0.15, duration: 0.5 }} />}
                      </button>
                   </div>
                </div>
             </div>
          </section>

          {/* Section: Session Config */}
          <section className="space-y-4">
             <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
               <Clock className="w-4 h-4" /> {t("settings.session")}
             </h3>
             
             <div className="bg-card border border-border rounded-xl divide-y divide-border">
                {/* Time Format */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 gap-4 sm:gap-6">
                   <div>
                     <p className="text-base font-semibold text-foreground">{t("settings.timeFormat")}</p>
                     <p className="text-sm text-muted-foreground mt-1">{t("settings.timeFormatDesc")}</p>
                   </div>
                   <div className="relative flex p-0.5 xl:p-1 bg-accent/30 rounded-[10px] shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                      <button 
                        onClick={() => handleUpdate("timeFormat", "12h")} 
                        className={cn("relative z-10 flex-1 text-center px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors duration-200 whitespace-nowrap cursor-pointer", settings?.timeFormat === "12h" ? "text-primary-foreground cursor-default" : "text-muted-foreground hover:text-foreground")}
                      >
                        12 AM
                        {settings?.timeFormat === "12h" && <motion.span layoutId="settings-time" className="absolute inset-0 rounded-lg bg-primary shadow-md -z-10" transition={{ type: "spring", bounce: 0.15, duration: 0.5 }} />}
                      </button>
                      <button 
                        onClick={() => handleUpdate("timeFormat", "24h")} 
                        className={cn("relative z-10 flex-1 text-center px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors duration-200 whitespace-nowrap cursor-pointer", settings?.timeFormat === "24h" ? "text-primary-foreground cursor-default" : "text-muted-foreground hover:text-foreground")}
                      >
                        24:00
                        {settings?.timeFormat === "24h" && <motion.span layoutId="settings-time" className="absolute inset-0 rounded-lg bg-primary shadow-md -z-10" transition={{ type: "spring", bounce: 0.15, duration: 0.5 }} />}
                      </button>
                   </div>
                </div>

                {/* Date Format */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 gap-4 sm:gap-6">
                   <div>
                     <p className="text-base font-semibold text-foreground">{t("settings.dateFormat")}</p>
                     <p className="text-sm text-muted-foreground mt-1">{t("settings.dateFormatDesc")}</p>
                   </div>
                   <div className="relative flex p-0.5 xl:p-1 bg-accent/30 rounded-[10px] shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                      <button 
                        onClick={() => handleUpdate("dateFormat", "US")} 
                        className={cn("relative z-10 flex-1 text-center px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors duration-200 whitespace-nowrap cursor-pointer", settings?.dateFormat === "US" ? "text-primary-foreground cursor-default" : "text-muted-foreground hover:text-foreground")}
                      >
                        US (MM/DD)
                        {settings?.dateFormat === "US" && <motion.span layoutId="settings-date" className="absolute inset-0 rounded-lg bg-primary shadow-md -z-10" transition={{ type: "spring", bounce: 0.15, duration: 0.5 }} />}
                      </button>
                      <button 
                        onClick={() => handleUpdate("dateFormat", "BR")} 
                        className={cn("relative z-10 flex-1 text-center px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors duration-200 whitespace-nowrap cursor-pointer", settings?.dateFormat === "BR" ? "text-primary-foreground cursor-default" : "text-muted-foreground hover:text-foreground")}
                      >
                        BR (DD/MM)
                        {settings?.dateFormat === "BR" && <motion.span layoutId="settings-date" className="absolute inset-0 rounded-lg bg-primary shadow-md -z-10" transition={{ type: "spring", bounce: 0.15, duration: 0.5 }} />}
                      </button>
                   </div>
                </div>

                {/* Strict Mode */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 gap-4 sm:gap-6">
                   <div>
                     <p className="text-base font-semibold text-foreground">{t("settings.strictMode")}</p>
                     <p className="text-sm text-muted-foreground mt-1">{t("settings.strictModeDesc")}</p>
                   </div>
                   <div className="relative flex p-0.5 xl:p-1 bg-accent/30 rounded-[10px] shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                      <button 
                        onClick={() => handleUpdate("strictModeDefault", false)} 
                        className={cn("relative z-10 flex-1 text-center px-6 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors duration-200 cursor-pointer", !settings?.strictModeDefault ? "text-primary-foreground cursor-default" : "text-muted-foreground hover:text-foreground")}
                      >
                        {t("common.off")}
                        {!settings?.strictModeDefault && <motion.span layoutId="settings-strict" className="absolute inset-0 rounded-lg bg-primary shadow-md -z-10" transition={{ type: "spring", bounce: 0.15, duration: 0.5 }} />}
                      </button>
                      <button 
                        onClick={() => handleUpdate("strictModeDefault", true)} 
                        className={cn("relative z-10 flex-1 text-center px-6 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors duration-200 cursor-pointer", settings?.strictModeDefault ? "text-primary-foreground cursor-default" : "text-muted-foreground hover:text-foreground")}
                      >
                        {t("common.on")}
                        {settings?.strictModeDefault && <motion.span layoutId="settings-strict" className="absolute inset-0 rounded-lg bg-primary shadow-md -z-10" transition={{ type: "spring", bounce: 0.15, duration: 0.5 }} />}
                      </button>
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
               <ShieldAlert className="w-4 h-4 text-success" /> {t("settings.dataVault")}
             </h3>
             
             <div className="bg-card border border-border rounded-xl p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 h-[calc(100%-32px)] justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                    {t("settings.dataVaultDesc")}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                     <button 
                       onClick={handleExport} disabled={isExporting}
                       className="flex items-center justify-center gap-1.5 sm:gap-2 h-12 sm:h-14 bg-accent/30 hover:bg-accent/60 border border-border rounded-lg text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                     >
                       <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                       {isExporting ? t("settings.exporting") : t("settings.export")}
                     </button>
                     
                     <button 
                       onClick={handleImport} disabled={isImporting}
                       className="flex items-center justify-center gap-1.5 sm:gap-2 h-12 sm:h-14 bg-accent/30 hover:bg-accent/60 border border-border rounded-lg text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                     >
                       <Download className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                       {isImporting ? t("settings.restoring") : t("settings.restore")}
                     </button>
                  </div>
                </div>

                <div className="pt-4 sm:pt-6 border-t border-border flex flex-col xl:flex-row items-center justify-between gap-4">
                   <div className="text-xs sm:text-sm text-foreground font-medium text-center xl:text-left">
                     {t("settings.wipeWarning")}
                   </div>
                   <button 
                     onClick={() => setShowWipeDialog(true)}
                     className="flex items-center gap-2 px-6 h-12 bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground border border-destructive/20 rounded-lg text-sm font-bold transition-colors shrink-0 w-full xl:w-auto justify-center cursor-pointer"
                   >
                     <Trash2 className="w-4 h-4 shrink-0" />
                     {t("settings.wipeData")}
                   </button>
                </div>
             </div>
          </section>

          {/* Action Footer */}
          <div className="flex justify-end items-center gap-4 pt-2">
             <span className={cn("text-sm font-bold text-success flex items-center gap-2 transition-opacity duration-300", saveSuccess ? "opacity-100" : "opacity-0")}>
                <CheckCircle2 className="w-5 h-5" /> {t("settings.savedInstantly")}
             </span>
          </div>
        </div>

      </div>

      {/* Custom Wipe Confirmation Modal */}
      {showWipeDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4">
           <div className="bg-card/95 backdrop-blur-md border border-border w-full max-w-md p-6 rounded-xl emissive-border flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
              
              <div className="flex flex-col items-center text-center gap-4">
                 <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive border border-destructive/20">
                   <ShieldAlert className="w-8 h-8" />
                 </div>
                 <div>
                   <h2 className="text-xl font-bold text-foreground">{t("settings.wipeConfirmTitle")}</h2>
                   <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                     {t("settings.wipeConfirmDesc")}
                   </p>
                 </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 pt-2">
                 <Button 
                   variant="outline" 
                   className="sm:flex-1 h-11 border-border" 
                   onClick={() => setShowWipeDialog(false)} 
                   disabled={isWiping}
                 >
                   {t("common.cancel")}
                 </Button>
                 <Button 
                   variant="destructive" 
                   className="sm:flex-1 h-11 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold" 
                   onClick={handleWipeConfirm} 
                   disabled={isWiping}
                 >
                   {isWiping ? t("settings.erasing") : t("settings.wipeConfirmBtn")}
                 </Button>
              </div>

           </div>
        </div>
      )}

    </AppLayout>
  );
}

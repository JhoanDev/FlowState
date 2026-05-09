"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";

import { useSettings } from "@/providers/settings-provider";

export function GlobalLoader() {
  const { isLoading: isSettingsLoading } = useSettings();
  const [minTimeElapsed, setMinTimeElapsed] = React.useState(false);

  React.useEffect(() => {
    // Minimum 1.5s of loading screen to guarantee UI rendering settles underneath
    const timer = setTimeout(() => setMinTimeElapsed(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const showLoader = !minTimeElapsed || isSettingsLoading;

  return (
    <AnimatePresence>
      {showLoader && (
        <motion.div
          key="global-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative w-28 h-28 rounded-3xl overflow-hidden border border-border/50 emissive-border flex items-center justify-center p-5">
              <img 
                src="/flowstate-mark-light.svg" 
                alt="FlowState Logo" 
                className="w-full h-full object-contain block dark:hidden" 
              />
              <img 
                src="/flowstate-mark-dark.svg" 
                alt="FlowState Logo" 
                className="w-full h-full object-contain hidden dark:block" 
              />
            </div>
            
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2, duration: 0.4 }}
               className="flex flex-col items-center gap-2"
            >
              <h1 className="text-2xl font-bold tracking-tight text-foreground">FlowState</h1>
              
              <div className="flex items-center gap-2 mt-2">
                {[0, 1, 2].map((i) => (
                  <motion.div 
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} 
                    transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }} 
                    className="w-1.5 h-1.5 rounded-full bg-primary" 
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

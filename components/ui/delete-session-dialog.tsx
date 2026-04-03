"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteSession } from "@/services/sessions";
import { useTranslation } from "react-i18next";

interface DeleteSessionDialogProps {
  sessionId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function DeleteSessionDialog({
  sessionId,
  open,
  onOpenChange,
  onDeleted,
}: DeleteSessionDialogProps) {
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await deleteSession(sessionId);
      onDeleted();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
      onOpenChange(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4">
      <div className="bg-card/95 backdrop-blur-md border border-border w-full max-w-sm p-6 rounded-xl emissive-border flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive border border-destructive/20">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {t("session.deleteSession")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              {t("session.deleteSessionConfirm")}
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
          <Button
            variant="outline"
            className="sm:flex-1 h-10 border-border"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            className="sm:flex-1 h-10 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold"
            onClick={handleConfirm}
            disabled={deleting}
          >
            {deleting ? t("common.loading") : t("common.delete")}
          </Button>
        </div>
      </div>
    </div>
  );
}

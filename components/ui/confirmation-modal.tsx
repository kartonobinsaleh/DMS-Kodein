"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}: ConfirmationModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const variants = {
    danger: "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20",
    warning: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20",
    info: "bg-primary hover:bg-primary/90 shadow-primary/20",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Content */}
      <div className="relative w-full max-w-md scale-in overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex h-12 items-center justify-between border-b border-border px-6 bg-muted/30">
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-500",
              variant === "warning" && "bg-amber-500/10 text-amber-500",
              variant === "info" && "bg-primary/10 text-primary"
            )}>
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-muted transition-all active:scale-[0.98]"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={cn(
                "flex-1 rounded-xl py-2.5 text-sm font-medium text-white shadow-lg transition-all active:scale-[0.98]",
                variants[variant]
              )}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

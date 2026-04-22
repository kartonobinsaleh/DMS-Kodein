"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "success" | "danger" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  leftIcon,
  rightIcon,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100",
    danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-100",
    outline: "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-5 py-2.5 text-sm rounded-xl",
    lg: "px-6 py-3 text-sm rounded-xl",
    xl: "px-8 py-4 text-base rounded-2xl",
  };

  return (
    <button
      disabled={loading || disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-sm",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={18} />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      
      <span className="truncate">{children}</span>
      
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}

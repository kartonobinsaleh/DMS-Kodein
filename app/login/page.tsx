"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LogIn, AlertCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().email("Alamat email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        setError("Email atau password tidak valid");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (_err) {
      setError("Terjadi kesalahan yang tidak terduga");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-[2.5rem] border border-slate-200 bg-background shadow-xl relative overflow-hidden">
        {/* Banner - Framed with Margins (Sharp Corners) */}
        <div className="p-8 pb-0">
          <div className="overflow-hidden border border-slate-100 shadow-sm">
            <img src="/banner.png" alt="Kodein School Banner" className="w-full h-auto object-cover" />
          </div>
        </div>

        {/* Background Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50" />

        <div className="px-10 pb-8 pt-6 text-center relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
            Device Management System
          </p>
        </div>

        <form className="px-10 pb-12 space-y-8 relative z-10" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-600 border border-rose-100 animate-in shake duration-300">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                Alamat Email
              </label>
              <input
                {...register("email")}
                type="email"
                className={cn(
                  "block w-full rounded-2xl border border-slate-200 bg-background px-6 py-4 text-sm font-bold placeholder-slate-300 focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all",
                  errors.email && "border-rose-300 focus:border-rose-400"
                )}
                placeholder="admin@dms.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-[10px] font-black text-rose-500 uppercase tracking-tight ml-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className={cn(
                    "block w-full rounded-2xl border border-slate-200 bg-background px-6 py-4 text-sm font-bold placeholder-slate-300 focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all",
                    errors.password && "border-rose-300 focus:border-rose-400"
                  )}
                  placeholder="••••••••"
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 p-2 hover:bg-transparent"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </Button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-[10px] font-black text-rose-500 uppercase tracking-tight ml-1">{errors.password.message}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            loading={isLoading}
            size="md"
            className="w-full"
          >
            SIGN IN ACCESS
          </Button>
        </form>

        <div className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest relative z-10 pb-10 pt-2">
          &copy; 2026 KODEIN SCHOOL. Secured Access Only.
        </div>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  otp: z.string().min(6, "Enter the 6-digit code").max(6),
});

type FormData = z.infer<typeof schema>;

function AdminLogin() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async () => {
    // The current backend intentionally exposes student authentication only.
    // Do not simulate admin access in the browser: that would bypass access control.
    setIsSubmitting(true);
    toast.error("Admin sign-in is not configured", {
      description: "Configure a server-side admin authentication endpoint before enabling console access.",
    });
    setIsSubmitting(false);
  };

  return (
    <AuthLayout role="admin">
      <div className="w-full max-w-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-md">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h2 className="mt-5 font-display text-3xl font-bold tracking-tight">Admin Console</h2>
        <p className="mt-2 text-sm text-muted-foreground">Restricted access — sign in with your admin credentials and OTP.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Admin Email</Label>
            <Input id="email" type="email" placeholder="admin@careercompass.ai" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="otp">2FA Code</Label>
            <Input id="otp" placeholder="6-digit code" maxLength={6} {...register("otp")} />
            {errors.otp && <p className="text-xs text-destructive">{errors.otp.message}</p>}
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Checking access..." : "Sign In to Console"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/login" className="font-semibold text-primary hover:underline">← Student login</Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export { AdminLogin };

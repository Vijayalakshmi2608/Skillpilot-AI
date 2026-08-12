import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { KeyRound, MailCheck } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type FormData = z.infer<typeof schema>;

function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = () => {
    setSent(true);
    toast.success("Reset link sent!", { description: "Check your email inbox for a password reset link." });
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
          <KeyRound className="h-6 w-6" />
        </div>
        <h2 className="mt-5 font-display text-3xl font-bold tracking-tight">Reset your password</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the email linked to your account and we'll send you a reset link.
        </p>

        {sent ? (
          <div className="mt-8 rounded-2xl border border-accent/30 bg-accent/5 p-6 text-center">
            <MailCheck className="mx-auto h-10 w-10 text-accent" />
            <h3 className="mt-3 font-display text-lg font-bold">Check your inbox</h3>
            <p className="mt-1 text-sm text-muted-foreground">We've sent a password reset link. It expires in 30 minutes.</p>
            <Link to="/login" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">Back to login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <Button type="submit" size="lg" className="w-full">Send Reset Link</Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remembered it? <Link to="/login" className="font-semibold text-primary hover:underline">Back to login</Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export { ForgotPassword };

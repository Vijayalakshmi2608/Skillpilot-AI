import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useState } from "react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

function StudentLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      toast.success("Logged in successfully!", { description: "Welcome back!" });
      navigate("/student/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      toast.error("Login failed", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <h2 className="font-display text-3xl font-bold tracking-tight">Welcome back</h2>
        <p className="mt-2 text-sm text-muted-foreground">Log in to continue your career journey.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" {...register("password")} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <div className="flex items-center justify-between">
            <Checkbox id="remember" label="Remember me" {...register("remember")} />
            <Link to="/admin/login" className="text-xs font-medium text-muted-foreground hover:text-primary">Admin login →</Link>
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            <LogIn className="h-4 w-4" /> {isSubmitting ? "Logging in..." : "Log In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to Career Compass?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">Create an account</Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export { StudentLogin };

import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

const schema = z.object({
  fullName: z.string().min(3, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  stream: z.string().min(1, "Select your stream"),
  city: z.string().min(2, "Enter your city"),
});

type FormData = z.infer<typeof schema>;

function StudentRegister() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register: registerUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await registerUser({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        stream: data.stream,
        city: data.city,
      });
      toast.success("Account created!", { description: "Welcome aboard! Let's find your career compass." });
      navigate("/student/assessment");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      toast.error("Registration failed", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <h2 className="font-display text-3xl font-bold tracking-tight">Create your account</h2>
        <p className="mt-2 text-sm text-muted-foreground">Free forever for Class 12 students. Start with the assessment.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" placeholder="Aarav Sharma" {...register("fullName")} />
            {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stream">Stream</Label>
              <Select id="stream" defaultValue="" {...register("stream")}>
                <option value="" disabled>Select</option>
                <option value="PCM">PCM</option>
                <option value="PCB">PCB</option>
                <option value="PCMB">PCMB</option>
                <option value="Commerce">Commerce</option>
                <option value="Arts">Arts</option>
              </Select>
              {errors.stream && <p className="text-xs text-destructive">{errors.stream.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="Chennai" {...register("city")} />
              {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Minimum 8 characters" {...register("password")} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            <UserPlus className="h-4 w-4" /> {isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">Log in</Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export { StudentRegister };

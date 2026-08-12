import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Camera, User, Mail, Phone, MapPin, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

const schema = z.object({
  fullName: z.string().min(3, "Required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Invalid phone"),
  city: z.string().min(2, "Required"),
  school: z.string().min(2, "Required"),
  stream: z.string().min(1, "Select stream"),
  boardScore: z.string().min(1, "Required"),
});

type FormData = z.infer<typeof schema>;

function StudentProfile() {
  const { user, refreshProfile } = useAuth();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", phone: "", city: "", school: "", stream: "", boardScore: "" },
  });

  useEffect(() => {
    if (user) {
      reset({ fullName: user.fullName || "", email: user.email || "", phone: user.phone || "", city: user.city || "", school: user.school || "", stream: user.stream || "", boardScore: user.boardScore || "" });
    }
  }, [user, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      await api.patch("/students/me", data);
      await refreshProfile();
      toast.success("Profile saved!", { description: "Your profile has been updated." });
    } catch (error) {
      toast.error("Unable to save profile", { description: error instanceof Error ? error.message : "Please try again." });
    }
  };

  const displayName = user?.fullName || "Student";
  const education = [user?.studentClass || "Education not provided", user?.stream].filter(Boolean).join(" · ");

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Keep your details updated — better data means better career matches."
        breadcrumbs={[{ label: "Dashboard", to: "/student/dashboard" }, { label: "Profile" }]}
        icon={User}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <Card className="h-fit">
          <CardHeader className="text-center">
            <div className="relative mx-auto">
              <Avatar initials={displayName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()} color="bg-gradient-to-br from-blue-600 to-indigo-600" size="lg" />
              <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-md" onClick={() => toast.info("Photo upload is a UI demo")}>
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <CardTitle className="mt-3">{displayName}</CardTitle>
            <p className="text-sm text-muted-foreground">{education}</p>
            <div className="mt-2 flex justify-center gap-2">
              <Badge variant="secondary">AI/ML aspirant</Badge>
              <Badge variant="accent">NTSE eligible</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> {user?.email || "Not provided"}</p>
            <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> {user?.phone || "Not provided"}</p>
            <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> {user?.city || "Not provided"}</p>
            <p className="flex items-center gap-2 text-muted-foreground"><GraduationCap className="h-4 w-4" /> {user?.school || "Not provided"}</p>
            <div className="pt-2">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted-foreground">Profile completeness</span>
                <span className="font-bold text-primary">78%</span>
              </div>
              <Progress value={78} />
            </div>
          </CardContent>
        </Card>

        {/* Edit form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <p className="text-sm text-muted-foreground">Update your personal and academic information.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" {...register("fullName")} />
                {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register("city")} />
                {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="school">School</Label>
                <Input id="school" {...register("school")} />
                {errors.school && <p className="text-xs text-destructive">{errors.school.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="stream">Stream</Label>
                <Select id="stream" {...register("stream")}>
                  <option value="PCM">PCM</option>
                  <option value="PCB">PCB</option>
                  <option value="PCMB">PCMB</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="boardScore">Board Score (%)</Label>
                <Input id="boardScore" {...register("boardScore")} />
                {errors.boardScore && <p className="text-xs text-destructive">{errors.boardScore.message}</p>}
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full">Save Changes</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { StudentProfile };

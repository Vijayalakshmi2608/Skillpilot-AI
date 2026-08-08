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
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "Aarav Sharma", email: "aarav.sharma@student.in", phone: "9876543210", city: "Chennai", school: "DAV Senior Secondary School", stream: "PCM", boardScore: "92%" },
  });

  const onSubmit = () => toast.success("Profile saved!", { description: "Your changes have been saved (UI demo)." });

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
              <Avatar initials="AR" color="bg-gradient-to-br from-blue-600 to-indigo-600" size="lg" />
              <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-md" onClick={() => toast.info("Photo upload is a UI demo")}>
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <CardTitle className="mt-3">Aarav Sharma</CardTitle>
            <p className="text-sm text-muted-foreground">Class 12 · PCM · Chennai</p>
            <div className="mt-2 flex justify-center gap-2">
              <Badge variant="secondary">AI/ML aspirant</Badge>
              <Badge variant="accent">NTSE eligible</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> aarav.sharma@student.in</p>
            <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> +91 98765 43210</p>
            <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> Chennai, Tamil Nadu</p>
            <p className="flex items-center gap-2 text-muted-foreground"><GraduationCap className="h-4 w-4" /> DAV Senior Secondary School</p>
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

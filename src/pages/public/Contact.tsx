import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, MapPin, MessageSquare, Phone, Send } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

const info = [
  { icon: Mail, title: "Email Us", value: "hello@careercompass.ai" },
  { icon: Phone, title: "Call Us", value: "+91 98765 43210" },
  { icon: MapPin, title: "Visit Us", value: "Chennai, Tamil Nadu, India" },
];

function Contact() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    toast.success("Message sent!", { description: `Thanks ${data.name}, we'll get back to you within 24 hours.` });
    reset();
  };

  return (
    <div className="container py-10">
      <PageHeader
        title="Contact Us"
        description="Questions, feedback or partnership ideas? We'd love to hear from you."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Contact" }]}
        icon={MessageSquare}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          {info.map((i) => (
            <Card key={i.title}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
                  <i.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{i.title}</p>
                  <p className="text-sm text-muted-foreground">{i.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
          <Card>
            <CardContent className="p-5">
              <p className="text-sm font-semibold">Response time</p>
              <p className="mt-1 text-sm text-muted-foreground">We typically respond within 24 hours on weekdays, and 48 hours on weekends.</p>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input id="name" placeholder="Aarav Sharma" {...register("name")} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="How can we help?" {...register("subject")} />
                {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" rows={6} placeholder="Tell us more..." {...register("message")} />
                {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
              </div>
              <Button type="submit" className="w-full sm:w-auto">
                <Send className="h-4 w-4" /> Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { Contact };

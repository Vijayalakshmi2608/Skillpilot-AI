import { Compass } from "lucide-react";

function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-2xl bg-primary/20" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-glow">
          <Compass className="h-7 w-7" />
        </div>
      </div>
      <p className="text-sm font-medium text-muted-foreground">Calibrating your compass...</p>
    </div>
  );
}

export { LoadingScreen };

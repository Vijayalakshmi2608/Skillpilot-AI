import { Link } from "react-router-dom";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-glow">
        <Compass className="h-10 w-10" />
      </div>
      <p className="mt-8 font-display text-7xl font-extrabold text-gradient">404</p>
      <h1 className="mt-3 font-display text-2xl font-bold">You've drifted off the map</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        The page you're looking for doesn't exist or has been moved. Let's get you back on course.
      </p>
      <div className="mt-8 flex gap-3">
        <Link to="/"><Button size="lg"><Home className="h-4 w-4" /> Back to Home</Button></Link>
        <Link to="/explore"><Button size="lg" variant="outline">Explore Careers</Button></Link>
      </div>
    </div>
  );
}

export { NotFound };

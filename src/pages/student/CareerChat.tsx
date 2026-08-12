import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  suggestedResources?: string[];
  nextSteps?: string[];
};

type ChatResponse = {
  response: string;
  suggestedResources?: string[];
  nextSteps?: string[];
};

function CareerChat() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Please log in to use the career chatbot.");
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    if (!isAuthenticated) {
      toast.error("Please log in first.");
      return;
    }

    const userMessage: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const data = await api.post<{ success: boolean; data: ChatResponse }>("/ai/chat", {
        message: text,
        student_profile: {},
      });
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.data.response,
        suggestedResources: data.data.suggestedResources,
        nextSteps: data.data.nextSteps,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to get response";
      toast.error("Chat failed", { description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
      <PageHeader
        title="AI Career Chatbot"
        description="Ask anything about careers, colleges, skills, jobs, or higher studies."
        breadcrumbs={[{ label: "Dashboard", to: "/student/dashboard" }, { label: "Career Chat" }]}
        icon={Bot}
      />

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardContent className="flex flex-1 flex-col p-0">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
                <Bot className="mb-2 h-8 w-8 text-primary" />
                <p className="font-semibold text-foreground">Start a conversation</p>
                <p>Ask about careers, colleges, skills, jobs, higher studies, or anything else.</p>
              </div>
            )}
            <AnimatePresence>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  {m.role === "assistant" && (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                      <Bot className="h-4 w-4" />
                    </span>
                  )}
                  <div className={cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm", m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                    <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                    {m.suggestedResources && m.suggestedResources.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Resources</p>
                        {m.suggestedResources.map((r) => <Badge key={r} variant="secondary">{r}</Badge>)}
                      </div>
                    )}
                    {m.nextSteps && m.nextSteps.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Next Steps</p>
                        <ul className="space-y-0.5 text-xs text-muted-foreground">
                          {m.nextSteps.map((s, idx) => <li key={idx}>• {s}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                  {m.role === "user" && (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                      <User className="h-4 w-4" />
                    </span>
                  )}
                </motion.div>
              ))}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div className="rounded-2xl bg-muted px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          <div className="border-t p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about careers, colleges, skills, jobs..."
                disabled={loading || !isAuthenticated}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !input.trim() || !isAuthenticated}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { CareerChat };

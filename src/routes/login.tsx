import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { SiteLayout, PageHeader } from "@/components/SiteLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Account — Explorers Smash Burger" },
      { name: "description", content: "Sign in to track your Explorers Smash Burger orders and saved favourites." },
      { property: "og:title", content: "Account — Explorers Smash Burger" },
      { property: "og:description", content: "Sign in to keep your favourites and order history." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user && isAdmin) navigate({ to: "/admin" });
  }, [user, isAdmin, navigate]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin, data: { full_name: fullName } },
      });
      setBusy(false);
      if (error) {
        toast.error("Sign up failed", { description: error.message });
        return;
      }
      toast.success("Check your email", { description: "Confirm your address to finish creating your account." });
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error("Sign in failed", { description: error.message });
      return;
    }
    toast.success("Signed in");
    navigate({ to: "/" });
  };

  if (user) {
    return (
      <SiteLayout>
        <PageHeader title="Your account" subtitle={user.email ?? ""} />
        <div className="mx-auto w-full max-w-md space-y-4 px-4 py-12">
          <p className="text-sm text-muted-foreground">
            You're signed in{isAdmin ? " as an administrator" : ""}. Favourites sync to your account automatically.
          </p>
          <button
            type="button"
            onClick={async () => {
              await signOut();
              toast.success("Signed out");
            }}
            className="w-full border border-border px-5 py-3 text-xs font-bold uppercase tracking-widest transition-colors hover:border-destructive hover:text-destructive"
          >
            Sign out
          </button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageHeader title="Account" subtitle="Sign in to save favourites and follow your orders. Guest checkout stays open." />
      <div className="mx-auto w-full max-w-md px-4 py-12">
        <div className="mb-6 grid grid-cols-2 border border-border">
          {(["signin", "signup"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              aria-pressed={mode === value}
              className={cn(
                "px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors",
                mode === value ? "bg-primary text-primary-foreground" : "bg-background hover:bg-surface",
              )}
            >
              {value === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4 border border-border p-6">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="full-name">Full name</Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="rounded-none"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-none"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>
    </SiteLayout>
  );
}

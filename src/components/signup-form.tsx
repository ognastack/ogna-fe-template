import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/api/OgnaContext";

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const client = useAuth();
  const [busy, setBusy] = useState(false);

  const signUp = async () => {
    setBusy(true);
    try {
      await client.auth.signUpWithRedirect({ returnTo: "/protected" });
    } catch (err) {
      setBusy(false);
      toast(err instanceof Error ? err.message : "Could not start sign-up");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            You will be redirected to the secure registration page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <Button className="w-full" onClick={signUp} disabled={busy}>
              {busy ? "Redirecting…" : "Sign up"}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <a href="/account/login" className="underline underline-offset-4">
                Log in
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

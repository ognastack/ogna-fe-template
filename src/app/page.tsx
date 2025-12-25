import { SiteHeader } from "@/components/site-header";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
              <Card>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mt-4 text-center text-sm">
                    have an account?{" "}
                    <a
                      href="/account/login"
                      className="underline underline-offset-4"
                    >
                      Logn In
                    </a>
                  </div>
                </CardContent>
                <CardFooter>Sign in to start using</CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>SignUp</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mt-4 text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <a
                      href="/account/signup"
                      className="underline underline-offset-4"
                    >
                      Sign up
                    </a>
                  </div>
                </CardContent>
                <CardFooter>Create an account</CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

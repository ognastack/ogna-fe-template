import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
} from "react";
import { OgnaClient } from "@/api/OgnaClient";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const OgnaContext = createContext<OgnaClient | undefined>(undefined);

export const useAuth = (): OgnaClient => {
  const ctx = useContext(OgnaContext);
  if (!ctx) {
    throw new Error("OgnaContext must be used within an AuthProvider");
  }
  return ctx;
};

type OgnaAppProps = {
  baseUrl: string;
} & PropsWithChildren;

export const OgnaAppContainer = ({ children, baseUrl }: OgnaAppProps) => {
  const auth = useMemo(() => new OgnaClient(baseUrl), [baseUrl]);
  return (
    <OgnaContext.Provider value={auth}>
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
              <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6"></div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </OgnaContext.Provider>
  );
};

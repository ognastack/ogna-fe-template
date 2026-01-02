import React, {
  PropsWithChildren,
  useMemo,
} from "react";
import { OgnaClient } from '@ogna/js';
import { OgnaContext } from "@/api/OgnaContext";

import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";


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
              <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
                {children}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </OgnaContext.Provider>
  );
};

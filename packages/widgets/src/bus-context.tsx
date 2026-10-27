import type { PaneBus } from "@window-host/core";
import { createContext, useContext, type ReactNode } from "react";

const PaneBusContext = createContext<PaneBus | null>(null);
const PaneIdContext = createContext<string>("");

export function PaneBusProvider({ bus, children }: { bus: PaneBus; children: ReactNode }) {
  return <PaneBusContext.Provider value={bus}>{children}</PaneBusContext.Provider>;
}

export function PaneIdProvider({ paneId, children }: { paneId: string; children: ReactNode }) {
  return <PaneIdContext.Provider value={paneId}>{children}</PaneIdContext.Provider>;
}

export function usePaneBus(): PaneBus {
  const bus = useContext(PaneBusContext);
  if (!bus) throw new Error("usePaneBus requires PaneBusProvider");
  return bus;
}

export function usePaneId(): string {
  return useContext(PaneIdContext);
}

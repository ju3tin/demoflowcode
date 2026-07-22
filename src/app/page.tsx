"use client";

import { useMemo, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { NodePalette } from "@/components/panels/NodePalette";
import { TopBar } from "@/components/panels/TopBar";
import { FlowCanvas } from "@/components/flow/FlowCanvas";
import { EmptyCanvasState } from "@/components/flow/EmptyCanvasState";
import { ViewTabs, type MainView } from "@/components/panels/ViewTabs";
import { CodeView } from "@/components/panels/CodeView";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";
import { useFlowStore } from "@/lib/flow-store";
import { compileToSolidity } from "@/lib/compiler";

export default function Home() {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const nodeCount = nodes.length;

  const [paletteMobileOpen, setPaletteMobileOpen] = useState(false);
  const [assistantMobileOpen, setAssistantMobileOpen] = useState(false);
  const [paletteCollapsed, setPaletteCollapsed] = useState(false);
  const [assistantCollapsed, setAssistantCollapsed] = useState(false);
  const [mainView, setMainView] = useState<MainView>("canvas");

  const hasCodeIssue = useMemo(
    () => nodeCount > 0 && compileToSolidity(nodes, edges).errors.length > 0,
    [nodes, edges, nodeCount]
  );

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden">
      <NodePalette
        mobileOpen={paletteMobileOpen}
        onCloseMobile={() => setPaletteMobileOpen(false)}
        collapsed={paletteCollapsed}
        onToggleCollapsed={() => setPaletteCollapsed((c) => !c)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          onOpenPalette={() => setPaletteMobileOpen(true)}
          onOpenAssistant={() => setAssistantMobileOpen(true)}
        />
        <ViewTabs value={mainView} onChange={setMainView} hasCodeIssue={hasCodeIssue} />

        <div className="relative flex-1 min-h-0">
          {mainView === "canvas" ? (
            <>
              <ReactFlowProvider>
                <FlowCanvas />
              </ReactFlowProvider>
              {nodeCount === 0 && <EmptyCanvasState />}
            </>
          ) : (
            <CodeView />
          )}
        </div>
      </div>

      <AssistantPanel
        mobileOpen={assistantMobileOpen}
        onCloseMobile={() => setAssistantMobileOpen(false)}
        collapsed={assistantCollapsed}
        onToggleCollapsed={() => setAssistantCollapsed((c) => !c)}
      />
    </div>
  );
}

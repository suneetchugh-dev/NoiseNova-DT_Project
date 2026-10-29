import { Link2, Radio, Smartphone, Wifi } from "lucide-react";
import { NodeRoster } from "../components/NodeRoster";
import { StatCard } from "../components/StatCard";
import type { HubStatus, NodeSummary } from "../lib/types";

interface NodesPageProps {
  nodes: NodeSummary[];
  selectedNodeId: string;
  onSelect: (nodeId: string) => void;
  selfNodeId: string;
  hubStatus: HubStatus;
  onOpenPairing: () => void;
}

const STEPS = [
  {
    title: "Start the hub on the laptop",
    body: "npm run hub prints a pairing string of the form 192.168.x.x:8787#token. Keep the window open.",
  },
  {
    title: "Pair each edge node",
    body: "On the phone or second laptop, open Settings, paste that string, then Test then Save. Same Wi-Fi network is required.",
  },
  {
    title: "Press Start on the node",
    body: "The node captures one reading per second and pushes it over the socket. Every paired viewer sees it within a second.",
  },
] as const;

export function NodesPage({
  nodes,
  selectedNodeId,
  onSelect,
  selfNodeId,
  hubStatus,
  onOpenPairing,
}: NodesPageProps) {
  const online = nodes.filter((node) => Date.now() - node.lastSeen < 30_000 && node.lastSeen > 0);
  const samples = nodes.reduce((sum, node) => sum + node.readings, 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <StatCard
          icon={Radio}
          label="Reporting nodes"
          value={String(online.length)}
          detail={`${nodes.length} known in this session`}
          accent={online.length > 0 ? "#2DD4BF" : undefined}
        />
        <StatCard
          icon={Wifi}
          label="Hub"
          value={hubStatus === "live" ? "Paired" : hubStatus === "connecting" ? "Wait" : "Down"}
          detail={hubStatus === "live" ? "Socket connected" : "Readings stay on this device"}
          accent={
            hubStatus === "live" ? "#2DD4BF" : hubStatus === "connecting" ? "#D9A353" : "#F43F5E"
          }
        />
        <StatCard
          icon={Smartphone}
          label="Samples"
          value={String(samples)}
          detail="Total stored per node"
        />
        <button
          type="button"
          onClick={onOpenPairing}
          className="bezel lift flex cursor-pointer flex-col items-start justify-center gap-1 p-4 text-left"
        >
          <span className="flex items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5 text-[#D9A353]" strokeWidth={2} />
            <span className="label-mono">Pair a device</span>
          </span>
          <span className="text-[12px] font-medium text-white/80">Open pairing</span>
          <span className="text-[10.5px] text-white/32">Enter the hub address printed on start-up</span>
        </button>
      </div>

      <section>
        <div className="mb-2 flex items-center gap-2">
          <h2 className="text-[13px] font-semibold tracking-tight text-white/85">All nodes</h2>
          <span className="num text-[11px] text-white/30">{nodes.length}</span>
        </div>
        <NodeRoster
          nodes={nodes}
          activeNodeId={selectedNodeId}
          onSelect={onSelect}
          selfNodeId={selfNodeId}
        />
      </section>

      <section className="bezel p-4">
        <h2 className="text-[13px] font-semibold tracking-tight text-white/85">
          How a node joins
        </h2>
        <ol className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="bezel-inset p-3">
              <span className="num text-[10px] font-semibold text-[#D9A353]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-1.5 text-[12px] font-medium text-white/82">{step.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-white/35">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bezel p-4">
        <h2 className="text-[13px] font-semibold tracking-tight text-white/85">
          Node requirements
        </h2>
        <ul className="mt-2.5 space-y-1.5">
          {[
            "Microphone permission granted to the browser or the installed app.",
            "A secure context: HTTPS, localhost, or the Android container's https origin.",
            "Both devices on the same network as the hub, with inbound TCP allowed through the firewall.",
            "Background microphone capture is not supported on Android; keep the app in the foreground while measuring.",
          ].map((line) => (
            <li key={line} className="flex gap-2 text-[11.5px] leading-relaxed text-white/45">
              <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 rounded-[1px] bg-white/25" />
              {line}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

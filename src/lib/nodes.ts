import type { NodeSummary, Reading } from "./types.ts";

interface SelfDescriptor {
  nodeId: string;
  nodeLabel: string;
  kind: NodeSummary["kind"];
}

/**
 * Node roster = what the hub knows (presence) merged with what the feed proves
 * (recent readings). The feed wins on recency because the hub's presence list is
 * updated on a slower cadence than the 1 Hz reading stream.
 */
export function buildNodes(
  feed: readonly Reading[],
  remote: readonly NodeSummary[],
  self: SelfDescriptor,
): NodeSummary[] {
  const counts = new Map<string, number>();
  const latest = new Map<string, Reading>();

  for (const reading of feed) {
    counts.set(reading.nodeId, (counts.get(reading.nodeId) ?? 0) + 1);
    const current = latest.get(reading.nodeId);
    if (!current || reading.ts >= current.ts) latest.set(reading.nodeId, reading);
  }

  const nodes = new Map<string, NodeSummary>();
  for (const summary of remote) nodes.set(summary.nodeId, { ...summary });

  for (const [nodeId, reading] of latest) {
    const prior = nodes.get(nodeId);
    const newer = prior && prior.lastSeen > reading.ts ? prior : null;
    nodes.set(nodeId, {
      nodeId,
      nodeLabel: reading.nodeLabel,
      kind: reading.kind,
      lastSeen: newer ? newer.lastSeen : reading.ts,
      db: newer ? newer.db : reading.db,
      status: newer ? newer.status : reading.status,
      source: newer ? newer.source : reading.source,
      readings: Math.max(counts.get(nodeId) ?? 0, prior?.readings ?? 0),
    });
  }

  if (!nodes.has(self.nodeId)) {
    nodes.set(self.nodeId, {
      nodeId: self.nodeId,
      nodeLabel: self.nodeLabel,
      kind: self.kind,
      lastSeen: 0,
      db: 0,
      status: "QUIET",
      source: self.kind === "phone" ? "android-mic" : "browser-mic",
      readings: 0,
    });
  }

  return [...nodes.values()].sort((a, b) => {
    if (a.nodeId === self.nodeId) return -1;
    if (b.nodeId === self.nodeId) return 1;
    return b.lastSeen - a.lastSeen;
  });
}

import { useEffect, useState } from "react";
import { CheckCircle2, Link2Off, Loader2, PlugZap, XCircle } from "lucide-react";
import { normaliseHubUrl, probeHub, resolveHub } from "../lib/hub";
import { clearHubConfig, loadHubConfig, saveHubConfig } from "../lib/storage";
import { Modal } from "./Modal";

interface PairHubDialogProps {
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
}

type TestState =
  | { kind: "idle" }
  | { kind: "testing" }
  | { kind: "ok"; nodes: number; readings: number }
  | { kind: "fail"; message: string };

export function PairHubDialog({ open, onClose, onChanged }: PairHubDialogProps) {
  const [value, setValue] = useState("");
  const [test, setTest] = useState<TestState>({ kind: "idle" });
  const current = loadHubConfig();
  const fallback = resolveHub();

  useEffect(() => {
    if (!open) return;
    setValue(current.url ? `${current.url}${current.token ? `#${current.token}` : ""}` : "");
    setTest({ kind: "idle" });
    // `current` is re-read on open by design; the dependency is the dialog toggle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const parsed = normaliseHubUrl(value);

  async function runTest() {
    if (!parsed.url) {
      setTest({ kind: "fail", message: "Enter a hub address first." });
      return;
    }
    setTest({ kind: "testing" });
    try {
      const health = await probeHub(parsed.url, parsed.token);
      setTest({ kind: "ok", nodes: health.nodes, readings: health.readings });
    } catch (error) {
      setTest({
        kind: "fail",
        message: error instanceof Error ? error.message : "Hub did not respond.",
      });
    }
  }

  function save() {
    if (!parsed.url) return;
    saveHubConfig({ url: parsed.url, token: parsed.token });
    onChanged();
    onClose();
  }

  function disconnect() {
    clearHubConfig();
    onChanged();
    setValue("");
    setTest({ kind: "idle" });
  }

  return (
    <Modal
      open={open}
      title="Pair with hub"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={disconnect}
            className="mr-auto flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-[10px] font-mono font-bold uppercase tracking-wide text-white/45 transition-colors hover:bg-[#F43F5E]/10 hover:text-[#F43F5E]"
          >
            <Link2Off className="h-3.5 w-3.5" strokeWidth={2} />
            Disconnect
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-9 cursor-pointer rounded-lg border border-white/10 px-3.5 text-[10px] font-mono font-bold uppercase tracking-wide text-white/60 transition-colors hover:border-white/20 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!parsed.url}
            className="h-9 cursor-pointer rounded-lg bg-[#EDEEF0] px-3.5 text-[10px] font-mono font-bold uppercase tracking-wide text-[#0a0b0d] transition-opacity hover:opacity-90 disabled:opacity-35"
          >
            Save
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="hub-address" className="label-mono">
            Hub address
          </label>
          <input
            id="hub-address"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setTest({ kind: "idle" });
            }}
            placeholder="192.168.1.42:8787"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            className="num mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white/90 outline-none transition-colors placeholder:text-white/20 focus:border-[#D9A353]/50"
          />
          <p className="mt-2 text-[11px] leading-relaxed text-white/35">
            Enter the address the hub printed on start-up. Append{" "}
            <span className="num text-white/55">#token</span> if the hub requires one. The phone
            and the hub must be on the same Wi-Fi network.
          </p>
        </div>

        {fallback.url ? (
          <div className="bezel-inset px-3 py-2.5">
            <span className="label-mono">Detected default</span>
            <p className="num mt-1 text-[12px] text-white/70">{fallback.url}</p>
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={runTest}
            disabled={test.kind === "testing" || !parsed.url}
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 px-3 text-[10px] font-mono font-bold uppercase tracking-wide text-white/75 transition-colors hover:border-white/20 hover:text-white disabled:opacity-40"
          >
            {test.kind === "testing" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
            ) : (
              <PlugZap className="h-3.5 w-3.5" strokeWidth={2} />
            )}
            Test connection
          </button>
        </div>

        {test.kind === "ok" ? (
          <div className="flex items-start gap-2 rounded-lg border border-[#2DD4BF]/25 bg-[#2DD4BF]/8 px-3 py-2">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2DD4BF]" strokeWidth={2} />
            <p className="text-[11px] leading-relaxed text-[#2DD4BF]/85">
              Hub reachable. {test.nodes} node(s) and {test.readings} stored reading(s) available.
            </p>
          </div>
        ) : null}

        {test.kind === "fail" ? (
          <div className="flex items-start gap-2 rounded-lg border border-[#F43F5E]/25 bg-[#F43F5E]/8 px-3 py-2">
            <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#F43F5E]" strokeWidth={2} />
            <p className="text-[11px] leading-relaxed text-[#F43F5E]/85">
              {test.message} Check that the hub is running, the firewall allows the port, and both
              devices are on the same network.
            </p>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

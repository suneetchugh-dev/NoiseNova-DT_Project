import { ArrowDownRight, ArrowUpRight, Rows3 } from "lucide-react";
import { HistoryTable } from "../components/HistoryTable";
import { StatCard } from "../components/StatCard";
import { average, formatDb, peakOf } from "../lib/noise";
import type { Reading } from "../lib/types";

export function HistoryPage({ readings }: { readings: Reading[] }) {
  const values = readings.map((reading) => reading.db);
  const lowest = values.length > 0 ? Math.min(...values) : 0;
  const highest = peakOf(values);

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <StatCard
          icon={Rows3}
          label="Samples"
          value={String(readings.length)}
          detail="Stored in the hub and this device"
        />
        <StatCard
          icon={ArrowDownRight}
          label="Lowest"
          value={values.length > 0 ? formatDb(lowest) : "--.-"}
          unit="dB"
          detail="Quietest sample in window"
          accent="#2DD4BF"
        />
        <StatCard
          icon={ArrowUpRight}
          label="Highest"
          value={highest > 0 ? formatDb(highest) : "--.-"}
          unit="dB"
          detail="Loudest sample in window"
          accent="#F43F5E"
        />
        <StatCard
          icon={Rows3}
          label="Average"
          value={values.length > 0 ? formatDb(average(values)) : "--.-"}
          unit="dB"
          detail="Arithmetic mean of stored samples"
        />
      </div>

      <div className="min-h-[420px]">
        <HistoryTable readings={readings} limit={600} />
      </div>
    </div>
  );
}

"use client";

import { X } from "lucide-react";
import { formatCount } from "@jev/kit";
import type { Chip } from "@/lib/tag-state";

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

function percent(confidence: number): string {
  return `${formatCount(Math.round(confidence * 100))}%`;
}

type TagChipProps = { chip: Chip; onConfirm: (chip: Chip) => void; onDismiss: (chip: Chip) => void };

/* A tag Jev read. Filled means it is applied, dashed means it waits for a click. */
export function TagChip({ chip, onConfirm, onDismiss }: TagChipProps) {
  if (chip.kind === "guess") {
    return (
      <li className="flex h-8 overflow-hidden rounded-[3px] border-2 border-dashed border-ink/45">
        <button
          type="button"
          onClick={() => onConfirm(chip)}
          title={`Jev is ${percent(chip.confidence)} sure. Select to use it.`}
          aria-label={`Use ${chip.label}. Jev is ${percent(chip.confidence)} sure.`}
          className={`flex items-center gap-2 pl-2.5 pr-2 text-[14px] font-semibold hover:bg-ink/5 ${FOCUS}`}
        >
          {chip.label}?<span className="text-[12px] font-normal tabular-nums text-muted">{percent(chip.confidence)}</span>
        </button>
        <button
          type="button"
          onClick={() => onDismiss(chip)}
          aria-label={`Remove ${chip.label}`}
          className={`grid w-7 place-items-center text-muted hover:bg-ink/5 hover:text-ink ${FOCUS}`}
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      </li>
    );
  }

  return (
    <li className="flex h-8 items-stretch overflow-hidden rounded-[3px] bg-signal text-signal-ink">
      <span className="flex items-center pl-2.5 pr-1 text-[14px] font-semibold" title={`Jev is ${percent(chip.confidence)} sure`}>
        {chip.label}
      </span>
      <button
        type="button"
        onClick={() => onDismiss(chip)}
        aria-label={`Remove ${chip.label}`}
        className={`grid w-7 place-items-center hover:bg-signal-ink/10 ${FOCUS}`}
      >
        <X size={14} strokeWidth={2.5} />
      </button>
    </li>
  );
}

/* The same tag on a saved entry, where there is nothing left to decide. */
export function StaticChip({ label }: { label: string }) {
  return (
    <li className="rounded-[3px] bg-signal px-2 py-0.5 text-[13px] font-semibold text-signal-ink">{label}</li>
  );
}

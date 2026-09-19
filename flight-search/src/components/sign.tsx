"use client";

import {
  ArrowDownWideNarrow,
  Armchair,
  Ban,
  CalendarDays,
  ChevronDown,
  Clock,
  Moon,
  MoveRight,
  PlaneLanding,
  PlaneTakeoff,
  X,
  type LucideIcon,
} from "lucide-react";
import { AIRPORTS } from "@/lib/airports";
import { formatPercent } from "@/lib/format";
import type { Sign, SignField } from "@/lib/search-state";

const ICONS: Record<SignField, LucideIcon> = {
  origin: PlaneTakeoff,
  destination: PlaneLanding,
  dates: CalendarDays,
  nonstop: MoveRight,
  departureTime: Clock,
  avoidOvernight: Moon,
  cabin: Armchair,
  priority: ArrowDownWideNarrow,
  avoidAirline: Ban,
};

const AIRPORTS_BY_CITY = [...AIRPORTS].sort((a, b) => a.city.localeCompare(b.city));

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

function Label({ sign }: { sign: Sign }) {
  return (
    <span className="flex items-baseline gap-1.5 whitespace-nowrap text-[14px] font-semibold sm:text-[15px]">
      {sign.label}
      {sign.detail && <span className="font-normal opacity-65">{sign.detail}</span>}
    </span>
  );
}

function Pictogram({ field, className }: { field: SignField; className: string }) {
  const Icon = ICONS[field];
  return (
    <span aria-hidden className={`grid w-9 shrink-0 place-items-center sm:w-10 ${className}`}>
      <Icon size={18} strokeWidth={2.25} />
    </span>
  );
}

function DismissButton({ label, onClick, className }: { label: string; onClick: () => void; className: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={`Remove ${label}`} className={`grid w-8 place-items-center ${FOCUS} ${className}`}>
      <X size={15} strokeWidth={2.5} />
    </button>
  );
}

type SignViewProps = {
  sign: Sign;
  onConfirm: (sign: Sign) => void;
  onDismiss: (sign: Sign) => void;
};

export function SignView({ sign, onConfirm, onDismiss }: SignViewProps) {
  const name = sign.detail ? `${sign.label} ${sign.detail}` : sign.label;

  if (sign.kind === "guess") {
    const percent = formatPercent(sign.confidence ?? 0);
    return (
      <li className="sign-drop flex h-9 overflow-hidden rounded-[3px] border-2 border-dashed border-ink/45 text-ink sm:h-10">
        <button
          type="button"
          onClick={() => onConfirm(sign)}
          title={`Jev is ${percent} sure. Select to use it.`}
          aria-label={`Use ${name}. Jev is ${percent} sure.`}
          className={`flex items-center pr-2 hover:bg-ink/5 ${FOCUS}`}
        >
          <Pictogram field={sign.field} className="-ml-0.5 text-muted" />
          <Label sign={{ ...sign, label: `${sign.label}?` }} />
          <span className="ml-2 text-[13px] tabular-nums text-muted">{percent}</span>
        </button>
        <DismissButton label={name} onClick={() => onDismiss(sign)} className="text-muted hover:bg-ink/5 hover:text-ink" />
      </li>
    );
  }

  if (sign.kind === "default") {
    return (
      <li className="flex h-9 items-stretch overflow-hidden rounded-[3px] border border-rule bg-surface pr-3.5 text-muted sm:h-10">
        <Pictogram field={sign.field} className="" />
        <span className="flex items-center" title="Used until you say otherwise">
          <Label sign={sign} />
        </span>
      </li>
    );
  }

  const source = sign.confidence === null ? "You picked this" : `Jev is ${formatPercent(sign.confidence)} sure`;
  return (
    <li className="sign-drop flex h-9 items-stretch overflow-hidden rounded-[3px] bg-signal text-signal-ink sm:h-10">
      <Pictogram field={sign.field} className="bg-sign-dark text-signal" />
      <span className="flex items-center pl-3 pr-1" title={source}>
        <Label sign={sign} />
      </span>
      <DismissButton label={name} onClick={() => onDismiss(sign)} className="hover:bg-signal-ink/10" />
    </li>
  );
}

type HomeAirportSignProps = { code: string; onChange: (code: string) => void };

/* The origin sign when the traveler has not said where they fly from. It doubles as the home airport picker. */
export function HomeAirportSign({ code, onChange }: HomeAirportSignProps) {
  return (
    <li className="relative flex h-9 items-stretch overflow-hidden rounded-[3px] border border-rule bg-surface text-muted focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink sm:h-10">
      <Pictogram field="origin" className="" />
      <label className="sr-only" htmlFor="home-airport">
        Flying from, unless you say otherwise
      </label>
      <select
        id="home-airport"
        value={code}
        onChange={(event) => onChange(event.target.value)}
        className="field-sizing-content cursor-pointer appearance-none bg-transparent pr-8 font-semibold text-muted outline-none"
      >
        {AIRPORTS_BY_CITY.map((airport) => (
          <option key={airport.code} value={airport.code}>
            {airport.city} {airport.code}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden size={16} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
    </li>
  );
}

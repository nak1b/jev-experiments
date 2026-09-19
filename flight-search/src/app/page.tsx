import { FlightSearch } from "@/components/flight-search";

export default function Home() {
  return (
    <>
      <FlightSearch />
      <footer className="mx-auto w-full max-w-7xl px-4 pb-8 text-[13px] text-muted sm:px-8">
        <p>Flights here are sample data, not real fares. Jev, the TypeSafe System One model, reads what you type.</p>
      </footer>
    </>
  );
}

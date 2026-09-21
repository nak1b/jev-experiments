import { ExpenseTracker } from "@/components/expense-tracker";

export default function Home() {
  return (
    <>
      <ExpenseTracker />
      <footer className="mx-auto w-full max-w-7xl px-4 pb-8 text-[13px] text-muted sm:px-8">
        <p>Expenses stay in this browser. Jev, the TypeSafe System One model, reads what you type.</p>
      </footer>
    </>
  );
}

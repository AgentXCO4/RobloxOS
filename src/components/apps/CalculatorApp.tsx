import { useState } from "react";
import { cn } from "@/lib/utils";

const KEYS = [
  ["C", "±", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", ".", "="],
];

export default function CalculatorApp() {
  const [display, setDisplay] = useState("0");
  const [acc, setAcc] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);

  const applyOp = (a: number, b: number, operator: string) => {
    switch (operator) {
      case "+":
        return a + b;
      case "−":
        return a - b;
      case "×":
        return a * b;
      case "÷":
        return b === 0 ? NaN : a / b;
      default:
        return b;
    }
  };

  const press = (key: string) => {
    if (key === "C") {
      setDisplay("0");
      setAcc(null);
      setOp(null);
      setFresh(true);
      return;
    }
    if (key === "±") {
      setDisplay((d) => (d.startsWith("-") ? d.slice(1) : d === "0" ? d : `-${d}`));
      return;
    }
    if (key === "%") {
      setDisplay((d) => String(Number(d) / 100));
      setFresh(true);
      return;
    }
    if ("+-−×÷".includes(key) && key !== ".") {
      const n = Number(display);
      const next = acc !== null && op && !fresh ? applyOp(acc, n, op) : n;
      setAcc(next);
      setOp(key);
      setDisplay(String(next));
      setFresh(true);
      return;
    }
    if (key === "=") {
      if (acc === null || !op) return;
      const result = applyOp(acc, Number(display), op);
      setDisplay(Number.isFinite(result) ? String(result) : "Error");
      setAcc(null);
      setOp(null);
      setFresh(true);
      return;
    }
    if (key === ".") {
      if (fresh) {
        setDisplay("0.");
        setFresh(false);
        return;
      }
      if (!display.includes(".")) setDisplay(display + ".");
      return;
    }
    if (fresh || display === "0") {
      setDisplay(key);
      setFresh(false);
    } else if (display.length < 14) {
      setDisplay(display + key);
    }
  };

  return (
    <div className="flex h-full flex-col bg-os-surface p-3 text-os-fg">
      <div className="mb-3 flex h-20 items-end justify-end rounded-os bg-os-elevated px-3 py-2 text-3xl font-medium tabular-nums">
        {display}
      </div>
      <div className="grid flex-1 grid-cols-4 gap-2">
        {KEYS.flatMap((row) =>
          row.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => press(key)}
              className={cn(
                "rounded-os text-lg font-medium transition-transform duration-150 hover:bg-os-hover active:scale-[0.96]",
                key === "0" ? "col-span-2" : "",
                key === "=" ? "bg-os-accent text-os-accent-fg hover:opacity-90" : "bg-os-elevated",
                "÷×−+".includes(key) && "text-os-accent",
              )}
            >
              {key}
            </button>
          )),
        )}
      </div>
    </div>
  );
}

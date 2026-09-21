import { describe, expect, it } from "vitest";
import { formatSpend } from "./format";

describe("formatSpend", () => {
  it("keeps three significant digits for fractions of a cent", () => {
    expect(formatSpend(0.000142)).toBe("$0.000142");
    expect(formatSpend(0.0011289)).toBe("$0.00113");
  });

  it("keeps whole cents from one cent up", () => {
    expect(formatSpend(0.141152)).toBe("$0.14");
    expect(formatSpend(1.5)).toBe("$1.50");
    expect(formatSpend(12.3456)).toBe("$12.35");
  });

  it("says when the cost is unknown", () => {
    expect(formatSpend(null)).toBe("cost unknown");
  });
});

import { describe, expect, it } from "vitest";
import { computeBenchmark } from "../benchmarks";
import type { AuditInput } from "../types";

function input(partial: Partial<AuditInput> = {}): AuditInput {
  return {
    tools: [
      { tool: "cursor", plan: "pro", monthlySpendUsd: 20, seats: 1 },
    ],
    teamSize: 5,
    useCase: "coding",
    ...partial,
  };
}

describe("computeBenchmark", () => {
  it("returns null for non-coding use cases", () => {
    expect(computeBenchmark(input({ useCase: "writing" }), 100)).toBeNull();
    expect(computeBenchmark(input({ useCase: "research" }), 100)).toBeNull();
    expect(computeBenchmark(input({ useCase: "data" }), 100)).toBeNull();
  });

  it("returns null when zero seats", () => {
    const i = input({
      tools: [{ tool: "cursor", plan: "pro", monthlySpendUsd: 100, seats: 0 }],
    });
    expect(computeBenchmark(i, 100)).toBeNull();
  });

  it("returns null on zero spend", () => {
    expect(computeBenchmark(input(), 0)).toBeNull();
  });

  it("selects the early-stage band for a 5-person team", () => {
    const i = input({
      teamSize: 5,
      tools: [{ tool: "cursor", plan: "pro", monthlySpendUsd: 400, seats: 5 }],
    });
    const b = computeBenchmark(i, 400);
    expect(b).not.toBeNull();
    expect(b!.band.id).toBe("early");
    expect(b!.yourPerSeatMonthlyUsd).toBe(80); // 400 / 5
    expect(b!.position).toBe("in_range"); // 80 is exactly the median
  });

  it("selects the enterprise band for a 500-person team", () => {
    const i = input({
      teamSize: 500,
      tools: [{ tool: "cursor", plan: "pro", monthlySpendUsd: 50000, seats: 400 }],
      useCase: "mixed",
    });
    const b = computeBenchmark(i, 50000);
    expect(b!.band.id).toBe("enterprise");
  });

  it("classifies 'above' when per-seat exceeds the max", () => {
    // Growth band max is $140/seat.
    const i = input({
      teamSize: 25,
      tools: [{ tool: "cursor", plan: "pro", monthlySpendUsd: 2000, seats: 10 }],
    });
    const b = computeBenchmark(i, 2000); // $200/seat
    expect(b!.position).toBe("above");
    expect(b!.pctVsMedian).toBeGreaterThan(0);
  });

  it("classifies 'below' when per-seat is under the min", () => {
    // Growth band min is $70/seat.
    const i = input({
      teamSize: 25,
      tools: [{ tool: "cursor", plan: "pro", monthlySpendUsd: 200, seats: 10 }],
    });
    const b = computeBenchmark(i, 200); // $20/seat
    expect(b!.position).toBe("below");
    expect(b!.pctVsMedian).toBeLessThan(0);
  });

  it("surfaces the Ramp + a16z citations", () => {
    const b = computeBenchmark(input(), 100);
    expect(b!.sourceRefs).toEqual([10, 11]);
  });

  it("computes pctVsMedian relative to the band median", () => {
    // Growth median is $105. 10 seats × $105 = $1050 puts us at median.
    const i = input({
      teamSize: 25,
      tools: [{ tool: "cursor", plan: "pro", monthlySpendUsd: 1050, seats: 10 }],
    });
    const b = computeBenchmark(i, 1050);
    expect(b!.pctVsMedian).toBe(0);
  });

  it("works for 'mixed' use case", () => {
    const b = computeBenchmark(input({ useCase: "mixed" }), 100);
    expect(b).not.toBeNull();
  });
});

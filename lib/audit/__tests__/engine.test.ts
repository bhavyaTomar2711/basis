import { describe, expect, it } from "vitest";
import { runAudit } from "../engine";
import type { AuditInput, ToolFinding } from "../types";

/**
 * Audit-engine test suite.
 * brain.md §15.1 — minimum 5 tests covering the engine.
 *
 * Conventions:
 *  - Each test names the scenario in plain English.
 *  - Findings are looked up by tool id, not by index, since the engine sorts
 *    by savings desc.
 */

function findingFor(
  result: ReturnType<typeof runAudit>,
  toolId: string,
): ToolFinding {
  const f = result.findings.find((x) => x.tool === toolId);
  if (!f) throw new Error(`No finding for ${toolId} in result`);
  return f;
}

describe("audit engine — defensibility invariants", () => {
  it("every finding ships with a non-empty math string containing a $", () => {
    const input: AuditInput = {
      teamSize: 4,
      useCase: "coding",
      tools: [
        { tool: "cursor", plan: "teams", monthlySpendUsd: 80, seats: 2 },
        { tool: "claude", plan: "team_standard", monthlySpendUsd: 50, seats: 2 },
      ],
    };
    const result = runAudit(input);
    for (const f of result.findings) {
      expect(f.math.length).toBeGreaterThan(20);
      expect(f.math).toContain("$");
    }
  });
});

describe("audit engine — Cursor downgrades", () => {
  it("Cursor Teams with 2 seats downgrades to Pro × 2", () => {
    const input: AuditInput = {
      teamSize: 2,
      useCase: "coding",
      tools: [{ tool: "cursor", plan: "teams", monthlySpendUsd: 80, seats: 2 }],
    };
    const f = findingFor(runAudit(input), "cursor");
    expect(f.recommendedAction).toBe("downgrade");
    expect(f.recommendedTo?.plan).toBe("pro");
    expect(f.monthlySavingsUsd).toBe(40); // $80 → $40
    expect(f.confidence).toBe("high");
  });

  it("Cursor Ultra on a solo non-coding user downgrades to Pro+", () => {
    const input: AuditInput = {
      teamSize: 1,
      useCase: "writing",
      tools: [{ tool: "cursor", plan: "ultra", monthlySpendUsd: 200, seats: 1 }],
    };
    const f = findingFor(runAudit(input), "cursor");
    expect(f.recommendedAction).toBe("downgrade");
    expect(f.recommendedTo?.plan).toBe("pro_plus");
    expect(f.monthlySavingsUsd).toBe(140); // $200 → $60
  });
});

describe("audit engine — ChatGPT downgrades", () => {
  it("ChatGPT Business with 2 users downgrades to Plus × 2", () => {
    const input: AuditInput = {
      teamSize: 2,
      useCase: "mixed",
      tools: [{ tool: "chatgpt", plan: "business", monthlySpendUsd: 50, seats: 2 }],
    };
    const f = findingFor(runAudit(input), "chatgpt");
    expect(f.recommendedAction).toBe("downgrade");
    expect(f.recommendedTo?.plan).toBe("plus");
    expect(f.monthlySavingsUsd).toBe(10); // $50 → $40
  });

  it("ChatGPT Pro ($200) for non-research use suggests Plus", () => {
    const input: AuditInput = {
      teamSize: 1,
      useCase: "coding",
      tools: [{ tool: "chatgpt", plan: "pro", monthlySpendUsd: 200, seats: 1 }],
    };
    const f = findingFor(runAudit(input), "chatgpt");
    expect(f.recommendedAction).toBe("downgrade");
    expect(f.recommendedTo?.plan).toBe("plus");
    expect(f.monthlySavingsUsd).toBe(180);
  });
});

describe("audit engine — Claude rules", () => {
  it("Claude Team Standard with 1 seat downgrades to Pro", () => {
    const input: AuditInput = {
      teamSize: 1,
      useCase: "writing",
      tools: [
        { tool: "claude", plan: "team_standard", monthlySpendUsd: 25, seats: 1 },
      ],
    };
    const f = findingFor(runAudit(input), "claude");
    expect(f.recommendedAction).toBe("downgrade");
    expect(f.recommendedTo?.plan).toBe("pro");
    expect(f.monthlySavingsUsd).toBe(5);
  });

  it("Claude Pro on monthly billing flags annual-billing savings", () => {
    const input: AuditInput = {
      teamSize: 1,
      useCase: "coding",
      tools: [{ tool: "claude", plan: "pro", monthlySpendUsd: 20, seats: 1 }],
    };
    const f = findingFor(runAudit(input), "claude");
    expect(f.monthlySavingsUsd).toBe(3); // $20 → $17 annual
    expect(f.reason.toLowerCase()).toContain("annual");
  });
});

describe("audit engine — API-spend credit routing", () => {
  it("OpenAI API spend ≥ $1500/mo recommends credit purchase", () => {
    const input: AuditInput = {
      teamSize: 5,
      useCase: "coding",
      tools: [
        { tool: "openai_api", plan: "usage", monthlySpendUsd: 2000, seats: 1 },
      ],
    };
    const f = findingFor(runAudit(input), "openai_api");
    expect(f.recommendedAction).toBe("use_credits");
    expect(f.monthlySavingsUsd).toBeGreaterThan(0);
    expect(f.confidence).toBe("high");
  });

  it("Anthropic API spend below $500/mo stays on retail (keep)", () => {
    const input: AuditInput = {
      teamSize: 1,
      useCase: "coding",
      tools: [
        { tool: "anthropic_api", plan: "usage", monthlySpendUsd: 200, seats: 1 },
      ],
    };
    const f = findingFor(runAudit(input), "anthropic_api");
    expect(f.recommendedAction).toBe("keep");
    expect(f.monthlySavingsUsd).toBe(0);
  });
});

describe("audit engine — cross-tool consolidation", () => {
  it("3 coding-IDE subs in coding mode flag the cheapest as redundant", () => {
    const input: AuditInput = {
      teamSize: 2,
      useCase: "coding",
      tools: [
        { tool: "cursor", plan: "pro", monthlySpendUsd: 20, seats: 1 },
        { tool: "copilot", plan: "pro", monthlySpendUsd: 10, seats: 1 },
        { tool: "windsurf", plan: "pro", monthlySpendUsd: 20, seats: 1 },
      ],
    };
    const result = runAudit(input);
    const consolidated = result.findings.find(
      (f) => f.recommendedAction === "consolidate",
    );
    expect(consolidated).toBeDefined();
    // cheapest is copilot @ $10
    expect(consolidated?.tool).toBe("copilot");
    expect(consolidated?.monthlySavingsUsd).toBe(10);
  });
});

describe("audit engine — totals + tiers", () => {
  it("zero tools returns a zero-savings, optimal-tier result without throwing", () => {
    const input: AuditInput = { teamSize: 1, useCase: "mixed", tools: [] };
    const result = runAudit(input);
    expect(result.findings).toHaveLength(0);
    expect(result.totalMonthlySavingsUsd).toBe(0);
    expect(result.totalAnnualSavingsUsd).toBe(0);
    expect(result.tier).toBe("optimal");
  });

  it("savings ≥ $500/mo land in the high tier, with proper annualisation", () => {
    const input: AuditInput = {
      teamSize: 1,
      useCase: "writing",
      tools: [
        { tool: "cursor", plan: "ultra", monthlySpendUsd: 200, seats: 1 },
        { tool: "chatgpt", plan: "pro", monthlySpendUsd: 200, seats: 1 },
        {
          tool: "claude",
          plan: "team_premium",
          monthlySpendUsd: 250,
          seats: 2,
        },
      ],
    };
    const result = runAudit(input);
    expect(result.totalMonthlySavingsUsd).toBeGreaterThanOrEqual(500);
    expect(result.tier).toBe("high");
    expect(result.totalAnnualSavingsUsd).toBe(
      Math.round(result.totalMonthlySavingsUsd * 12 * 100) / 100,
    );
  });

  it("an already-optimal stack reports tier=optimal", () => {
    const input: AuditInput = {
      teamSize: 1,
      useCase: "coding",
      tools: [
        { tool: "cursor", plan: "pro", monthlySpendUsd: 20, seats: 1 },
        {
          tool: "anthropic_api",
          plan: "usage",
          monthlySpendUsd: 80,
          seats: 1,
        },
      ],
    };
    const result = runAudit(input);
    expect(result.tier).toBe("optimal");
    expect(result.totalMonthlySavingsUsd).toBeLessThan(100);
  });
});

describe("audit engine — bad input safety", () => {
  it("throws on an unknown tool id", () => {
    const bad: AuditInput = {
      teamSize: 1,
      useCase: "coding",
      tools: [
        {
          tool: "not_a_real_tool" as AuditInput["tools"][number]["tool"],
          plan: "pro",
          monthlySpendUsd: 20,
          seats: 1,
        },
      ],
    };
    expect(() => runAudit(bad)).toThrow();
  });
});

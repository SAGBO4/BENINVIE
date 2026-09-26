import { describe, it, expect, beforeEach } from "vitest";
import { breezService } from "./breez.service";

describe("breezService (Simulation Mode)", () => {
  beforeEach(() => {
    delete process.env.BREEZ_API_KEY;
    delete process.env.BREEZ_MNEMONIC;
  });

  it("initializes successfully in fallback simulation mode when keys are omitted", async () => {
    const initialized = await breezService.initialize();
    expect(initialized).toBe(true);
  });

  it("ensureConnected returns true in fallback simulation mode", async () => {
    const connected = await breezService.ensureConnected();
    expect(connected).toBe(true);
  });

  it("generates a simulated BOLT11 invoice with correct prefix and metadata", async () => {
    const result = await breezService.receivePayment(
      2500,
      "Don pour Urgence CNHU",
    );

    expect(result.simulated).toBe(true);
    expect(result.feesSat).toBe(0);
    expect(result.bolt11).toMatch(/^lnbcsimulated2500u1p/);
  });

  it("simulates payment of a BOLT11 invoice and generates a 64-char hex hash", async () => {
    const invoice = "lnbc10u1p0fake...";
    const result = await breezService.payInvoice(invoice);

    expect(result).not.toBeNull();
    expect(result?.paymentHash).toMatch(/^[0-9a-f]{64}$/);
  });
});

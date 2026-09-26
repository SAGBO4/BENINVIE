// @vitest-environment node
import { describe, it, expect, vi } from "vitest";

vi.mock("javascript-opentimestamps", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  const base = (actual.default as Record<string, unknown>) || actual;
  const mockStamp = vi.fn().mockResolvedValue(undefined);
  return {
    ...base,
    default: {
      ...base,
      stamp: mockStamp,
    },
    stamp: mockStamp,
  };
});

import { otsService } from "./ots.service";

describe("otsService", () => {
  it("stampHash serializes timestamp proof to base64", async () => {
    const dummyHash =
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    const proofBase64 = await otsService.stampHash(dummyHash);

    expect(proofBase64).toBeTruthy();
    expect(typeof proofBase64).toBe("string");
    // Should be valid base64
    expect(() => Buffer.from(proofBase64, "base64")).not.toThrow();
  });

  it("verifyTimestamp returns null when proof is corrupted or invalid", async () => {
    const dummyHash =
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    const corruptedProof = Buffer.from("not-a-valid-ots-proof").toString(
      "base64",
    );

    const result = await otsService.verifyTimestamp(dummyHash, corruptedProof);
    expect(result).toBeNull();
  });

  it("verifyTimestamp returns null when given completely empty inputs", async () => {
    const result = await otsService.verifyTimestamp("", "");
    expect(result).toBeNull();
  });
});

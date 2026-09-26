// @vitest-environment node
import { describe, it, expect } from "vitest";
import { sha256 } from "js-sha256";
import { offlineIdentityService } from "./offline-identity.service";
import { verifyDonorSignature } from "@/lib/bitcoin/donor-identity";

describe("offlineIdentityService", () => {
  it("generates a signed offline donor identity and verifies it", () => {
    const result = offlineIdentityService.signDonorIdentity(
      "donor-abc-123",
      "O+",
    );

    expect(result.payload.donorId).toBe("donor-abc-123");
    expect(result.payload.bloodType).toBe("O+");
    expect(result.payload.issuer).toBe("HEMORA Network (Clinic Signature)");
    expect(result.payload.timestamp).toBeTruthy();

    expect(result.profileHash).toMatch(/^[0-9a-f]{64}$/);
    expect(result.clinicAddress).toMatch(/^bc1[a-z0-9]{25,62}$/);
    expect(result.signature).toBeTruthy();

    // Verify BIP-322 signature of the payload's profileHash
    const isValid = verifyDonorSignature(
      result.clinicAddress!,
      result.profileHash,
      result.signature,
    );
    expect(isValid).toBe(true);
  });

  it("fails verification if the offline blood type is altered", () => {
    const result = offlineIdentityService.signDonorIdentity("donor-456", "O-");

    // Attacker tries to forge the blood type to AB+ without changing signature
    const forgedPayload = {
      ...result.payload,
      bloodType: "AB+",
    };
    const forgedHash = sha256(JSON.stringify(forgedPayload));

    const isValid = verifyDonorSignature(
      result.clinicAddress!,
      forgedHash,
      result.signature,
    );
    expect(isValid).toBe(false);
  });
});

// @vitest-environment node
import { describe, it, expect } from "vitest";
import { createDonorIdentity, verifyDonorSignature } from "./donor-identity";
import { walletService } from "@/modules/bitcoin/services/wallet.service";

describe("donor-identity & BIP-322 cryptography", () => {
  it("generates a valid DonorIdentity with native segwit address and BIP-322 signature", async () => {
    const profile = {
      fullName: "Kofi Mensah",
      bloodType: "O-",
      city: "Cotonou",
      age: 28,
      consent: true,
    };

    const identity = await createDonorIdentity(profile);

    expect(identity.bitcoinAddress).toMatch(/^bc1[a-z0-9]{25,62}$/);
    expect(identity.profileHash).toMatch(/^[0-9a-f]{64}$/);
    expect(identity.signature).toBeTruthy();
    expect(identity.wif).toBeTruthy();

    // Verify using verifyDonorSignature (client side)
    const isValidClient = verifyDonorSignature(
      identity.bitcoinAddress,
      identity.profileHash,
      identity.signature,
    );
    expect(isValidClient).toBe(true);

    // Verify using walletService (server side)
    const isValidServer = walletService.verifySignature(
      identity.profileHash,
      identity.bitcoinAddress,
      identity.signature,
    );
    expect(isValidServer).toBe(true);
  });

  it("produces identical profileHash regardless of key order in profile object (canonicalization)", async () => {
    const p1 = { a: "alpha", b: 123, c: true };
    const p2 = { c: true, a: "alpha", b: 123 };

    const id1 = await createDonorIdentity(p1);
    const id2 = await createDonorIdentity(p2);

    expect(id1.profileHash).toBe(id2.profileHash);
  });

  it("fails verification when profileHash is altered", async () => {
    const identity = await createDonorIdentity({ bloodType: "O-" });

    // Tampered hash (change last character)
    const tamperedHash =
      identity.profileHash.slice(0, -1) +
      (identity.profileHash.endsWith("0") ? "1" : "0");

    const isValid = verifyDonorSignature(
      identity.bitcoinAddress,
      tamperedHash,
      identity.signature,
    );
    expect(isValid).toBe(false);

    const isValidServer = walletService.verifySignature(
      tamperedHash,
      identity.bitcoinAddress,
      identity.signature,
    );
    expect(isValidServer).toBe(false);
  });

  it("fails verification when signature is corrupted", async () => {
    const identity = await createDonorIdentity({ bloodType: "A+" });
    const corruptedSig = "AkcwRAIgZ3...corrupted...";

    expect(
      verifyDonorSignature(
        identity.bitcoinAddress,
        identity.profileHash,
        corruptedSig,
      ),
    ).toBe(false);

    expect(
      walletService.verifySignature(
        identity.profileHash,
        identity.bitcoinAddress,
        corruptedSig,
      ),
    ).toBe(false);
  });

  it("fails verification when address is malformed or belongs to someone else", async () => {
    const id1 = await createDonorIdentity({ id: "donor-1" });
    const id2 = await createDonorIdentity({ id: "donor-2" });

    // Using id2 address with id1 signature
    expect(
      verifyDonorSignature(id2.bitcoinAddress, id1.profileHash, id1.signature),
    ).toBe(false);

    // Completely invalid address
    expect(
      verifyDonorSignature(
        "invalid_btc_address",
        id1.profileHash,
        id1.signature,
      ),
    ).toBe(false);

    // Empty string
    expect(verifyDonorSignature("", id1.profileHash, id1.signature)).toBe(
      false,
    );
  });

  it("handles empty or extreme values without crashing", async () => {
    const emptyProfile = {};
    const id = await createDonorIdentity(emptyProfile);
    expect(id.profileHash).toMatch(/^[0-9a-f]{64}$/);

    expect(verifyDonorSignature("", "", "")).toBe(false);
    expect(
      walletService.verifySignature("not-a-hash", "not-an-addr", "not-a-sig"),
    ).toBe(false);
  });
});

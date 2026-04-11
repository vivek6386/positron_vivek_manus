import { randomUUID } from "crypto";

const OTP_PROOF_TTL_MS = 10 * 60 * 1000;

type ContactType = "email" | "phone";

type OtpProofRecord = {
  contact: string;
  contactType: ContactType;
  expiresAt: number;
};

const otpProofs = new Map<string, OtpProofRecord>();

function cleanupExpiredProofs() {
  const now = Date.now();
  for (const [token, record] of otpProofs.entries()) {
    if (record.expiresAt <= now) {
      otpProofs.delete(token);
    }
  }
}

export function createOtpProof(contact: string, contactType: ContactType): string {
  cleanupExpiredProofs();

  const token = randomUUID();
  otpProofs.set(token, {
    contact,
    contactType,
    expiresAt: Date.now() + OTP_PROOF_TTL_MS,
  });

  return token;
}

export function consumeOtpProof(
  token: string,
  contact: string,
  contactType: ContactType
): boolean {
  cleanupExpiredProofs();

  const record = otpProofs.get(token);
  if (!record) {
    return false;
  }

  otpProofs.delete(token);

  return record.contact === contact && record.contactType === contactType;
}

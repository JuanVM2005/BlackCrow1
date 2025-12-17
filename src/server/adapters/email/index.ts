// src/server/adapters/email/index.ts

export * from "./contract";
export { noopEmailClient } from "./implementations/noop";
export { resendEmailClient } from "./implementations/resend";

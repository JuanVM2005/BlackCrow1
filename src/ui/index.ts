// src/ui/index.ts

// ------------------------------
// Controls
// ------------------------------
export { default as Button } from "./Button";
export * from "./Button"; // (opcional) expone tipos/variantes si existen

// ------------------------------
// Layout primitives
// ------------------------------
export { default as Container } from "./Container";
export * from "./Container";

export { default as Section } from "./Section";
export * from "./Section";

export { default as Grid } from "./Grid";
export * from "./Grid";

// ------------------------------
// Typography
// ------------------------------
// Reexport default para usar `import { Typography } from "@/ui"`
export { default as Typography } from "./Typography";
// Reexporta named: { Heading, Text, ... }
export * from "./Typography";

// ------------------------------
// Badges / Chips
// ------------------------------
export { default as Badge } from "./Badge";
export * from "./Badge";

// ------------------------------
// Feedback
// ------------------------------
export { default as Alert } from "./feedback/Alert";
export * from "./feedback/Alert";

export { default as ErrorState } from "./feedback/ErrorState";
export * from "./feedback/ErrorState";

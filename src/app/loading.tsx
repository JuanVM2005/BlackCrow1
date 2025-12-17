// src/app/loading.tsx

import splashConfig from "@/content/ui/splash.json";

type SplashConfig = {
  label?: string;
};

export default function RootLoading() {
  const label = (splashConfig as SplashConfig).label ?? "";

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className="min-h-dvh surface-base"
    />
  );
}

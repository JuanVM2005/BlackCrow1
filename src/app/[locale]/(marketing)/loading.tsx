export default function MarketingLoading() {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className="min-h-[50vh] grid place-items-center p-8"
    >
      <div className="w-full max-w-2xl space-y-4">
        <div className="h-8 w-48 rounded-md animate-pulse bg-(--surface-muted)" />
        <div className="h-4 w-80 rounded-md animate-pulse bg-(--surface-muted)" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="h-24 rounded-lg animate-pulse bg-(--surface-muted)" />
          <div className="h-24 rounded-lg animate-pulse bg-(--surface-muted)" />
        </div>
      </div>
    </section>
  );
}

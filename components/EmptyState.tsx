export function EmptyState({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-section text-center">
      <h2 className="text-ui-lg font-bold">{title}</h2>
      <p className="mt-4 text-ink-muted">{children}</p>
    </section>
  );
}

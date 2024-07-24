import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
  component: PeriodsGrid,
});

function PeriodsGrid() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Grid</h1>
    </>
  );
}

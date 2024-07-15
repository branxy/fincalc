import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
  component: PeriodsGrid,
});

function PeriodsGrid() {
  return <main className="flex-grow py-2 sm:px-5">grid</main>;
}

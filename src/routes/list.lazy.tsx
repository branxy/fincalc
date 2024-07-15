import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/list")({
  component: () => <div>Hello /list!</div>,
});

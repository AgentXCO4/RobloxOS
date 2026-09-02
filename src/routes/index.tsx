import { createFileRoute } from "@tanstack/react-router";
import { OSShell } from "@/components/os/OSShell";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <OSShell />;
}

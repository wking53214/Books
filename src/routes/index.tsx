import { createFileRoute } from "@tanstack/react-router";
import { RaceDesk } from "@/components/race/race-desk";

export const Route = createFileRoute("/")({ component: RaceDesk });

import { z } from "zod";

export const exampleHarnessSchema = z.enum([
  "integration-lab",
  "vanilla-bus",
  "iframe-guest",
  "iframe-harness",
  "mfe-harness",
  "wc-harness",
  "server-harness",
]);

export type ExampleHarnessId = z.infer<typeof exampleHarnessSchema>;

/** Same-origin paths served from desk `public/examples/`. */
export const EXAMPLE_HARNESS_PATHS: Record<ExampleHarnessId, string> = {
  "integration-lab": "/examples/00-integration-lab.html",
  "vanilla-bus": "/examples/01-vanilla-bus.html",
  "iframe-guest": "/examples/lab-iframe-guest.html",
  "iframe-harness": "/examples/02-iframe-harness.html",
  "mfe-harness": "/examples/03-mfe-harness.html",
  "wc-harness": "/examples/04-wc-harness.html",
  "server-harness": "/examples/05-server-harness.html",
};

export const EXAMPLE_HARNESS_LABELS: Record<ExampleHarnessId, string> = {
  "integration-lab": "Integration lab",
  "vanilla-bus": "Vanilla bus",
  "iframe-guest": "iframe guest",
  "iframe-harness": "iframe harness",
  "mfe-harness": "ESM remote",
  "wc-harness": "Web component",
  "server-harness": "Server SSE",
};

export function resolveExampleHarnessPath(harness: string): string | null {
  const parsed = exampleHarnessSchema.safeParse(harness);
  if (!parsed.success) return null;
  return EXAMPLE_HARNESS_PATHS[parsed.data];
}

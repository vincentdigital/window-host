import { EXAMPLE_HARNESS_LABELS, exampleHarnessSchema, resolveExampleHarnessPath } from "@window-host/schema";

type Props = { harness: string };

export function ExampleHarnessWidget({ harness }: Props) {
  const parsed = exampleHarnessSchema.safeParse(harness);
  const id = parsed.success ? parsed.data : "integration-lab";
  const src = resolveExampleHarnessPath(id) ?? "/examples/00-integration-lab.html";
  const title = EXAMPLE_HARNESS_LABELS[id];

  return (
    <iframe
      className="wh-iframe wh-pane-host-iframe wh-example-harness"
      src={src}
      title={title}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    />
  );
}

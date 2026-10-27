/** Example remote pane — loaded via dynamic import(). */
export function mount(target) {
  const root = document.createElement("div");
  root.className = "remote-pane";
  root.innerHTML = `
    <p><strong>Remote ESM pane</strong></p>
    <button type="button">Emit local event</button>
    <pre></pre>
  `;
  target.replaceChildren(root);
  const pre = root.querySelector("pre");
  root.querySelector("button").onclick = () => {
    const detail = { topic: "demo.ping", payload: { message: "from-remote-esm" } };
    target.dispatchEvent(new CustomEvent("wh-pane-emit", { bubbles: true, detail }));
    pre.textContent = "dispatched wh-pane-emit:\n" + JSON.stringify(detail, null, 2);
  };
  return () => target.replaceChildren();
}

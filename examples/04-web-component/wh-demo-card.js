class WhDemoCard extends HTMLElement {
  static observedAttributes = ["topic"];

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.render();
  }

  attributeChangedCallback() {
    if (this.shadowRoot) this.render();
  }

  render() {
    const topic = this.getAttribute("topic") || "demo.ping";
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; font-family: system-ui, sans-serif; padding: 0.75rem; border: 1px solid #ccc; border-radius: 8px; }
        button { margin-top: 0.5rem; }
      </style>
      <p>Web component pane</p>
      <p>Topic: <code>${topic}</code></p>
      <button type="button">Request bus publish</button>
    `;
    this.shadowRoot.querySelector("button").onclick = () => {
      this.dispatchEvent(
        new CustomEvent("wh-bus-request", {
          bubbles: true,
          composed: true,
          detail: { topic, payload: { message: "from-web-component" } },
        }),
      );
    };
  }
}

customElements.define("wh-demo-card", WhDemoCard);

#!/usr/bin/env node
import http from "node:http";

const PORT = Number(process.env.WH_EXAMPLES_PORT ?? 9123);
const clients = new Map();

function sseWrite(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/events") {
    const topic = url.searchParams.get("topic") ?? "demo.ping";
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    if (!clients.has(topic)) clients.set(topic, new Set());
    clients.get(topic).add(res);
    req.on("close", () => clients.get(topic)?.delete(res));
    return;
  }

  if (req.method === "POST" && url.pathname === "/publish") {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const body = JSON.parse(Buffer.concat(chunks).toString() || "{}");
    const topic = body.topic ?? "demo.ping";
    const envelope = {
      v: 1,
      id: `bus-${Date.now()}`,
      topic,
      source: { paneId: body.sourcePaneId ?? "server" },
      payload: body.payload ?? {},
      at: Date.now(),
    };
    for (const client of clients.get(topic) ?? []) sseWrite(client, "envelope", envelope);
    res.writeHead(202, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, envelope }));
    return;
  }

  res.writeHead(404);
  res.end("not found");
});

server.listen(PORT, () => {
  console.log(`examples mock server http://127.0.0.1:${PORT}`);
  console.log(`  SSE  GET /events?topic=demo.ping`);
  console.log(`  POST /publish  {"topic","payload","sourcePaneId?"}`);
});

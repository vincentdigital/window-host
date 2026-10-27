import { parseScene, type Scene } from "@window-host/schema";
import { SceneShell } from "@window-host/shell";
import { useEffect, useState } from "react";
import duetRaw from "../../../scenes/duet.scene.json";
import linkRaw from "../../../scenes/link.scene.json";
import railRaw from "../../../scenes/rail.scene.json";

const SCENES: Record<string, Scene> = {
  duet: parseScene(duetRaw),
  rail: parseScene(railRaw),
  link: parseScene(linkRaw),
};

const SCENE_LIST = Object.values(SCENES);

function sceneFromQuery(): string {
  const id = new URLSearchParams(window.location.search).get("scene");
  if (id && SCENES[id]) return id;
  return "duet";
}

export function App() {
  const [sceneId, setSceneId] = useState(sceneFromQuery);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("scene", sceneId);
    window.history.replaceState({}, "", url);
  }, [sceneId]);

  const scene = SCENES[sceneId];

  return (
    <div className="wh-app">
      <nav className="wh-scene-nav" aria-label="Scenes">
        {SCENE_LIST.map((s) => (
          <button
            key={s.id}
            type="button"
            className={s.id === sceneId ? "wh-scene-pill active" : "wh-scene-pill"}
            onClick={() => setSceneId(s.id)}
          >
            {s.title}
          </button>
        ))}
      </nav>
      <SceneShell scene={scene} />
    </div>
  );
}

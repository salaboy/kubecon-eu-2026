import { Miniverse, PropSystem, Editor, createStandardSpriteConfig } from '@miniverse/core';
import type { SceneConfig, SpriteSheetConfig, CitizenDef } from '@miniverse/core';

const WORLD_ID = 'ocean-lab';
const basePath = `/worlds/${WORLD_ID}`;

function charSprites(name: string): SpriteSheetConfig {
  return {
    sheets: {
      walk: `/universal_assets/citizens/${name}_walk.png`,
      actions: `/universal_assets/citizens/${name}_actions.png`,
    },
    animations: {
      idle_down: { sheet: 'actions', row: 3, frames: 4, speed: 0.5 },
      idle_up: { sheet: 'actions', row: 3, frames: 4, speed: 0.5 },
      walk_down: { sheet: 'walk', row: 0, frames: 4, speed: 0.15 },
      walk_up: { sheet: 'walk', row: 1, frames: 4, speed: 0.15 },
      walk_left: { sheet: 'walk', row: 2, frames: 4, speed: 0.15 },
      walk_right: { sheet: 'walk', row: 3, frames: 4, speed: 0.15 },
      working: { sheet: 'actions', row: 0, frames: 4, speed: 0.3 },
      sleeping: { sheet: 'actions', row: 1, frames: 2, speed: 0.8 },
      talking: { sheet: 'actions', row: 2, frames: 4, speed: 0.15 },
    },
    frameWidth: 64,
    frameHeight: 64,
  };
}

function buildSceneConfig(cols: number, rows: number, floor: string[][] | undefined, tiles: Record<string, string> | undefined): SceneConfig {
  const safeFloor: string[][] = floor ?? Array.from({ length: rows }, () => Array(cols).fill(''));
  const walkable: boolean[][] = [];
  for (let r = 0; r < rows; r++) {
    walkable[r] = [];
    for (let c = 0; c < cols; c++) walkable[r][c] = (safeFloor[r]?.[c] ?? '') !== '';
  }

  const resolvedTiles: Record<string, string> = { ...(tiles ?? {}) };
  for (const [key, src] of Object.entries(resolvedTiles)) {
    if (/^(blob:|data:|https?:\/\/)/.test(src)) continue;
    const clean = src.startsWith('/') ? src.slice(1) : src;
    resolvedTiles[key] = `${basePath}/${clean}`;
  }

  return {
    name: 'main',
    tileWidth: 32,
    tileHeight: 32,
    layers: [safeFloor],
    walkable,
    locations: {},
    tiles: resolvedTiles,
  };
}

async function main() {
  const container = document.getElementById('miniverse-container')!;
  const tooltip = document.getElementById('tooltip')!;
  const statusBar = document.getElementById('status-bar')!;

  const sceneData = await fetch(`${basePath}/world.json`).then(r => r.json()).catch(() => null);

  // Collect work anchor names from props for citizen placement
  const workAnchors: string[] = (sceneData?.props ?? [])
    .flatMap((f: any) => (f.anchors ?? []).filter((a: any) => a.type === 'work').map((a: any) => a.name));

  const gridCols = sceneData?.gridCols ?? 16;
  const gridRows = sceneData?.gridRows ?? 12;
  const sceneConfig = buildSceneConfig(gridCols, gridRows, sceneData?.floor, sceneData?.tiles);
  const tileSize = 32;

  // Auto-discover agents from server and available sprites
  const availableSprites: string[] = await fetch('/api/citizens').then(r => r.json()).catch(() => ['morty', 'dexter', 'nova', 'rio']);
  const serverAgents: { agent: string; name: string }[] = await fetch('http://localhost:4321/api/agents')
    .then(r => r.json())
    .then((d: any) => d.agents ?? [])
    .catch(() => []);

  const spriteSheets: Record<string, SpriteSheetConfig> = {
    ...Object.fromEntries(serverAgents.map((a: any, i: number) =>
      [a.agent, charSprites(availableSprites[i % availableSprites.length])]
    ))
  };

  const mv = new Miniverse({
    container,
    world: WORLD_ID,
    scene: 'main',
    signal: {
      type: 'websocket',
      url: 'ws://localhost:4321/ws',
    },
    citizens: [
      ...serverAgents.map((a: any, i: number) => ({
        agentId: a.agent,
        name: a.name || a.agent,
        sprite: a.agent,
        position: workAnchors[i] ?? sceneData?.wanderPoints?.[i]?.name ?? 'wander_' + i,
      }))
    ],
    scale: 2,
    width: gridCols * tileSize,
    height: gridRows * tileSize,
    sceneConfig,
    spriteSheets,
    objects: [],
  });

  // --- Props system ---
  const props = new PropSystem(tileSize, 2);

  const rawSpriteMap: Record<string, string> = sceneData?.propImages ?? {};
  await Promise.all(
    Object.entries(rawSpriteMap).map(([id, src]) => {
      const clean = src.startsWith('/') ? src : '/' + src;
      return props.loadSprite(id, `${basePath}${clean}`);
    }),
  );

  props.setLayout(sceneData?.props ?? []);
  if (sceneData?.wanderPoints) {
    props.setWanderPoints(sceneData.wanderPoints);
  }

  props.setDeadspaceCheck((col, row) => {
    const floor = mv.getFloorLayer();
    return floor?.[row]?.[col] === '';
  });

  const syncProps = () => {
    mv.setTypedLocations(props.getLocations());
    mv.updateWalkability(props.getBlockedTiles());
  };
  syncProps();
  props.onSave(syncProps);

  await mv.start();

  mv.addLayer({ order: 5, render: (ctx) => props.renderBelow(ctx) });
  mv.addLayer({ order: 15, render: (ctx) => props.renderAbove(ctx) });

  // --- Editor ---
  const editor = new Editor({
    canvas: mv.getCanvas(),
    props,
    miniverse: mv,
    worldId: WORLD_ID,
    apiBase: '',
    onSave: async (scene) => {
      const res = await fetch('/api/save-world', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...scene, worldId: WORLD_ID }),
      });
      if (!res.ok) throw new Error(await res.text());
    },
  });
  editor.loadCitizenDefs(sceneData?.citizens);
  mv.addLayer({ order: 50, render: (ctx) => {
    editor.renderOverlay(ctx);
    if (editor.isActive()) syncProps();
  } });

  // --- Tooltip ---
  mv.on('citizen:click', (data: unknown) => {
    const d = data as { name: string; state: string; task: string | null };
    tooltip.style.display = 'block';
    tooltip.querySelector('.name')!.textContent = d.name;
    tooltip.querySelector('.state')!.textContent = `State: ${d.state}`;
    tooltip.querySelector('.task')!.textContent = d.task ? `Task: ${d.task}` : 'No active task';
    setTimeout(() => { tooltip.style.display = 'none'; }, 3000);
  });

  container.addEventListener('mousemove', (e) => {
    tooltip.style.left = e.clientX + 12 + 'px';
    tooltip.style.top = e.clientY + 12 + 'px';
  });
}

main().catch(console.error);

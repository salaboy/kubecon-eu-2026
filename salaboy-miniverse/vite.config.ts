import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

function worldSavePlugin() {
  return {
    name: 'world-save',
    configureServer(server: any) {
      server.middlewares.use('/api/save-world', (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method not allowed');
          return;
        }
        let body = '';
        req.on('data', (chunk: string) => { body += chunk; });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const worldId = data.worldId ?? 'ocean-lab';
            delete data.worldId;

            const safeId = worldId.replace(/[^a-zA-Z0-9_-]/g, '');
            const worldDir = path.resolve(__dirname, 'public/worlds', safeId);
            if (!fs.existsSync(worldDir)) {
              fs.mkdirSync(worldDir, { recursive: true });
            }

            const filePath = path.join(worldDir, 'world.json');
            let existing: Record<string, unknown> = {};
            if (fs.existsSync(filePath)) {
              try { existing = JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch {}
            }
            const merged = { ...existing, ...data };

            fs.writeFileSync(filePath, JSON.stringify(merged, null, 2) + '\n');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true }));
            console.log('[world-save] Written to', filePath);
          } catch (e: any) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });
    },
  };
}

function generatePlugin() {
  return {
    name: 'generate',
    configureServer(server: any) {
      server.middlewares.use('/api/generate', (req: any, res: any) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end('Method not allowed'); return; }
        let body = '';
        req.on('data', (chunk: string) => { body += chunk; });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);

            if (!data.prompt || !data.type) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Missing prompt or type' }));
              return;
            }

            if (data.falKey) process.env.FAL_KEY = data.falKey;
            if (!process.env.FAL_KEY) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'No FAL_KEY. Set it in the Generate tab or as an environment variable.' }));
              return;
            }

            let gen: any;
            try {
              gen = await import('@miniverse/generate');
            } catch {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Install @miniverse/generate: npm i @miniverse/generate' }));
              return;
            }

            const publicDir = path.resolve(__dirname, 'public');
            const slug = data.prompt.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40);
            const worldId = (data.worldId || '').replace(/[^a-zA-Z0-9_-]/g, '');
            const worldDir = worldId ? path.join(publicDir, 'worlds', worldId) : publicDir;

            // Handle base64 reference image
            let refImage: string | undefined;
            if (data.image) {
              const os = await import('os');
              const tmpPath = path.join(os.tmpdir(), 'miniverse_ref_' + Date.now() + '.png');
              fs.writeFileSync(tmpPath, Buffer.from(data.image, 'base64'));
              refImage = tmpPath;
            }

            let resultPath: string;
            let resultId: string;

            if (data.type === 'props') {
              // Count existing props to get next index
              const propsDir = path.join(worldDir, 'world_assets/props');
              fs.mkdirSync(propsDir, { recursive: true });
              const existing = fs.readdirSync(propsDir).filter((f: string) => f.startsWith('prop_'));
              const nextIdx = existing.length;
              resultId = slug || 'prop';
              const filename = 'prop_' + nextIdx + '_' + resultId + '.png';
              const outPath = path.join(propsDir, filename);
              await gen.generateObject({ prompt: data.prompt, refImage, output: outPath });
              resultPath = worldId
                ? '/worlds/' + worldId + '/world_assets/props/' + filename
                : '/world_assets/props/' + filename;
            } else if (data.type === 'texture') {
              resultId = slug || 'texture';
              const filename = resultId + '.png';
              const tilesDir = path.join(worldDir, 'world_assets/tiles');
              fs.mkdirSync(tilesDir, { recursive: true });
              const outPath = path.join(tilesDir, filename);
              await gen.generateTexture({ prompt: data.prompt, refImage, output: outPath, size: 32 });
              resultPath = worldId
                ? '/worlds/' + worldId + '/world_assets/tiles/' + filename
                : '/world_assets/tiles/' + filename;
            } else if (data.type === 'character') {
              resultId = slug || 'character';
              const citizensDir = path.join(publicDir, 'universal_assets/citizens');
              fs.mkdirSync(citizensDir, { recursive: true });

              const walkFile = resultId + '_walk.png';
              const walkPath = path.join(citizensDir, walkFile);
              console.log('[generate] Generating walk sheet...');
              await gen.generateCharacter({ prompt: data.prompt, refImage, type: 'walk', output: walkPath });

              const actionsFile = resultId + '_actions.png';
              const actionsPath = path.join(citizensDir, actionsFile);
              console.log('[generate] Generating actions sheet...');
              await gen.generateCharacter({ prompt: data.prompt, refImage, type: 'action', output: actionsPath });

              resultPath = '/universal_assets/citizens/' + walkFile;
            } else {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Invalid type. Use: props, texture, character' }));
              return;
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, path: resultPath, id: resultId, type: data.type }));
            console.log('[generate] Created:', resultPath);
          } catch (e: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e.message || String(e) }));
          }
        });
      });
    },
  };
}

function tilesListPlugin() {
  return {
    name: 'tiles-list',
    configureServer(server: any) {
      server.middlewares.use('/api/tiles', (req: any, res: any) => {
        const url = new URL(req.url, 'http://localhost');
        const worldId = (url.searchParams.get('worldId') || '').replace(/[^a-zA-Z0-9_-]/g, '');
        const tilesDir = worldId
          ? path.resolve(__dirname, 'public/worlds', worldId, 'world_assets/tiles')
          : path.resolve(__dirname, 'public/universal_assets/tiles');
        let names: string[] = [];
        if (fs.existsSync(tilesDir)) {
          names = fs.readdirSync(tilesDir)
            .filter((f: string) => f.endsWith('.png') && f !== 'office.png')
            .map((f: string) => f.replace('.png', ''));
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(names));
      });
    },
  };
}

function citizensListPlugin() {
  return {
    name: 'citizens-list',
    configureServer(server: any) {
      server.middlewares.use('/api/citizens', (_req: any, res: any) => {
        const citizensDir = path.resolve(__dirname, 'public/universal_assets/citizens');
        let names: string[] = [];
        if (fs.existsSync(citizensDir)) {
          names = fs.readdirSync(citizensDir)
            .filter((f: string) => f.endsWith('_walk.png'))
            .map((f: string) => f.replace('_walk.png', ''));
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(names));
      });
    },
  };
}

export default defineConfig({
  plugins: [worldSavePlugin(), generatePlugin(), tilesListPlugin(), citizensListPlugin()],
});

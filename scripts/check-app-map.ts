import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { APP_ROUTES_MAP } from './gen-app-map.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function check() {
  const root = path.resolve(__dirname, '..');
  const jsonPath = path.join(root, 'apps', 'api', 'src', 'ai', 'knowledge', 'app-knowledge.generated.json');
  const mdPath = path.join(root, 'docs', 'voterule-ai', 'APP_MAP.md');

  if (!fs.existsSync(jsonPath)) {
    console.error(`[ERROR] app-knowledge.generated.json is missing at ${jsonPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(mdPath)) {
    console.error(`[ERROR] APP_MAP.md is missing at ${mdPath}`);
    process.exit(1);
  }

  const existingJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  if (existingJson.length !== APP_ROUTES_MAP.length) {
    console.error(
      `[ERROR] app-knowledge.generated.json is stale! Has ${existingJson.length} routes, expected ${APP_ROUTES_MAP.length}. Run 'pnpm run ai:gen-app-map' to update.`
    );
    process.exit(1);
  }

  console.log(`[PASS] App knowledge map is valid and up to date (${existingJson.length} routes registered).`);
}

check();

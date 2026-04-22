import fs from 'fs';
import path from 'path';

// On Vercel, `process.cwd()` is the serverless function's working directory.
// Files referenced via `outputFileTracingIncludes` (see next.config.ts) are
// copied alongside the function and resolvable via cwd-relative paths.
const PIPELINE_DIR = path.join(process.cwd(), 'data', 'pipeline');

/**
 * Read a JSON file from `data/pipeline/`. Returns `fallback` if:
 *  - the file doesn't exist (pipeline has never run)
 *  - or parsing fails
 *
 * The pipeline (`python -m pipeline.run_daily`) writes files here;
 * until then the dashboard runs entirely off `data/mockData.ts`.
 */
export function readPipelineJson<T>(filename: string, fallback: T): T {
  const target = path.join(PIPELINE_DIR, filename);
  try {
    if (!fs.existsSync(target)) return fallback;
    const raw = fs.readFileSync(target, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[pipeline] failed to read ${filename}:`, err);
    return fallback;
  }
}

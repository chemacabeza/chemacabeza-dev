#!/usr/bin/env node
// Enqueue any content/posts/*.mdx files that aren't yet in the Medium queue,
// with scheduledFor = now + 12h. The publish workflow (cron) picks them up
// once that timestamp passes.
import { readFileSync, readdirSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import matter from 'gray-matter';

const POSTS_DIR = 'content/posts';
const QUEUE_FILE = 'scripts/medium-poster/posts.json';
const DELAY_HOURS = parseInt(process.env.MEDIUM_DELAY_HOURS || '12', 10);

function main() {
  if (!existsSync(QUEUE_FILE)) {
    console.error(`Queue file not found: ${QUEUE_FILE}`);
    process.exit(1);
  }
  const queue = JSON.parse(readFileSync(QUEUE_FILE, 'utf8'));
  const existingSlugs = new Set(queue.map((p) => p.slug));

  const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith('.mdx'));
  const added = [];

  const scheduledFor = new Date(Date.now() + DELAY_HOURS * 3600 * 1000).toISOString();

  for (const file of files) {
    const slug = basename(file, '.mdx');
    if (existingSlugs.has(slug)) continue;

    const raw = readFileSync(join(POSTS_DIR, file), 'utf8');
    const { data: fm } = matter(raw);

    queue.push({
      slug,
      title: (fm.title || slug).toString().trim(),
      tags: Array.isArray(fm.tags) ? fm.tags.slice(0, 5) : [],
      scheduledFor,
      posted: false,
      postedAt: null,
      mediumUrl: null,
    });
    added.push(slug);
    console.log(`✓ Queued ${slug} (scheduledFor=${scheduledFor})`);
  }

  if (added.length === 0) {
    console.log('No new posts to queue.');
  } else {
    writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2) + '\n');
    console.log(`Wrote ${added.length} new entries to ${QUEUE_FILE}.`);
  }

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `added=${added.join(',')}\n`);
    appendFileSync(process.env.GITHUB_OUTPUT, `count=${added.length}\n`);
  }
}

main();

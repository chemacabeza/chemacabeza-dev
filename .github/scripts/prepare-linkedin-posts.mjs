#!/usr/bin/env node
import { readFileSync, readdirSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import matter from 'gray-matter';

const POSTS_DIR = 'content/posts';
const QUEUE_FILE = 'scripts/linkedin-poster/posts.json';
const SITE_URL = 'https://chemacabeza.dev';

function toHashtag(tag) {
  const cleaned = String(tag).replace(/[^A-Za-z0-9 ]/g, '').trim();
  return '#' + cleaned.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

function makeBlurb(slug, fm) {
  const title = (fm.title || slug).toString().trim();
  const description = (fm.description || '').toString().trim();
  const tags = Array.isArray(fm.tags) ? fm.tags : [];
  const hashtags = tags.slice(0, 5).map(toHashtag).filter((h) => h.length > 1).join(' ');

  const url = `${SITE_URL}/writing/${slug}`;
  const parts = [];
  if (description) parts.push(description);
  parts.push(`I just published "${title}".\n\nRead it → ${url}`);
  if (hashtags) parts.push(hashtags);
  return parts.join('\n\n');
}

function main() {
  if (!existsSync(QUEUE_FILE)) {
    console.error(`Queue file not found: ${QUEUE_FILE}`);
    process.exit(1);
  }
  const queue = JSON.parse(readFileSync(QUEUE_FILE, 'utf8'));
  const existingSlugs = new Set(queue.map((p) => p.slug));

  const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith('.mdx'));
  const added = [];
  const summary = [];

  for (const file of files) {
    const slug = basename(file, '.mdx');
    if (existingSlugs.has(slug)) continue;

    const raw = readFileSync(join(POSTS_DIR, file), 'utf8');
    const { data: fm } = matter(raw);
    const body = makeBlurb(slug, fm);

    queue.push({ slug, posted: false, postedAt: null, body });
    added.push(slug);
    summary.push({ slug, title: fm.title || slug, body });
    console.log(`✓ Queued ${slug}`);
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
    // Multi-line output for the issue body.
    const issueBody = summary
      .map((s) => `### ${s.title}\n\n\`${s.slug}\`\n\n\`\`\`\n${s.body}\n\`\`\``)
      .join('\n\n---\n\n');
    appendFileSync(process.env.GITHUB_OUTPUT, `body<<EOF\n${issueBody}\nEOF\n`);
  }
}

main();

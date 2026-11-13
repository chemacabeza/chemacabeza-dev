import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";

const script = resolve("scripts/vercel/ignore-build.sh");

function fixture() {
  const cwd = mkdtempSync(join(tmpdir(), "vercel-ignore-"));
  const git = (...args: string[]) => execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
  const commit = (path: string, value: string) => {
    mkdirSync(dirname(join(cwd, path)), { recursive: true });
    writeFileSync(join(cwd, path), value);
    git("add", ".");
    git("commit", "-qm", "fixture change");
    return git("rev-parse", "HEAD");
  };
  git("init", "-q");
  git("config", "user.email", "test@example.invalid");
  git("config", "user.name", "Test");
  const previous = commit("app/page.tsx", "initial");
  const run = (sha?: string) => {
    const env = { ...process.env };
    delete env.VERCEL_GIT_PREVIOUS_SHA;
    if (sha !== undefined) env.VERCEL_GIT_PREVIOUS_SHA = sha;
    return spawnSync("sh", [script], { cwd, env }).status;
  };
  return { cwd, previous, commit, run };
}

test("missing, empty, and unavailable previous commits continue the build", () => {
  const f = fixture();
  try {
    assert.equal(f.run(), 1);
    assert.equal(f.run(""), 1);
    assert.equal(f.run("eba3256373cf8cc9708b381f271c5d4d701ed36b"), 1);
  } finally {
    rmSync(f.cwd, { recursive: true, force: true });
  }
});

test("unchanged application and automation-only commits skip the build", () => {
  const f = fixture();
  try {
    assert.equal(f.run(f.previous), 0);
    f.commit("scripts/medium-poster/posts.json", "[]");
    assert.equal(f.run(f.previous), 0);
  } finally {
    rmSync(f.cwd, { recursive: true, force: true });
  }
});

for (const path of ["app/page.tsx", "content/posts/example.mdx", "package-lock.json", "vercel.json", "scripts/vercel/ignore-build.sh"]) {
  test(`${path} changes continue the build`, () => {
    const f = fixture();
    try {
      f.commit(path, "changed");
      assert.equal(f.run(f.previous), 1);
    } finally {
      rmSync(f.cwd, { recursive: true, force: true });
    }
  });
}

test("Git comparison errors continue the build rather than returning a fatal exit code", () => {
  const f = fixture();
  try {
    execFileSync("git", ["symbolic-ref", "HEAD", "refs/heads/missing"], { cwd: f.cwd });
    assert.equal(f.run(f.previous), 1);
  } finally {
    rmSync(f.cwd, { recursive: true, force: true });
  }
});

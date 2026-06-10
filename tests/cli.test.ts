import { test } from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { discoverPosts } from "../lib/propagation/posts";
import { selectPosts } from "../lib/propagation/run";

test("selectPosts filters by slug and --since (CLI arg handling)", () => {
    const all = discoverPosts();
    const one = selectPosts(all, { slug: all[0].slug });
    assert.equal(one.length, 1);
    assert.equal(one[0].slug, all[0].slug);

    const since = selectPosts(all, { since: "2099-01-01" });
    assert.equal(since.length, 0, "nothing is published after 2099");
});

test("CLI runs end-to-end in dry-run and confirms full-text inclusion", () => {
    const tmp = mkdtempSync(path.join(os.tmpdir(), "prop-cli-"));
    const slug = discoverPosts()[0].slug;
    const out = execFileSync(
        process.execPath,
        ["--import", "tsx", "scripts/propagate/cli.ts", "--slug", slug, "--dry-run"],
        {
            encoding: "utf8",
            env: {
                ...process.env,
                CONTENT_PROP_STATE_PATH: path.join(tmp, "state.json"),
                CONTENT_PROP_OUT_DIR: path.join(tmp, "out"),
                PROPAGATE_OFFLINE: "1",
            },
        },
    );
    assert.match(out, /DRY-RUN/);
    assert.match(out, /Full article text included for \d+\/\d+/);
    assert.match(out, /substack/);
    assert.match(out, /medium/);
    assert.match(out, /linkedin/);
});

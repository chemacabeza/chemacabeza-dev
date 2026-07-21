#!/usr/bin/env tsx
// Content propagation CLI.
//
//   npm run propagate:posts -- --dry-run
//   npm run propagate:posts -- --all --dry-run
//   npm run propagate:posts -- --all --publish
//   npm run propagate:posts -- --slug <slug> --dry-run
//   npm run propagate:posts -- --platform medium --slug <slug> --publish
//   npm run propagate:posts -- --platform linkedin --all --dry-run
//
// Flags: --all  --slug <slug>  --platform <substack|medium|linkedin|all>
//        --dry-run  --publish  --update-existing  --since <YYYY-MM-DD>  --print-body
//
// DEFAULT IS DRY-RUN. Real publishing requires an explicit --publish (and
// --dry-run always wins if both are passed). Missing credentials never crash a
// run; the affected platform reports `manual_required`.
import { discoverPosts } from "../../lib/propagation/posts";
import { runPropagation, selectPosts } from "../../lib/propagation/run";
import { PLATFORMS } from "../../lib/propagation/adapters";
import type { Platform, PublishOptions } from "../../lib/propagation/types";

interface Args {
    all: boolean;
    slug?: string;
    platform: string;
    dryRun: boolean;
    publish: boolean;
    updateExisting: boolean;
    since?: string;
    printBody: boolean;
}

function parseArgs(argv: string[]): Args {
    const a: Args = {
        all: false,
        platform: "all",
        dryRun: false,
        publish: false,
        updateExisting: false,
        printBody: false,
    };
    for (let i = 0; i < argv.length; i++) {
        const t = argv[i];
        // For "--flag value" we consume the next token; for "--flag=value" we split.
        const takeValue = (name: string): string | undefined => {
            if (t.startsWith(`${name}=`)) return t.slice(name.length + 1);
            return argv[++i];
        };
        if (t === "--all") a.all = true;
        else if (t === "--slug" || t.startsWith("--slug=")) a.slug = takeValue("--slug");
        else if (t === "--platform" || t.startsWith("--platform=")) a.platform = takeValue("--platform") ?? "all";
        else if (t === "--since" || t.startsWith("--since=")) a.since = takeValue("--since");
        else if (t === "--dry-run") a.dryRun = true;
        else if (t === "--publish") a.publish = true;
        else if (t === "--update-existing") a.updateExisting = true;
        else if (t === "--print-body") a.printBody = true;
    }
    return a;
}

function resolvePlatforms(p: string): Platform[] {
    if (p === "all") return PLATFORMS;
    if ((PLATFORMS as string[]).includes(p)) return [p as Platform];
    console.error(`Invalid --platform "${p}". Use substack | medium | linkedin | devto | all.`);
    process.exit(2);
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const publish = args.publish && !args.dryRun;
    const options: PublishOptions = {
        publish,
        dryRun: !publish,
        updateExisting: args.updateExisting,
    };
    const platforms = resolvePlatforms(args.platform);

    const all = discoverPosts();
    const posts = selectPosts(all, { slug: args.slug, since: args.since });
    if (args.slug && posts.length === 0) {
        console.error(`No post found with slug "${args.slug}".`);
        process.exit(2);
    }

    console.log(
        `\nContent propagation — mode: ${publish ? "PUBLISH (live)" : "DRY-RUN (no publishing)"} | ` +
            `posts: ${posts.length} | platforms: ${platforms.join(", ")}` +
            (args.updateExisting ? " | update-existing" : "") +
            (args.since ? ` | since ${args.since}` : ""),
    );
    if (!publish) console.log("Default safe mode. Pass --publish to publish for real.\n");
    else console.log("");

    const results = await runPropagation({ posts, platforms, options });

    // Group by post for readable output.
    let hadError = false;
    const bySlug = new Map<string, typeof results>();
    for (const r of results) {
        if (!bySlug.has(r.slug)) bySlug.set(r.slug, []);
        bySlug.get(r.slug)!.push(r);
    }

    for (const [slug, items] of bySlug) {
        const post = posts.find((p) => p.slug === slug)!;
        console.log(`■ ${slug}  (${post.canonicalUrl})`);
        for (const { platform, result } of items) {
            const ft = result.fullTextPropagated
                ? "full-text → platform"
                : result.fullTextArtifact
                  ? "full-text → artifact"
                  : "—";
            console.log(
                `    ${platform.padEnd(9)} ${result.status.padEnd(16)} [${ft}]  ${result.message}`,
            );
            if (result.artifactPaths?.length) {
                for (const p of result.artifactPaths) console.log(`        ↳ ${p.replace(process.cwd() + "/", "")}`);
            }
            if (result.status === "error") hadError = true;
        }
        if (args.printBody) {
            const item = items[0];
            console.log(`\n----- FULL TEXT (${item.platform}) -----`);
            // Re-render is cheap; show the article body that was written to artifacts.
            const { getAdapter } = await import("../../lib/propagation/adapters");
            const rendered = await getAdapter(item.platform).render(post);
            console.log(rendered.bodyMarkdown);
            console.log(`----- END FULL TEXT -----\n`);
        }
        console.log("");
    }

    const counts = results.reduce<Record<string, number>>((acc, r) => {
        acc[r.result.status] = (acc[r.result.status] ?? 0) + 1;
        return acc;
    }, {});
    console.log(
        "Summary:",
        Object.entries(counts)
            .map(([k, v]) => `${k}=${v}`)
            .join("  "),
    );
    const fullText = results.filter((r) => r.result.fullTextPropagated || r.result.fullTextArtifact).length;
    console.log(`Full article text included for ${fullText}/${results.length} platform outputs.`);
    console.log(`Artifacts under out/crosspost/. Sync state in .content-propagation-state.json.\n`);

    // Non-zero ONLY for real runtime failures, never for expected manual_required.
    process.exit(hadError ? 1 : 0);
}

main().catch((e) => {
    console.error("Propagation run failed:", e);
    process.exit(1);
});

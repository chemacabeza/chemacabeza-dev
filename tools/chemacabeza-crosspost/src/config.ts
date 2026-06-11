import { z } from "zod";

const EnvSchema = z.object({
  SOURCE_URL: z
    .string()
    .url()
    .default("https://chemacabeza.dev/writing"),

  LINKEDIN_ACCESS_TOKEN: z.string().optional().default(""),
  LINKEDIN_PERSON_URN: z.string().optional().default(""),
  LINKEDIN_VERSION: z.string().default("202605"),

  MEDIUM_TOKEN: z.string().optional().default(""),

  SUBSTACK_MODE: z.enum(["manual", "webhook"]).default("manual"),
  SUBSTACK_WEBHOOK_URL: z.string().optional().default(""),

  SQLITE_PATH: z.string().default(".data/crosspost.sqlite"),

  // String "true"/"false" coerced to a boolean.
  DRY_RUN: z
    .string()
    .default("true")
    .transform((v) => v.toLowerCase() === "true"),
});

export type Config = z.infer<typeof EnvSchema> & {
  linkedinEnabled: boolean;
  mediumEnabled: boolean;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = EnvSchema.parse(env);

  if (parsed.SUBSTACK_MODE === "webhook" && !parsed.SUBSTACK_WEBHOOK_URL) {
    throw new Error(
      "SUBSTACK_MODE=webhook requires SUBSTACK_WEBHOOK_URL to be set.",
    );
  }

  return {
    ...parsed,
    linkedinEnabled: Boolean(
      parsed.LINKEDIN_ACCESS_TOKEN && parsed.LINKEDIN_PERSON_URN,
    ),
    mediumEnabled: Boolean(parsed.MEDIUM_TOKEN),
  };
}

import { readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { mkdir } from "node:fs/promises";
import { highlight } from "codehike/code";
import { theme } from "../packages/video-themes/src/tokens.ts";

const archiveMonoCodeTheme = {
  name: "archive-mono",
  type: "light",
  colors: {
    "editor.background": theme.code.background,
    "editor.foreground": theme.code.syntax.plain,
    "editorLineNumber.foreground": theme.colors.mutedSoft,
    "editor.lineHighlightBackground": theme.code.focusBackground,
    "editor.selectionBackground": theme.code.focusBackground,
  },
  tokenColors: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: theme.code.syntax.comment, fontStyle: "italic" },
    },
    {
      scope: ["string", "string.quoted", "string.template"],
      settings: { foreground: theme.code.syntax.string },
    },
    {
      scope: [
        "keyword",
        "storage",
        "storage.type",
        "entity.name.tag",
        "punctuation.definition.tag",
      ],
      settings: { foreground: theme.code.syntax.keyword },
    },
    {
      scope: ["constant", "constant.numeric", "constant.language"],
      settings: { foreground: theme.code.syntax.constant },
    },
    {
      scope: ["entity.name.function", "support.function", "meta.function-call"],
      settings: { foreground: theme.code.syntax.function },
    },
    {
      scope: ["entity.name.type", "support.type", "support.class"],
      settings: { foreground: theme.code.syntax.type },
    },
  ],
};

const getArgument = (name) => {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
};

const input = getArgument("input");
const output = getArgument("output");
const lang = getArgument("lang") ?? "tsx";
const meta = getArgument("meta") ?? "";

if (!input || !output) {
  throw new Error(
    "Usage: npm run highlight-code -- --input <source> --output <json> [--lang tsx] [--meta Scene.tsx]",
  );
}

const inputPath = resolve(input);
const outputPath = resolve(output);
const value = await readFile(inputPath, "utf8");
const highlighted = await highlight(
  { value: value.trimEnd(), lang, meta },
  archiveMonoCodeTheme,
);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(highlighted, null, 2)}\n`, "utf8");

console.log(`Highlighted ${relative(process.cwd(), inputPath)} -> ${relative(process.cwd(), outputPath)}`);

# Visual System

This system adapts the `gogoga-ai-hub` archive mono language for Remotion videos: paper surfaces, HarmonyOS Sans SC, hard rules, dense ledgers, restrained command details, and restrained orange accents.

`packages/video-themes/src/tokens.ts` is the only numeric source of truth for color, type, spacing, safe areas, radii, shadows, easing, and standard durations. This document explains how to use those tokens without duplicating their values.

## Canvas And Safe Area

Use the `canvasPresets` and `theme.safeArea` tokens for landscape, portrait, and square compositions. Keep readable content inside `SafeArea`; only backgrounds and intentional edge-to-edge media should leave it.

Landscape is the default for explainers and archive walkthroughs. Portrait is for short social clips with one focused message per scene. Square is for reusable clips, covers, and compact summaries.

`SafeArea` uses border-box sizing. Do not recreate safe-area padding with local `top`, `left`, or page-specific margins.

## Page Layout

Use `PageLayout` for every ordinary content scene. It owns the page chrome and divides the frame into three stable regions: navigation, content, and subtitle/footer. Header height, format-specific footer height, region gaps, content gaps, and center widths come from `theme.layout`; do not duplicate those values in scene code.

The navigation region always keeps the same baseline and bottom rule. Use its slots consistently:

- `brand`: series or video identity.
- `section`: current chapter or content type.
- `index`: stable page or scene position.

The footer always keeps its top rule at one fixed position within a canvas format and contains only narration subtitles. Page authors cannot change the footer height or move its divider. Landscape uses a compact single-line subtitle slot; square and portrait canvases reserve two lines because their text measure is narrower. This behavior is selected from the canvas format, never per page. Do not repeat page numbers, section names, sources, or component metadata in the footer; those belong in the header, figure caption, chart caption, or content itself.

`PageSubtitle` renders narration as a compact centered contrast plate. It is intentionally different from terminal chrome: it has no `$` prompt, filename, or full-width command bar. In landscape, split long narration into timed semantic phrases instead of wrapping it onto a second line. Square and portrait may use at most two short lines. An empty subtitle leaves the reserved region blank without moving content.

Use `PageIntro` for an ordinary scene heading. It fixes the relationship between eyebrow, title, and explanatory copy. Use the title scale for low-density pages and the subtitle scale for charts, tables, code, or other dense scenes. Do not move a title upward simply because one scene has more content; reduce the content, use the compact title scale, or split the scene.

Use `ContentLayout` only inside the content region:

- `split`: copy and evidence, chart and explanation, or two comparable objects.
- `stack`: before/after, timeline stages, or a heading above a large visual.
- `focus`: one conclusion, one title, or one dominant visual.
- `surround`: one central object with short annotations on both sides.
- `full`: a table, code frame, or media object that already supplies its own internal hierarchy.

`ContentLayout` changes split layouts to a vertical stack on portrait canvases by default. Override that only when the scene has been visually verified in portrait.

Use `CoverPage` for the first frame and `SectionPage` for chapter boundaries. They are explicit page variants, not exceptions implemented by deleting rules or changing padding locally. Covers may use a supporting visual. Section pages should contain one short statement and use deterministic text reveal.

```tsx
<PageLayout
  header={{
    brand: "AI 未来推演",
    section: "图表系统 / Charts",
    index: "06 / 12",
  }}
  footer={{
    subtitle: "折线揭示趋势，里程碑只标记真正的转折点。",
  }}
>
  <ContentLayout
    variant="split"
    ratio="1:2"
    primary={<PageIntro eyebrow="趋势" title="能力开始加速" />}
    secondary={<ChartFrame>{/* chart */}</ChartFrame>}
  />
</PageLayout>
```

## Typography

Use HarmonyOS Sans SC for narrative UI and video text, with Chinese system fonts as fallback. Use Chivo Mono only for code and command-like details. Keep letter spacing at `0`.

Use `Eyebrow` for a local principle, evidence type, or short content cue; use `Title` for the main scene message, `BodyText` for explanatory copy, and `Caption` for sources, figure notes, or other low-priority text. The default eyebrow marker is a narrow vertical accent bar, not a decorative horizontal dash. Do not repeat the header's section label verbatim in the eyebrow. Use `marker="none"` when the surrounding layout already supplies a strong alignment cue.

`Prompt` and black `$ ...` terminal bars are reserved for real commands, terminal output, and code-adjacent UI only. Do not use them as general scene headings, table captions, chart titles, media labels, or component catalog decoration.

Use `TextFit` only when props can contain long text. Do not reduce important text below the tokenized caption scale; split the idea into another scene instead.

Per screen, prefer one main message, one supporting caption, and one visual object. Dense ledger text can appear when it is visual texture, but the viewer should not need to read every row.

## Color And Contrast

Use `canvas`, `surface`, `surfaceSoft`, `ink`, `body`, `muted`, `hairline`, and `primary` for the core system. Status colors are reserved for small labels, dots, and table states. Do not fill large areas with status colors or gradients.

Check contrast by using `ink` on `canvas`, `body` on `canvas`, and `canvas` on `ink`. If text sits on an image, place it in a hard-edged panel or simplify the image crop.

## Grid, Spacing, And Media

Build ordinary pages with `PageLayout`, `ContentLayout`, `PageIntro`, and `Stack`. `Scene` and `SafeArea` are lower-level primitives for explicit page variants and full-frame effects. Use grid and borders to create the archive/ledger feel. Avoid floating cards, soft shadows, heavy rounding, and pill-shaped controls.

Do not add a page-wide `Rule` at the top of individual scenes. The navigation region already owns that divider. Additional rules are allowed only inside the content region when they separate real content groups.

Do not wrap text-only panels, section copy, typography examples, or ordinary explanatory blocks in `MediaFrame` or raised cards. Use unframed layout, hard rules, and generous internal spacing for text areas. Reserve framed containers for media, charts, code, tables, and repeated data items that need a clear object boundary.

Use `MediaFrame` for screenshots, product shots, and stable image crops. It accepts public-relative paths such as `shared/images/example.png`; the component resolves them with Remotion's asset pipeline. Use `fit="cover"` for editorial crops and `fit="contain"` for UI screenshots or product shots where losing information would be misleading. Set `aspectRatio`, `objectPosition`, and `variant` deliberately instead of letting the source image shape drive the scene layout.

`MediaFrame` labels are subtle metadata rows, not black corner stickers. Prefer figure captions below media when naming a source, screenshot, or asset. Labels and captions must not cover the image content or touch the frame edge.

`MediaFrame` is named as a media container, but its built-in `src` path is for static images. Animated GIFs should use Remotion's `AnimatedImage`, and videos should use the appropriate video component inside a frame wrapper or a future dedicated wrapper. Do not rely on browser-native GIF playback or CSS animation timing for rendered output.

For long images, use a fixed-height `MediaFrame` viewport with `overflow: hidden`, then drive the inner image's `translate` with `useCurrentFrame()` and `interpolate()`. Very tall source images should be preprocessed or sliced before rendering to keep memory usage predictable.

## Code

Use `CodeFrame` for named files and `CodeBlock` when the surrounding scene already provides a frame. Keep line numbers on for walkthroughs, and use `focusLines` or `focusSteps` to direct attention without hiding context. Long examples should be split across scenes instead of shrinking the code scale.

Run `npm run highlight-code` to convert source files into `HighlightedCode` JSON before rendering. Code Hike highlighting is asynchronous, so it belongs in this deterministic preprocessing step rather than inside a frame component. The generated tokens use the code colors from `tokens.ts`; frame rendering only reads serializable data.

```bash
npm run highlight-code -- \
  --input src/videos/<video-id>/fixtures/example.tsx.txt \
  --output src/videos/<video-id>/fixtures/example.highlighted.json \
  --lang tsx \
  --meta Example.tsx
```

```tsx
<CodeFrame
  code={highlightedCode}
  filename="Example.tsx"
  focusSteps={[
    { lines: "2-5", from: 30 },
    { lines: "7-10", from: 78 },
  ]}
/>
```

`LineSelection` accepts a line number, a number array, or a compact range such as `"2-5,8"`. When `focusLines` and `focusSteps` are omitted, block annotations named `focus` or `mark` from Code Hike are used automatically.

## Tables

Use `DataTable` for dense but scannable ledgers: model comparisons, timelines, decision matrices, benchmark summaries, release notes, and source lists. A video table should help the viewer compare a few rows quickly; do not use it to reproduce a spreadsheet.

Keep columns explicit. Set widths and alignment in the column definition, reserve status colors for small markers or short cells, and use highlighted rows only for the point being discussed. Prefer five to seven visible rows in landscape. Split larger tables across scenes instead of shrinking text.

Table captions must be subtle metadata, not terminal chrome. Do not add black command bars or `$` prompts above tables unless the table is literally showing command output.

Table animation must be frame-driven. Use the built-in row reveal for ordered disclosure; do not rely on CSS transitions or browser table layout changes.

## Charts

Use `ChartFrame` to place charts in the same hard-edged visual system as screenshots and code. Use `BarChart` for category comparison, `LineChart` for trend over time, `RacingBarChart` for ranking changes across snapshots, and `PieChart` only for simple composition or share-of-total stories. Do not use pie charts for precise comparisons between many categories.

Chart animation must be frame-driven. Bars grow from the baseline, line charts reveal through stroke progress and optional milestone labels, racing bars interpolate value and rank between dated snapshots, and pie slices expand by angle. Keep labels short, use muted captions for context, and keep the chart focused on one message per scene.

For `RacingBarChart`, keep the changing year in the reserved footer area instead of placing it behind the bars. The footer can also hold short timeline notes or source labels, while the plot area remains dedicated to moving bars and ranks.

For knowledge videos, prefer charts that carry a concrete narrative: model capability timelines, language popularity shifts, market share changes, benchmark deltas, or release cadence. Demo data must be labeled as demo data; sourced data should keep units and source notes in the `ChartFrame` caption.

## Motion

Use Remotion frame primitives only: `useCurrentFrame()`, `interpolate()`, `spring()` when physical motion is intentional, and helpers from `remotion-kit/src/timeline.ts`. Do not use CSS transitions, CSS keyframes, timers, `Date.now()`, or unseeded `Math.random()`.

Use short deterministic entrances, exits, and scene transitions from `theme.motion.duration` and `theme.motion.easing`. Reveal from an element's final layout slot with opacity and translate; do not animate readable elements through occupied space.

Use `RevealText` for split text motion and `KineticTitle` for standalone chapter or transition titles. Use `by="char"` only for short Chinese titles, `by="word"` for English phrases, and `by="line"` for two or three short statement lines. Do not animate long paragraphs character by character; split the narration across scenes instead.

## Captions And Subtitles

Place ordinary narration subtitles in the fixed footer region supplied by `PageLayout`; do not position them inside scene content. `PageSubtitle` supplies the shared contrast plate and typography. Keep lines short and break on semantic phrases: one line in landscape, at most two in square or portrait. For portrait canvases, keep this region above platform UI risk zones through the portrait safe-area token.

The StyleGuide uses static strings to simulate narration captions. Production captions must come from deterministic timed caption data, preferably JSON using Remotion's `Caption` shape, while `PageSubtitle` remains the visual renderer for the active phrase.

Use captions for narration support, not for duplicating every on-screen title. Prefer readable phrase chunks over dense paragraphs.

## Audio

Keep narration as the primary audio layer. Background music should sit under speech and can be omitted when the scene depends on technical clarity. Silence is acceptable for title cards, ledger scans, and transitions.

Approved voiceover belongs in `public/videos/<video-id>/audio/voiceover/`. Temporary TTS generations belong in `.tmp/tts/<video-id>/`.

## Acceptable

- Paper background with hard one-pixel rules.
- Stable navigation, content, and subtitle regions across ordinary scenes.
- A fixed footer divider position regardless of subtitle length or presence.
- Vertical eyebrow accents paired with specific local cues rather than repeated section names.
- Explicit `CoverPage` and `SectionPage` variants for opening and chapter boundaries.
- `ContentLayout` variants chosen by narrative relationship rather than local coordinates.
- Dense ledgers when one focal point remains obvious.
- Orange `primary` for focus, section markers, and small command accents.
- Cropped screenshots inside `MediaFrame`.
- Figure captions below media, never covering important image content.
- Text-only areas separated by rules or grid alignment instead of raised cards.
- Frame-driven chart reveals that explain comparison, trend, or composition.
- Frame-driven fade and translate entrances.
- `RevealText` and `KineticTitle` for short transition titles and emphasis lines.
- Black terminal bars only for real command/code contexts.

## Forbidden

- CSS transitions, keyframes, Tailwind animation classes, timers, or unseeded randomness.
- Marketing hero gradients, decorative blobs, glassmorphism, soft floating cards, or large rounded pills.
- Raised `MediaFrame` wrappers around pure text blocks or section explanations.
- Long paragraphs squeezed into a single frame.
- Long paragraphs animated character by character.
- Large areas filled with status colors.
- Black `$ ...` command bars used as ordinary titles, table captions, chart labels, or decorative section headers.
- Machine-specific absolute asset paths in tracked code.
- Scene-specific safe-area padding, manually positioned page headers, or ad hoc top rules.
- Ordinary content pages that omit the navigation/footer chrome without a documented full-frame reason.
- Page-specific footer heights, subtitle offsets, or custom narration-caption styling.
- Footer metadata or page numbers that duplicate the navigation header.
- Short horizontal dashes used as generic eyebrow decoration.

## Studio Entry

Open the `style-guide` Composition in Remotion Studio. It is both the component catalog and the first visual regression entry for future changes.

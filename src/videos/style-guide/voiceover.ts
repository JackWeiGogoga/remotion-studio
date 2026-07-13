export type StyleGuideVoiceoverTiming = {
  start: number;
  durationInFrames: number;
  src: string;
};

export const styleGuideVoiceover = {
  cover: {
    start: 0,
    durationInFrames: 186,
    src: "videos/style-guide/audio/voiceover/scene-01.wav",
  },
  section: {
    start: 186,
    durationInFrames: 126,
    src: "videos/style-guide/audio/voiceover/scene-02.wav",
  },
  layout: {
    start: 312,
    durationInFrames: 208,
    src: "videos/style-guide/audio/voiceover/scene-03.wav",
  },
  typography: {
    start: 520,
    durationInFrames: 208,
    src: "videos/style-guide/audio/voiceover/scene-04.wav",
  },
  textMotion: {
    start: 728,
    durationInFrames: 229,
    src: "videos/style-guide/audio/voiceover/scene-05.wav",
  },
  media: {
    start: 957,
    durationInFrames: 258,
    src: "videos/style-guide/audio/voiceover/scene-06.wav",
  },
  chartLine: {
    start: 1215,
    durationInFrames: 218,
    src: "videos/style-guide/audio/voiceover/scene-07.wav",
  },
  chartRace: {
    start: 1433,
    durationInFrames: 267,
    src: "videos/style-guide/audio/voiceover/scene-08.wav",
  },
  comparison: {
    start: 1700,
    durationInFrames: 246,
    src: "videos/style-guide/audio/voiceover/scene-09.wav",
  },
  table: {
    start: 1946,
    durationInFrames: 278,
    src: "videos/style-guide/audio/voiceover/scene-10.wav",
  },
  codeMotion: {
    start: 2224,
    durationInFrames: 224,
    src: "videos/style-guide/audio/voiceover/scene-11.wav",
  },
  sourceStory: {
    start: 2448,
    durationInFrames: 226,
    src: "videos/style-guide/audio/voiceover/scene-12.wav",
  },
  contextStory: {
    start: 2674,
    durationInFrames: 309,
    src: "videos/style-guide/audio/voiceover/scene-13.wav",
  },
  forecastStory: {
    start: 2983,
    durationInFrames: 326,
    src: "videos/style-guide/audio/voiceover/scene-14.wav",
  },
} as const satisfies Record<string, StyleGuideVoiceoverTiming>;

export const styleGuideDurationInFrames = 3309;

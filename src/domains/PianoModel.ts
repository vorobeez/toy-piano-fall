export type KeyName = string;

export interface PianoState {
  activeKey: KeyName | undefined;
  keyPressed: boolean;
}

export const KEY_PREFIX = "Key";

export const WHITE_KEYS = [
  1, 3, 5, 6, 8, 10, 12, 13, 15, 17, 18, 20, 22, 24, 25,
];

export const BLACK_KEYS = Array.from({ length: 25 }, (_, i) => i + 1).filter(
  (key) => !WHITE_KEYS.includes(key),
);

export const NOTES = [
  "C4",
  "C#4",
  "D4",
  "D#4",
  "E4",
  "F4",
  "F#4",
  "G4",
  "G#4",
  "A4",
  "A#4",
  "B4",
  "C5",
  "C#5",
  "D5",
  "D#5",
  "E5",
  "F5",
  "F#5",
  "G5",
  "G#5",
  "A5",
  "A#5",
  "B5",
  "C6",
] as const;

export type Note = (typeof NOTES)[number];

const KEY_PATTERN = /Key(\d{1,2})/;

export const getKeyNum = (keyName: KeyName): number => {
  const result = KEY_PATTERN.exec(keyName);

  if (!result) {
    throw new Error(`Provided incorrect key name: ${keyName}`);
  }

  return Number.parseInt(result[1]);
};

export const isWhiteKey = (keyName: KeyName): boolean => {
  return WHITE_KEYS.includes(getKeyNum(keyName));
};

export const getNote = (keyName: KeyName): Note => {
  const keyNum = getKeyNum(keyName);

  return NOTES[keyNum - 1];
};

const INITIAL_STATE: PianoState = {
  activeKey: undefined,
  keyPressed: false,
};

export class PianoModel {
  currentState: PianoState = INITIAL_STATE;
  prevState: PianoState | undefined = undefined;

  private pushState(nextState: PianoState) {
    this.prevState = { ...this.currentState };
    this.currentState = nextState;
  }

  setActiveKey(keyName: KeyName) {
    if (this.currentState.keyPressed) {
      return;
    }

    if (this.currentState.activeKey === keyName) {
      return;
    }

    this.pushState({
      activeKey: keyName,
      keyPressed: false,
    });
  }

  resetActiveKey() {
    if (this.currentState.keyPressed) {
      return;
    }

    if (this.currentState.activeKey === undefined) {
      return;
    }

    this.pushState({
      activeKey: undefined,
      keyPressed: false,
    });
  }

  pressKey() {
    if (this.currentState.activeKey) {
      this.pushState({
        activeKey: this.currentState.activeKey,
        keyPressed: true,
      });
    }
  }

  releaseKey() {
    if (this.currentState.activeKey && this.currentState.keyPressed) {
      this.pushState({
        activeKey: this.currentState.activeKey,
        keyPressed: false,
      });
    }
  }
}

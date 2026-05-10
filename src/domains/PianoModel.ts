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

export class PianoModel implements PianoState {
  activeKey: string | undefined;
  keyPressed: boolean;

  constructor() {
    this.activeKey = undefined;
    this.keyPressed = false;
  }

  setActiveKey(keyName: KeyName) {
    if (this.keyPressed) {
      return;
    }

    this.activeKey = keyName;
  }

  resetActiveKey() {
    if (this.keyPressed) {
      return;
    }

    this.activeKey = undefined;
  }

  pressKey() {
    if (this.activeKey) {
      this.keyPressed = true;
    }
  }

  releaseKey() {
    this.keyPressed = false;
  }
}

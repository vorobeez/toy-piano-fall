export interface Renderable {
  load(): Promise<void>;
  tick(delta: number): void;
}

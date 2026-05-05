import { EventDispatcher } from "three";

export abstract class Dispatcher<EventMap extends {}, State> {
  protected dispatcher: EventDispatcher<EventMap>;

  constructor() {
    this.dispatcher = new EventDispatcher<EventMap>();
  }

  protected abstract update(state: State): void;
  protected abstract dispatch(): void;
  public abstract addListener(listener: (state: State) => void): void;
}

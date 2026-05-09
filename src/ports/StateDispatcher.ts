import { EventDispatcher } from "three";
import type { Repository } from "./Repository";

type EventMap<State> = {
  stateUpdate: {
    newState: State;
  };
};

export abstract class StateDispatcher<State> implements Repository<State> {
  protected dispatcher: EventDispatcher<EventMap<State>>;
  protected state: State;

  constructor(initialState: State) {
    this.state = initialState;
    this.dispatcher = new EventDispatcher<EventMap<State>>();
  }

  protected update(state: Partial<State>) {
    this.state = {
      ...this.state,
      ...state,
    };
    this.dispatch();
  }

  protected dispatch() {
    this.dispatcher.dispatchEvent({
      type: "stateUpdate",
      newState: this.state,
    });
  }

  public addListener(listener: (state: State) => void) {
    this.dispatcher.addEventListener("stateUpdate", ({ newState }) =>
      listener(newState),
    );
  }

  public getState(): State {
    return this.state;
  }
}

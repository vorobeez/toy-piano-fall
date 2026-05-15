import { Dispatcher, type Listener } from "./Dispatcher";
import type { Repository } from "../ports/Repository";

export abstract class StateDispatcher<State> implements Repository<State> {
  protected state: State;
  private dispatcher: Dispatcher<State>;

  constructor(initialState: State) {
    this.state = initialState;
    this.dispatcher = new Dispatcher();
  }

  protected update(state: Partial<State>) {
    this.state = {
      ...this.state,
      ...state,
    };
    this.dispatcher.dispatch(this.state);
  }

  public addListener(listener: Listener<State>) {
    this.dispatcher.addListener(listener);
  }

  public getState(): State {
    return this.state;
  }
}

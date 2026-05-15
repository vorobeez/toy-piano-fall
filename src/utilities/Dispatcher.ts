export type Listener<Event> = (event: Event) => void;

export class Dispatcher<Event> {
  private listeners: Listener<Event>[];

  constructor() {
    this.listeners = [];
  }

  public addListener(listener: Listener<Event>) {
    this.listeners.push(listener);
  }

  public dispatch(event: Event) {
    this.listeners.forEach((listener) => {
      listener(event);
    });
  }
}

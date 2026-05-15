import { Dispatcher } from "./Dispatcher";

export class ThrottledDispatcher<Event> extends Dispatcher<Event> {
  private limit: number;
  private lastCall: number;

  constructor(limit: number) {
    super();

    this.limit = limit;
    this.lastCall = 0;
  }

  public dispatch(event: Event): void {
    const now = Date.now();

    if (now - this.lastCall >= this.limit) {
      this.lastCall = now;
      super.dispatch(event);
    }
  }
}

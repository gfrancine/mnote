type Arguments<T> = [T] extends [(...args: infer U) => any] ? U
  : [T] extends [void] ? []
  : [T];

export class Emitter<E extends Record<string, (...args: unknown[]) => void>> {
  protected events: Record<keyof E, Function[]> = {} as Record<
    keyof E,
    Function[]
  >;

  on<K extends keyof E>(event: K, listener: E[K]) {
    let listeners = this.events[event];
    if (!listeners) {
      listeners = [];
      this.events[event] = listeners;
    }

    listeners.push(listener);
  }

  remove<K extends keyof E>(event: K, listener: E[K]) {
    const listeners = this.events[event];
    if (!listeners) return;

    const index = listeners.indexOf(listener);
    if (index === -1) return;

    delete listeners[index];
  }

  emit<K extends keyof E>(event: K, ...args: Arguments<E[K]>) {
    const listeners = this.events[event];
    if (!listeners) return;

    listeners.forEach((listener) => setTimeout(listener, 0, ...args));
  }
}

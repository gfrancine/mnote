// deno-lint-ignore-file ban-types no-explicit-any

type Arguments<T> = [T] extends [(...args: infer U) => any]
  ? U
  : [T] extends [void]
  ? []
  : [T];

export class Signal<F extends Function> {
  private listeners: F[] = [];

  emit(...args: Arguments<F>) {
    this.listeners.forEach((listener) => setTimeout(listener, 0, ...args));
  }

  emitSync(...args: Arguments<F>) {
    this.listeners.forEach((listener) => listener(...args));
  }

  listen(listener: F) {
    this.listeners.push(listener);
  }

  unlisten(listener: F) {
    const index = this.listeners.indexOf(listener);
    if (index === -1) return;
    this.listeners.splice(index, 1);
  }
}

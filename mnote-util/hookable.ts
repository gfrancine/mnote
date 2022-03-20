/* eslint-disable @typescript-eslint/no-explicit-any */
/*

hookables: for things that can be cancelled

new hookable<{
  newFile: string
}>()

trigger(event, context): results
*/

type Hook<C> = (cancel: () => void, context: C) => void | Promise<void>;

export class Hookable<H extends Record<string, unknown>> {
  protected topics: Record<keyof H, Hook<any>[]> = {} as Record<
    keyof H,
    Hook<any>[]
  >;

  hook<K extends keyof H>(topic: K, hook: Hook<H[K]>) {
    let hooks = this.topics[topic];
    if (!hooks) {
      hooks = [];
      this.topics[topic] = hooks;
    }

    hooks.push(hook);
  }

  async invoke<K extends keyof H>(topic: K, context: H[K]): Promise<boolean> {
    let pass = true;
    const cancel = () => {
      pass = false;
    };

    const hooks = this.topics[topic];
    if (!hooks) return pass;

    for (const hook of hooks) {
      await hook(cancel, context);
    }

    return pass;
  }
}

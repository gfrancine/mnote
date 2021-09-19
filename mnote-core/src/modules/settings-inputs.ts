// input types for settings

export type GeneralOptions = {
  title: string;
  key: string;
  subcategory: string;
  description?: string;
};

function withDefault<T>(value: T | undefined, default_: T): T {
  return value === undefined ? default_ : value;
}

export type StringInputOptions = {
  default: string;
  getInvalidMessage?: (value: string) => string | void;
};

export class StringInput {
  generalOpts: GeneralOptions;
  opts: StringInputOptions;
  constructor(generalOpts: GeneralOptions, opts: StringInputOptions) {
    this.generalOpts = generalOpts;
    this.opts = opts;
  }
}

export type NumberInputOptions = {
  default: number;
  max?: number;
  min?: number;
};

export class NumberInput {
  generalOpts: GeneralOptions;
  opts: Required<NumberInputOptions>;
  constructor(generalOpts: GeneralOptions, opts: NumberInputOptions) {
    this.generalOpts = generalOpts;
    this.opts = {
      ...opts,
      max: withDefault(opts.max, Infinity),
      min: withDefault(opts.min, -Infinity),
    };
  }
}

export type SelectInputOptions = {
  default: string;
  getItems: () => {
    value: string;
    text: string;
  }[];
};

export class SelectInput {
  generalOpts: GeneralOptions;
  opts: SelectInputOptions;
  constructor(generalOpts: GeneralOptions, opts: SelectInputOptions) {
    this.generalOpts = generalOpts;
    this.opts = opts;
  }
}

export type InputOptionsMap = {
  string: StringInputOptions;
  number: NumberInputOptions;
  select: SelectInputOptions;
};

export const constructorMap = {
  string: StringInput,
  number: NumberInput,
  select: SelectInput,
};

export type Inputs =
  | StringInput
  | NumberInput
  | SelectInput;

// input types for settings

export type GeneralOptions = {
  title: string;
  key: string;
  category: string;
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

export type EnumInputOptions = {
  default: string;
  getItems: () => string[];
};

export class EnumInput {
  generalOpts: GeneralOptions;
  opts: EnumInputOptions;
  constructor(generalOpts: GeneralOptions, opts: EnumInputOptions) {
    this.generalOpts = generalOpts;
    this.opts = opts;
  }
}

export type InputOptionsMap = {
  string: StringInputOptions;
  number: NumberInputOptions;
  enum: EnumInputOptions;
};

export const constructorMap = {
  string: StringInput,
  number: NumberInput,
  enum: EnumInput,
};

export type Inputs =
  | StringInput
  | NumberInput
  | EnumInput;

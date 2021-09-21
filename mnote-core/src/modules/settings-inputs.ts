// input types for settings

export type GeneralOptions = {
  title: string;
  key: string;
  subcategory: string;
  description?: string;
};

export type Boolean = GeneralOptions & {
  type: "boolean";
  default: boolean;
};

export type String = GeneralOptions & {
  type: "string";
  default: string;
  getInvalidMessage?: (value: string) => string | void;
};

export type Number = GeneralOptions & {
  type: "number";
  default: number;
  max?: number;
  min?: number;
};

export type Select = GeneralOptions & {
  type: "select";
  default: string;
  getItems: () => {
    value: string;
    text: string;
  }[];
};

export type Result =
  | string
  | Array<{ printStatement: string; isPass: boolean }>;
export type Data = string | Array<string>;
export type Event = React.ChangeEvent<{ value: unknown }>;
export interface AvailableProblems {
  [key: string]: { title: string; placeholder: { [key: string]: string } };
}

import { Measure } from "./Measure";

export interface MeasureGroup {
  grpid: number;
  attrib: number;
  date: number;
  created: number;
  modified: number;
  category: number;
  deviceid: null; // ??
  hash_deviceid: null; // ??
  measures: Measure[];
  modelid: string | null; // ??
  model: null; // ??
  comment: null; // ??
}

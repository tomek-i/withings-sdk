import { MeasureGroup } from "./MeasureGroup";

export interface GetMeasurements {
  updatetime: number;
  timezone: string;
  measuregrps: MeasureGroup[];
}

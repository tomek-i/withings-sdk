import { GetActivityBaseOptions } from "./GetActivityBaseOptions";

export type GetActivityOptions =
  | (GetActivityBaseOptions & WithStartEndDate)
  | (GetActivityBaseOptions & WithLastUpdate);

export interface WithStartEndDate {
  startDate: Date;
  endDate: Date;
  lastUpdate?: never;
}

export interface WithLastUpdate {
  lastUpdate: Date;
  startDate?: never;
  endDate?: never;
}

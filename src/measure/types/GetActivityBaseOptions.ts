import { ActivityDataFields } from "../enums/ActivityDataFields";
import { WithPagination } from "../../types/WithPagination";

export interface GetActivityBaseOptions extends WithPagination {
  data_fields?: ActivityDataFields[];
}

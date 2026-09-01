import { WithPagination } from "../../types/WithPagination";
import { ActivityDataFields } from "../enums/ActivityDataFields";

/**
 * Options shared by both forms of {@link Measures.getActivity}.
 */
export interface GetActivityBaseOptions extends WithPagination {
  /**
   * Which activity metrics to return. Fields not listed here are omitted from
   * the response.
   */
  data_fields?: ActivityDataFields[];
}

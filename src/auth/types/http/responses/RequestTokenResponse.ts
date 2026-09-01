import { WithingsResponse } from "../../../../types";
import { AccessTokenBody } from "../../../models/AccessTokenBody";

/**
 * Response to the OAuth2 `requesttoken` action.
 *
 * @see https://developer.withings.com/api-reference/#tag/oauth2
 */
export interface RequestTokenResponse extends WithingsResponse<AccessTokenBody> {}

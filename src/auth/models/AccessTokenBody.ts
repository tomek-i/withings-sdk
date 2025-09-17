//TODO: better naming for this, without body or response
export interface AccessTokenBody {
  userid: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  csrf_token: string;
  token_type: string;
}

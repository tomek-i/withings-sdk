//TODO: add link to documentation
export interface AuthCodeUrlParams {
  response_type: string; //has to be "code"
  client_id: string;
  state: string;
  scope: string;
  redirect_uri: string;
}

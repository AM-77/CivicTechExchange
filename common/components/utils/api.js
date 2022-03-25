// @flow
import serialize from "form-serialize";
import { Dictionary } from "../types/Generics.jsx";
import htmlDocument from "./htmlDocument.js";

export type APIResponse = {|
  +status: number,
|};

export type APIError = {|
  +errorCode: number,
  +errorMessage: string,
|};

class apiHelper {
  static post(
    url: string,
    body: {||},
    successCallback: APIResponse => void,
    errCallback: APIError => void
  ) {
    // TODO: Replace ProjectAPIUtils.post() and UserAPIUtils.post() with this method
    const bodyJson: string = JSON.stringify(body);
    const cookies: Dictionary<string> = htmlDocument.cookies();
    const headers = {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
      "X-CSRFToken": cookies["csrftoken"],
    };
    apiHelper._request(
      url,
      "POST",
      bodyJson,
      headers,
      successCallback,
      errCallback
    );
  }

  static postForm(
    url: string,
    formNode: React.Ref,
    successCallback: APIResponse => void,
    errCallback: APIError => void
  ) {
    const serializedForm = serialize(formNode.current, {
      empty: true,
      hash: false,
    });

    const headers = {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Requested-With": "XMLHttpRequest",
    };
    apiHelper._request(
      url,
      "POST",
      serializedForm,
      headers,
      successCallback,
      errCallback
    );
  }

  static isSuccessResponse(response: Response): boolean {
    return response.status < 400;
  }

  static isJsonResponse(response: Response): boolean {
    const headerKeys: $ReadOnlyArray<string> = [...response.headers.values()];
    return (
      headerKeys.find((key: string) => key === "content-type") &&
      response.headers.get("content-type") === "application/json"
    );
  }

  static _request(
    url: string,
    method: string,
    body: {||},
    headers: { [key: string]: string },
    successCallback: ({||}) => void,
    errCallback: APIError => void,
    requestOptions: object
  ): void {
    const doError = response =>
      errCallback &&
      errCallback({
        errorCode: response.status,
        errorMessage: JSON.stringify(response),
      });

    const _requestOptions = Object.assign(
      { method: method, body: body, credentials: "include", headers: headers },
      requestOptions
    );

    fetch(new Request(url, _requestOptions))
      .then((response: Response) => {
        if (!response.ok) {
          throw Error();
        }

        const isJson: boolean = apiHelper.isJsonResponse(response);
        return isJson ? response.json() : response.text();
      })
      .then(responsePayload => {
        successCallback && successCallback(responsePayload);
      })
      .catch(response => {
        return doError(response);
      });
  }
}

export default apiHelper;

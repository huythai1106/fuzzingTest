import HTTPRequest from "src/httpMessage/HTTPRequest";
import { TypeBody } from "src/httpMessage/constants";

export interface elememtObj {
  key: string;
  type: string;
  length?: number;
  mutateValue?: string[];
  value?: any;
  dictionaries?: string[];
}

export const sendRequest = async (req: Request) => {
  try {
    const result = await fetch(req);
    return result;
  } catch (error) {
    return error;
  }
};

export const makeRequest = (
  httpRequest: HTTPRequest,
  options?: {
    url?: string;
    body?: any;
  }
) => {
  const url = options?.url || httpRequest.getStartLine().url.href;
  const method = httpRequest.getStartLine().method;
  const optionsHeader = {
    "Content-Type": httpRequest.getHeaders()["Content-Type"] || "",
    Referer: httpRequest.getHeaders()["Referer"] || "",
    Cookie: httpRequest.getHeaders()["Cookie"] || "",
  };

  const r = new Request(url, {
    method: method,
    headers: optionsHeader,
    body: options?.body || undefined,
  });

  return r;
};

import { RequestUrlResponse } from "obsidian"

// from: https://stackoverflow.com/questions/75257250/typescript-type-for-json-response-object-in-object

export type JSONValue =
    | string
    | number
    | boolean
    | JSONObject
    | JSONArray;

interface JSONObject {
    [x: string]: JSONValue;
}

type JSONArray = Array<JSONValue>

const HTTP_OK = 200

const VALID_SUCCESS_CODES = [
    HTTP_OK,
]

export interface ReadeckBackendResponse {
    ok: boolean,
    status: number
    statusText: string
    text: string
    headers: Headers,
    json: JSONArray
}

export function fromRequestUrlResponse(result: RequestUrlResponse): ReadeckBackendResponse {
    const {
        status, headers, text,
    } = result

    const json = result.json as JSONArray

    const ok = VALID_SUCCESS_CODES.contains(status)

    return {
        ok,
        status,
        statusText: text,
        json,
        text,
        headers: new Headers(headers),
    } as ReadeckBackendResponse
}

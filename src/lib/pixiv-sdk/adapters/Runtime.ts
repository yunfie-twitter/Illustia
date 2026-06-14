// @ts-nocheck
export type HeaderMap = Record<string, string>
export type QueryParams = object

export interface FetchResponseLike {
    ok: boolean
    status: number
    statusText?: string
    json(): Promise<unknown>
    text(): Promise<string>
    arrayBuffer(): Promise<ArrayBuffer>
}

export type FetchLike = (input: string, init?: {
    method?: string
    headers?: HeaderMap
    body?: string | FormData
    signal?: AbortSignal
}) => Promise<FetchResponseLike>

export interface DownloadPayload {
    url: string
    suggestedPath: string
    headers: HeaderMap
    data?: string
}

export type DownloadHandler = (payload: DownloadPayload) => Promise<string>

export interface PixivRuntimeOptions {
    fetch?: FetchLike
    timeoutMs?: number
    downloadHandler?: DownloadHandler
}

export class PixivRequestError extends Error {
    public constructor(
        message: string,
        public readonly url: string,
        public readonly status?: number,
        public readonly body?: string
    ) {
        super(message)
        this.name = "PixivRequestError"
    }
}

export class PixivUnsupportedRuntimeError extends Error {
    public constructor(feature: string, alternative: string) {
        super(`${feature} is not available in this runtime. ${alternative}`)
        this.name = "PixivUnsupportedRuntimeError"
    }
}

const getFetch = (fetchImpl?: FetchLike): FetchLike => {
    if (fetchImpl) return fetchImpl
    const globalFetch = globalThis.fetch as unknown as FetchLike | undefined
    if (!globalFetch) {
        throw new PixivUnsupportedRuntimeError(
            "fetch",
            "Pass a fetch-compatible implementation through Pixiv.configure({ fetch }) or Pixiv.refreshLogin(token, { fetch })."
        )
    }
    return globalFetch
}

export const requestWithTimeout = async (
    url: string,
    init: Parameters<FetchLike>[1] = {},
    options: PixivRuntimeOptions = {}
) => {
    const timeoutMs = options.timeoutMs ?? 30000
    const fetchImpl = getFetch(options.fetch)
    const AbortControllerImpl = globalThis.AbortController
    const controller = AbortControllerImpl ? new AbortControllerImpl() : undefined
    let timedOut = false

    const timeout = setTimeout(() => {
        timedOut = true
        controller?.abort()
    }, timeoutMs)

    try {
        return await fetchImpl(url, {...init, signal: controller?.signal})
    } catch (error) {
        if (timedOut) {
            throw new PixivRequestError(`Request timed out after ${timeoutMs}ms`, url)
        }
        throw error
    } finally {
        clearTimeout(timeout)
    }
}

export const assertOk = async (response: FetchResponseLike, url: string) => {
    if (response.ok) return
    let body = ""
    try {
        body = await response.text()
    } catch {}
    throw new PixivRequestError(
        `Pixiv request failed with HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ""}`,
        url,
        response.status,
        body
    )
}

export const toQueryString = (params: QueryParams) => {
    return Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join("&")
}

export const appendQuery = (baseUrl: string, params?: QueryParams) => {
    const query = params ? toQueryString(params) : ""
    if (!query) return baseUrl
    return `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}${query}`
}

export const parseQuery = (input: string) => {
    const params: Record<string, string> = {}
    const query = input.split("?").slice(1).join("?")
    if (!query) return params
    query.split("&").forEach((entry) => {
        if (!entry) return
        const [rawKey, rawValue = ""] = entry.split("=")
        params[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue.replace(/\+/g, " "))
    })
    return params
}

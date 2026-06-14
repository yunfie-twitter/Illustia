// @ts-nocheck
import {PixivAPIResponse} from "./types/ApiTypes"
import {PixivAuthData, PixivAuthHeaders, PixivParams, PixivWebParams} from "./types/index"
import {appendQuery, assertOk, parseQuery, PixivRuntimeOptions, requestWithTimeout, toQueryString} from "./adapters/Runtime"
import {md5} from "./adapters/md5"

const oauthURL = "https://oauth.secure.pixiv.net/auth/token"
const appURL = "https://app-api.pixiv.net/"
const webURL = "https://www.pixiv.net/"

const hashSecret = "28c1fdd170a5204386cb1313c7077b34f83e4aaf4aa829ce78c231e05b0bae2c"

export default class API {
    private readonly headers = {"user-agent": "PixivIOSApp/7.7.5 (iOS 13.2.0; iPhone XR)", "referer": "https://www.pixiv.net/", "accept-language": "English"}
    public constructor(private readonly data: PixivAuthData,
                       private readonly authHeaders: PixivAuthHeaders,
                       public refreshToken: string,
                       public accessToken: string,
                       private readonly loginTime: number,
                       private readonly expirationTime: number,
                       private readonly runtime: PixivRuntimeOptions = {}) {}

    /**
     * Gets a new access token if the refresh token expires.
     */
    public refreshAccessToken = async (refreshToken?: string) => {
        if (refreshToken) this.refreshToken = refreshToken
        const expired = (Date.now() - this.loginTime) > (this.expirationTime * 900)
        if (expired) {
            this.data.grant_type = "refresh_token"
            const clientTime = new Date().toISOString().slice(0, -5) + "+00:00"
            const clientHash = md5(String(clientTime + hashSecret))
            this.authHeaders["x-client-time"] = clientTime
            this.authHeaders["x-client-hash"] = clientHash
            const headers = Object.fromEntries(
                Object.entries(this.authHeaders).filter(([, value]) => value !== undefined)
            ) as Record<string, string>
            const result = await this.postForm<PixivAPIResponse>(oauthURL, this.data, headers)
            this.accessToken = result.response.access_token
            this.refreshToken = result.response.refresh_token
            this.authHeaders.authorization = `Bearer ${this.accessToken}`
        }
        return this.refreshToken
    }

    /**
     * Fetches an endpoint from the API and returns the response.
     */
    public get = async <T = unknown>(endpoint: string, params?: PixivParams) => {
        await this.refreshAccessToken()
        if (!params) params = {}
        params.filter = "for_ios"
        const headersWithAuth = Object.assign({}, this.headers, {
            authorization: `Bearer ${this.accessToken}`
        })
        if (endpoint.startsWith("/")) endpoint = endpoint.slice(1)
        const url = appendQuery(appURL + endpoint, params)
        return this.getJson<T>(url, headersWithAuth)
    }

    /**
     * Post with the API and returns the response.
     */
    public post = async <T = unknown>(endpoint: string, params?: PixivParams) => {
        await this.refreshAccessToken()
        if (!params) params = {}
        if (endpoint.startsWith("/")) endpoint = endpoint.slice(1)
        const url = appURL + endpoint
        return this.postForm<T>(url, params, {
            authorization: this.authHeaders.authorization ?? `Bearer ${this.accessToken}`,
            ...this.headers
        })
    }

    /**
     * Fetches from web url and returns the response.
     */
    public getWeb = async <T = unknown>(endpoint: string, params?: PixivWebParams) => {
        if (endpoint.startsWith("/")) endpoint = endpoint.slice(1)
        const url = appendQuery(webURL + endpoint, params)
        return this.getJson<T>(url, this.headers)
    }

    /**
     * Fetches the url in the nextUrl() property of search responses.
     */
    public next = async (nextUrl: string) => {
        await this.refreshAccessToken()
        const {baseUrl, params} = this.destructureParams(nextUrl)
        const headersWithAuth = Object.assign({}, this.headers, {
            authorization: `Bearer ${this.accessToken}`
        })
        const url = appendQuery(baseUrl, params)
        return this.getJson(url, headersWithAuth)
    }

    /**
     * Destructures a URL to get all of the search parameters and values.
     */
    public destructureParams = (nextUrl: string) => {
            const paramUrl = nextUrl.split("?")
            const baseUrl = paramUrl[0]
            paramUrl.shift()
            const params = parseQuery(`?${paramUrl.join("")}`) as PixivParams
            return {baseUrl, params}
    }

    /**
     * Fetches any url.
     */
    public request = async <T = unknown>(baseUrl: string, params?: object, headers?: Record<string, string>) => {
        return this.getJson<T>(appendQuery(baseUrl, params), headers)
    }

    public requestText = async (baseUrl: string, params?: object, headers?: Record<string, string>) => {
        const url = appendQuery(baseUrl, params)
        const response = await requestWithTimeout(url, {headers}, this.runtime)
        await assertOk(response, url)
        return response.text()
    }

    public requestArrayBuffer = async (baseUrl: string, params?: object, headers?: Record<string, string>) => {
        const url = appendQuery(baseUrl, params)
        const response = await requestWithTimeout(url, {headers}, this.runtime)
        await assertOk(response, url)
        return response.arrayBuffer()
    }

    private getJson = async <T = unknown>(url: string, headers?: Record<string, string>) => {
        const response = await requestWithTimeout(url, {headers}, this.runtime)
        await assertOk(response, url)
        return response.json() as Promise<T>
    }

    private postForm = async <T = unknown>(url: string, body: object, headers: Record<string, string>) => {
        const response = await requestWithTimeout(url, {
            method: "POST",
            headers,
            body: toQueryString(body)
        }, this.runtime)
        await assertOk(response, url)
        return response.json() as Promise<T>
    }
}

// @ts-nocheck
import api from "./API"
import {Illust, Manga, Novel, Search, Spotlight, Ugoira, User, Util, Web} from "./entities/index"
import {PixivAPIResponse, PixivAuthData, PixivAuthHeaders} from "./types/index"
import {assertOk, PixivRuntimeOptions, requestWithTimeout, toQueryString} from "./adapters/Runtime"
import {md5} from "./adapters/md5"

const oauthURL = "https://oauth.secure.pixiv.net/auth/token"

const clientId = "MOBrBDS8blbauoSck0ZfDbtuzpyT"
const clientSecret = "lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj"
const hashSecret = "28c1fdd170a5204386cb1313c7077b34f83e4aaf4aa829ce78c231e05b0bae2c"

const createHeaders = (): PixivAuthHeaders => {
    const clientTime = new Date().toISOString().slice(0, -5) + "+00:00"
    const clientHash = md5(String(clientTime + hashSecret))
    return {
    "app-os": "ios",
    "app-os-version": "13.2.0",
    "app-version": "7.7.5",
    "user-agent": "PixivIOSApp/7.7.5 (iOS 13.2.0; iPhone XR)",
    "host": "oauth.secure.pixiv.net",
    "accept-language": "en_US",
    "x-client-time": clientTime,
    "x-client-hash": clientHash,
    "content-type": "application/x-www-form-urlencoded",
    "accept-encoding": "gzip"
    }
}

const createAuthData = (): PixivAuthData => ({
    client_id: clientId,
    client_secret: clientSecret,
    get_secure_url: true
})

/**
 * The main class for interacting with the Pixiv API.
 */
export default class Pixiv {
    public static accessToken: string = ""
    public static refreshToken: string = ""
    private static runtime: PixivRuntimeOptions = {}
    public api: api
    public illust: Illust
    public manga: Manga
    public novel: Novel
    public search: Search
    public user: User
    public ugoira: Ugoira
    public util: Util
    public spotlight: Spotlight
    public web: Web

    private constructor(
        private readonly loginTime: number,
        private readonly expirationTime: number,
        private readonly runtime: PixivRuntimeOptions = {}
    ) {
        this.rebuildEntities()
    }

    public static configure = (options: PixivRuntimeOptions) => {
        Pixiv.runtime = {...Pixiv.runtime, ...options}
    }

    private rebuildEntities = () => {
        this.api = new api(createAuthData(), createHeaders(), Pixiv.refreshToken, Pixiv.accessToken, this.loginTime, this.expirationTime, this.runtime)
        this.illust = new Illust(this.api)
        this.manga = new Manga(this.api)
        this.novel = new Novel(this.api)
        this.search = new Search(this.api)
        this.user = new User(this.api)
        this.ugoira = new Ugoira(this.api)
        this.util = new Util(this.api, this.runtime.downloadHandler)
        this.spotlight = new Spotlight(this.api)
        this.web = new Web(this.api)
    }

    /**
     * Refreshes your refresh token and access token if they have expired.
     */
    public refreshToken = async (refreshToken?: string) => {
        if (!refreshToken) refreshToken = Pixiv.refreshToken
        if (!refreshToken) return Promise.reject("You must login with a username and password first.")
        Pixiv.refreshToken = await this.api.refreshAccessToken(refreshToken)
        this.rebuildEntities()
        return Pixiv.refreshToken
    }

    /**
     * Logs into Pixiv with your username and password, or refresh token if it is available.
     */
    public static login = async (username: string, password: string, options?: PixivRuntimeOptions) => {
        if (!username || !password) {
            const missing = username ? "password" : (password ? "username" : "username and password")
            return Promise.reject(`You must provide a ${missing} in order to login!`)
        }
        const runtime = {...Pixiv.runtime, ...options}
        const data = createAuthData()
        if (!Pixiv.refreshToken) {
            data.username = username
            data.password = password
            data.grant_type = "password"
        } else {
            data.refresh_token = Pixiv.refreshToken
            data.grant_type = "refresh_token"
        }
        const headers = createHeaders()
        const result = await Pixiv.postAuth(data, headers, runtime)
        Pixiv.accessToken = result.response.access_token
        Pixiv.refreshToken = result.response.refresh_token
        headers.authorization = `Bearer ${Pixiv.accessToken}`
        return new Pixiv(Date.now(), result.response.expires_in, runtime)
    }

    /**
     * Logs in with username and password only.
     */
    public static passwordLogin = async (username: string, password: string, options?: PixivRuntimeOptions) => {
        if (!username || !password) {
            const missing = username ? "password" : (password ? "username" : "username and password")
            return Promise.reject(`You must provide a ${missing} in order to login!`)
        }
        const runtime = {...Pixiv.runtime, ...options}
        const data = createAuthData()
        data.username = username
        data.password = password
        data.grant_type = "password"
        const headers = createHeaders()
        const result = await Pixiv.postAuth(data, headers, runtime)
        Pixiv.accessToken = result.response.access_token
        Pixiv.refreshToken = result.response.refresh_token
        headers.authorization = `Bearer ${Pixiv.accessToken}`
        return new Pixiv(Date.now(), result.response.expires_in, runtime)
    }

    /**
     * Logs in with refresh token only.
     */
    public static refreshLogin = async (refreshToken: string, options?: PixivRuntimeOptions) => {
        const runtime = {...Pixiv.runtime, ...options}
        const data = createAuthData()
        data.refresh_token = refreshToken
        data.grant_type = "refresh_token"
        const headers = createHeaders()
        const result = await Pixiv.postAuth(data, headers, runtime)
        Pixiv.accessToken = result.response.access_token
        Pixiv.refreshToken = result.response.refresh_token
        headers.authorization = `Bearer ${Pixiv.accessToken}`
        return new Pixiv(Date.now(), result.response.expires_in, runtime)
    }

    private static postAuth = async (authData: PixivAuthData, authHeaders: PixivAuthHeaders, runtime: PixivRuntimeOptions) => {
        const headers = Object.fromEntries(
            Object.entries(authHeaders).filter(([, value]) => value !== undefined)
        ) as Record<string, string>
        const response = await requestWithTimeout(oauthURL, {
            method: "POST",
            headers,
            body: toQueryString(authData)
        }, runtime)
        await assertOk(response, oauthURL)
        return response.json() as Promise<PixivAPIResponse>
    }
}

export * from "./entities/index"
export * from "./types/index"
export * from "./adapters/Runtime"

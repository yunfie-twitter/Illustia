// @ts-nocheck
import API from "../API"
import {DownloadHandler, PixivUnsupportedRuntimeError} from "../adapters/Runtime"
import replace from "../Translate"
import {PixivFolderMap, PixivIllust, PixivMultiCall, PixivNovel} from "../types"
import {Illust} from "./Illust"
import {Novel} from "./Novel"
import {Search} from "./Search"
import {Ugoira} from "./Ugoira"

type IllustSize = "medium" | "large" | "square_medium" | "original"

const REFERER_HEADERS = {Referer: "https://www.pixiv.net/"}

const pathJoin = (...parts: string[]) => {
    return parts
        .filter(Boolean)
        .map((part, index) => {
            const normalized = part.replace(/\\/g, "/")
            if (index === 0) return normalized.replace(/\/+$/g, "")
            return normalized.replace(/^\/+|\/+$/g, "")
        })
        .join("/")
}

const basename = (input: string) => {
    const normalized = input.replace(/\\/g, "/").replace(/\/+$/g, "")
    return normalized.slice(normalized.lastIndexOf("/") + 1)
}

const dirname = (input: string) => {
    const normalized = input.replace(/\\/g, "/").replace(/\/+$/g, "")
    const index = normalized.lastIndexOf("/")
    return index >= 0 ? normalized.slice(0, index) : ""
}

const extname = (input: string) => {
    const clean = input.split("?")[0]
    const file = basename(clean)
    const index = file.lastIndexOf(".")
    return index >= 0 ? file.slice(index) : ""
}

const withoutExt = (input: string) => {
    const index = input.lastIndexOf(".")
    return index >= 0 ? input.slice(0, index) : input
}

export class Util {
    private readonly illust = new Illust(this.api)
    private readonly novel = new Novel(this.api)
    private readonly search = new Search(this.api)
    private readonly ugoira = new Ugoira(this.api)

    public constructor(private readonly api: API, private readonly downloadHandler?: DownloadHandler) {}

    /**
     * Parsed a pixiv id from the url.
     */
    public parseID = (input: string) => {
        const parsed = input.match(/\d{5,}/)
        return parsed ? Number(parsed) : null
    }

    /**
     * Translates a tag to Japanese.
     */
    public translateTag = async (tag: string) => {
        return replace.translateTag(tag) as unknown as string
    }

    /**
     * Translates a title to English.
     */
    public translateTitle = async (title: string) => {
        return replace.translateTitle(title) as unknown as string
    }

    /**
     * Attempts to detect if The illust is AI.
     */
    public isAI = (illust: PixivIllust, AITags: string[] = [], AIUsers: number[] = []) => {
        const defaultAITags = ["AIイラスト", "AI生成", "StableDiffusion", "NovelAI"]
        const defaultAIUsers = [87833254]
        AIUsers = [...defaultAIUsers, ...AIUsers]
        AITags = [...defaultAITags, ...AITags]
        const tagNames = illust.tags.map((t) => t.name)

        return (
            illust.illust_ai_type === 2 ||
            AITags.some((tag) => tagNames.includes(tag)) ||
            AIUsers.includes(illust.user.id)
        )
    }

    /**
     * Utility for awaiting a setTimeout
     */
    public timeout = async (ms: number) => {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    /**
     * Node streams are not available in React Native.
     */
    public awaitStream = async () => {
        throw new PixivUnsupportedRuntimeError(
            "awaitStream",
            "Use a Promise-returning downloadHandler instead."
        )
    }

    /**
     * Makes subsequent api calls to get more search results, then returns them.
     */
    public multiCall = async (response: PixivMultiCall, limit?: number) => {
        let responseArray = []
        let counter = limit || Infinity
        if (!response.next_url) return Promise.reject("You can only use this method on search responses.")
        while ((response.next_url !== null) && (counter > 0)) {
            response = await this.api.next(response.next_url).catch(() => ({next_url: null}))
            if (response.hasOwnProperty("illusts")) {
                responseArray.push(response.illusts)
            } else if (response.hasOwnProperty("user_previews")) {
                responseArray.push(response.user_previews)
            } else if (response.hasOwnProperty("comments")) {
                responseArray.push(response.comments)
            } else if (response.hasOwnProperty("novels")) {
                responseArray.push(response.novels)
            } else if (response.hasOwnProperty("bookmark_tags")) {
                responseArray.push(response.bookmark_tags)
            }
            await this.timeout(500)
            counter--
        }
        if (response.hasOwnProperty("illusts")) {
            responseArray = [...response.illusts, responseArray]
        } else if (response.hasOwnProperty("user_previews")) {
            responseArray = [...response.user_previews, responseArray]
        } else if (response.hasOwnProperty("comments")) {
            responseArray = [...response.comments, responseArray]
        } else if (response.hasOwnProperty("novels")) {
            responseArray = [...response.novels, responseArray]
        } else if (response.hasOwnProperty("bookmark_tags")) {
            responseArray = [...response.bookmark_tags, responseArray]
        }
        return responseArray.flat(Infinity)
    }

    /**
     * Like multicall but with a minimum bookmark limit.
     */
    public bookmarkMultiCall = async (response: PixivMultiCall, bookmarks: number, limit?: number) => {
        let responseArray = []
        if (!response.next_url) return Promise.reject("You can only use this method on search responses.")
        let thresholdReached = false
        while ((response.next_url !== null) && !thresholdReached) {
            response = await this.api.next(response.next_url).catch(() => ({next_url: null}))
            if (response.hasOwnProperty("illusts")) {
                responseArray.push(response.illusts)
            } else if (response.hasOwnProperty("user_previews")) {
                responseArray.push(response.user_previews)
            } else if (response.hasOwnProperty("comments")) {
                responseArray.push(response.comments)
            } else if (response.hasOwnProperty("novels")) {
                responseArray.push(response.novels)
            } else if (response.hasOwnProperty("bookmark_tags")) {
                responseArray.push(response.bookmark_tags)
            }
            await this.timeout(500)
            const lastBookmarks = response?.illusts?.[response.illusts.length - 1]?.total_bookmarks
            if (lastBookmarks === undefined) thresholdReached = true
            if (!thresholdReached) thresholdReached = lastBookmarks <= bookmarks
            const amount = responseArray.reduce((p, c) => p + c.length, 0)
            if (amount >= limit) thresholdReached = true
        }
        if (response.hasOwnProperty("illusts")) {
            responseArray = [...response.illusts, responseArray]
        } else if (response.hasOwnProperty("user_previews")) {
            responseArray = [...response.user_previews, responseArray]
        } else if (response.hasOwnProperty("comments")) {
            responseArray = [...response.comments, responseArray]
        } else if (response.hasOwnProperty("novels")) {
            responseArray = [...response.novels, responseArray]
        } else if (response.hasOwnProperty("bookmark_tags")) {
            responseArray = [...response.bookmark_tags, responseArray]
        }
        return responseArray.flat(Infinity)
    }

    /**
     * Utility for sorting by bookmarks.
     */
    public sort = (illusts: PixivIllust[]) => {
        Array.prototype.sort.call(illusts, ((a: PixivIllust, b: PixivIllust) => (a.total_bookmarks - b.total_bookmarks) * -1))
        return illusts
    }

    private requireDownloadHandler = () => {
        if (this.downloadHandler) return this.downloadHandler
        throw new PixivUnsupportedRuntimeError(
            "local file downloads",
            "Pass Pixiv.refreshLogin(token, { downloadHandler }) and save with expo-file-system or react-native-fs."
        )
    }

    private resolveDownloadPath = (url: string, folder: string, nameExt?: string) => {
        const folderBase = basename(folder)
        const fileExt = extname(url) || ".jpg"
        if (folderBase.includes(".")) {
            return pathJoin(dirname(folder), `${withoutExt(folderBase)}${fileExt}`)
        }
        const id = url.match(/\d{6,}/)?.[0] ?? "illust"
        return pathJoin(folder, `${id}${nameExt ?? ""}${fileExt}`)
    }

    private download = async (url: string, folder: string, nameExt?: string) => {
        const handler = this.requireDownloadHandler()
        const suggestedPath = this.resolveDownloadPath(url, folder, nameExt)
        return handler({
            url,
            suggestedPath,
            headers: REFERER_HEADERS
        })
    }

    private downloadData = async (data: string, folder: string, id?: number, fileExt = "txt") => {
        const handler = this.requireDownloadHandler()
        const folderBase = basename(folder)
        const suggestedPath = folderBase.includes(".")
            ? folder
            : pathJoin(folder, `${id ? `${id}` : "data"}.${fileExt}`)
        return handler({
            url: "",
            suggestedPath,
            headers: {},
            data
        })
    }

    /**
     * Downloads an illust locally through the configured downloadHandler.
     */
    public downloadIllust = async (illustResolvable: string | PixivIllust, folder: string,
        size?: IllustSize, multiFolder?: string): Promise<string> => {
        if (!illustResolvable) return ""
        if (!size) size = "medium"
        if (!multiFolder) multiFolder = folder
        let url: string
        let illust = illustResolvable as PixivIllust
        if (typeof illustResolvable !== "string" && illustResolvable.image_urls) {
            if (illust.meta_pages.length === 0) {
                if (size === "original") {
                    url = illust.meta_single_page.original_image_url
                } else {
                    url = illust.image_urls[size]
                }
                return this.download(url, folder)
            } else {
                let dest = ""
                let i = 0
                for (const image of illust.meta_pages) {
                    url = image.image_urls[size]
                    dest = await this.download(url, multiFolder, `_p${i++}`)
                }
                return dest
            }
        } else {
            url = illustResolvable as string
            if (url.startsWith("https://i.pximg.net/")) {
                return this.download(url, folder)
            }
            illust = await this.illust.get(url)
            return this.downloadIllust(illust, folder, size)
        }
    }

    /**
     * Downloads an author's profile picture through the configured downloadHandler.
     */
    public downloadProfilePicture = async (illustResolvable: string | PixivIllust, folder: string, size?: string) => {
        if (!illustResolvable) return ""
        if (!size) size = "medium"
        let url: string
        let username: string
        if (typeof illustResolvable !== "string" && illustResolvable.image_urls) {
            url = illustResolvable.user.profile_image_urls[size]
            username = illustResolvable.user.name
        } else {
            url = illustResolvable as string
            username = (illustResolvable as string).match(/\d{6,}/)?.[0] ?? "profile"
        }
        if (!url.startsWith("https://i.pximg.net/")) {
            const illust = await this.illust.get(url)
            if (!illust) return ""
            url = illust.user.profile_image_urls[size] ?
            illust.user.profile_image_urls[size] : illust.user.profile_image_urls.medium
            username = illust.user.name
        }
        const folderBase = basename(folder)
        const suggestedPath = folderBase.includes(".") ? folder : pathJoin(folder, `${username}.png`)
        return this.requireDownloadHandler()({
            url,
            suggestedPath,
            headers: REFERER_HEADERS
        })
    }

    /**
     * Downloads a novel text file and its cover through the configured downloadHandler.
     */
    public downloadNovel = async (novelResolvable: string | PixivNovel, folder: string) => {
        let novel = novelResolvable as PixivNovel
        if (typeof novelResolvable === "string") {
            novel = await this.novel.get(novelResolvable)
        }
        const data = await this.novel.text({novel_id: novel.id})
        const dest = await this.downloadData(data.content, folder, novel.id)
        await this.download(data.coverUrl, folder)
        return dest
    }

    /**
     * Mass downloads illusts from a search result. You can map the results into different folders by tag
     * with the folderMap parameter.
     */
    public downloadIllusts = async (query: string, dest: string, size?: IllustSize, folderMap?: PixivFolderMap[], r18?: boolean) => {
        if (!size) size = "medium"
        if (!r18) r18 = false
        const illusts = await this.search.illusts({word: query, r18})
        const promiseArray = []
        loop1:
        for (let i = 0; i < illusts.length; i++) {
            const illust = illusts[i]
            if (!r18 && illust.x_restrict !== 0) continue
            if (folderMap) {
                for (let k = 0; k < illust.tags.length; k++) {
                    for (let j = 0; j < folderMap.length; j++) {
                        const tag = await replace.translateTag(folderMap[j].tag)
                        if (tag.includes(illust.tags[k].name)) {
                            const promise = this.downloadIllust(illust, pathJoin(dest, folderMap[j].folder), size)
                            promiseArray.push(promise)
                            continue loop1
                        }
                    }
                }
            }
            const promise = this.downloadIllust(illust, dest, size)
            promiseArray.push(promise)
        }
        return Promise.all(promiseArray)
    }

    public encodeGif = async (files: string[], delays?: number[], dest?: string): Promise<string> => {
        throw new PixivUnsupportedRuntimeError(
            "encodeGif",
            "Use a React Native image/video processing library or perform ugoira conversion on a backend service."
        )
    }

    public encodeAnimatedWebp = async (files: string[], delays: number[], dest?: string, webpPath?: string): Promise<string> => {
        throw new PixivUnsupportedRuntimeError(
            "encodeAnimatedWebp",
            "Use a native module, Expo-compatible media pipeline, or backend conversion service."
        )
    }

    public chmod777 = (webpPath?: string) => {
        throw new PixivUnsupportedRuntimeError(
            "chmod777",
            "React Native does not expose POSIX chmod for bundled converter binaries."
        )
    }

    public downloadZip = async (url: string, dest: string): Promise<string> => {
        throw new PixivUnsupportedRuntimeError(
            "downloadZip",
            "Fetch pixiv.ugoira.metadata(...).ugoira_metadata.zip_urls.medium and save or unzip it with an app-specific native zip library."
        )
    }

    public downloadUgoira = async (illustResolvable: string | PixivIllust, dest: string,
        options?: {speed?: number, reverse?: boolean, webp?: boolean, webpPath?: string}): Promise<string> => {
        throw new PixivUnsupportedRuntimeError(
            "downloadUgoira",
            "Use pixiv.ugoira.get(...) for metadata, then convert frames with a native module or backend service."
        )
    }

    public downloadUgoiraZip = async (illustResolvable: string | PixivIllust, dest: string): Promise<string> => {
        throw new PixivUnsupportedRuntimeError(
            "downloadUgoiraZip",
            "Use pixiv.ugoira.get(...) and an Expo/Bare RN zip library, or send the conversion job to a backend."
        )
    }

    /**
     * Gets a viewable link for an illust, if it exists.
     */
    public viewLink = async (illustResolvable: string | PixivIllust): Promise<string | null> => {
        let id: string
        if (typeof illustResolvable !== "string" && illustResolvable.id) {
            id = String(illustResolvable.id)
        } else {
            id = String(illustResolvable).match(/\d{5,}/)?.[0]?.trim()
        }
        const html = await this.api.requestText(`https://www.pixiv.net/artworks/${id}`, undefined, {referer: "https://www.pixiv.net/"})
        const match = html.match(/(?<="regular":")(.*?)(?=")/gm)?.map((m: string) => m)?.[0]
        if (match && (match.match(/i-cf/) || match.match(/tc-px/))) {
            try {
                await this.api.requestText(match, undefined, {referer: "https://www.pixiv.net/"})
                return match
            } catch {
                return null
            }
        }
        return null
    }
}

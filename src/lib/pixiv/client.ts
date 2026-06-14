import Pixiv from "@/lib/pixiv-sdk/pixiv";
import type {
  PageResult,
  PixivIllust,
  PixivUserDetail,
  RankingMode,
  Restrict,
  SearchIllustOptions
} from "@/types/pixiv";
import { toPixivError } from "@/lib/pixiv/errors";

let pixivInstance: Awaited<ReturnType<typeof Pixiv.refreshLogin>> | null = null;

function normalizePage<T>(items: T[], nextUrl: string | null): PageResult<T> {
  return { items, nextUrl };
}

function readNextUrl(entity: { nextURL?: string | null }) {
  return entity.nextURL ?? null;
}

export function hasPixivSession() {
  return pixivInstance !== null;
}

export function clearPixivSession() {
  pixivInstance = null;
}

export async function loginWithRefreshToken(refreshToken: string) {
  try {
    const trimmed = refreshToken.trim();
    if (!trimmed) throw new Error("refresh token を入力してください。");
    pixivInstance = await Pixiv.refreshLogin(trimmed);
    await pixivInstance.illust.recommended({ filter: "for_ios" });
    return pixivInstance;
  } catch (error) {
    pixivInstance = null;
    throw toPixivError(error, "refresh token の検証に失敗しました。");
  }
}

async function getClient() {
  if (!pixivInstance) {
    throw toPixivError(new Error("Pixiv refresh token が未設定です。"));
  }
  return pixivInstance;
}

export async function getRecommendedIllusts(): Promise<PageResult<PixivIllust>> {
  try {
    const client = await getClient();
    const items = (await client.illust.recommended()) as PixivIllust[];
    return normalizePage(items, readNextUrl(client.illust));
  } catch (error) {
    throw toPixivError(error);
  }
}

export async function getRankingIllusts(mode: RankingMode = "day"): Promise<PageResult<PixivIllust>> {
  try {
    const client = await getClient();
    const items = (await client.illust.ranking({ mode })) as PixivIllust[];
    return normalizePage(items, readNextUrl(client.illust));
  } catch (error) {
    throw toPixivError(error);
  }
}

export async function getNewIllusts(): Promise<PageResult<PixivIllust>> {
  try {
    const client = await getClient();
    const items = (await client.illust.new()) as PixivIllust[];
    return normalizePage(items, readNextUrl(client.illust));
  } catch (error) {
    throw toPixivError(error);
  }
}

export async function searchIllusts(
  word: string,
  options: SearchIllustOptions = {}
): Promise<PageResult<PixivIllust>> {
  try {
    const client = await getClient();
    const items = (await client.search.illusts({
      word,
      sort: options.sort ?? "date_desc",
      search_target: options.searchTarget ?? "partial_match_for_tags",
      r18: options.r18 ?? false,
      bookmarks: options.minBookmarks
    })) as PixivIllust[];
    return normalizePage(items, readNextUrl(client.search));
  } catch (error) {
    throw toPixivError(error);
  }
}

export async function getIllustDetail(id: number): Promise<PixivIllust> {
  try {
    const client = await getClient();
    return (await client.illust.detail({ illust_id: id })) as PixivIllust;
  } catch (error) {
    throw toPixivError(error);
  }
}

export async function getUserDetail(id: number): Promise<PixivUserDetail> {
  try {
    const client = await getClient();
    return (await client.user.detail({ user_id: id })) as PixivUserDetail;
  } catch (error) {
    throw toPixivError(error);
  }
}

export async function getUserIllusts(userId: number): Promise<PageResult<PixivIllust>> {
  try {
    const client = await getClient();
    const items = (await client.user.illusts({ user_id: userId })) as PixivIllust[];
    return normalizePage(items, readNextUrl(client.user));
  } catch (error) {
    throw toPixivError(error);
  }
}

export async function getBookmarks(
  userId: number,
  restrict: Restrict = "public",
  tag?: string
): Promise<PageResult<PixivIllust>> {
  try {
    const client = await getClient();
    const items = (await client.user.bookmarksIllust({
      user_id: userId,
      restrict,
      tag
    } as any)) as PixivIllust[];
    return normalizePage(items, readNextUrl(client.user));
  } catch (error) {
    throw toPixivError(error);
  }
}

export async function addBookmark(illustId: number, restrict: Restrict = "public") {
  try {
    const client = await getClient();
    await client.illust.doBookmarkIllust({ illust_id: illustId, restrict });
  } catch (error) {
    throw toPixivError(error);
  }
}

export async function removeBookmark(illustId: number) {
  try {
    const client = await getClient();
    await client.illust.undoBookmarkIllust({ illust_id: illustId });
  } catch (error) {
    throw toPixivError(error);
  }
}

export async function followUser(userId: number, restrict: Restrict = "public") {
  try {
    const client = await getClient();
    await client.api.post("v1/user/follow/add", { user_id: userId, restrict });
  } catch (error) {
    throw toPixivError(error);
  }
}

export async function unfollowUser(userId: number) {
  try {
    const client = await getClient();
    await client.api.post("v1/user/follow/delete", { user_id: userId });
  } catch (error) {
    throw toPixivError(error);
  }
}

export async function getNextPage<T>(nextUrl: string | null): Promise<PageResult<T>> {
  try {
    if (!nextUrl) return normalizePage<T>([], null);
    const client = await getClient();
    const result = (await client.api.next(nextUrl)) as {
      illusts?: T[];
      user_previews?: T[];
      next_url?: string | null;
    };
    return normalizePage((result.illusts ?? result.user_previews ?? []) as T[], result.next_url ?? null);
  } catch (error) {
    throw toPixivError(error);
  }
}

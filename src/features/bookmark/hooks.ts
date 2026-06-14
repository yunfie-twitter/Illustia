import { useInfiniteQuery } from "@tanstack/react-query";
import { getBookmarks, getNextPage } from "@/lib/pixiv/client";
import type { PixivIllust, Restrict } from "@/types/pixiv";

export function useBookmarks(userId?: number, restrict: Restrict = "public", tag?: string) {
  return useInfiniteQuery({
    queryKey: ["bookmarks", userId, restrict, tag],
    enabled: Boolean(userId),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => {
      if (pageParam) return getNextPage<PixivIllust>(pageParam);
      return getBookmarks(userId!, restrict, tag || undefined);
    },
    getNextPageParam: (lastPage) => lastPage.nextUrl
  });
}

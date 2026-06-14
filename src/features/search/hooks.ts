import { useInfiniteQuery } from "@tanstack/react-query";
import { getNextPage, searchIllusts } from "@/lib/pixiv/client";
import type { PixivIllust, SearchIllustOptions } from "@/types/pixiv";

export function useIllustSearch(word: string, options: SearchIllustOptions) {
  return useInfiniteQuery({
    queryKey: ["searchIllusts", word, options],
    enabled: word.trim().length > 0,
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => {
      if (pageParam) return getNextPage<PixivIllust>(pageParam);
      return searchIllusts(word, options);
    },
    getNextPageParam: (lastPage) => lastPage.nextUrl
  });
}

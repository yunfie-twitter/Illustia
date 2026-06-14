import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { followUser, getNextPage, getUserDetail, getUserIllusts, unfollowUser } from "@/lib/pixiv/client";
import type { PixivIllust } from "@/types/pixiv";

export function useUserDetail(userId: number) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserDetail(userId)
  });
}

export function useUserIllusts(userId: number) {
  return useInfiniteQuery({
    queryKey: ["userIllusts", userId],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => {
      if (pageParam) return getNextPage<PixivIllust>(pageParam);
      return getUserIllusts(userId);
    },
    getNextPageParam: (lastPage) => lastPage.nextUrl
  });
}

export function useFollowMutation(userId: number) {
  const queryClient = useQueryClient();
  const invalidate = async () => queryClient.invalidateQueries({ queryKey: ["user", userId] });

  return {
    follow: useMutation({ mutationFn: () => followUser(userId), onSuccess: invalidate }),
    unfollow: useMutation({ mutationFn: () => unfollowUser(userId), onSuccess: invalidate })
  };
}

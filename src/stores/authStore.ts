import { create } from "zustand";
import { clearPixivSession, loginWithRefreshToken } from "@/lib/pixiv/client";
import { deleteRefreshToken, getRefreshToken, saveRefreshToken } from "@/lib/storage/secure";

interface AuthState {
  bootstrapped: boolean;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  error?: string;
  bootstrap: () => Promise<void>;
  login: (refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  bootstrapped: false,
  isAuthenticated: false,
  isAuthenticating: false,
  async bootstrap() {
    set({ isAuthenticating: true, error: undefined });
    const token = await getRefreshToken();
    if (!token) {
      set({ bootstrapped: true, isAuthenticated: false, isAuthenticating: false });
      return;
    }

    try {
      await loginWithRefreshToken(token);
      set({ bootstrapped: true, isAuthenticated: true, isAuthenticating: false });
    } catch (error) {
      clearPixivSession();
      set({
        bootstrapped: true,
        isAuthenticated: false,
        isAuthenticating: false,
        error: error instanceof Error ? error.message : "ログインに失敗しました。"
      });
    }
  },
  async login(refreshToken) {
    set({ isAuthenticating: true, error: undefined });
    try {
      await loginWithRefreshToken(refreshToken);
      await saveRefreshToken(refreshToken.trim());
      set({ bootstrapped: true, isAuthenticated: true, isAuthenticating: false });
    } catch (error) {
      set({
        isAuthenticated: false,
        isAuthenticating: false,
        error: error instanceof Error ? error.message : "ログインに失敗しました。"
      });
      throw error;
    }
  },
  async logout() {
    await deleteRefreshToken();
    clearPixivSession();
    set({ isAuthenticated: false, isAuthenticating: false, error: undefined, bootstrapped: true });
  }
}));

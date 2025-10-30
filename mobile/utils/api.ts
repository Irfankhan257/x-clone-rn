import axios, { AxiosInstance } from "axios";
import { useAuth } from "@clerk/clerk-expo";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://x-clone-rn-sepia-six.vercel.app/api";

export const createApiClient = (
  getToken: () => Promise<string | null>
): AxiosInstance => {
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "User-Agent": "ExpoApp/1.0 (Android Emulator)",
      Accept: "application/json",
    },
  });

  api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });
  return api;
};

export const useApiClient = (): AxiosInstance => {
  const { getToken } = useAuth();
  return createApiClient(getToken);
};

export const userApi = {
  syncUser: (api: AxiosInstance) => api.post("/user/sync"),
  getCurrentUser: (api: AxiosInstance) => api.get("/user/me"),
  updateProfile: (api: AxiosInstance, data: any) =>
    api.put("/user/profile", data),
};

export const postApi = {
  createPost: (api: AxiosInstance, data: { content: string; image?: string }) =>
    api.post("/post", data),
  getPosts: (api: AxiosInstance) => api.get("/post"),
  getUserPosts: (api: AxiosInstance, username: string) =>
    api.get(`/post/user/${username}`),
  likePost: (api: AxiosInstance, postId: string) =>
    api.post(`/post/${postId}/like`),
  deletePost: (api: AxiosInstance, postId: string) =>
    api.delete(`/post/${postId}`),
};

export const commentApi = {
  createComment: (api: AxiosInstance, postId: string, content: string) =>
    api.post(`/comment/post/${postId}`, { content }),
};

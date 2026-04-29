/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthProvider } from "@refinedev/core";
import { supabaseClient } from "../supabaseClient";

const LOGIN_PATH = "/login";
const DASHBOARD_PATH = "/dashboard";

const normalizeError = (error: any, fallback: string) => ({
  name: error?.name ?? "AuthError",
  message: error?.message ?? fallback,
});


export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return {
        success: false,
        error: normalizeError(error, "Invalid email or password"),
      };
    }

    return {
      success: true,
      redirectTo: DASHBOARD_PATH,
    };
  },
  register: async ({ email, password }) => {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
    });

    if (error || !data.user) {
      return {
        success: false,
        error: normalizeError(error, "Registration failed"),
      };
    }

    return {
      success: true,
      redirectTo: LOGIN_PATH,
    };
  },
  forgotPassword: async ({ email }) => {
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/update-password`
        : undefined;

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      return {
        success: false,
        error: normalizeError(error, "Password reset failed"),
      };
    }

    return {
      success: true,
    };

  },
  updatePassword: async ({ password }) => {
    const { error } = await supabaseClient.auth.updateUser({ password });

    if (error) {
      return {
        success: false,
        error: normalizeError(error, "Password update failed"),
      };
    }

    return {
      success: true,
      redirectTo: DASHBOARD_PATH,
    };
  },
  logout: async () => {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      return {
        success: false,
        error: normalizeError(error, "Logout failed"),
      };
    }

    return {
      success: true,
      redirectTo: LOGIN_PATH,
    };
  },
  onError: async (error) => {
    if (
      error?.status === 401 ||
      error?.statusCode === 401 ||
      error?.code === "PGRST301"
    ) {
      return {
        logout: true,
        redirectTo: LOGIN_PATH,
      };
    }

    return {};
  },
  check: async () => {
    const {
      data: { user },
      error,
    } = await supabaseClient.auth.getUser();

    if (error || !user) {
      return {
        authenticated: false,
        logout: true,
        redirectTo: LOGIN_PATH,
        error: normalizeError(error, "Authentication required"),
      };
    }

    return {
      authenticated: true,
    };
  },
  getPermissions: async () => {
    const {
      data: { user },
      error,
    } = await supabaseClient.auth.getUser();

    if (error || !user) return null;

    return user.app_metadata?.role ?? user.user_metadata?.role ?? null;
  },
  getIdentity: async () => {
    const {
      data: { user },
      error,
    } = await supabaseClient.auth.getUser();

    if (error || !user) return null;

    return {
      id: user.id,
      name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email,
      email: user.email,
      avatar: user.user_metadata?.avatar_url,
    };
  },
};

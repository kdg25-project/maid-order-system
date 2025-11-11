"use client";

import { useCallback, useRef } from "react";
import type { Maid } from "@/app/types";
import type { MaidCredentials } from "@/lib/maid-auth";
import { updateMaidActiveStatus } from "@/lib/maid-auth";

type ForceDeactivateOptions = {
  onError?: (message: string) => void;
};

type ForceDeactivatePromise = Promise<Maid | null>;

export const useForceMaidDeactivate = (credentials: MaidCredentials | null) => {
  const pendingRef = useRef<ForceDeactivatePromise | null>(null);

  return useCallback(
    async (options?: ForceDeactivateOptions): ForceDeactivatePromise => {
      if (!credentials) return null;
      if (pendingRef.current) {
        return pendingRef.current;
      }

      const promise = (async () => {
        try {
          const updated = await updateMaidActiveStatus(credentials, {
            is_active: false,
          });
          return updated;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "稼働状態の更新に失敗しました。";
          console.error("Failed to inactive state", error);
          options?.onError?.(message);
          return null;
        } finally {
          pendingRef.current = null;
        }
      })();

      pendingRef.current = promise;
      return promise;
    },
    [credentials],
  );
};

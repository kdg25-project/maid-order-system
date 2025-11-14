"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { User as UserIcon } from "lucide-react";
import { getMaids } from "@/api/maids";
import type { Maid } from "@/app/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ActiveMaidsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActiveMaids({ open, onOpenChange }: ActiveMaidsProps) {
  const [maids, setMaids] = useState<Maid[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [instaxFilter, setInstaxFilter] = useState<"all" | "available" | "unavailable">("all");

  const filteredMaids = useMemo(() => {
    if (instaxFilter === "all") return maids;
    if (instaxFilter === "available") return maids.filter(m => m.is_instax_available);
    return maids.filter(m => !m.is_instax_available);
  }, [maids, instaxFilter]);

  useEffect(() => {
    if (!open) return;

    const fetchActiveMaids = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getMaids({
          is_active: true,
          per_page: 100,
        });
        setMaids(response.data.data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "エラーが発生しました。";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void fetchActiveMaids();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>稼働中メイド一覧</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-3 px-2 pb-3">
          <label htmlFor="instax-filter" className="text-sm font-medium whitespace-nowrap">
            チェキ可否:
          </label>
          <Select value={instaxFilter} onValueChange={(value) => setInstaxFilter(value as typeof instaxFilter)}>
            <SelectTrigger id="instax-filter" className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="available">チェキ可のみ</SelectItem>
              <SelectItem value="unavailable">チェキ不可のみ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-y-auto px-2">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center gap-3 rounded-2xl border p-6"
                >
                  <div
                    className="h-32 w-32 animate-pulse rounded-full bg-rose-100"
                    aria-hidden="true"
                  />
                  <div className="w-full space-y-2">
                    <div
                      className="mx-auto h-5 w-24 animate-pulse rounded-full bg-rose-100"
                      aria-hidden="true"
                    />
                    <div
                      className="mx-auto h-4 w-20 animate-pulse rounded-full bg-rose-50"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {error}
            </p>
          ) : filteredMaids.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {maids.length === 0 ? "現在稼働中のメイドはいません。" : "該当するメイドはいません。"}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredMaids.map((maid) => (
                <div
                  key={maid.id}
                  className="flex flex-col items-center gap-3 rounded-2xl border p-6"
                >
                  <div className="h-32 w-32 shrink-0 rounded-full">
                    {maid.image_url ? (
                      <Image
                        src={maid.image_url}
                        alt={maid.name || "メイド"}
                        width={128}
                        height={128}
                        className="h-32 w-32 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-rose-200 bg-rose-50 text-rose-300">
                        <UserIcon className="h-16 w-16" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <p className="text-lg font-semibold leading-tight">
                      {maid.name || "名前未設定"}
                    </p>
                    {maid.is_instax_available ? (
                      <Badge
                        variant="outline"
                        className="border-sky-200 bg-sky-50 text-sky-600"
                      >
                        チェキ可
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-gray-200 bg-gray-50 text-gray-600"
                      >
                        チェキ不可
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {maid.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

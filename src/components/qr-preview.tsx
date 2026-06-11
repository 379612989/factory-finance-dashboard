"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, QrCode } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { Card } from "@/components/ui/card";

export function QrPreview() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const query = new URLSearchParams(window.location.search);
      const isEdgeOneProtectedUrl = query.has("eo_token") && query.has("eo_time");
      setUrl(
        isEdgeOneProtectedUrl
          ? window.location.href
          : window.location.origin || process.env.NEXT_PUBLIC_APP_URL || "",
      );
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const displayUrl = useMemo(() => url.replace(/^https?:\/\//, ""), [url]);

  return (
    <Card className="hidden p-4 sm:block">
      <div className="flex items-center gap-4">
        <div className="rounded-lg border border-slate-100 bg-white p-2">
          {url ? (
            <QRCodeCanvas value={url} size={84} includeMargin />
          ) : (
            <div className="flex h-[84px] w-[84px] items-center justify-center rounded bg-slate-50">
              <QrCode className="h-7 w-7 text-slate-300" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-950">手机扫码预览</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            扫码在手机上查看经营看板
          </p>
          <div className="mt-2 flex max-w-[190px] items-center gap-1 truncate text-xs font-medium text-blue-700">
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{displayUrl || "当前访问地址"}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

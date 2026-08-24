import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

const MCP_ORIGIN = "https://blew.setupr.com";

export function useMcpUrl() {
  const [url, setUrl] = useState("");
  useEffect(() => {
    setUrl(new URL("/mcp", MCP_ORIGIN).toString());
  }, []);
  return url;
}

export function CopyableValue({
  value,
  label,
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={className}>
      {label ? (
        <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </div>
      ) : null}
      <div className="flex items-stretch gap-2 rounded-lg border border-border bg-card p-1">
        <code className="flex-1 overflow-x-auto whitespace-nowrap px-3 py-2.5 text-sm text-foreground">
          {value || "\u00a0"}
        </code>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy to clipboard"
          className="inline-flex shrink-0 items-center gap-2 rounded-md bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
        >
          {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

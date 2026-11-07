interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  withBadge?: boolean;
  withText?: boolean;
}

export function Logo({
  className = "",
  size = "md",
  withBadge = true,
  withText = true,
}: LogoProps) {
  const sizeMap = {
    sm: "size-6",
    md: "size-8",
    lg: "size-10",
    xl: "size-12",
  };

  return (
    <div className={`flex items-center gap-2.5 group ${className}`}>
      <img
        src="/logo.png"
        alt="blew logo"
        className={`${sizeMap[size]} object-contain shrink-0 transition-transform group-hover:scale-105 rounded-sm`}
      />
      {withText && (
        <div className="flex items-baseline gap-1.5">
          <span className="font-bold text-lg tracking-tight text-foreground">blew</span>
          {withBadge && (
            <span className="rounded-full bg-muted/80 px-2 py-0.5 font-mono text-[10px] text-muted-foreground uppercase tracking-widest border border-border/80">
              by setupr
            </span>
          )}
        </div>
      )}
    </div>
  );
}

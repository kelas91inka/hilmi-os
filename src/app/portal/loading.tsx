import { Logo } from "@/components/shared/logo";

export default function PortalLoading() {
  return (
    <div className="absolute inset-0 z-50 flex h-full w-full items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-700 ease-out">
        <div className="relative flex h-20 w-20 items-center justify-center">
          {/* Subtle glowing ring behind */}
          <div className="absolute inset-0 animate-ping rounded-3xl bg-primary/20 opacity-20" style={{ animationDuration: '3s' }} />
          
          {/* Main Logo with smooth pulse */}
          <div className="relative h-16 w-16 animate-pulse" style={{ animationDuration: '2s' }}>
            <Logo />
          </div>
        </div>
        <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Initializing OS...
        </div>
      </div>
    </div>
  );
}

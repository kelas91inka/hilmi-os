import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 512 512" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-full", className)}
    >
      <rect width="512" height="512" rx="112" fill="#09090B"/>
      <rect x="2" y="2" width="508" height="508" rx="110" stroke="url(#borderGlow)" strokeWidth="4" strokeOpacity="0.3"/>
      <circle cx="256" cy="256" r="140" fill="url(#glow)" opacity="0.3"/>
      
      <path d="M192 160C192 151.163 199.163 144 208 144C216.837 144 224 151.163 224 160V232H288V160C288 151.163 295.163 144 304 144C312.837 144 320 151.163 320 160V352C320 360.837 312.837 368 304 368C295.163 368 288 360.837 288 352V280H224V352C224 360.837 216.837 368 208 368C199.163 368 192 360.837 192 352V160Z" fill="url(#primaryGradient)"/>
      
      <defs>
        <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(256 256) rotate(90) scale(140)">
          <stop stopColor="#8B5CF6"/>
          <stop offset="1" stopColor="#09090B" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="primaryGradient" x1="192" y1="144" x2="320" y2="368" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A78BFA"/>
          <stop offset="1" stopColor="#7C3AED"/>
        </linearGradient>
        <linearGradient id="borderGlow" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C3AED"/>
          <stop offset="1" stopColor="#09090B"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

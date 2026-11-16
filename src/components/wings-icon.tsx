export function WingsIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left wing — main feathers */}
      <path
        d="M28 26C24 22 18 16 8 13C5 12 3 13 3 15C3 20 8 27 16 32C21 35 26 36 30 35"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 28C23 24 16 19 7 17"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M28 30C22 26 14 22 6 21"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.35"
      />
      {/* Left wing — top accent feather */}
      <path
        d="M28 24C22 18 14 12 6 10"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.3"
      />

      {/* Right wing — main feathers */}
      <path
        d="M36 26C40 22 46 16 56 13C59 12 61 13 61 15C61 20 56 27 48 32C43 35 38 36 34 35"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M36 28C41 24 48 19 57 17"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M36 30C42 26 50 22 58 21"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.35"
      />
      {/* Right wing — top accent feather */}
      <path
        d="M36 24C42 18 50 12 58 10"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.3"
      />

      {/* Sword — blade fragment going up */}
      <line
        x1="32" y1="38"
        x2="32" y2="14"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Sword — crossguard */}
      <line
        x1="27" y1="30"
        x2="37" y2="30"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Sword — grip wrapping */}
      <line x1="31" y1="33" x2="33" y2="33" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <line x1="31" y1="35" x2="33" y2="35" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      {/* Sword — pommel */}
      <circle cx="32" cy="39" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      {/* Sword — blade tip detail */}
      <path
        d="M31.2 14.5L32 11L32.8 14.5"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
    </svg>
  );
}

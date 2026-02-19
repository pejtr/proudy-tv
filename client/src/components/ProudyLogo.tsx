export function ProudyLogo({ className = "", size = "large" }: { className?: string; size?: "small" | "medium" | "large" }) {
  const sizeClasses = {
    small: "w-16 h-12",
    medium: "w-24 h-18",
    large: "w-32 h-24"
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <svg
        viewBox="0 0 200 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Three animated rainbow streams */}
        <defs>
          <linearGradient id="stream1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff0000">
              <animate attributeName="stop-color" values="#ff0000;#ff7f00;#ffff00;#ff0000" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#ff7f00">
              <animate attributeName="stop-color" values="#ff7f00;#ffff00;#00ff00;#ff7f00" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#ffff00">
              <animate attributeName="stop-color" values="#ffff00;#00ff00;#00ffff;#ffff00" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>

          <linearGradient id="stream2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00ff00">
              <animate attributeName="stop-color" values="#00ff00;#00ffff;#0000ff;#00ff00" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#00ffff">
              <animate attributeName="stop-color" values="#00ffff;#0000ff;#8b00ff;#00ffff" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#0000ff">
              <animate attributeName="stop-color" values="#0000ff;#8b00ff;#ff00ff;#0000ff" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>

          <linearGradient id="stream3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8b00ff">
              <animate attributeName="stop-color" values="#8b00ff;#ff00ff;#ff0080;#8b00ff" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#ff00ff">
              <animate attributeName="stop-color" values="#ff00ff;#ff0080;#ff0000;#ff00ff" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#ff0080">
              <animate attributeName="stop-color" values="#ff0080;#ff0000;#ff7f00;#ff0080" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Stream 1 - Left */}
        <path
          d="M 40 10 Q 30 50, 40 90 T 40 130"
          stroke="url(#stream1)"
          strokeWidth="20"
          fill="none"
          strokeLinecap="round"
          filter="url(#glow)"
          opacity="0.9"
        >
          <animate
            attributeName="d"
            values="M 40 10 Q 30 50, 40 90 T 40 130;
                    M 40 10 Q 50 50, 40 90 T 40 130;
                    M 40 10 Q 30 50, 40 90 T 40 130"
            dur="4s"
            repeatCount="indefinite"
          />
        </path>

        {/* Stream 2 - Middle */}
        <path
          d="M 100 10 Q 90 50, 100 90 T 100 130"
          stroke="url(#stream2)"
          strokeWidth="20"
          fill="none"
          strokeLinecap="round"
          filter="url(#glow)"
          opacity="0.9"
        >
          <animate
            attributeName="d"
            values="M 100 10 Q 90 50, 100 90 T 100 130;
                    M 100 10 Q 110 50, 100 90 T 100 130;
                    M 100 10 Q 90 50, 100 90 T 100 130"
            dur="4s"
            begin="0.5s"
            repeatCount="indefinite"
          />
        </path>

        {/* Stream 3 - Right */}
        <path
          d="M 160 10 Q 150 50, 160 90 T 160 130"
          stroke="url(#stream3)"
          strokeWidth="20"
          fill="none"
          strokeLinecap="round"
          filter="url(#glow)"
          opacity="0.9"
        >
          <animate
            attributeName="d"
            values="M 160 10 Q 150 50, 160 90 T 160 130;
                    M 160 10 Q 170 50, 160 90 T 160 130;
                    M 160 10 Q 150 50, 160 90 T 160 130"
            dur="4s"
            begin="1s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  );
}

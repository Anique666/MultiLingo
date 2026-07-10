export default function OwlMascot({ className = "" }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Body */}
            <ellipse cx="40" cy="48" rx="26" ry="28" fill="#58CC02" />
            {/* Belly */}
            <ellipse cx="40" cy="54" rx="16" ry="16" fill="#89E219" />
            {/* Left eye white */}
            <ellipse cx="30" cy="36" rx="10" ry="11" fill="white" />
            {/* Right eye white */}
            <ellipse cx="50" cy="36" rx="10" ry="11" fill="white" />
            {/* Left pupil */}
            <circle cx="33" cy="37" r="5" fill="#1C1C1C" />
            {/* Right pupil */}
            <circle cx="47" cy="37" r="5" fill="#1C1C1C" />
            {/* Left eye shine */}
            <circle cx="35" cy="35" r="2" fill="white" />
            {/* Right eye shine */}
            <circle cx="49" cy="35" r="2" fill="white" />
            {/* Beak */}
            <ellipse cx="40" cy="46" rx="5" ry="3.5" fill="#FFC800" />
            {/* Left wing */}
            <ellipse cx="16" cy="50" rx="8" ry="14" fill="#58CC02" transform="rotate(-12 16 50)" />
            {/* Right wing */}
            <ellipse cx="64" cy="50" rx="8" ry="14" fill="#58CC02" transform="rotate(12 64 50)" />
            {/* Left foot */}
            <ellipse cx="32" cy="74" rx="6" ry="3" fill="#FFC800" />
            {/* Right foot */}
            <ellipse cx="48" cy="74" rx="6" ry="3" fill="#FFC800" />
        </svg>
    );
}

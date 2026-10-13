interface Props {
  text: string;
  className?: string;
  allowWrapping?: boolean;
}

export default function DancingText({
  text,
  className = "",
  allowWrapping = false,
}: Props) {
  return (
    <span className={`dancing-text ${className}`}>
      {text.split("").map((char, index) => (
        <span
          key={index}
          className={`dancing-char${allowWrapping && char === " " ? " dancing-space" : ""}`}
          style={{
            animationDelay: `${index * 0.1}s`,
          }}
        >
          {char === " " ? (allowWrapping ? " " : "\u00A0") : char}
        </span>
      ))}
    </span>
  );
}

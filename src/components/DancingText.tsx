interface Props {
  text: string;
  className?: string;
}

export default function DancingText({ text, className = '' }: Props) {
  return (
    <span className={`dancing-text ${className}`}>
      {text.split('').map((char, index) => (
        <span
          key={index}
          className="dancing-char"
          style={{
            animationDelay: `${index * 0.1}s`,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}

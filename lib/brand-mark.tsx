export function BrandMark({ size }: { size: number }) {
  return (
    <div style={{ display: "flex", width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 32 32">
        <rect width="32" height="32" rx="8" fill="#9a3412" />
        <path
          fill="#f3eee4"
          d="M16.2 7.2 25 25h-3.7l-1.7-3.8h-7.2L10.7 25H7L15.8 7.2h.4Zm-2.4 10.7h4.4L16 12.2l-2.2 5.7Z"
        />
      </svg>
    </div>
  );
}

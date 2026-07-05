import { avatarPixelPalette, avatarRows, avatarWidth } from "./pixelAvatar";

type PixelAvatarProps = {
  className?: string;
};

export function PixelAvatar({ className = "" }: PixelAvatarProps) {
  return (
    <div
      className={`pixel-avatar ${className}`}
      style={{ gridTemplateColumns: `repeat(${avatarWidth}, var(--avatar-pixel-size))` }}
      aria-hidden="true"
    >
      {avatarRows.flatMap((row, rowIndex) =>
        [...row].map((pixel, columnIndex) => (
          <span
            // The matrix never reorders, so coordinates are stable keys.
            key={`${rowIndex}-${columnIndex}`}
            style={{
              backgroundColor: avatarPixelPalette[pixel] ?? "transparent",
            }}
          />
        )),
      )}
    </div>
  );
}

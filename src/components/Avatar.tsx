import { useMemo } from 'react';

interface AvatarProps {
  name: string;
  src?: string;
  avatarSize?: number;
}

const sizeClassMap: Record<number, string> = {
  8: 'w-8 h-8',
  10: 'w-10 h-10',
  12: 'w-12 h-12',
  16: 'w-16 h-16',
  20: 'w-20 h-20',
};

function Avatar({ name, src, avatarSize = 10 }: AvatarProps) {
  const initials = useMemo(() => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }, [name]);

  const sizeClass = sizeClassMap[avatarSize] ?? sizeClassMap[10];

  const textSizeClass =
    avatarSize <= 8
      ? 'text-xs'
      : avatarSize <= 10
      ? 'text-sm'
      : avatarSize <= 12
      ? 'text-base'
      : avatarSize <= 16
      ? 'text-lg'
      : 'text-xl';

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClass} shrink-0 rounded-full object-cover`}
      />
    );
  }
  return (
    <div
      className={`${sizeClass} ${textSizeClass} shrink-0 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-semibold`}
    >
      {initials}
    </div>
  );
}

export default Avatar;

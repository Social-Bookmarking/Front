import { useMemo } from 'react';

interface AvatarProps {
  name: string;
  src?: string;
  avatarSize?: number;
}

function Avatar({ name, src, avatarSize = 10 }: AvatarProps) {
  const initials = useMemo(() => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }, [name]);

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
        className={`w-${avatarSize} h-${avatarSize} shrink-0 rounded-full object-cover`}
      />
    );
  }
  return (
    <div
      className={`w-${avatarSize} h-${avatarSize} ${textSizeClass} shrink-0 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-semibold`}
    >
      {initials}
    </div>
  );
}

export default Avatar;

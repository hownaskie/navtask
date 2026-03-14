import { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { lorelei } from '@dicebear/collection';

export default function AvatarUrl({ seed = 'John Doe' }) {
  const avatar = useMemo(() => {
    return createAvatar(lorelei, {
      seed,
      size: 128,
      // ... other options
    }).toDataUri();
  }, [seed]);

  return avatar;
}
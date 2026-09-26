/**
 * Helper utility to parse ANY YouTube channel, handle, playlist, or video URL
 * and automatically generate a valid YouTube embed URL for in-app viewing.
 */
export function getYouTubeEmbedUrl(inputUrl: string): string | undefined {
  if (!inputUrl) return undefined;

  const trimmed = inputUrl.trim();

  // 1. If it's already an embed URL
  if (trimmed.includes('youtube.com/embed/')) {
    return trimmed;
  }

  // 2. If it's a YouTube handle e.g. https://www.youtube.com/@PhysicsWallahBangla
  const handleMatch = trimmed.match(/youtube\.com\/@([a-zA-Z0-9_\-.]+)/);
  if (handleMatch && handleMatch[1]) {
    const handle = handleMatch[1];
    return `https://www.youtube.com/embed?listType=user_uploads&list=${encodeURIComponent(handle)}`;
  }

  // 3. If it's a Channel ID e.g. https://www.youtube.com/channel/UCxxxxxxxxxxxx
  const channelMatch = trimmed.match(/youtube\.com\/channel\/(UC[a-zA-Z0-9_\-]+)/);
  if (channelMatch && channelMatch[1]) {
    // Replacing UC with UU gives YouTube's official "Uploads Playlist" for that channel!
    const uploadsPlaylistId = channelMatch[1].replace(/^UC/, 'UU');
    return `https://www.youtube.com/embed/videoseries?list=${uploadsPlaylistId}`;
  }

  // 4. If it's a YouTube playlist e.g. https://www.youtube.com/playlist?list=PLxxxx
  const playlistMatch = trimmed.match(/[?&]list=([a-zA-Z0-9_\-]+)/);
  if (playlistMatch && playlistMatch[1]) {
    return `https://www.youtube.com/embed/videoseries?list=${playlistMatch[1]}`;
  }

  // 5. If it's a custom user/c link e.g. https://www.youtube.com/c/ChannelName or /user/UserName
  const customMatch = trimmed.match(/youtube\.com\/(?:c|user)\/([a-zA-Z0-9_\-]+)/);
  if (customMatch && customMatch[1]) {
    return `https://www.youtube.com/embed?listType=user_uploads&list=${encodeURIComponent(customMatch[1])}`;
  }

  // 6. If it's a direct video link e.g. https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID
  const videoMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_\-]+)/);
  if (videoMatch && videoMatch[1]) {
    return `https://www.youtube.com/embed/${videoMatch[1]}?autoplay=1`;
  }

  // Fallback: If it contains youtube.com or youtu.be, construct user_uploads fallback
  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    const lastPart = trimmed.split('/').pop()?.replace('@', '') || '';
    if (lastPart) {
      return `https://www.youtube.com/embed?listType=user_uploads&list=${encodeURIComponent(lastPart)}`;
    }
  }

  return undefined;
}

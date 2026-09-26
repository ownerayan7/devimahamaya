/**
 * Universal Embed Generator
 * Converts YouTube, Facebook, Vimeo, and Web links into valid embedded URLs for in-app viewing.
 */

export function getUniversalEmbedUrl(
  inputUrl: string,
  platform: 'youtube' | 'facebook' | 'web' | string
): string | undefined {
  if (!inputUrl) return undefined;
  const trimmed = inputUrl.trim();

  // 1. If it's already an explicit iframe / embed link
  if (
    trimmed.includes('youtube.com/embed/') ||
    trimmed.includes('facebook.com/plugins/') ||
    trimmed.includes('player.vimeo.com/')
  ) {
    return trimmed;
  }

  // ----------------------------------------------------
  // YOUTUBE EMBEDS
  // ----------------------------------------------------
  if (platform === 'youtube' || trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    // Handle @channelName
    const handleMatch = trimmed.match(/youtube\.com\/@([a-zA-Z0-9_\-.]+)/);
    if (handleMatch && handleMatch[1]) {
      return `https://www.youtube.com/embed?listType=user_uploads&list=${encodeURIComponent(handleMatch[1])}`;
    }

    // Channel ID UCxxxx -> Uploads playlist UUxxxx
    const channelMatch = trimmed.match(/youtube\.com\/channel\/(UC[a-zA-Z0-9_\-]+)/);
    if (channelMatch && channelMatch[1]) {
      const uploadsPlaylistId = channelMatch[1].replace(/^UC/, 'UU');
      return `https://www.youtube.com/embed/videoseries?list=${uploadsPlaylistId}`;
    }

    // Playlist PLxxxx
    const playlistMatch = trimmed.match(/[?&]list=([a-zA-Z0-9_\-]+)/);
    if (playlistMatch && playlistMatch[1]) {
      return `https://www.youtube.com/embed/videoseries?list=${playlistMatch[1]}`;
    }

    // Custom user / c link
    const customMatch = trimmed.match(/youtube\.com\/(?:c|user)\/([a-zA-Z0-9_\-]+)/);
    if (customMatch && customMatch[1]) {
      return `https://www.youtube.com/embed?listType=user_uploads&list=${encodeURIComponent(customMatch[1])}`;
    }

    // Direct Video
    const videoMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_\-]+)/);
    if (videoMatch && videoMatch[1]) {
      return `https://www.youtube.com/embed/${videoMatch[1]}?autoplay=1`;
    }

    // Fallback YouTube
    const lastPart = trimmed.split('/').pop()?.replace('@', '') || '';
    if (lastPart && !lastPart.includes('?')) {
      return `https://www.youtube.com/embed?listType=user_uploads&list=${encodeURIComponent(lastPart)}`;
    }
  }

  // ----------------------------------------------------
  // FACEBOOK EMBEDS (Pages, Videos, Groups & Posts)
  // ----------------------------------------------------
  if (platform === 'facebook' || trimmed.includes('facebook.com') || trimmed.includes('fb.watch')) {
    // Check if it's a Facebook Video
    if (trimmed.includes('/videos/') || trimmed.includes('/watch') || trimmed.includes('fb.watch/')) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(trimmed)}&show_text=false&width=560`;
    }

    // Check if it's a Facebook Post
    if (trimmed.includes('/posts/') || trimmed.includes('/photos/') || trimmed.includes('/permalink/')) {
      return `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(trimmed)}&width=500`;
    }

    // Otherwise, treat as Facebook Page / Group timeline feed embed!
    return `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(trimmed)}&tabs=timeline&width=500&height=600&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`;
  }

  // ----------------------------------------------------
  // VIMEO EMBEDS
  // ----------------------------------------------------
  if (trimmed.includes('vimeo.com')) {
    const vimeoMatch = trimmed.match(/vimeo\.com\/([0-9]+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
  }

  // ----------------------------------------------------
  // GENERAL WEBSITE IFRAME / WEBVIEW
  // ----------------------------------------------------
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return undefined;
}

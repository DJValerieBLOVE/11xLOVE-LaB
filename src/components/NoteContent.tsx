import { useMemo } from 'react';
import { type NostrEvent } from '@nostrify/nostrify';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { cn } from '@/lib/utils';

interface NoteContentProps {
  event: NostrEvent;
  className?: string;
}

// Media URL detection patterns
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|svg|avif)(\?.*)?$/i;
const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|ogg|m4v)(\?.*)?$/i;
const AUDIO_EXTENSIONS = /\.(mp3|wav|ogg|m4a|flac)(\?.*)?$/i;

// Known image/media hosts that might not have extensions
const IMAGE_HOSTS = [
  'blossom.primal.net',
  'void.cat',
  'nostr.build',
  'image.nostr.build',
  'i.imgur.com',
  'imgur.com',
  'primal.b-cdn.net',
  'cdn.nostr.build',
  'media.nostr.band',
  'files.sovbit.host',
  'nostpic.com',
  'm.primal.net',
  'media.snort.social',
  'noster.social',
  'satellite.earth',
  'nostrcheck.me',
  'cdn.satellite.earth',
  'i.nostr.build',
  'pfp.nostr.build',
  'media.primal.net',
  'blossom.band',
  'files.blossom.band',
];

function isImageUrl(url: string): boolean {
  // Check by extension first
  if (IMAGE_EXTENSIONS.test(url)) return true;
  
  try {
    const parsed = new URL(url);
    
    // Check known image hosts
    if (IMAGE_HOSTS.some(host => parsed.hostname.includes(host))) return true;
    
    // Check if URL path looks like an image (hash-based filenames common on Blossom)
    // e.g., /abc123def456... (32+ hex chars)
    const pathWithoutSlash = parsed.pathname.slice(1);
    if (/^[a-f0-9]{32,}$/i.test(pathWithoutSlash)) return true;
    
    return false;
  } catch {
    return false;
  }
}

function isVideoUrl(url: string): boolean {
  return VIDEO_EXTENSIONS.test(url);
}

function isAudioUrl(url: string): boolean {
  return AUDIO_EXTENSIONS.test(url);
}

function isYouTubeUrl(url: string): { isYouTube: boolean; videoId?: string } {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be')) {
      let videoId: string | undefined;
      if (parsed.hostname.includes('youtu.be')) {
        videoId = parsed.pathname.slice(1);
      } else {
        videoId = parsed.searchParams.get('v') || undefined;
      }
      return { isYouTube: true, videoId };
    }
  } catch {
    // Ignore
  }
  return { isYouTube: false };
}

/** Parses content of text note events so that URLs and hashtags are linkified, and media is embedded. */
export function NoteContent({
  event, 
  className, 
}: NoteContentProps) {  
  // Collect media URLs from content and imeta tags
  const { textContent, mediaItems } = useMemo(() => {
    const text = event.content;
    const media: Array<{ url: string; type: 'image' | 'video' | 'audio' | 'youtube'; thumbnailUrl?: string }> = [];
    
    // Extract URLs from content - handle trailing punctuation
    const urlRegex = /https?:\/\/[^\s<>"]+/g;
    const rawUrls = text.match(urlRegex) || [];
    // Clean trailing punctuation that might be captured
    const urls = rawUrls.map(url => url.replace(/[.,;:!?)\]]+$/, ''));
    
    // Check each URL for media type
    urls.forEach(url => {
      const { isYouTube, videoId } = isYouTubeUrl(url);
      if (isYouTube && videoId) {
        media.push({ url, type: 'youtube', thumbnailUrl: `https://img.youtube.com/vi/${videoId}/0.jpg` });
      } else if (isImageUrl(url)) {
        media.push({ url, type: 'image' });
      } else if (isVideoUrl(url)) {
        media.push({ url, type: 'video' });
      } else if (isAudioUrl(url)) {
        media.push({ url, type: 'audio' });
      }
    });
    
    // Also check imeta tags for media
    event.tags
      .filter(([name]) => name === 'imeta')
      .forEach(tag => {
        // imeta tags contain key-value pairs like "url https://...", "m image/jpeg"
        const urlPart = tag.find(p => p.startsWith('url '));
        if (urlPart) {
          const url = urlPart.replace('url ', '');
          const mimeType = tag.find(p => p.startsWith('m '))?.replace('m ', '');
          if (mimeType?.startsWith('image/') || isImageUrl(url)) {
            if (!media.some(m => m.url === url)) {
              media.push({ url, type: 'image' });
            }
          } else if (mimeType?.startsWith('video/') || isVideoUrl(url)) {
            if (!media.some(m => m.url === url)) {
              media.push({ url, type: 'video' });
            }
          }
        }
      });
    
    // Remove media URLs from text content (they'll be rendered separately)
    let cleanedText = text;
    media.forEach(m => {
      cleanedText = cleanedText.replace(m.url, '').trim();
    });
    
    return { textContent: cleanedText, mediaItems: media };
  }, [event]);
  
  // Process the text content to render mentions, links, etc.
  const processedContent = useMemo(() => {
    const text = textContent;
    
    // Regex to find URLs, Nostr references, and hashtags
    const regex = /(https?:\/\/[^\s]+)|nostr:(npub1|note1|nprofile1|nevent1)([023456789acdefghjklmnpqrstuvwxyz]+)|(#\w+)/g;
    
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let keyCounter = 0;
    
    while ((match = regex.exec(text)) !== null) {
      const [fullMatch, url, nostrPrefix, nostrData, hashtag] = match;
      const index = match.index;
      
      // Add text before this match
      if (index > lastIndex) {
        parts.push(text.substring(lastIndex, index));
      }
      
      if (url) {
        // Skip if it's a media URL (already handled separately)
        const isMedia = mediaItems.some(m => url.includes(m.url) || m.url.includes(url));
        if (!isMedia) {
          // Handle URLs
          parts.push(
            <a 
              key={`url-${keyCounter++}`}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6600ff] hover:underline break-all"
            >
              {url.length > 50 ? url.slice(0, 50) + '...' : url}
            </a>
          );
        }
      } else if (nostrPrefix && nostrData) {
        // Handle Nostr references
        try {
          const nostrId = `${nostrPrefix}${nostrData}`;
          const decoded = nip19.decode(nostrId);
          
          if (decoded.type === 'npub') {
            const pubkey = decoded.data;
            parts.push(
              <NostrMention key={`mention-${keyCounter++}`} pubkey={pubkey} />
            );
          } else if (decoded.type === 'nprofile') {
            const pubkey = decoded.data.pubkey;
            parts.push(
              <NostrMention key={`mention-${keyCounter++}`} pubkey={pubkey} />
            );
          } else {
            // For other types, just show as a link
            parts.push(
              <Link 
                key={`nostr-${keyCounter++}`}
                to={`/${nostrId}`}
                className="text-[#6600ff] hover:underline break-all"
              >
                {fullMatch}
              </Link>
            );
          }
        } catch {
          // If decoding fails, just render as text
          parts.push(fullMatch);
        }
      } else if (hashtag) {
        // Handle hashtags
        const tag = hashtag.slice(1); // Remove the #
        parts.push(
          <Link 
            key={`hashtag-${keyCounter++}`}
            to={`/t/${tag}`}
            className="text-[#6600ff] hover:underline"
          >
            {hashtag}
          </Link>
        );
      }
      
      lastIndex = index + fullMatch.length;
    }
    
    // Add any remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts;
  }, [textContent, mediaItems]);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Text content */}
      {processedContent.length > 0 && (
        <div className="whitespace-pre-wrap break-words">
          {processedContent}
        </div>
      )}
      
      {/* Media gallery */}
      {mediaItems.length > 0 && (
        <div className={cn(
          "grid gap-2",
          mediaItems.length === 1 ? "grid-cols-1" : 
          mediaItems.length === 2 ? "grid-cols-2" :
          mediaItems.length === 3 ? "grid-cols-2" :
          "grid-cols-2"
        )}>
          {mediaItems.map((media, index) => (
            <MediaItem key={`media-${index}`} {...media} />
          ))}
        </div>
      )}
    </div>
  );
}

// Media item component
function MediaItem({ url, type }: { url: string; type: 'image' | 'video' | 'audio' | 'youtube'; thumbnailUrl?: string }) {
  if (type === 'image') {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        <img
          src={url}
          alt="Embedded media"
          className="rounded-xl max-h-[400px] w-full object-cover hover:opacity-90 transition-opacity bg-gray-100"
          loading="lazy"
          onError={(e) => {
            // Hide broken images
            const img = e.target as HTMLImageElement;
            img.style.display = 'none';
            // Also hide the parent link
            const parent = img.parentElement;
            if (parent) parent.style.display = 'none';
          }}
          onLoad={(e) => {
            // Ensure image is visible after loading
            const img = e.target as HTMLImageElement;
            img.style.opacity = '1';
          }}
          style={{ minHeight: '100px' }}
        />
      </a>
    );
  }
  
  if (type === 'video') {
    return (
      <video
        src={url}
        controls
        className="rounded-xl max-h-96 w-full"
        preload="metadata"
      >
        <track kind="captions" />
      </video>
    );
  }
  
  if (type === 'audio') {
    return (
      <audio
        src={url}
        controls
        className="w-full"
        preload="metadata"
      >
        <track kind="captions" />
      </audio>
    );
  }
  
  if (type === 'youtube') {
    const { videoId } = isYouTubeUrl(url);
    if (videoId) {
      return (
        <div className="relative aspect-video rounded-xl overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      );
    }
  }
  
  return null;
}

// Helper component to display user mentions
function NostrMention({ pubkey }: { pubkey: string }) {
  const author = useAuthor(pubkey);
  const npub = nip19.npubEncode(pubkey);
  const hasRealName = !!author.data?.metadata?.name;
  const displayName = author.data?.metadata?.name ?? genUserName(pubkey);

  return (
    <Link 
      to={`/${npub}`}
      className={cn(
        "font-medium hover:underline",
        hasRealName 
          ? "text-[#6600ff]" 
          : "text-gray-500 hover:text-gray-700"
      )}
    >
      @{displayName}
    </Link>
  );
}

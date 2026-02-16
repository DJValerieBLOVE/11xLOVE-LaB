import { useMemo } from 'react';
import { type NostrEvent } from '@nostrify/nostrify';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useAuthor } from '@/hooks/useAuthor';
import { useAppContext } from '@/hooks/useAppContext';
import { genUserName } from '@/lib/genUserName';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

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
  // Debug: Check if event is actually an object
  if (typeof event === 'string') {
    console.error('[NoteContent] Received string instead of event object:', event.slice(0, 100));
    try {
      const parsed = JSON.parse(event);
      return <div className={className}>{parsed.content || 'Failed to parse event'}</div>;
    } catch {
      return <div className={className}>Invalid event data</div>;
    }
  }
  
  if (!event || typeof event.content !== 'string') {
    console.error('[NoteContent] Invalid event:', event);
    return <div className={className}>Invalid event</div>;
  }
  
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
          } else if (decoded.type === 'note') {
            // Embedded note quote
            parts.push(
              <EmbeddedNote 
                key={`note-${keyCounter++}`} 
                eventId={decoded.data} 
              />
            );
          } else if (decoded.type === 'nevent') {
            // Embedded nevent quote
            parts.push(
              <EmbeddedNote 
                key={`nevent-${keyCounter++}`} 
                eventId={decoded.data.id}
                relays={decoded.data.relays}
              />
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
      
      {/* Media gallery - Primal style: single column, natural sizing */}
      {mediaItems.length > 0 && (
        <div className="space-y-2">
          {mediaItems.map((media, index) => (
            <MediaItem key={`media-${index}`} {...media} />
          ))}
        </div>
      )}
    </div>
  );
}

// Media item component - Primal-style image rendering
function MediaItem({ url, type }: { url: string; type: 'image' | 'video' | 'audio' | 'youtube'; thumbnailUrl?: string }) {
  if (type === 'image') {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl">
        <img
          src={url}
          alt="Embedded media"
          className="max-w-full h-auto rounded-xl hover:opacity-90 transition-opacity bg-gray-100"
          loading="lazy"
          onError={(e) => {
            // Hide broken images
            const img = e.target as HTMLImageElement;
            img.style.display = 'none';
            // Also hide the parent link
            const parent = img.parentElement;
            if (parent) parent.style.display = 'none';
          }}
          style={{ maxHeight: '500px', objectFit: 'contain' }}
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

// Embedded note component for quote posts (like Primal)
function EmbeddedNote({ eventId, relays }: { eventId: string; relays?: string[] }) {
  const { nostr } = useNostr();
  const { config } = useAppContext();
  
  // Get user's configured public relays
  const configuredRelays = config.relayMetadata.relays
    .filter(r => r.read && !r.url.includes('railway.app'))
    .map(r => r.url);
  
  // Fetch the referenced event
  const { data: event, isLoading } = useQuery({
    queryKey: ['embedded-note', eventId, configuredRelays.length],
    queryFn: async () => {
      // Use provided relays, or user's configured relays
      const relayUrls = relays?.length ? relays.slice(0, 3) : configuredRelays;
      if (relayUrls.length === 0) return null;
      
      const relayGroup = nostr.group(relayUrls);
      
      const events = await relayGroup.query(
        [{ ids: [eventId], limit: 1 }],
        { signal: AbortSignal.timeout(5000) }
      );
      
      return events[0] || null;
    },
    enabled: configuredRelays.length > 0 || (relays?.length ?? 0) > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
  
  const author = useAuthor(event?.pubkey);
  
  if (isLoading) {
    return (
      <div className="my-2 p-3 border rounded-xl bg-muted/30 animate-pulse">
        <div className="flex gap-2 items-center">
          <div className="h-6 w-6 rounded-full bg-muted" />
          <div className="h-4 w-24 bg-muted rounded" />
        </div>
        <div className="mt-2 h-4 w-full bg-muted rounded" />
      </div>
    );
  }
  
  if (!event) {
    const noteId = nip19.noteEncode(eventId);
    return (
      <Link 
        to={`/${noteId}`}
        className="my-2 block p-3 border rounded-xl bg-muted/30 text-muted-foreground hover:bg-muted/50 transition-colors"
      >
        <span className="text-sm">Referenced note not found</span>
      </Link>
    );
  }
  
  const metadata = author.data?.metadata;
  const displayName = metadata?.display_name || metadata?.name || genUserName(event.pubkey);
  const noteId = nip19.noteEncode(event.id);
  const npub = nip19.npubEncode(event.pubkey);
  const timeAgo = formatDistanceToNow(new Date(event.created_at * 1000), { addSuffix: true });
  
  // Truncate content if too long
  const maxLength = 280;
  const content = event.content.length > maxLength 
    ? event.content.slice(0, maxLength) + '...' 
    : event.content;
  
  return (
    <Link 
      to={`/${noteId}`}
      className="my-2 block p-3 border rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        <Avatar className="h-5 w-5">
          <AvatarImage src={metadata?.picture} />
          <AvatarFallback className="text-[8px] bg-[#6600ff]/10 text-[#6600ff]">
            {displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <Link 
          to={`/${npub}`}
          onClick={(e) => e.stopPropagation()}
          className="font-medium text-sm hover:underline"
        >
          {displayName}
        </Link>
        <span className="text-xs text-muted-foreground">• {timeAgo}</span>
      </div>
      <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
    </Link>
  );
}

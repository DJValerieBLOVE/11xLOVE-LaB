import { useMemo, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { ChevronDown, ChevronUp, ImageIcon, ExternalLink } from 'lucide-react';
import type { PrimalLinkMetadata } from '@/lib/primalCache';

// Content limits like Primal - show 2 images max, click for more
const MAX_CONTENT_LENGTH = 500;
const MAX_IMAGES_PREVIEW = 2;

interface NoteContentProps {
  event: NostrEvent;
  className?: string;
  /** Link previews from Primal cache (kind 10000128) */
  linkPreviews?: Map<string, PrimalLinkMetadata>;
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
    
    // Check known image hosts - these often serve images without extensions
    if (IMAGE_HOSTS.some(host => parsed.hostname.includes(host))) {
      // For known image hosts, assume it's an image unless it looks like a webpage
      const path = parsed.pathname.toLowerCase();
      // Skip if path ends with common webpage indicators
      if (path.endsWith('/') || path.endsWith('.html') || path.endsWith('.htm')) {
        return false;
      }
      return true;
    }
    
    // Check if URL path looks like an image (hash-based filenames common on Blossom)
    // e.g., /abc123def456... (32+ hex chars)
    const pathWithoutSlash = parsed.pathname.slice(1);
    if (/^[a-f0-9]{32,}$/i.test(pathWithoutSlash)) return true;
    
    // Also check for common CDN patterns with hash-like filenames
    if (/\/[a-f0-9]{40,}\/?$/i.test(parsed.pathname)) return true;
    
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
  linkPreviews,
}: NoteContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllMedia, setShowAllMedia] = useState(false);
  
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
  
  // Collect media URLs and link URLs from content and imeta tags
  const { textContent, mediaItems, linkUrls } = useMemo(() => {
    const text = event.content;
    
    const media: Array<{ url: string; type: 'image' | 'video' | 'audio' | 'youtube'; thumbnailUrl?: string }> = [];
    const links: string[] = []; // URLs that should get link previews
    
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
      } else {
        // Not a media URL - might have a link preview
        links.push(url);
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
    
    return { textContent: cleanedText, mediaItems: media, linkUrls: links };
  }, [event]);
  
  // Process the text content to render mentions, links, etc.
  const processedContent = useMemo(() => {
    const text = textContent;
    
    // Regex to find URLs, Nostr references, and hashtags
    // Includes naddr1 for addressable events (articles, streams, etc.)
    const regex = /(https?:\/\/[^\s]+)|nostr:(npub1|note1|nprofile1|nevent1|naddr1)([023456789acdefghjklmnpqrstuvwxyz]+)|(#\w+)/g;
    
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
            const pubkey = decoded.data as string;
            parts.push(
              <NostrMention key={`mention-${keyCounter++}`} pubkey={pubkey} />
            );
          } else if (decoded.type === 'nprofile') {
            const data = decoded.data as { pubkey: string; relays?: string[] };
            parts.push(
              <NostrMention key={`mention-${keyCounter++}`} pubkey={data.pubkey} />
            );
          } else if (decoded.type === 'note') {
            // Embedded note quote
            parts.push(
              <EmbeddedNote 
                key={`note-${keyCounter++}`} 
                eventId={decoded.data as string} 
              />
            );
          } else if (decoded.type === 'nevent') {
            // Embedded nevent quote
            const data = decoded.data as { id: string; relays?: string[]; author?: string };
            parts.push(
              <EmbeddedNote 
                key={`nevent-${keyCounter++}`} 
                eventId={data.id}
                relays={data.relays}
              />
            );
          } else if (decoded.type === 'naddr') {
            // Addressable event (article, stream, etc.) - show as compact link
            const data = decoded.data as { kind: number; pubkey: string; identifier: string; relays?: string[] };
            const kindLabel = data.kind === 30023 ? 'Article' : 
                            data.kind === 30311 ? 'Stream' :
                            data.kind === 30402 ? 'Listing' :
                            `Event`;
            parts.push(
              <Link 
                key={`naddr-${keyCounter++}`}
                to={`/${nostrId}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#6600ff]/10 text-[#6600ff] rounded text-sm hover:bg-[#6600ff]/20 transition-colors"
              >
                📄 {kindLabel}{data.identifier ? `: ${data.identifier.slice(0, 30)}${data.identifier.length > 30 ? '...' : ''}` : ''}
              </Link>
            );
          } else {
            // For other types, show as compact link (not raw string)
            parts.push(
              <Link 
                key={`nostr-${keyCounter++}`}
                to={`/${nostrId}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#6600ff]/10 text-[#6600ff] rounded text-sm hover:bg-[#6600ff]/20"
              >
                🔗 {nostrPrefix.slice(0, -1)}
              </Link>
            );
          }
        } catch {
          // If decoding fails, show as compact link instead of raw text
          const shortId = `${nostrPrefix}${nostrData.slice(0, 8)}...`;
          parts.push(
            <span 
              key={`nostr-fallback-${keyCounter++}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-sm"
            >
              🔗 {shortId}
            </span>
          );
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

  // Check if media needs limiting
  const hasMoreMedia = mediaItems.length > MAX_IMAGES_PREVIEW && !showAllMedia;
  const displayedMedia = hasMoreMedia 
    ? mediaItems.slice(0, MAX_IMAGES_PREVIEW)
    : mediaItems;
  const hiddenMediaCount = mediaItems.length - MAX_IMAGES_PREVIEW;

  // Check if content needs truncation - but ALWAYS process nostr references
  // Only truncate pure text parts, not embedded content
  const needsTruncation = textContent.length > MAX_CONTENT_LENGTH && !isExpanded;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Text content - always use processedContent to render nostr references */}
      {processedContent.length > 0 && (
        <div className={cn("whitespace-pre-wrap break-words", needsTruncation && "line-clamp-6")}>
          {processedContent}
        </div>
      )}
      
      {/* Show more/less for text */}
      {needsTruncation && (
        <Button
          variant="link"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="text-[#6600ff] p-0 h-auto font-normal"
        >
          Show more
          <ChevronDown className="h-3 w-3 ml-0.5" />
        </Button>
      )}
      {isExpanded && textContent.length > MAX_CONTENT_LENGTH && (
        <Button
          variant="link"
          size="sm"
          onClick={() => setIsExpanded(false)}
          className="text-[#6600ff] p-0 h-auto font-normal"
        >
          Show less
          <ChevronUp className="h-3 w-3 ml-0.5" />
        </Button>
      )}
      
      {/* Media gallery - Primal style: limited preview with show more */}
      {displayedMedia.length > 0 && (
        <div className="space-y-2">
          {displayedMedia.map((media, index) => (
            <MediaItem key={`media-${index}`} {...media} />
          ))}
          
          {/* Show more media button */}
          {hasMoreMedia && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllMedia(true)}
              className="w-full gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              Show {hiddenMediaCount} more image{hiddenMediaCount > 1 ? 's' : ''}
            </Button>
          )}
        </div>
      )}
      
      {/* Link Previews - Primal style cards or client-side fallback */}
      {linkUrls.length > 0 && (
        <div className="space-y-2">
          {linkUrls.slice(0, 1).map((url) => {
            // Try exact match first, then normalized variants
            const preview = findLinkPreview(url, linkPreviews);
            if (preview) {
              return <LinkPreviewCard key={url} url={url} preview={preview} />;
            }
            // Client-side fallback when Primal doesn't have the preview
            return <ClientLinkPreview key={url} url={url} />;
          })}
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
        "font-normal hover:underline",
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
        className="my-2 block p-3 border rounded-xl bg-gray-50 text-foreground hover:bg-gray-100 transition-colors"
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
  
  return (
    <div 
      className="my-2 block p-3 border rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => window.location.href = `/${noteId}`}
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
          className="font-normal text-sm hover:underline"
        >
          {displayName}
        </Link>
        <span className="text-xs text-gray-500">• {timeAgo}</span>
      </div>
      {/* Render rich content with media - same as regular posts */}
      <EmbeddedNoteContent event={event} />
    </div>
  );
}

/** Compact content renderer for embedded/quoted notes - shows text + images inline */
function EmbeddedNoteContent({ event }: { event: NostrEvent }) {
  const content = event.content || '';
  
  // Extract media URLs from content
  const urlRegex = /https?:\/\/[^\s<>"]+/g;
  const rawUrls = content.match(urlRegex) || [];
  const urls = rawUrls.map(url => url.replace(/[.,;:!?)\]]+$/, ''));
  
  const imageUrls: string[] = [];
  
  urls.forEach(url => {
    if (isImageUrl(url) || isVideoUrl(url)) {
      imageUrls.push(url);
    }
  });
  
  // Clean media URLs from text
  let textContent = content;
  imageUrls.forEach(url => {
    textContent = textContent.replace(url, '').trim();
  });
  
  // Also clean nostr: references and show them as compact links
  const nostrRegex = /nostr:(npub1|note1|nprofile1|nevent1|naddr1)([023456789acdefghjklmnpqrstuvwxyz]+)/g;
  const textWithChips = textContent.replace(nostrRegex, (_match, prefix: string) => {
    const label = prefix === 'npub1' ? '@user' : 
                  prefix === 'note1' ? '📝 note' :
                  prefix === 'naddr1' ? '📄 link' :
                  '🔗 ref';
    return `[${label}]`;
  });
  
  // Truncate if too long
  const maxLength = 280;
  const displayText = textWithChips.length > maxLength 
    ? textWithChips.slice(0, maxLength) + '...' 
    : textWithChips;
  
  return (
    <div className="space-y-2">
      {displayText.trim() && (
        <p className="text-sm whitespace-pre-wrap break-words">{displayText}</p>
      )}
      {/* Show first image from the embedded note */}
      {imageUrls.slice(0, 1).map((url, i) => (
        <a 
          key={`embed-img-${i}`}
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block overflow-hidden rounded-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={url}
            alt="Embedded media"
            className="max-w-full h-auto rounded-lg bg-gray-100"
            loading="lazy"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
              const parent = img.parentElement;
              if (parent) parent.style.display = 'none';
            }}
            style={{ maxHeight: '300px', objectFit: 'contain' }}
          />
        </a>
      ))}
      {imageUrls.length > 1 && (
        <p className="text-xs text-gray-500">+{imageUrls.length - 1} more image{imageUrls.length > 2 ? 's' : ''}</p>
      )}
    </div>
  );
}

/**
 * Find a link preview by trying multiple URL variants.
 * Primal may store the URL differently than what appears in the post content.
 */
function findLinkPreview(
  url: string, 
  linkPreviews?: Map<string, PrimalLinkMetadata>
): PrimalLinkMetadata | null {
  if (!linkPreviews || linkPreviews.size === 0) return null;
  
  // Try exact match first
  const exact = linkPreviews.get(url);
  if (exact && (exact.title || exact.md_title)) return exact;
  
  // Try http/https variants
  const httpVariant = url.replace(/^https:/, 'http:');
  const httpsVariant = url.replace(/^http:/, 'https:');
  
  for (const variant of [httpVariant, httpsVariant]) {
    const match = linkPreviews.get(variant);
    if (match && (match.title || match.md_title)) return match;
  }
  
  // Try with/without trailing slash
  const withSlash = url.endsWith('/') ? url : url + '/';
  const withoutSlash = url.endsWith('/') ? url.slice(0, -1) : url;
  
  for (const variant of [withSlash, withoutSlash]) {
    const match = linkPreviews.get(variant);
    if (match && (match.title || match.md_title)) return match;
    // Also try http/https with trailing slash
    const httpV = variant.replace(/^https:/, 'http:');
    const httpsV = variant.replace(/^http:/, 'https:');
    const matchH = linkPreviews.get(httpV) || linkPreviews.get(httpsV);
    if (matchH && (matchH.title || matchH.md_title)) return matchH;
  }
  
  // Try partial URL match (hostname + path) against all entries
  try {
    const parsed = new URL(url);
    const urlPath = parsed.hostname + parsed.pathname;
    for (const [key, value] of linkPreviews) {
      try {
        const keyParsed = new URL(key);
        if (keyParsed.hostname + keyParsed.pathname === urlPath && (value.title || value.md_title)) {
          return value;
        }
      } catch { /* skip invalid URLs */ }
    }
  } catch { /* skip invalid URLs */ }
  
  return null;
}

/** 
 * Client-side link preview fetcher.
 * When Primal doesn't provide a link preview, fetch og:tags via CORS proxy.
 */
function ClientLinkPreview({ url }: { url: string }) {
  const { data: preview, isLoading } = useQuery({
    queryKey: ['link-preview', url],
    queryFn: async (): Promise<PrimalLinkMetadata | null> => {
      try {
        const proxyUrl = `https://proxy.shakespeare.diy/?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl, { 
          signal: AbortSignal.timeout(6000),
          headers: { 'Accept': 'text/html' },
        });
        if (!response.ok) return null;
        
        const html = await response.text();
        
        // Parse og:tags from HTML
        const getMetaContent = (property: string): string | undefined => {
          // Match both property="" and name="" attributes
          const regex = new RegExp(
            `<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*?)["']|<meta[^>]*content=["']([^"']*?)["'][^>]*(?:property|name)=["']${property}["']`,
            'i'
          );
          const match = html.match(regex);
          return match?.[1] || match?.[2] || undefined;
        };
        
        const title = getMetaContent('og:title') || getMetaContent('twitter:title');
        const description = getMetaContent('og:description') || getMetaContent('twitter:description') || getMetaContent('description');
        const image = getMetaContent('og:image') || getMetaContent('twitter:image');
        
        // Also try to extract <title> as fallback
        const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
        const pageTitle = titleMatch?.[1]?.trim();
        
        const finalTitle = title || pageTitle;
        if (!finalTitle) return null;
        
        // Extract favicon
        const iconMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']*?)["']/i);
        let iconUrl = iconMatch?.[1];
        if (iconUrl && !iconUrl.startsWith('http')) {
          try {
            const base = new URL(url);
            iconUrl = new URL(iconUrl, base.origin).href;
          } catch { /* ignore */ }
        }
        
        return {
          url,
          title: finalTitle,
          description: description || undefined,
          image: image || undefined,
          icon_url: iconUrl,
        };
      } catch {
        return null;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: false,
  });
  
  if (isLoading) {
    // Show minimal loading skeleton for the preview
    return (
      <div className="rounded-xl border overflow-hidden animate-pulse">
        <div className="h-[140px] bg-muted" />
        <div className="p-3 space-y-2">
          <div className="h-3 w-24 bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
        </div>
      </div>
    );
  }
  
  if (!preview) return null;
  
  return <LinkPreviewCard url={url} preview={preview} />;
}

// Link Preview Card - Primal style
function LinkPreviewCard({ url, preview }: { url: string; preview: PrimalLinkMetadata }) {
  const title = preview.md_title || preview.title;
  const description = preview.md_description || preview.description;
  const image = preview.md_image || preview.image;
  
  // Extract domain from URL
  let domain = '';
  try {
    domain = new URL(url).hostname.replace('www.', '');
  } catch {
    domain = url;
  }
  
  if (!title) return null;
  
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <Card className="overflow-hidden hover:bg-muted/50 transition-colors">
        {image && (
          <div className="aspect-video bg-muted overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            {preview.icon_url && (
              <img 
                src={preview.icon_url} 
                alt="" 
                className="h-4 w-4 rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <span>{domain}</span>
            <ExternalLink className="h-3 w-3" />
          </div>
          <h4 className="font-normal text-sm line-clamp-2">{title}</h4>
          {description && (
            <p className="text-xs text-gray-500 line-clamp-2">{description}</p>
          )}
        </div>
      </Card>
    </a>
  );
}

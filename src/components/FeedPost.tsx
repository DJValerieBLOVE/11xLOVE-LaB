/**
 * Feed Post Component
 * 
 * Displays a single post in the feed with appropriate actions based on privacy:
 * - Private posts (Tribe): No share/repost button, all other actions available
 * - Public posts: All actions available including share and repost
 * 
 * All posts have: Zap, Like, Reply, Bookmark, Mute, Report
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageCircle, 
  Repeat2, 
  Zap, 
  Heart, 
  Share2, 
  MoreHorizontal,
  VolumeX,
  Flag,
  Trash2,
  Lock,
  Users,
  UserMinus,
  Bookmark,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { NoteContent } from '@/components/NoteContent';
import { ZapDialog } from '@/components/ZapDialog';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { cn } from '@/lib/utils';

interface FeedPostProps {
  event: NostrEvent;
  /** Whether this is a private post (from Tribe) */
  isPrivate?: boolean;
  /** The tribe/group name if this is a private post */
  tribeName?: string;
  /** Whether current user is admin of the tribe */
  isGroupAdmin?: boolean;
  /** Whether current user is site admin */
  isSiteAdmin?: boolean;
  /** Callback when user mutes this author */
  onMute?: (pubkey: string) => void;
  /** Callback when user reports this post */
  onReport?: (eventId: string, reason: string) => void;
  /** Callback when admin removes user from group */
  onRemoveFromGroup?: (pubkey: string) => void;
  /** Callback when admin deletes post */
  onDelete?: (eventId: string) => void;
}

export function FeedPost({
  event,
  isPrivate = false,
  tribeName,
  isGroupAdmin = false,
  isSiteAdmin = false,
  onMute,
  onReport,
  onRemoveFromGroup,
  onDelete,
}: FeedPostProps) {
  const author = useAuthor(event.pubkey);
  const { user } = useCurrentUser();
  const metadata = author.data?.metadata;
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const displayName = metadata?.display_name || metadata?.name || genUserName(event.pubkey);
  const npub = nip19.npubEncode(event.pubkey);
  const noteId = nip19.noteEncode(event.id);
  const timeAgo = formatDistanceToNow(new Date(event.created_at * 1000), { addSuffix: true });
  
  // Check if author has lightning address for zapping
  const hasLightningAddress = !!(metadata?.lud16 || metadata?.lud06);
  const canZap = !!user && user.pubkey !== event.pubkey && hasLightningAddress;

  const handleReport = () => {
    if (onReport && reportReason.trim()) {
      onReport(event.id, reportReason);
      setShowReportDialog(false);
      setReportReason('');
    }
  };

  const handleRemoveFromGroup = () => {
    if (onRemoveFromGroup) {
      onRemoveFromGroup(event.pubkey);
      setShowRemoveDialog(false);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    // TODO: Publish kind 7 reaction event
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Add to NIP-51 bookmark list
  };

  const handleShare = () => {
    // Copy link to clipboard
    const url = `${window.location.origin}/${noteId}`;
    navigator.clipboard.writeText(url);
    // TODO: Show toast
  };

  const handleRepost = () => {
    // TODO: Publish kind 6 repost event
    console.log('Repost:', event.id);
  };

  return (
    <>
      <div className="p-6">
        <div className="flex gap-3">
          {/* Avatar */}
          <Link to={`/${npub}`}>
            <Avatar className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-[#6600ff]/30 transition-all">
              <AvatarImage src={metadata?.picture} />
              <AvatarFallback className="bg-[#6600ff]/10 text-[#6600ff]">
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Link to={`/${npub}`} className="font-semibold hover:underline">
                  {displayName}
                </Link>
                <span className="text-muted-foreground text-sm">• {timeAgo}</span>
                
                {/* Privacy Badge */}
                {isPrivate && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Lock className="h-3 w-3" />
                    {tribeName || 'Private'}
                  </Badge>
                )}
              </div>

              {/* More Options Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {/* Open in new tab */}
                  <DropdownMenuItem asChild>
                    <Link to={`/${noteId}`} target="_blank">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Note
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Mute Author */}
                  <DropdownMenuItem onClick={() => onMute?.(event.pubkey)}>
                    <VolumeX className="h-4 w-4 mr-2" />
                    Mute @{displayName.slice(0, 12)}
                  </DropdownMenuItem>
                  
                  {/* Report Post */}
                  <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                    <Flag className="h-4 w-4 mr-2" />
                    Report Post
                  </DropdownMenuItem>

                  {/* Admin Options */}
                  {(isGroupAdmin || isSiteAdmin) && (
                    <>
                      <DropdownMenuSeparator />
                      
                      {isGroupAdmin && isPrivate && (
                        <DropdownMenuItem 
                          onClick={() => setShowRemoveDialog(true)}
                          className="text-amber-600"
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          Remove from Tribe
                        </DropdownMenuItem>
                      )}
                      
                      {isSiteAdmin && (
                        <DropdownMenuItem 
                          onClick={() => onDelete?.(event.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Post
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Content */}
            <div className="mb-4">
              <NoteContent event={event} className="text-base" />
            </div>

            {/* Engagement Buttons */}
            <div className="flex items-center gap-1 flex-wrap -ml-2">
              {/* Reply */}
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-[#6600ff] hover:bg-[#6600ff]/10 gap-1.5 h-9 px-3">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">Reply</span>
              </Button>

              {/* Like/React */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLike}
                className={cn(
                  "gap-1.5 h-9 px-3",
                  isLiked 
                    ? "text-red-500 hover:text-red-600 hover:bg-red-50" 
                    : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                )}
              >
                <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                <span className="text-sm">{likeCount > 0 ? likeCount : 'Like'}</span>
              </Button>

              {/* Zap - Always available if author has lightning address */}
              {canZap ? (
                <ZapDialog target={event}>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-orange-500 hover:bg-orange-50 gap-1.5 h-9 px-3">
                    <Zap className="h-4 w-4" />
                    <span className="text-sm">Zap</span>
                  </Button>
                </ZapDialog>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled 
                  className="text-gray-300 gap-1.5 h-9 px-3 cursor-not-allowed"
                  title={!user ? "Login to zap" : user.pubkey === event.pubkey ? "Can't zap yourself" : "No lightning address"}
                >
                  <Zap className="h-4 w-4" />
                  <span className="text-sm">Zap</span>
                </Button>
              )}

              {/* Bookmark */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBookmark}
                className={cn(
                  "gap-1.5 h-9 px-3",
                  isBookmarked 
                    ? "text-[#6600ff] hover:text-[#5500dd] hover:bg-[#6600ff]/10" 
                    : "text-gray-400 hover:text-[#6600ff] hover:bg-[#6600ff]/10"
                )}
              >
                <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
              </Button>

              {/* Repost - Only for public posts */}
              {!isPrivate && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRepost}
                  className="text-gray-400 hover:text-green-500 hover:bg-green-50 gap-1.5 h-9 px-3"
                >
                  <Repeat2 className="h-4 w-4" />
                </Button>
              )}

              {/* Share - Only for public posts */}
              {!isPrivate && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleShare}
                  className="text-gray-400 hover:text-[#6600ff] hover:bg-[#6600ff]/10 gap-1.5 h-9 px-3"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Dialog */}
      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-amber-500" />
              Report Post
            </AlertDialogTitle>
            <AlertDialogDescription>
              Report this post to the site admin. Please describe why this post violates community guidelines.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <Textarea
            placeholder="Describe the issue..."
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="min-h-[100px]"
          />
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReport}
              disabled={!reportReason.trim()}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Submit Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove from Group Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserMinus className="h-5 w-5 text-amber-500" />
              Remove from Tribe?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <strong>{displayName}</strong> from the tribe. They will no longer be able to see or post messages in this group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveFromGroup}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Remove from Tribe
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * Tribe indicator badge for showing which group a post is from
 */
export function TribeBadge({ name, memberCount }: { name: string; memberCount?: number }) {
  return (
    <Badge variant="outline" className="gap-1.5 text-xs">
      <Users className="h-3 w-3" />
      {name}
      {memberCount && <span className="text-muted-foreground">• {memberCount}</span>}
    </Badge>
  );
}

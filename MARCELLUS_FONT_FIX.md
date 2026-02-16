# MARCELLUS FONT FIX — Blurry Text Site-Wide

**Priority**: HIGH  
**Created**: February 16, 2026  
**Created By**: Claude Opus 4.6

---

## THE PROBLEM

The Marcellus font (`@fontsource/marcellus`) only has **weight 400** (regular). There are no bold, semibold, or medium weight files. When Tailwind classes `font-medium` (500), `font-semibold` (600), or `font-bold` (700) are applied, the browser **fakes** a bold by stretching/smearing the glyphs. This makes text look **blurry and gray** instead of crisp black.

## THE FIX

Replace `font-medium`, `font-semibold`, and `font-bold` with `font-normal` on ALL visible user-facing text.

**EXCEPTIONS — do NOT change these**:
- `src/components/ui/*.tsx` files (shadcn primitives) — EXCEPT `card.tsx` which was already changed
- Invisible/structural elements (sr-only, aria labels)
- Text that uses a different font (monospace code, etc.)

## ALREADY FIXED (Feed page — commit 9e41e5e)

- `src/components/FeedPost.tsx` line 310: username link — `font-semibold` → `font-normal` ✅
- `src/pages/Feed.tsx`: My Tribes CardTitle — added `font-normal` ✅  
- `src/pages/Feed.tsx`: Live Now CardTitle — added `font-normal` ✅
- `src/pages/Feed.tsx`: Upcoming Events CardTitle — added `font-normal` ✅
- `src/pages/Feed.tsx`: Live event titles — `font-medium` → `font-normal` ✅
- `src/pages/Feed.tsx`: Upcoming event titles — `font-medium` → `font-normal` ✅

## STILL NEEDS FIXING

### Pages (`src/pages/`)

**BigDreams.tsx:**
- Line 121: `font-medium` on "Less" toggle
- Line 128: `font-medium` on "More" toggle
- Line 177: `font-bold` on "Daily LOVE Practice"
- Line 193: `font-semibold` on "My 11 Big Dreams"
- Line 234: `font-medium` on event titles
- Line 253: `font-medium` on course titles
- Line 277: `font-medium` on buddy names

**Events.tsx:**
- Line 108: `font-semibold` on badge text
- Line 117: `font-bold` on event title

**Experiments.tsx:**
- Line 67: `font-bold` on page heading
- Line 78: `font-semibold` on "Login Required"
- Line 321: `font-semibold` on experiment card titles

**ExperimentBuilder.tsx:**
- Line 156: `font-bold` on "Become a Creator"
- Line 337: `font-bold` on experiment title
- Line 475: `font-bold` on card overlay text
- Line 498: `font-semibold` on "No modules yet"
- Line 537: `font-semibold` on "Preview Coming Soon"
- Line 591: `font-semibold` on input text
- Line 617: `font-medium` on "Lessons" label

**Feed.tsx (remaining):**
- Line 196: `font-bold` on "Your Feed" (logged out state)
- Line 228: `font-bold` on "Your Feed" (logged in state)
- Line 401: `font-medium` on tribe name in sidebar list

**Index.tsx:**
- Line 14: `font-bold` on main heading

**JournalView.tsx:**
- Line 81: `font-bold` on journal heading
- Line 127: `font-semibold` on "No Journal Entries Yet"
- Line 144: `font-semibold` on journal entry titles

**LoveBoard.tsx:**
- Line 103: `font-bold` on "Love Board" heading
- Line 188: `font-medium` on board text

**Messages.tsx:**
- Line 15: `font-semibold` on "Messages" heading

**NotFound.tsx:**
- Line 23: `font-bold` on "404"

**Profile.tsx:**
- Line 42: `font-semibold` on "Login Required"
- Line 126: `font-bold` on user's display name
- Line 198: `font-semibold` on following count
- Line 208: `font-semibold` on followers count
- Line 218: `font-semibold` on zaps received count

**Settings.tsx:**
- Line 201: `font-medium` on "Light"
- Line 211: `font-medium` on "Dark"

**Vault.tsx:**
- Line 145: `font-bold` on "The Vault" heading
- Line 225: `font-medium` on "Less" toggle
- Line 232: `font-medium` on "More" toggle
- Line 281: `font-bold` on "Daily LOVE Practice"
- Line 344: `font-medium` on dimension titles
- Line 382: `font-medium` on section header
- Line 452: `font-bold` on "Ready to Chat with Your Mentor?"
- Line 517: `font-medium` on stats
- Line 528: `font-medium` on stats
- Line 586: `font-medium` on "Connected Relays"
- Line 592: `font-medium` on relay name

### Components (`src/components/`)

**FeedPost.tsx (remaining):**
- Line 393: `font-medium` on zapper sats count

**NoteContent.tsx:**
- Line 485: `font-medium` on Nostr mentions
- Line 581: `font-medium` on embedded note author
- Line 644: `font-medium` on link preview title

**Layout.tsx:**
- Line 82: `font-medium` on navigation links
- Line 120: `font-medium` on sats sent
- Line 129: `font-medium` on sats received
- Line 152: `font-medium` on user name in dropdown

**FollowListModal.tsx:**
- Line 132: `font-medium` on follower names

**CommentsSection.tsx:**
- Line 83: `font-medium` on empty state message

**Comment.tsx:**
- Line 60: `font-medium` on commenter name

**DMChatArea.tsx:**
- Line 182: `font-semibold` on chat partner name

**DMConversationList.tsx:**
- Line 78: `font-medium` on conversation partner name
- Line 168: `font-semibold` on "Messages" heading
- Line 211: `font-medium` on active tab
- Line 222: `font-medium` on active tab

**DMStatusInfo.tsx:**
- Lines 91, 109, 137, 160, 164, 168, 172, 185: various `font-medium`

**EQVisualizer.tsx:**
- Line 81: `font-medium` on dimension labels

**ErrorBoundary.tsx:**
- Line 60: `font-bold` on error heading
- Line 70: `font-medium` on details toggle

**JournalPromptModal.tsx:**
- Line 126: `font-medium` on "Login Required"
- Line 137: `font-semibold` on section heading
- Line 152: `font-medium` on entry title
- Line 175: `font-semibold` on "Today's Reflection"

**LessonViewer.tsx:**
- Line 179: `font-bold` on experiment title
- Line 182: `font-medium` on progress percentage
- Line 199: `font-semibold` on section heading
- Line 215: `font-medium` on current lesson
- Line 249: `font-bold` on lesson title
- Line 322: `font-medium` on next lesson text
- Line 399: `font-bold` on "Experiment Complete!"
- Line 418: `font-semibold` on section heading
- Line 460: `font-medium` on file name

**QuizModal.tsx:**
- Line 153: `font-semibold` on question text
- Line 236: `font-bold` on score number
- Line 247: `font-bold` on "Lesson Complete!"

**ShareConfirmDialog.tsx:**
- Line 86: `font-medium` on dialog text
- Line 95: `font-medium` on "What this means"

**TopZappers.tsx:**
- Line 51: `font-medium` on zapper name
- Line 52: `font-bold` on sats amount
- Line 90: `font-semibold` on total sats
- Line 123: `font-medium` on mini zapper sats
- Line 170: `font-medium` on zapper name

**WalletModal.tsx:**
- Lines 93, 100, 116, 138, 159: various `font-medium`

**ZapDialog.tsx:**
- Line 92: `font-bold` on sats amount

**AccountSwitcher.tsx:**
- Line 38: `font-medium` on current user name
- Line 44: `font-medium` on "Switch Account"
- Line 56: `font-medium` on user name in list

**LoginDialog.tsx:**
- Line 288: `font-semibold` on dialog title

**SignupDialog.tsx:**
- Line 169: `font-semibold` on dialog title
- Line 228: `font-semibold` on warning text
- Line 248: `font-medium` on step text
- Line 258: `font-medium` on label
- Line 271: `font-medium` on label
- Line 286: `font-medium` on label

### UI Components (`src/components/ui/`) — LEAVE ALONE

The shadcn/ui primitives use `font-medium`/`font-semibold` as part of their design system. These should generally be left alone UNLESS they directly cause visible blurry text. The `card.tsx` CardTitle `font-semibold` was already addressed by adding `font-normal` overrides at the usage sites.

---

## HOW TO VERIFY

After making changes, check these pages in the preview:
1. Feed page — already fixed, use as reference for "correct" look
2. Big Dreams page
3. Experiments page
4. Vault page
5. Profile page
6. Events page
7. Messages page

All text should look crisp and black like the post content text in the Feed.

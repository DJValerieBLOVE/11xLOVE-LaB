# CRITICAL BUGS - FOR OPUS 4.6

**Date**: February 16, 2026  
**Status**: Two critical unfixable bugs requiring expert debugging

---

## 🔴 BUG #1: TEXT COLORS RENDER GRAY (UNFIXABLE)

### Symptom
ALL text (usernames, headings, sidebar items) renders as gray/muted instead of black, despite:
- CSS variables set to pure black `0 0% 0%` (#000000)
- Removing all color classes from components
- Multiple attempts with inline styles, !important, arbitrary values

### What Works vs What Doesn't

| Element | Color | Status |
|---------|-------|--------|
| Post content text | Black | ✅ Works |
| Usernames | Gray | ❌ Broken |
| "Your Feed" heading | Gray | ❌ Broken |
| "My Tribes" heading | Gray | ❌ Broken |
| Sidebar items | Gray | ❌ Broken |

### Root Cause (Suspected)

Shakespeare's build system generates HTML with:
```html
<style type="text/tailwindcss">
  :root { --foreground: 0 0% 0%; }
  /* ... */
</style>
```

The `type="text/tailwindcss"` attribute triggers Tailwind's Play CDN, which:
1. Downloads from `cdn.tailwindcss.com`
2. Reprocesses the CSS at runtime
3. Overrides custom color values with Tailwind defaults
4. Results in gray/muted text instead of black

### Evidence

- **Console Warning**: "cdn.tailwindcss.com should not be used in production"
- **Source CSS**: Variables correctly set to `0 0% 0%` (black)
- **Computed CSS**: Browser DevTools show gray values being applied
- **Post content works**: Has NO color classes, uses browser default (black)
- **Headings fail**: Inherit from `--foreground` which gets overridden to gray

### Failed Solutions (11+ Attempts)

1. ❌ Set CSS variables to black - CDN overrides
2. ❌ Inline styles - CDN strips/ignores
3. ❌ `!important` modifier - CDN bypasses
4. ❌ Remove all color classes - still gray
5. ❌ Delete muted system - still gray
6. ❌ Arbitrary color values `text-[#000]` - still gray
7. ❌ Hard refresh browser - still gray
8. ❌ Clear ALL site data - still gray
9. ❌ Deploy to production - STILL GRAY
10. ❌ Dark red test color - still renders gray
11. ❌ **NEW (Sonnet 4.5 final attempt)**: Moved CSS variables OUTSIDE @layer base (unlayered styles should override layered), restored --muted/--muted-foreground variables, added muted to tailwind.config.ts, changed nav to text-black - **STILL FUZZY/GRAY** (commit b9a9f86)

### What's Needed

**Option A**: Modify Shakespeare build system to:
- Compile Tailwind to regular CSS (not `type="text/tailwindcss"`)
- Remove Play CDN dependency
- Output standard `<style>` tags with pre-compiled CSS

**Option B**: Find workaround to:
- Override Tailwind CDN color processing
- Force black color that CDN respects
- Bypass CDN entirely for text colors

**Option C**: Investigate if there's a different root cause:
- Maybe the Tailwind CDN is injecting global styles with high specificity
- Maybe there's a preflight/reset that sets text to gray
- Maybe the font (Marcellus) has anti-aliasing issues making black appear fuzzy
- Check if computed styles show actual black but RENDERING looks gray

### Files to Check

- `/dist/index.html` - Contains `<style type="text/tailwindcss">`
- `/src/index.css` - CSS variables (correctly set to black)
- `/src/components/FeedPost.tsx` - Username rendering
- `/src/pages/Feed.tsx` - Headings and sidebar
- `/tailwind.config.ts` - Tailwind configuration
- `vite.config.ts` - Build configuration
- `postcss.config.js` - PostCSS configuration

---

## 🔴 BUG #2: FEED SHOWS 25+ MINUTE OLD DATA

### Symptom
Feed displays posts from 25+ minutes ago, even after:
- Clicking Refresh button
- Hard refreshing browser (Cmd+Shift+R)
- Clearing ALL browser site data
- Logging out and back in

### Expected Behavior
Feed should show latest posts from the last few minutes

### Current Behavior
Feed stuck showing stale posts from 25+ minutes ago

### Possible Causes

**1. Primal Cache Server**
- `wss://cache.primal.net/v1` might be heavily caching responses
- Not respecting fresh data requests

**2. TanStack Query Caching**
```typescript
// Check settings in useFeedPosts.ts
staleTime: ??? 
cacheTime: ???
refetchOnMount: ???
```

**3. Service Worker Caching**
- Console shows: "ServiceWorker already registered"
- Might be caching WebSocket responses or API data

**4. Browser HTTP Cache**
- Even though WebSocket, might have aggressive caching

### Investigation Steps

1. **Check TanStack Query settings**:
   ```typescript
   // /src/hooks/useFeedPosts.ts
   return useQuery({
     queryKey: ['feed', ...],
     staleTime: ?, // Should be 0 or very low
     cacheTime: ?, // Should be minimal
     refetchOnMount: 'always', // Force fresh data
   });
   ```

2. **Check Primal WebSocket**:
   - Are we sending `since` timestamp?
   - Is `limit` too small?
   - Is Primal cache returning stale data?

3. **Service Worker**:
   - Unregister service worker
   - Test if that fixes stale data

4. **Add timestamp debugging**:
   ```typescript
   console.log('Fetching feed at:', new Date().toISOString());
   console.log('Latest post timestamp:', posts[0]?.created_at);
   ```

### Files to Check

- `/src/hooks/useFeedPosts.ts` - TanStack Query configuration
- `/src/lib/primalCache.ts` - WebSocket feed request
- Browser DevTools → Application → Service Workers
- Browser DevTools → Network → WS (WebSocket tab)

---

## Summary for Opus 4.6

**Two critical bugs that Claude Sonnet 4.5 could not fix after extensive debugging:**

1. **Text colors render gray** - Tailwind Play CDN issue, unfixable without build system changes
2. **Feed shows old data** - Aggressive caching somewhere in the stack

Both bugs are production-critical and require expert debugging to resolve.

**Good news:**
- ✅ Tribe badges changed to gray (working)
- ✅ Notification badges added to tabs (working)
- ✅ Code is well-documented and organized
- ✅ All attempted fixes are tracked in git history

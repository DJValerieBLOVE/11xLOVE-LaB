# 11x LOVE LaB Testing Checklist

**Last Updated:** February 15, 2026  
**Live URL:** https://11xLOVE.shakespeare.wtf

---

## 🔐 LOGIN TESTING

**NOTE:** Browser extension login (Alby, nos2x) does NOT work in Shakespeare preview iframe. Must test on the deployed site.

### Pre-requisites:
- [ ] Have a Nostr browser extension installed (Alby, nos2x, etc.)
- [ ] Visit https://11xLOVE.shakespeare.wtf (NOT the preview)

### Tests:
- [ ] Click "Log in" button
- [ ] Extension popup appears
- [ ] Approve connection
- [ ] User avatar appears in header
- [ ] Profile dropdown works
- [ ] Logout works
- [ ] Re-login works

---

## 📱 NAVIGATION TESTING

### Desktop (sidebar):
- [ ] Logo links to Big Dreams
- [ ] All 7 nav items clickable
- [ ] Active state highlights correctly
- [ ] EQ Visualizer displays in header
- [ ] Sats widget shows (if logged in)

### Mobile (bottom nav):
- [ ] 5 nav items visible
- [ ] Touch targets adequate
- [ ] Active state highlights

---

## 📰 FEED PAGE

### Logged Out:
- [ ] Shows login required message
- [ ] Login button works

### Logged In:
- [ ] 4 tabs visible: All, Tribes, Buddies, Public
- [ ] Post composer shows your avatar
- [ ] Can type in composer
- [ ] Post button enables when text entered
- [ ] Tab switching works
- [ ] Mock posts display with:
  - [ ] Avatar (or fallback)
  - [ ] Username
  - [ ] Time ago
  - [ ] Content
  - [ ] Privacy badge (for private posts)
  - [ ] Action buttons (Reply, React, Zap)
- [ ] Private posts have NO share button
- [ ] Public posts HAVE share button
- [ ] Mute option in dropdown
- [ ] Report option in dropdown

### Sidebar:
- [ ] My Tribes shows
- [ ] Live Now shows
- [ ] Upcoming Events shows

---

## 🧪 EXPERIMENTS PAGE

### Logged Out:
- [ ] Shows login required message

### Logged In:
- [ ] 6 tabs visible
- [ ] Search bar works
- [ ] Dimension filter dropdown works
- [ ] Experiment cards display with:
  - [ ] 16:9 image/gradient
  - [ ] Title
  - [ ] Description
  - [ ] Level badge
  - [ ] Dimension badge
  - [ ] Duration
  - [ ] Enrolled count
  - [ ] Rating
  - [ ] View button
- [ ] "Create Experiment" button (for creators)

---

## 🎨 EXPERIMENT BUILDER

### Access:
- [ ] Only accessible to creators/admins
- [ ] Free users see upgrade prompt

### Form:
- [ ] Basics tab:
  - [ ] Title field
  - [ ] Description field
  - [ ] Dimension dropdown (required)
  - [ ] Level dropdown
  - [ ] Cover color selector
- [ ] Modules & Lessons tab:
  - [ ] Add module button
  - [ ] Add lesson button
  - [ ] Reorder works
  - [ ] Delete works
- [ ] Lesson editor:
  - [ ] Video URL field
  - [ ] Content textarea
  - [ ] Journal prompt field

---

## 💜 LOVE BOARD

### Logged Out:
- [ ] Shows login required

### Logged In (Free):
- [ ] Can browse listings
- [ ] Create button disabled
- [ ] Upgrade notice shows

### Logged In (Paid):
- [ ] Create button enabled
- [ ] Create dialog opens
- [ ] Listings display with 16:9 images

---

## 🔐 VAULT

### Logged Out:
- [ ] Shows login required

### Logged In:
- [ ] 5 tabs visible
- [ ] Daily LOVE tab:
  - [ ] Streak calendar displays
  - [ ] Start Practice button
- [ ] Journal tab:
  - [ ] Shows journals (or empty state)
  - [ ] Export button
- [ ] Magic Mentor tab:
  - [ ] "What mentor knows" section
  - [ ] Custom instructions textarea
  - [ ] Save button
  - [ ] Start Conversation button
- [ ] My Data tab:
  - [ ] "You Own Your Data" card
  - [ ] Export buttons
  - [ ] BYOR relay input
  - [ ] Connected relays list
- [ ] Library tab:
  - [ ] Bookmarks card
  - [ ] Assessments card
  - [ ] Music card
  - [ ] Reading List card

---

## 👥 TRIBE PAGE

- [ ] Shows tabs: Chat, Celebrations, Prayer, Find Buddy, Groups
- [ ] Placeholder content displays

---

## 🎯 BIG DREAMS PAGE

- [ ] EQ Visualizer shows
- [ ] 11 dimension cards display
- [ ] Cards have correct colors

---

## 📅 EVENTS PAGE

- [ ] Calendar displays
- [ ] Event cards show

---

## ⚙️ SETTINGS PAGE

- [ ] Profile section
- [ ] Theme toggle (if present)
- [ ] Wallet settings (if present)

---

## 🐛 KNOWN ISSUES TO CHECK

1. [ ] Feed posts showing mock data (expected - no real Nostr query yet)
2. [ ] Experiment progress not persisting to Nostr (uses localStorage)
3. [ ] Tribes not fully functional (NIP-29 not implemented)
4. [ ] Magic Mentor chat not functional (AI not integrated)

---

## 📝 BUGS FOUND

| Bug | Page | Description | Priority |
|-----|------|-------------|----------|
| | | | |
| | | | |
| | | | |

---

## ✅ TESTING COMPLETE

- [ ] All critical paths work
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Ready for next phase

**Tested by:** _______________  
**Date:** _______________

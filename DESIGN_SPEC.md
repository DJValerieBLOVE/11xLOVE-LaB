# 11x LOVE LaB — Design Specification

> **Light mode default. Pink accent. Clean, modern, mobile-first PWA. Celebration animations on completions.**

---

## 🎨 Brand Colors

### Primary Brand Color
- **Purple** — `#6600ff` — Body Dimension, primary brand accent

### The 11 Dimensions Color Palette

#### GOD (Center/Heart)
- **GOD/Spirituality** — `#eb00a8` Hot Pink

#### PURPOSE (Top of Pyramid)
- **Purpose/IKIGAI** — `#a2f005` Lime Green

#### HEALTH (Body, Mind, Soul)
- **Body** — `#6600ff` Purple (PRIMARY BRAND COLOR)
- **Mind** — `#9900ff` Purple
- **Soul** — `#cc00ff` Magenta

#### PEOPLE (Romance, Family, Community)
- **Romance** — `#e60023` Red
- **Family** — `#ff6600` Orange
- **Community** — `#ffdf00` Yellow

#### WEALTH (Money, Time, Environment)
- **Money** — `#00d81c` Matrix Green
- **Time** — `#00ccff` Cyan
- **Environment** — `#0033ff` Blue

### UI System Colors

```javascript
colors: {
  // Light mode (default)
  background: '#ffffff',       // Light mode default
  surface: '#f9f9f9',          // Card backgrounds
  surfaceLight: '#ffffff',     // Lighter surfaces
  
  // Brand accents
  primary: '#6600ff',          // PURPLE primary brand
  primaryLight: '#9900ff',     // Light purple hover
  secondary: '#eb00a8',        // HOT PINK secondary
  secondaryLight: '#ff3dbf',   // Light pink hover
  
  // Functional colors
  accent: '#f39c12',           // Gold - streaks/achievements
  success: '#2ecc71',          // Green - completions
  warning: '#e94560',          // Red/pink alerts
  
  // Text & neutrals
  text: '#1a1a1a',             // Primary text
  textMuted: '#666666',        // Secondary text
  border: '#e5e5e5',           // Subtle borders
}
```

---

## 🌈 Dimension Color Usage

### When to Use Dimension Colors

1. **EQ Visualizer Bars** — Each bar uses its Dimension's color
2. **Experiment Cards** — Header gradient uses the Dimension color
3. **Big Dream Sections** — Each Dimension section has its color accent
4. **Progress Indicators** — Dimension-specific progress uses that color
5. **Tags/Badges** — Dimension tags use their specific color

### Color Application Examples

```jsx
// Experiment card for BODY dimension
<div className="h-32 bg-gradient-to-br from-[#6600ff] to-[#9900ff]">
  <h3 className="text-white">Body Experiment</h3>
</div>

// EQ Visualizer bar for ROMANCE
<div 
  className="w-full rounded-t-lg" 
  style={{ 
    height: `${level}%`, 
    backgroundColor: '#e60023' 
  }}
/>

// Dimension badge for MONEY
<Badge style={{ backgroundColor: '#00d81c', color: 'white' }}>
  Money
</Badge>
```

---

## 📐 Design Principles

### Core Aesthetics
- **Light mode default** (per spec) — no dark mode toggle needed initially
- **Pink/Purple accent** (`#6600ff` primary, `#eb00a8` secondary)
- **Clean, modern, mobile-first**
- **Celebration animations** on completions (sparkles, confetti)
- **Streak counter** with fire emoji 🔥
- **Card-based layouts** with rounded corners (12px)
- **Generous whitespace** for breathing room
- **Satisfying micro-interactions** (hover states, transitions)

### Apple-Level Refinement
- Meticulous attention to detail
- Designs evoke emotions (wonder, inspiration, energy)
- Fully functional interactive components with intuitive feedback
- Dynamic elements (gradients, glows, subtle animations)
- Never generic or templated — unique, brand-specific visuals

### NO Generic Design
- ❌ No basic "text-on-left, image-on-right" layouts without custom polish
- ❌ No simplistic headers — must be immersive and brand-reflective
- ❌ No designs that look like free templates
- ✅ Every element must feel intentional and tailored

---

## 🎭 Typography

### Font Family
- **Primary:** Inter (already installed)
- **Headings:** Inter Bold
- **Body:** Inter Regular
- **Monospace (if needed):** System monospace

### Font Sizes
- **Base:** 16px mobile, scale up for desktop
- **Headlines:** 40px+ for impact
- **Body text:** 18px+ for readability
- **Small text:** 14px minimum

### Hierarchy
- Clear visual hierarchy with size, weight, and color
- Headlines use bold weight + larger size
- Body text uses regular weight
- Muted text uses `textMuted` color (`#666666`)

---

## 🎬 Key Animations

### Completion Celebrations
- **Lesson complete:** ✨ Sparkle burst animation
- **Streak milestone (7/30/90):** 🎊 Confetti explosion
- **Check-in:** Pop/scale animation
- **Zap sent:** ⚡ Lightning flash effect

### Micro-Interactions
- **Card hover:** Subtle scale (1.02x) + shadow increase
- **Button hover:** Color shift + subtle glow
- **Input focus:** Border glow in brand color
- **Scroll reveals:** Fade-in from bottom

### Transitions
- **Page transitions:** Smooth fade (150ms)
- **Modal open/close:** Scale + fade (200ms)
- **Tab switches:** Slide + fade (150ms)
- **Collapsible sections:** Height transition (250ms)

---

## 🧩 Component Patterns

### Cards
```jsx
<Card className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
  {/* Colored header for Dimension */}
  <div className="h-32 bg-gradient-to-br from-[#6600ff] to-[#9900ff]">
    <h3 className="text-white text-2xl font-bold">Title</h3>
  </div>
  
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Supporting text</CardDescription>
  </CardHeader>
  
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Badges
```jsx
{/* Dimension badge */}
<Badge 
  variant="secondary" 
  style={{ backgroundColor: '#6600ff', color: 'white' }}
>
  Body
</Badge>

{/* V4V badge */}
<Badge 
  variant="secondary" 
  className="bg-orange-100 text-orange-700"
>
  Value for Value
</Badge>
```

### Buttons
```jsx
{/* Primary action */}
<Button size="lg" className="bg-[#6600ff] hover:bg-[#9900ff]">
  Start Experiment
</Button>

{/* Secondary action */}
<Button variant="outline" className="border-[#6600ff] text-[#6600ff]">
  View Details
</Button>

{/* Zap button */}
<Button variant="ghost" className="text-[#ff9500]">
  <Zap className="h-4 w-4 mr-1" />
  Zap
</Button>
```

### Streak Counter
```jsx
<div className="flex items-center gap-2">
  <span className="text-2xl">🔥</span>
  <div>
    <p className="text-lg font-bold">{currentStreak} days</p>
    <p className="text-sm text-muted-foreground">Current streak</p>
  </div>
</div>
```

---

## 📱 Responsive Design

### Breakpoints (Tailwind defaults)
- **Mobile:** < 640px (default)
- **Tablet:** 640px - 1024px (`md:`)
- **Desktop:** > 1024px (`lg:`)

### Mobile-First Approach
- Design for mobile FIRST
- Enhance for tablet and desktop
- Touch-friendly targets (44px minimum)
- Bottom navigation on mobile
- Side navigation on desktop

### Layout Patterns
```jsx
{/* Mobile: Stack, Desktop: Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>

{/* Mobile: Full width, Desktop: Constrained */}
<div className="container max-w-7xl mx-auto px-4">
  {/* Content */}
</div>
```

---

## 🎯 Loading States

### Skeleton Loading (Preferred)
Use skeleton loading for structured content (feeds, profiles, forms):

```jsx
<Card>
  <CardHeader>
    <div className="flex items-center space-x-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  </CardContent>
</Card>
```

### Spinners
Only use for buttons or very short operations:

```jsx
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading...
</Button>
```

---

## 🚫 Empty States

When no content is found:

```jsx
<Card className="border-dashed">
  <CardContent className="py-12 px-8 text-center">
    <div className="max-w-sm mx-auto space-y-6">
      <p className="text-muted-foreground">
        No results found. Try checking your relay connections or wait a moment for content to load.
      </p>
    </div>
  </CardContent>
</Card>
```

---

## ✨ Celebration Moments

### VIP Reminders
```jsx
<div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-[#6600ff] p-4 rounded">
  <p className="font-semibold text-[#6600ff]">Victory In Progress!</p>
  <p className="text-sm text-muted-foreground">
    No shame. Just pick up where you left off. What's your vibe today?
  </p>
</div>
```

### Streak Milestones
```jsx
{/* 7-day streak */}
<div className="text-center py-8 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
  <span className="text-6xl mb-4 block">🎊</span>
  <h3 className="text-2xl font-bold mb-2">7 Days Strong!</h3>
  <p className="text-muted-foreground">
    You're not just building habits — you're collecting DATA on the most important subject: YOU.
  </p>
</div>
```

### Discovery Made
```jsx
<div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200">
  <div className="flex items-center gap-3 mb-3">
    <span className="text-3xl">✨</span>
    <h4 className="text-xl font-bold text-green-700">Discovery Made!</h4>
  </div>
  <p className="text-green-600">
    What surprised you? What confirmed what you knew? Add your findings to your Lab Notes.
  </p>
</div>
```

---

## 🎨 Sample UI Copy

### Welcome Message
```
Welcome to the LOVE Lab — where life is a game, everything's an experiment, 
and YOU are the most fascinating subject. Ready to raise your vibes and rock your dreams?
```

### Daily 5 V's Prompt
```
Good morning, VIP! Let's set your vibe. What are your 5 V's today?
```

### Setting Dreams
```
What's your Big Dream for [DIMENSION] this year? 
Dream big, mama. We're here to help you rock it.
```

### Starting an Experiment
```
Ready to play? This week's Experiment: [Title]. 
Your hypothesis: What do you THINK will happen? Let's find out...
```

### After a Discovery
```
Discovery made! What surprised you? What confirmed what you knew? 
Add your findings to your Lab Notes.
```

---

## 🌊 Vibe & Energy

### Overall Feeling
- **Warm, inviting, empowering**
- Playful without being childish
- Sacred without being stuffy
- Sophisticated without being intimidating
- Like walking into your favorite cozy coffee shop where everyone knows your name

### Voice & Tone
- **Encouraging, never judgmental**
- "VIP" energy — you're always winning
- Direct but loving ("Who the F Are You?" is empowering, not harsh)
- Celebrates mess and imperfection
- God-centered but not preachy

---

## 🚀 Technical Requirements

### Performance
- Optimize images (WebP format, compressed 70-90%)
- Lazy load images below the fold
- Code splitting for routes
- Minimize bundle size

### Accessibility (WCAG 2.1 AA)
- Minimum 4.5:1 contrast ratio for text
- Keyboard navigation support
- ARIA labels for interactive elements
- Focus states visible (glowing outline in accent color)
- Screen reader support

### Responsive Grid
- 8px grid system for spacing, padding, alignment
- Consistent use of `gap-4`, `gap-6`, `gap-8`
- Rounded corners: `rounded-lg` (12px) for cards
- Shadows: `shadow-md` for elevation

---

## 🎯 Design Checklist

Before finalizing any design, ask:
- [ ] Would this make Apple or Stripe designers pause and take notice?
- [ ] Does it evoke an emotion (wonder, inspiration, energy)?
- [ ] Is every element purposeful?
- [ ] Does it feel unique to 11x LOVE LaB brand?
- [ ] Are the Dimension colors used correctly?
- [ ] Are animations smooth and lightweight?
- [ ] Is it mobile-first responsive?
- [ ] Does it meet WCAG AA standards?
- [ ] Is the VIP energy present?

---

**Peace, LOVE, & Warm Aloha** 💜

*"Raise your vibes, rock your dreams."*

# 11x LOVE LaB — Button & Badge System

> **Consistent design across every page, every button, every interaction.**

---

## 🎨 Button Design Rules

### Core Principles

1. **All buttons are pill-shaped** (`rounded-full`)
2. **Never manually set heights** - Always use size variants
3. **Never use `w-full` outside containers** - Let buttons size naturally unless in a card/flex container
4. **Consistent padding** - Defined in variants, don't override
5. **Three sizes only** - default, sm, lg (+ icon for icon-only)

---

## 📏 Button Sizes

### **Default** (Most Common)
```tsx
<Button>Click Me</Button>
// or explicitly:
<Button size="default">Click Me</Button>
```
- **Height:** 40px (`h-10`)
- **Padding:** Left/Right 24px (`px-6`)
- **Text:** Small (`text-sm`)
- **Use for:** Primary actions, forms, cards, most buttons

### **Small** (Compact Areas)
```tsx
<Button size="sm">Small Action</Button>
```
- **Height:** 32px (`h-8`)
- **Padding:** Left/Right 16px (`px-4`)
- **Text:** Small (`text-sm`)
- **Use for:** Secondary actions, inline buttons, sidebars, compact UIs

### **Large** (Hero CTAs)
```tsx
<Button size="lg">Start Your Journey</Button>
```
- **Height:** 44px (`h-11`)
- **Padding:** Left/Right 32px (`px-8`)
- **Text:** Base (`text-base`)
- **Use for:** Primary CTAs, "Start Practice", "View Experiment", hero sections

### **Icon Only**
```tsx
<Button size="icon" variant="ghost">
  <Heart className="h-4 w-4" />
</Button>
```
- **Size:** 36px × 36px (`h-9 w-9`)
- **Padding:** None (`p-0`)
- **Use for:** Icon-only actions (mail, notifications, close buttons)

---

## 🎨 Button Variants

### **Default** (Primary Actions)
```tsx
<Button>Primary Action</Button>
```
- **Color:** Purple `#6600ff`
- **Hover:** Lighter purple `#8c4dff`
- **Text:** White
- **Shadow:** Subtle shadow that increases on hover

### **Outline** (Secondary Actions)
```tsx
<Button variant="outline">Secondary</Button>
```
- **Color:** Transparent background
- **Border:** Input border color
- **Hover:** Accent background
- **Text:** Foreground color

### **Ghost** (Tertiary Actions)
```tsx
<Button variant="ghost">Tertiary</Button>
```
- **Color:** Transparent
- **Hover:** Accent background
- **Use for:** Icon buttons, subtle actions

### **Link** (Text Links)
```tsx
<Button variant="link">View All</Button>
```
- **Color:** Purple `#6600ff`
- **Underline:** On hover
- **No background, no border**
- **Not rounded** (exception to pill rule)

---

## 🏷️ Badge System

Badges use the same `rounded-full` pill shape but are smaller:

### **Default Badge**
```tsx
<Badge>Category</Badge>
```
- **Height:** Auto (based on content)
- **Padding:** `px-2.5 py-0.5`
- **Text:** Extra small (`text-xs`)
- **Font:** Semibold

### **Dimension Badges** (Custom Colors)
```tsx
<Badge style={{ backgroundColor: '#6600ff', color: 'white' }}>
  Body
</Badge>
```
- Use official dimension colors
- White text for contrast
- Pill-shaped (`rounded-full`)

### **Sats Rewards**
```tsx
<Badge variant="secondary" className="bg-orange-100 text-orange-700">
  Earn 100 sats ⚡
</Badge>
```
- Orange theme for sats
- Pill-shaped

---

## ✅ Usage Guidelines

### ✅ DO:
```tsx
// Correct - uses size variants
<Button size="lg">Start Practice</Button>
<Button size="sm">Cancel</Button>
<Button>Save</Button>

// Correct - w-full inside container
<Card>
  <CardContent>
    <Button className="w-full" size="lg">
      View Experiment
    </Button>
  </CardContent>
</Card>
```

### ❌ DON'T:
```tsx
// Wrong - manual height override
<Button className="h-12 px-9">Bad</Button>

// Wrong - manual padding override
<Button className="px-10 py-4">Bad</Button>

// Wrong - w-full outside container
<div>
  <Button className="w-full">This will stretch weirdly</Button>
</div>

// Wrong - overriding rounded
<Button className="rounded-lg">Should be rounded-full</Button>
```

---

## 📋 Button Checklist

Before committing any page with buttons, verify:

- [ ] All buttons use `size="default"`, `size="sm"`, or `size="lg"`
- [ ] No manual `h-*` classes on buttons
- [ ] No manual `px-*` or `py-*` classes on buttons
- [ ] All buttons are `rounded-full` (pill-shaped)
- [ ] `w-full` only used inside card/container contexts
- [ ] Icons inside buttons use `h-4 w-4`
- [ ] Text doesn't get cut off (proper padding)

---

## 🎯 Quick Reference

| Context | Size | Example |
|---------|------|---------|
| Primary CTA | `lg` | "Start Your Journey", "View Experiment" |
| Form submit | `default` | "Save Vision", "Post Comment" |
| Cancel/secondary | `sm` | "Cancel", "Skip" |
| Card actions | `default` or `lg` | "Learn More", "View Details" |
| Inline actions | `sm` | "+ Find a Buddy", "Reply" |
| Icon only | `icon` | Mail icon, close button |

---

**Consistency = Professional Experience** ✨

*Last Updated: February 13, 2026*

import { cva } from "class-variance-authority"

/**
 * 11x LOVE LaB Button System
 * 
 * DESIGN RULES:
 * - All buttons are pill-shaped (rounded-full)
 * - Consistent heights and padding across the app
 * - Never use w-full unless inside a flex container
 * - Use size="default" for primary actions
 * - Use size="sm" for secondary/compact actions
 * - Use size="lg" for hero CTAs only
 * 
 * SIZING GUIDE:
 * - default: h-10 (40px) - Most buttons sitewide
 * - sm: h-8 (32px) - Compact areas, inline actions
 * - lg: h-11 (44px) - Primary CTAs, "Start Practice", "View Experiment"
 * - icon: 36px × 36px - Icon-only buttons
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#6600ff] text-white hover:bg-[#8c4dff] shadow-sm hover:shadow-md",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-[#6600ff] underline-offset-4 hover:underline rounded-none px-0",
      },
      size: {
        default: "h-10 px-6 text-sm",
        sm: "h-8 px-4 text-sm",
        lg: "h-11 px-8 text-base",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
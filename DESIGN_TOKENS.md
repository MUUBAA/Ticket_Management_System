# Color System & Design Tokens

## Primary Colors
- **Indigo-600**: `#4F46E5` - Primary brand color
- **Cyan-500**: `#06B6D4` - Secondary accent color

## Status Badge Colors

### Ticket Status
| Status | Background | Text | Hex |
|--------|-----------|------|-----|
| Open | `bg-blue-100` | `text-blue-700` | #DBEAFE / #1E40AF |
| In Progress | `bg-yellow-100` | `text-yellow-700` | #FEF3C7 / #B45309 |
| Resolved | `bg-green-100` | `text-green-700` | #DCFCE7 / #15803D |
| Closed | `bg-gray-100` | `text-gray-700` | #F3F4F6 / #374151 |
| Assigned | `bg-purple-100` | `text-purple-700` | #F3E8FF / #6B21A8 |

### Priority Levels
| Priority | Background | Text | Hex |
|----------|-----------|------|-----|
| Low | `bg-green-100` | `text-green-700` | #DCFCE7 / #15803D |
| Medium | `bg-yellow-100` | `text-yellow-700` | #FEF3C7 / #B45309 |
| High | `bg-orange-100` | `text-orange-700` | #FFEDD5 / #C2410C |
| Urgent | `bg-red-100` | `text-red-700` | #FEE2E2 / #B91C1C |

## Utility Colors
- **Success**: `green-600` - #16A34A
- **Warning**: `yellow-600` - #CA8A04
- **Error**: `red-600` - #DC2626
- **Info**: `blue-600` - #2563EB

## Semantic Spacing
```
xs: 4px   (0.25rem)
sm: 8px   (0.5rem)
md: 16px  (1rem)
lg: 24px  (1.5rem)
xl: 32px  (2rem)
2xl: 48px (3rem)
```

## Typography Scale
```
xs: 12px  (0.75rem)
sm: 14px  (0.875rem)
md: 16px  (1rem)
lg: 18px  (1.125rem)
xl: 20px  (1.25rem)
2xl: 24px (1.5rem)
3xl: 30px (2rem)
```

## Shadow Scale
- `shadow-sm`: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- `shadow`: `0 1px 3px 0 rgba(0, 0, 0, 0.1)`
- `shadow-md`: `0 4px 6px -1px rgba(0, 0, 0, 0.1)`
- `shadow-lg`: `0 10px 15px -3px rgba(0, 0, 0, 0.1)`

## Border Radius
- `rounded-sm`: 2px
- `rounded`: 4px
- `rounded-md`: 6px
- `rounded-lg`: 8px
- `rounded-xl`: 12px
- `rounded-2xl`: 16px
- `rounded-full`: 9999px

## Transition Presets
```
transition-all duration-200  // Smooth, quick
transition-colors duration-300 // Color changes
transition-transform duration-200 // Scale/rotate effects
```

## Responsive Breakpoints
```
sm: 640px   (Mobile landscape)
md: 768px   (Tablet)
lg: 1024px  (Desktop)
xl: 1280px  (Large desktop)
2xl: 1536px (Extra large)
```

## Icon Sizing
- Small: `w-4 h-4`
- Regular: `w-5 h-5`
- Medium: `w-6 h-6`
- Large: `w-8 h-8`
- XL: `w-12 h-12`

## Grid Layouts

### KPI Cards
```
Mobile:  grid-cols-1
Tablet:  md:grid-cols-2
Desktop: lg:grid-cols-5
Gap:     gap-6
```

### Stats Footer
```
Mobile:  grid-cols-1
Tablet:  md:grid-cols-3
Gap:     gap-6
```

## Z-Index Scale
```
navbar: z-50
dropdown: z-50
modal: z-40
tooltip: z-30
```

## Common Component Classes

### Button (Primary)
```
px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium
hover:bg-indigo-700 transition-colors duration-200
hover:shadow-lg hover:scale-105
```

### Card
```
bg-white rounded-xl shadow-sm hover:shadow-md
transition-all duration-200 p-6
```

### Table Row
```
border-b border-gray-100 hover:bg-gray-50
transition-colors duration-150
```

### Badge
```
inline-flex px-3 py-1 rounded-full text-xs font-semibold
{bgColor} {textColor}
```

## Dark Mode Classes
```
dark:bg-gray-900
dark:bg-gray-800
dark:text-white
dark:border-gray-700
dark:hover:bg-gray-700
```

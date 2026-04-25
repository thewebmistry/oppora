# UI Components Library

A modern, reusable UI components library built with TypeScript, Tailwind CSS, and Framer Motion. All components support both Light and Dark modes.

## Installation

The components are already included in the project. Import them from `@/components/ui` or using relative paths.

## Components

### Button
A versatile button component with multiple variants, sizes, and loading states.

```tsx
import { Button } from '@/components/ui';

<Button 
  variant="primary" 
  size="md"
  isLoading={false}
  onClick={() => console.log('clicked')}
>
  Click me
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'danger' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `isLoading`: boolean (default: false)
- `disabled`: boolean
- All standard button attributes

### InputField
A form input field with label, error handling, and password visibility toggle.

```tsx
import { InputField } from '@/components/ui';

<InputField
  label="Email"
  type="email"
  value={email}
  onChange={setEmail}
  placeholder="you@example.com"
  error={emailError}
  helperText="Enter your email address"
/>
```

**Props:**
- `label`: string (optional)
- `type`: 'text' | 'email' | 'password' | 'number' (default: 'text')
- `value`: string (required)
- `onChange`: (value: string) => void (required)
- `placeholder`: string (optional)
- `error`: string (optional)
- `helperText`: string (optional)
- All standard input attributes

### Card
A container component with shadow, border, and hover effects. Includes smooth entrance animations.

```tsx
import { Card } from '@/components/ui';

<Card 
  padding="md" 
  shadow 
  hoverEffect
  border
>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>
```

**Props:**
- `padding`: 'none' | 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `shadow`: boolean (default: true)
- `hoverEffect`: boolean (default: false)
- `border`: boolean (default: false)
- All standard div attributes

### PageLoader
A full-screen or inline loading component with spinner animation.

```tsx
import { PageLoader } from '@/components/ui';

<PageLoader 
  message="Loading..." 
  fullScreen 
  size="md"
/>
```

**Props:**
- `message`: string (default: 'Loading...')
- `fullScreen`: boolean (default: true)
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `backgroundColor`: string (optional)

## Dark Mode Support

All components automatically adapt to dark mode using Tailwind's `dark:` prefix. The project uses `darkMode: 'class'` configuration.

## Animations

Components use Framer Motion for smooth animations:
- Button: Scale on hover and tap
- Card: Fade in on mount
- InputField: Focus indicators and error animations
- PageLoader: Rotating spinner and progress bar

## Styling

Components are styled with Tailwind CSS utility classes. Custom styles can be added via the `className` prop.

## TypeScript

All components are fully typed with TypeScript interfaces for props.
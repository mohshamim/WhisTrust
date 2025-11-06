# Accessibility Guidelines for WhisTrust

## Image Alt Text and Aria Labels

### Current Implementation

All decorative icons from Lucide React are marked with `aria-hidden="true"` to prevent screen readers from announcing them unnecessarily.

### Icon Accessibility Rules

**Decorative Icons** (next to text):
```tsx
<Shield className="h-6 w-6" aria-hidden="true" />
<span>Text that describes the action</span>
```

**Interactive Icons** (buttons without text):
```tsx
<Button aria-label="Open navigation menu">
  <Menu className="h-5 w-5" aria-hidden="true" />
</Button>
```

**Informative Icons** (standalone with meaning):
```tsx
<CheckCircle className="h-5 w-5" role="img" aria-label="Success" />
```

### Images

All images should include descriptive alt text:

**Hero Section Images:**
- Background: "Abstract background pattern"
- App Screenshots: "WhisTrust dashboard interface showing case management"
- Logo Icons: Company name + "logo"

**Feature Cards:**
- Icon illustrations should use aria-hidden when paired with descriptive text

**Social Sharing Images:**
- Open Graph images automatically generated with alt text
- Twitter Cards automatically generated with alt text

### Forms

All form inputs include:
- Associated `<label>` elements
- aria-describedby for helper text
- aria-invalid for error states
- aria-required for required fields

### Navigation

- Main navigation includes proper aria-labels
- Mobile menu button has descriptive aria-label
- Skip links for keyboard navigation (if needed)

### Dynamic Content

- Status messages use aria-live regions
- Loading states include aria-busy
- Modal dialogs include proper focus management

## Testing Accessibility

### Automated Testing
```bash
npm run lint  # Includes a11y linting rules
```

### Manual Testing Checklist

- [ ] Test with keyboard-only navigation (Tab, Enter, Escape)
- [ ] Test with screen reader (NVDA, JAWS, or VoiceOver)
- [ ] Verify color contrast ratios (WCAG AA minimum)
- [ ] Test responsive design and zoom levels
- [ ] Verify focus indicators are visible
- [ ] Test with browser extensions (axe DevTools, WAVE)

### Screen Reader Testing

**macOS:**
```bash
# Enable VoiceOver
Cmd + F5
```

**Windows:**
- Download NVDA (free): https://www.nvaccess.org/
- Or use Windows Narrator (built-in)

## WCAG 2.1 Compliance

WhisTrust aims for **WCAG 2.1 Level AA** compliance:

✅ **Perceivable:**
- Alt text for images
- Color contrast ratios met
- Resizable text up to 200%

✅ **Operable:**
- Keyboard accessible
- No keyboard traps
- Sufficient time limits

✅ **Understandable:**
- Clear labels and instructions
- Error identification and suggestions
- Consistent navigation

✅ **Robust:**
- Valid HTML
- Compatible with assistive technologies
- Progressive enhancement

## Icon Library Standards

All Lucide React icons follow these patterns:

### Feature Icons
```tsx
<Lock className="h-6 w-6 text-primary" aria-hidden="true" />
```

### Navigation Icons
```tsx
<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
```

### Status Icons
```tsx
<CheckCircle className="h-5 w-5 text-green-500" role="img" aria-label="Completed" />
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [a11y Project](https://www.a11yproject.com/)
- [Accessible Rich Internet Applications (ARIA)](https://www.w3.org/WAI/standards-guidelines/aria/)


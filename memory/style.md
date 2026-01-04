
# Coding Style & Conventions

## Architecture
- Typescript single page application.
- Google AI Studio (direct importmap).
- Tailwind for style architecture.
- Supabase backend for auth and data storage.

## Naming Conventions
- Variables & functions: camelCase
- Components & classes: PascalCase
- Files: PascalCase

## UI Components

### Button Component

For all button elements, use the reusable `<Button>` component located at `components/Button.tsx`. This ensures visual consistency and maintainability. Avoid styling `<button>` elements manually with Tailwind classes.

**Usage:**

```tsx
import Button from '../components/Button';

<Button variant="primary" onClick={handleClick}>
  Save Changes
</Button>
```

**Props:**

-   `variant`: (Optional) Defines the button's color scheme. Defaults to `primary`.
    -   `'primary'`: Blue background, for primary actions (e.g., "Save", "Create").
    -   `'secondary'`: Gray background, for less prominent actions (e.g., "Cancel").
    -   `'destructive'`: Red background, for actions that delete data (e.g., "Delete", "Revoke").
    -   `'success'`: Green background, for positive confirmation actions (e.g., "Approve").
-   All other standard `<button>` attributes like `onClick`, `disabled`, `type`, and `className` are passed through.

## Documentation
- Inline comments for complex logic.
- JSDoc/TypeDoc for public functions and APIs.

## Testing
- Tests are listed in the tests folder.
- Tests are run locally before public deployment.

## Formatting
- Prettier for auto-formatting.
- ESLint with Airbnb rules.

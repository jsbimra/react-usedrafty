# react-usedrafty

React Drafty (📄 `react-usedrafty`) is a plug-and-play hook for autosaving form state to localStorage or sessionStorage. No setup required. Restore drafts across page reloads — for any form.

# react-usedrafty

![npm](https://img.shields.io/npm/v/react-usedrafty)
![npm downloads](https://img.shields.io/npm/dt/react-usedrafty)
![license](https://img.shields.io/npm/l/react-usedrafty)
![issues](https://img.shields.io/github/issues/jsbimra/react-usedrafty)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)


---

## 🔥 Features

- ✅ Auto-save form state (localStorage/sessionStorage)
- ✅ Zero-config usage
- ✅ Restore values on mount
- ✅ Works with controlled forms (React state)
- ✅ TypeScript supported
- ✅ Small, dependency-free

---

## 📦 Installation

```bash
npm install react-usedrafty
# or
yarn add react-usedrafty
```

---

## 🚀 Usage

### 1. Basic Example

```tsx
import { useDrafty } from "react-usedrafty";
import { useState } from "react";

function ContactForm() {
  const [formData, setFormData] = useState({ name: "", message: "" });

  useDrafty("contact-form", formData, setFormData);

  return (
    <form>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <textarea
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
      />
    </form>
  );
}
```

### 2. Custom Options

```tsx
useDrafty("draft-key", data, setData, {
  storage: "session",    // 'local' | 'session'
  delay: 1000,           // autosave delay (ms)
  enabled: true,         // toggle saving
});
```

---

## 📘 API

### `useDrafty(key, state, setState, options?)`

| Param      | Type        | Description |
|------------|-------------|-------------|
| `key`      | `string`    | Storage key |
| `state`    | `object`    | Your form state |
| `setState` | `function`  | State setter (e.g. `useState`) |
| `options`  | `object?`   | Optional config |

### Options

- `storage`: `"local"` | `"session"` (default: `"local"`)
- `delay`: Number of ms between saves (default: 1000ms)
- `enabled`: Toggle auto-saving (default: `true`)

---

## 🛠 Fixes During Setup

If you face this error:

```ts
Could not find a declaration file for module 'react'.
```

Install types for React:

```bash
npm install --save-dev @types/react
```

---

## 📄 License

MIT

---

## ✍️ Author

Made by **jbviaai** with ❤️  
Inspired by real-world use in feedback forms and checkout pages.
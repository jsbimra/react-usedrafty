# react-usedrafty

React Drafty (📄 `react-usedrafty`) is a plug-and-play hook for autosaving form state to localStorage or sessionStorage. No setup required. Restore drafts across page reloads — for any form.

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
- ✅ Warn user before leaving with unsaved changes (optional)
- ✅ Custom debounce/save interval
- ✅ Clean up/reset support

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
  storage: "session",          // 'local' | 'session'
  delay: 1500,                 // autosave delay (ms)
  enabled: true,               // toggle saving
  warnOnUnload: true,          // optional: show leave warning
  unloadMessage: "Unsaved changes, are you sure?", // optional custom message
});
```

---

## 📘 API

### `useDrafty(key, state, setState, options?)`

| Param        | Type        | Description |
|--------------|-------------|-------------|
| `key`        | `string`    | Storage key |
| `state`      | `object`    | Your form state |
| `setState`   | `function`  | State setter (e.g. `useState`) |
| `options`    | `object?`   | Optional config |

### Options

- `storage`: `"local"` | `"session"` — Defaults to `"local"`
- `delay`: Number — Delay between saves (in ms, default: `1000`)
- `enabled`: Boolean — Toggle auto-saving (default: `true`)
- `warnOnUnload`: Boolean — Prompt user if leaving with unsaved state
- `unloadMessage`: String — Custom browser leave warning message

---

## ✨ What's New

- `warnOnUnload`: Prevent accidental form exit with optional browser prompt
- `unloadMessage`: Customize leave warning message
- Debounce autosave now default (`1000ms`) — can be configured via `delay`
- Full support for both `localStorage` and `sessionStorage`
- Reset logic available for manual clearing

---

## 🛠 Troubleshooting

If you face this error:

```ts
Could not find a declaration file for module 'react'.
```

Install types for React:

```bash
npm install --save-dev @types/react
```

---

## 🧪 Example Directory

A full working example (`/example`) with a contact form is included in the repo.
Clone the repo and run locally to try it out!

```bash
cd example
npm install
npm start
```

---

## 📄 License

MIT

---

## ✍️ Author

Made by **jbviaai** with ❤️  
Inspired by real-world use in feedback forms and checkout pages.
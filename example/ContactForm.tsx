import React, { useState } from "react";
import useDrafty from "../src";

type ContactForm = {
  name: string;
  email: string;
  message: string;
};

export default function ContactForm() {
  const [form, setForm] = useState<ContactForm>({
    name: "",
    email: "",
    message: "",
  });

  const { saveDraft, clearDraft, hasDraft, isDirty } = useDrafty<ContactForm>(
    "contact-form-draft", // Unique key
    form, // Current form state
    setForm, // Updater to restore draft
    {
      debounce: 500, // Auto-save after 500ms pause
      warnOnLeave: true, // Warn before navigating away
      useSession: false, // Store in localStorage (default)
    }
  );

  return (
    <form className="space-y-4">
      {hasDraft && <p className="text-yellow-600">Draft loaded</p>}
      {isDirty && <p className="text-blue-600">You have unsaved changes</p>}

      <input
        className="border p-2 w-full"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="Your name"
      />
      <input
        className="border p-2 w-full"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        placeholder="Your email"
      />
      <textarea
        className="border p-2 w-full"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        placeholder="Message"
      />
      <div className="flex gap-4">
        <button
          type="button"
          onClick={saveDraft}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Save Draft
        </button>
        <button
          type="button"
          onClick={clearDraft}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Clear Draft
        </button>
      </div>
    </form>
  );
}

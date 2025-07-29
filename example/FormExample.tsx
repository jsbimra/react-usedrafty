import React, { useState } from "react";
import useDrafty from "../src";

const ExampleForm = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  useDrafty("example-form", form, setForm);

  return (
    <form>
      <input
        type="text"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="Name"
      />
      <input
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        placeholder="Email"
      />
    </form>
  );
};

export default ExampleForm;

"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
      <div className="flex flex-col gap-1.5">
        <label className="font-heading uppercase text-xs font-bold tracking-wide text-muted-foreground">
          Nome
        </label>
        <input
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          placeholder="Seu nome"
          required
          className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors text-sm"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-heading uppercase text-xs font-bold tracking-wide text-muted-foreground">
          E-mail
        </label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="seu@email.com"
          required
          className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors text-sm"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-heading uppercase text-xs font-bold tracking-wide text-muted-foreground">
          Mensagem
        </label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Como posso te ajudar?"
          required
          rows={6}
          className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors text-sm resize-none"
        />
      </div>

      <button
        type="submit"
        className="flex items-center justify-center gap-2 bg-foreground text-secondary font-heading uppercase text-sm px-4 py-3 rounded-xl hover:bg-foreground/80 transition-colors"
      >
        <Send className="w-4 h-4" />
        Enviar mensagem
      </button>
    </form>
  );
}

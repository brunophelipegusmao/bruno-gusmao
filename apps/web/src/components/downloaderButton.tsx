"use client";

import { Download } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogCloseButton,
} from "@/components/ui/dialog";

export default function DownloadButton() {
  return (
    <Dialog>
      <DialogTrigger className="flex items-center gap-2 bg-foreground text-secondary font-heading uppercase text-sm px-4 py-2.5 rounded-xl hover:bg-foreground/80 transition-colors outline-none">
        <Download className="w-4 h-4" />
        Currículo
      </DialogTrigger>

      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Baixar currículo</DialogTitle>
          <DialogCloseButton />
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <a
            href="/CV_Bruno-pt.pdf"
            download
            className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl border border-border hover:bg-foreground/5 transition-colors group"
          >
            <span className="font-heading uppercase text-xs font-bold tracking-wide">
              Português
            </span>
            <Download className="w-4 h-4 text-foreground/40 group-hover:text-foreground transition-colors" />
          </a>

          <a
            href="/CV_Bruno-en.pdf"
            download
            className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl border border-border hover:bg-foreground/5 transition-colors group"
          >
            <span className="font-heading uppercase text-xs font-bold tracking-wide">
              English
            </span>
            <Download className="w-4 h-4 text-foreground/40 group-hover:text-foreground transition-colors" />
          </a>
        </div>
      </DialogPopup>
    </Dialog>
  );
}

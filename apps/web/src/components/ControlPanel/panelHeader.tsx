import { SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarSeparator } from "@/components/ui/sidebar";

interface PanelHeaderProps {
  title: string;
  description?: string;
}

export function PanelHeader({ title, description }: PanelHeaderProps) {
  return (
    <header className="flex items-center gap-3 px-6 py-4 border-b border-border shrink-0 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <SidebarTrigger className="shrink-0" />
      <SidebarSeparator orientation="vertical" className="h-5 mr-1" />
      <div className="flex flex-col">
        <h1 className="font-heading text-primary text-xl leading-none">{title}</h1>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </header>
  );
}

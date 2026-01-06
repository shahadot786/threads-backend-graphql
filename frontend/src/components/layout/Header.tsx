"use client";

export function Header({ title = "Home" }: { title?: string }) {
  return (
    <header className="sticky top-0 z-30 bg-bg-primary/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-center h-14 px-4">
        <h1 className="text-base font-semibold text-text-primary">
          {title}
        </h1>
      </div>
    </header>
  );
}

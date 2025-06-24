export default function Footer() {
  return (
    <footer className="w-full border-t border-border mt-auto">
      <div className="container mx-auto py-4 px-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Policy Q&amp;A. All rights reserved.
      </div>
    </footer>
  );
}

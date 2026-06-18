export function Footer() {
  return (
    <footer className="bg-dark-green text-white mt-12">
      <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-center">
        <p className="text-xs text-white/70">© {new Date().getFullYear()} Ocal Nutrition</p>
      </div>
    </footer>
  );
}

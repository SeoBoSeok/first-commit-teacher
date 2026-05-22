import Scene from "@/components/Scene";

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white">
      <div className="absolute inset-0">
        <Scene />
      </div>

      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between p-6 sm:p-10">
        <span className="pointer-events-auto text-sm font-medium tracking-[0.3em] uppercase">
          Lecture01
        </span>
        <nav className="pointer-events-auto hidden gap-8 text-sm sm:flex">
          <a href="#work" className="hover:opacity-70">Work</a>
          <a href="#about" className="hover:opacity-70">About</a>
          <a href="#contact" className="hover:opacity-70">Contact</a>
        </nav>
      </header>

      <section className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col gap-4 p-6 sm:p-10">
        <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          Crafted in <span className="italic text-amber-300">3D</span>,
          <br /> built for the web.
        </h1>
        <p className="max-w-md text-sm text-white/70 sm:text-base">
          A starter playground for character-driven, interactive 3D websites —
          inspired by sougen.co.
        </p>
      </section>

      <span className="pointer-events-none absolute bottom-4 right-6 z-10 text-[10px] tracking-widest text-white/40 uppercase">
        Drag to orbit · scroll to zoom
      </span>
    </main>
  );
}

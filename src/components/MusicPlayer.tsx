"use client";

import { useEffect, useRef, useState } from "react";

type Track = { id: string; title: string; src: string };

const TRACKS: Track[] = [
  { id: "junkyard", title: "Junkyard Bounce",    src: "/audio/Junkyard%20Bounce.mp3" },
  { id: "visor",    title: "Visor Chrome Rider", src: "/audio/Visor%20Chrome%20Rider.mp3" },
  { id: "cereal",   title: "Cereal Bowl Magic",  src: "/audio/Cereal%20Bowl%20Magic.mp3" },
];

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Start with track 0 on SSR for hydration consistency; randomize after mount.
  const [index, setIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    setIndex(Math.floor(Math.random() * TRACKS.length));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const a = audioRef.current;
    if (!a) return;
    a.src = TRACKS[index].src;
    a.load();
    a.play()
      .then(() => { setPlaying(true); setBlocked(false); })
      .catch(() => { setPlaying(false); setBlocked(true); });
  }, [index, hydrated]);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play()
        .then(() => { setPlaying(true); setBlocked(false); })
        .catch(() => setPlaying(false));
    } else {
      a.pause();
      setPlaying(false);
    }
  };
  const next = () => setIndex((i) => (i + 1) % TRACKS.length);
  const prev = () => setIndex((i) => (i - 1 + TRACKS.length) % TRACKS.length);

  const track = TRACKS[index];
  const status = blocked ? "TAP" : playing ? "LIVE" : "READY";

  return (
    <aside className="player" aria-label="Spacekkabbi radio">
      <audio
        ref={audioRef}
        preload="metadata"
        onEnded={next}
      />

      <span className="player__tick player__tick--tl" />
      <span className="player__tick player__tick--tr" />
      <span className="player__tick player__tick--bl" />
      <span className="player__tick player__tick--br" />

      <div className="player__head">
        <span className="player__live">
          <span className={`player__live-dot ${playing ? "is-on" : ""}`} />
          KKB · RADIO
        </span>
        <span className="player__status">{status}</span>
      </div>

      <div className="player__main">
        <div className="player__title">
          <div className="player__title-track" key={track.id}>
            <span>{track.title}</span>
            <span aria-hidden>{track.title}</span>
          </div>
        </div>
        <div className="player__controls">
          <button
            type="button"
            className="player__btn"
            onClick={prev}
            aria-label="Previous track"
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 4h2v12H5V4zm3 6l9-6v12L8 10z" />
            </svg>
          </button>
          <button
            type="button"
            className="player__btn player__btn--primary"
            onClick={togglePlay}
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <svg viewBox="0 0 20 20" fill="currentColor">
                <rect x="5" y="4" width="3.5" height="12" />
                <rect x="11.5" y="4" width="3.5" height="12" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3.5L17 10 5 16.5z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            className="player__btn"
            onClick={next}
            aria-label="Next track"
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 4h2v12h-2V4zM3 4l9 6-9 6V4z" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

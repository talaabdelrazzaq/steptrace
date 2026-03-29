"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const nums = [3, 2, 4, 6, 11, 7];
const target = 9;

const steps = [
  {
    activeLine: 2,
    currentIndex: null,
    explanation: "Initialize an empty hash map to store values we've seen.",
    mapEntries: [],
    foundPair: [],
    complement: null,
    miss: false,
  },
  {
    activeLine: 3,
    currentIndex: 0,
    explanation: "Start the loop. i = 0, x = 3.",
    mapEntries: [],
    foundPair: [],
    complement: null,
    miss: false,
  },
  {
    activeLine: 4,
    currentIndex: 0,
    explanation: "Complement: 9 − 3 = 6. Is 6 in the map?",
    mapEntries: [],
    foundPair: [],
    complement: 6,
    miss: false,
  },
  {
    activeLine: 5,
    currentIndex: 0,
    explanation: "6 is not in the map. Store 3 at index 0.",
    mapEntries: [{ key: 3, value: 0, isNew: true, hit: false }],
    foundPair: [],
    complement: null,
    miss: true,
  },
  {
    activeLine: 3,
    currentIndex: 1,
    explanation: "Next iteration. i = 1, x = 2.",
    mapEntries: [{ key: 3, value: 0, isNew: false, hit: false }],
    foundPair: [],
    complement: null,
    miss: false,
  },
  {
    activeLine: 4,
    currentIndex: 1,
    explanation: "Complement: 9 − 2 = 7. Is 7 in the map?",
    mapEntries: [{ key: 3, value: 0, isNew: false, hit: false }],
    foundPair: [],
    complement: 7,
    miss: false,
  },
  {
    activeLine: 5,
    currentIndex: 1,
    explanation: "7 is not in the map. Store 2 at index 1.",
    mapEntries: [
      { key: 3, value: 0, isNew: false, hit: false },
      { key: 2, value: 1, isNew: true, hit: false },
    ],
    foundPair: [],
    complement: null,
    miss: true,
  },
  {
    activeLine: 3,
    currentIndex: 2,
    explanation: "Next iteration. i = 2, x = 4.",
    mapEntries: [
      { key: 3, value: 0, isNew: false, hit: false },
      { key: 2, value: 1, isNew: false, hit: false },
    ],
    foundPair: [],
    complement: null,
    miss: false,
  },
  {
    activeLine: 4,
    currentIndex: 2,
    explanation: "Complement: 9 − 4 = 5. Is 5 in the map?",
    mapEntries: [
      { key: 3, value: 0, isNew: false, hit: false },
      { key: 2, value: 1, isNew: false, hit: false },
    ],
    foundPair: [],
    complement: 5,
    miss: false,
  },
  {
    activeLine: 5,
    currentIndex: 2,
    explanation: "5 is not in the map. Store 4 at index 2.",
    mapEntries: [
      { key: 3, value: 0, isNew: false, hit: false },
      { key: 2, value: 1, isNew: false, hit: false },
      { key: 4, value: 2, isNew: true, hit: false },
    ],
    foundPair: [],
    complement: null,
    miss: true,
  },
  {
    activeLine: 3,
    currentIndex: 3,
    explanation: "Next iteration. i = 3, x = 6.",
    mapEntries: [
      { key: 3, value: 0, isNew: false, hit: false },
      { key: 2, value: 1, isNew: false, hit: false },
      { key: 4, value: 2, isNew: false, hit: false },
    ],
    foundPair: [],
    complement: null,
    miss: false,
  },
  {
    activeLine: 4,
    currentIndex: 3,
    explanation: "Complement: 9 − 6 = 3. Is 3 in the map?",
    mapEntries: [
      { key: 3, value: 0, isNew: false, hit: false },
      { key: 2, value: 1, isNew: false, hit: false },
      { key: 4, value: 2, isNew: false, hit: false },
    ],
    foundPair: [],
    complement: 3,
    miss: false,
  },
  {
    activeLine: 5,
    currentIndex: 3,
    explanation: "Yes! 3 is in the map at index 0. nums[0] + nums[3] = 3 + 6 = 9 ✓",
    mapEntries: [
      { key: 3, value: 0, isNew: false, hit: true },
      { key: 2, value: 1, isNew: false, hit: false },
      { key: 4, value: 2, isNew: false, hit: false },
    ],
    foundPair: [0, 3],
    complement: 3,
    miss: false,
  },
  {
    activeLine: 5,
    currentIndex: 3,
    explanation: "Return [0, 3]. Done! nums[0] + nums[3] = 3 + 6 = 9 🎉",
    mapEntries: [
      { key: 3, value: 0, isNew: false, hit: true },
      { key: 2, value: 1, isNew: false, hit: false },
      { key: 4, value: 2, isNew: false, hit: false },
    ],
    foundPair: [0, 3],
    complement: 3,
    miss: false,
  },
];

const codeLines = [
  { text: "class Solution(object):", indent: 0 },
  { text: "def twoSum(self, nums, target):", indent: 1 },
  { text: "count = {}", indent: 2 },
  { text: "for i, x in enumerate(nums):", indent: 2 },
  { text: "if target - x in count:", indent: 3 },
  { text: "return count[target - x], i", indent: 4 },
  { text: "count[x] = i", indent: 3 },
];

function Confetti({ active }) {
  if (!active) return null;
  const colors = ["#10b981", "#6366f1", "#f59e0b", "#ec4899", "#3b82f6", "#a78bfa"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl z-10">
      {Array.from({ length: 28 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: `${20 + Math.random() * 60}%`, y: "70%", opacity: 1, scale: 1, rotate: 0 }}
          animate={{ x: `${5 + Math.random() * 90}%`, y: `${-20 + Math.random() * 80}%`, opacity: 0, scale: Math.random() * 0.6 + 0.3, rotate: Math.random() * 400 - 200 }}
          transition={{ duration: 1.4 + Math.random() * 0.8, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: Math.random() * 8 + 5,
            height: Math.random() * 8 + 5,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            background: colors[i % colors.length],
          }}
        />
      ))}
    </div>
  );
}

export default function TwoSumPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(2300);
  const [missFlash, setMissFlash] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const intervalRef = useRef(null);

  const currentStep = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;
  const isSolved = currentStep.foundPair.length > 0;

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === " ") { e.preventDefault(); setPlaying((p) => !p); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [stepIndex, playing]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setStepIndex((prev) => {
          if (prev >= steps.length - 1) { setPlaying(false); return prev; }
          return prev + 1;
        });
      }, speed);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, speed]);

  useEffect(() => {
    if (currentStep.miss) {
      setMissFlash(true);
      const t = setTimeout(() => setMissFlash(false), 600);
      return () => clearTimeout(t);
    }
  }, [stepIndex]);

  useEffect(() => {
    if (isSolved) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 2200);
      return () => clearTimeout(t);
    }
  }, [isSolved]);

  const goNext = () => { if (stepIndex < steps.length - 1) setStepIndex((p) => p + 1); };
  const goPrev = () => { setPlaying(false); setStepIndex((p) => Math.max(p - 1, 0)); };
  const reset = () => { setPlaying(false); setStepIndex(0); setShowConfetti(false); };

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-800 flex flex-col">

      {/* ── Nav ── */}
      <nav className="w-full px-8 py-4 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-400 hover:text-slate-600 transition text-sm flex items-center gap-1.5">
            ←
          </Link>
          <div className="w-px h-4 bg-slate-200" />
          <span className="text-xs font-bold tracking-[0.18em] uppercase text-slate-400">StepTrace</span>
          <div className="w-px h-4 bg-slate-200" />
          <span className="text-sm font-semibold text-slate-700">Two Sum</span>
          <span className="hidden sm:inline text-xs bg-indigo-50 text-indigo-500 border border-indigo-100 rounded-full px-2.5 py-0.5 font-medium">Hash Map</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 hidden sm:block">← → or Space</span>
          <div className="rounded-full bg-white border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-500 shadow-sm">
            {stepIndex + 1} / {steps.length}
          </div>
        </div>
      </nav>

      {/* Progress bar */}
      <div className="w-full h-1 bg-slate-100 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-400 to-sky-400"
          animate={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>

      {/* ── Body ── */}
      <main className="flex-1 px-6 py-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-full">

          {/* ── Code Panel ── */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Code</span>
              <span className="text-xs text-slate-300 font-medium font-mono">Python</span>
            </div>
            <div className="p-4 font-mono text-sm flex-1 space-y-0.5">
              {codeLines.map((line, index) => {
                const isActive = index === currentStep.activeLine;
                return (
                  <motion.div
                    key={index}
                    animate={{ backgroundColor: isActive ? "#eef2ff" : "transparent" }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center gap-3 px-3 py-[9px] rounded-xl border ${isActive ? "border-indigo-200" : "border-transparent"}`}
                  >
                    <span className="w-4 text-right text-xs text-slate-200 select-none shrink-0">{index + 1}</span>
                    <span
                      className={`transition-colors duration-200 ${isActive ? "text-indigo-700 font-semibold" : "text-slate-400"}`}
                      style={{ paddingLeft: `${line.indent * 14}px` }}
                    >
                      {line.text}
                    </span>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="ml-auto flex items-center gap-1.5 shrink-0"
                      >
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                          className="text-indigo-300 text-xs"
                        >
                          ▶
                        </motion.div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* ── Visualization Panel ── */}
          <section className="relative rounded-2xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col gap-5 overflow-hidden">
            <Confetti active={showConfetti} />

            {/* Array */}
            <div>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3">Array · target = {target}</p>
              <div className="flex gap-2.5 flex-wrap">
                {nums.map((num, index) => {
                  const isCurrent = index === currentStep.currentIndex;
                  const isFound = currentStep.foundPair.includes(index);
                  const isComplementVal = currentStep.complement === num && !isFound && !isCurrent;

                  return (
                    <div key={index} className="flex flex-col items-center gap-1.5">
                      <span className={`text-[10px] font-mono font-bold transition-colors duration-200 ${isCurrent || isFound ? "text-slate-500" : "text-slate-200"}`}>
                        [{index}]
                      </span>
                      <motion.div
                        animate={{
                          scale: isFound ? 1.14 : isCurrent ? 1.08 : 1,
                          y: isFound ? -5 : 0,
                          boxShadow: isFound
                            ? "0 8px 24px rgba(16,185,129,0.18)"
                            : isCurrent
                            ? "0 4px 14px rgba(245,158,11,0.18)"
                            : "0 1px 4px rgba(0,0,0,0.06)",
                        }}
                        transition={{ type: "spring", stiffness: 340, damping: 20 }}
                        className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-lg font-bold transition-colors duration-200 ${
                          isFound
                            ? "bg-emerald-50 border-emerald-400 text-emerald-600"
                            : isCurrent
                            ? "bg-amber-50 border-amber-400 text-amber-600"
                            : isComplementVal
                            ? "bg-sky-50 border-sky-300 text-sky-500"
                            : "bg-slate-50 border-slate-150 text-slate-500"
                        }`}
                      >
                        {num}
                      </motion.div>
                    </div>
                  );
                })}
              </div>
              <AnimatePresence>
                {currentStep.complement && !isSolved && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-sky-500 bg-sky-50 border border-sky-100 rounded-full px-3 py-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                    Searching for {currentStep.complement}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Hash Map */}
            <div>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3">Hash Map</p>
              <motion.div
                animate={{
                  backgroundColor: missFlash ? "#fef2f2" : "#f8fafc",
                  borderColor: missFlash ? "#fca5a5" : "#e2e8f0",
                }}
                transition={{ duration: 0.15 }}
                className="min-h-[72px] rounded-xl border-2 border-dashed p-3 flex gap-2 flex-wrap items-start content-start"
              >
                <AnimatePresence>
                  {currentStep.mapEntries.length === 0 ? (
                    <span className="text-slate-300 text-xs font-mono self-center mx-auto mt-3">{`{ }`} empty</span>
                  ) : (
                    currentStep.mapEntries.map((entry) => (
                      <motion.div
                        key={entry.key}
                        initial={{ opacity: 0, scale: 0.7, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ type: "spring", stiffness: 320, damping: 20 }}
                        className={`rounded-xl border flex flex-col items-center px-4 py-2 min-w-[60px] ${
                          entry.hit
                            ? "bg-emerald-50 border-emerald-300"
                            : entry.isNew
                            ? "bg-indigo-50 border-indigo-200"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        <span className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${entry.hit ? "text-emerald-400" : entry.isNew ? "text-indigo-400" : "text-slate-300"}`}>
                          val
                        </span>
                        <span className={`text-lg font-bold font-mono leading-none ${entry.hit ? "text-emerald-600" : entry.isNew ? "text-indigo-600" : "text-slate-600"}`}>
                          {entry.key}
                        </span>
                        <div className={`w-4 h-px my-1 ${entry.hit ? "bg-emerald-200" : entry.isNew ? "bg-indigo-200" : "bg-slate-200"}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${entry.hit ? "text-emerald-400" : entry.isNew ? "text-indigo-400" : "text-slate-300"}`}>
                          idx
                        </span>
                        <span className={`text-lg font-bold font-mono leading-none ${entry.hit ? "text-emerald-600" : entry.isNew ? "text-indigo-600" : "text-slate-600"}`}>
                          {entry.value}
                        </span>
                        {entry.hit && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="mt-1 text-emerald-500 text-xs"
                          >
                            ✓
                          </motion.div>
                        )}
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </motion.div>
              <AnimatePresence>
                {missFlash && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-red-400 font-semibold mt-2 flex items-center gap-1.5"
                  >
                    <span>✕</span> Not found — storing current value
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Explanation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={stepIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className={`rounded-xl border p-4 ${isSolved ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-100"}`}
              >
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${isSolved ? "text-emerald-400" : "text-slate-300"}`}>
                  {isSolved ? "✓ Solution Found" : "Explanation"}
                </p>
                <p className={`text-sm font-medium leading-relaxed ${isSolved ? "text-emerald-700" : "text-slate-600"}`}>
                  {currentStep.explanation}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={goPrev}
                disabled={isFirst}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 transition disabled:opacity-25 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setPlaying((p) => !p)}
                disabled={isLast}
                className={`rounded-full px-6 py-2 text-sm font-bold transition ${
                  playing
                    ? "bg-amber-400 text-white hover:bg-amber-500"
                    : "bg-slate-900 text-white hover:bg-slate-700"
                } disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                {playing ? "⏸ Pause" : "▶ Play"}
              </motion.button>
              <button
                onClick={goNext}
                disabled={isLast}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 transition disabled:opacity-25 disabled:cursor-not-allowed"
              >
                Next →
              </button>
              <button
                onClick={reset}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 transition"
              >
                Reset
              </button>
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-xs text-slate-300 mr-1">Speed</span>
                {[{ label: "1×", val: 1800 }, { label: "2×", val: 900 }, { label: "3×", val: 400 }].map((s) => (
                  <button
                    key={s.val}
                    onClick={() => setSpeed(s.val)}
                    className={`text-xs px-2.5 py-1 rounded-full border font-semibold transition ${
                      speed === s.val
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-400 border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
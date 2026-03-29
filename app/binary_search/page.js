"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const nums = [1, 3, 5, 7, 9, 12, 15, 18, 21, 24];
const target = 12;

// codeLines indices:
// 0: def search(self, nums, target):
// 1:   l = 0
// 2:   r = len(nums) - 1
// 3:   mid = (l+r)//2
// 4:   while l<=r:
// 5:     if nums[mid] == target:
// 6:       return mid
// 7:     elif nums[mid]>target:
// 8:       r = mid-1
// 9:       mid = (l+r)//2
// 10:    else:
// 11:      l = mid + 1
// 12:      mid = (l+r)//2
// 13:  return -1

const steps = [
  {
    activeLine: 1,
    left: 0, right: 9, mid: null,
    explanation: "Set l = 0 (leftmost index).",
    found: null, miss: false,
  },
  {
    activeLine: 2,
    left: 0, right: 9, mid: null,
    explanation: "Set r = 9 (last index). Search space is the full array.",
    found: null, miss: false,
  },
  {
    activeLine: 3,
    left: 0, right: 9, mid: 4,
    explanation: "Compute mid = (0+9)//2 = 4. nums[4] = 9.",
    found: null, miss: false,
  },
  {
    activeLine: 4,
    left: 0, right: 9, mid: 4,
    explanation: "Enter the while loop — l=0 <= r=9, so we continue.",
    found: null, miss: false,
  },
  {
    activeLine: 5,
    left: 0, right: 9, mid: 4,
    explanation: "nums[4] = 9. Is 9 == 12? No.",
    found: null, miss: false,
  },
  {
    activeLine: 7,
    left: 0, right: 9, mid: 4,
    explanation: "Is nums[4]=9 > 12? No. Try the else branch.",
    found: null, miss: false,
  },
  {
    activeLine: 11,
    left: 5, right: 9, mid: 4,
    explanation: "9 < 12, so target is in right half. Set l = mid+1 = 5.",
    found: null, miss: true,
  },
  {
    activeLine: 12,
    left: 5, right: 9, mid: 7,
    explanation: "Recompute mid = (5+9)//2 = 7. nums[7] = 18.",
    found: null, miss: false,
  },
  {
    activeLine: 4,
    left: 5, right: 9, mid: 7,
    explanation: "Check while condition — l=5 <= r=9. Continue.",
    found: null, miss: false,
  },
  {
    activeLine: 5,
    left: 5, right: 9, mid: 7,
    explanation: "nums[7] = 18. Is 18 == 12? No.",
    found: null, miss: false,
  },
  {
    activeLine: 7,
    left: 5, right: 9, mid: 7,
    explanation: "Is nums[7]=18 > 12? Yes! Target is in left half.",
    found: null, miss: true,
  },
  {
    activeLine: 8,
    left: 5, right: 6, mid: 7,
    explanation: "Set r = mid-1 = 6. New search range: [5, 6].",
    found: null, miss: false,
  },
  {
    activeLine: 9,
    left: 5, right: 6, mid: 5,
    explanation: "Recompute mid = (5+6)//2 = 5. nums[5] = 12.",
    found: null, miss: false,
  },
  {
    activeLine: 4,
    left: 5, right: 6, mid: 5,
    explanation: "Check while condition — l=5 <= r=6. Continue.",
    found: null, miss: false,
  },
  {
    activeLine: 5,
    left: 5, right: 6, mid: 5,
    explanation: "nums[5] = 12. Is 12 == 12? Yes!",
    found: 5, miss: false,
  },
  {
    activeLine: 6,
    left: 5, right: 6, mid: 5,
    explanation: "Return mid = 5. Found target 12 at index 5 in 3 comparisons! 🎉",
    found: 5, miss: false,
  },
];

const codeLines = [
  { text: "def search(self, nums, target):", indent: 0 },
  { text: "l = 0", indent: 1 },
  { text: "r = len(nums) - 1", indent: 1 },
  { text: "mid = (l+r)//2", indent: 1 },
  { text: "while l<=r:", indent: 1 },
  { text: "if nums[mid] == target:", indent: 2 },
  { text: "return mid", indent: 3 },
  { text: "elif nums[mid]>target:", indent: 2 },
  { text: "r = mid-1", indent: 3 },
  { text: "mid = (l+r)//2", indent: 3 },
  { text: "else:", indent: 2 },
  { text: "l = mid + 1", indent: 3 },
  { text: "mid = (l+r)//2", indent: 3 },
  { text: "return -1", indent: 1 },
];

function Confetti({ active }) {
  if (!active) return null;
  const colors = ["#10b981", "#6366f1", "#f59e0b", "#ec4899", "#3b82f6", "#a78bfa"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl z-10">
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

function PointerLabel({ label }) {
  const colors = {
    L: "bg-indigo-500 text-white",
    R: "bg-violet-400 text-white",
    M: "bg-sky-400 text-white",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center ${colors[label]}`}
    >
      {label}
    </motion.div>
  );
}

export default function BinarySearchPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1800);
  const [missFlash, setMissFlash] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const intervalRef = useRef(null);

  const currentStep = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;
  const isSolved = currentStep.found !== null;

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

  const { left, right, mid } = currentStep;

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-800 flex flex-col">

      {/* Nav */}
      <nav className="w-full px-8 py-4 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-400 hover:text-slate-600 transition text-sm">←</Link>
          <div className="w-px h-4 bg-slate-200" />
          <span className="text-xs font-bold tracking-[0.18em] uppercase text-slate-400">StepTrace</span>
          <div className="w-px h-4 bg-slate-200" />
          <span className="text-sm font-semibold text-slate-700">Binary Search</span>
          <span className="hidden sm:inline text-xs bg-sky-50 text-sky-500 border border-sky-100 rounded-full px-2.5 py-0.5 font-medium">Divide & Conquer</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 hidden sm:block">← → or Space</span>
          <div className="rounded-full bg-white border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-500 shadow-sm">
            {stepIndex + 1} / {steps.length}
          </div>
        </div>
      </nav>

      {/* Problem statement */}
      <details className="px-6 pt-4 max-w-6xl mx-auto w-full">
        <summary className="rounded-xl border border-slate-200 bg-white shadow-sm px-5 py-3 text-sm font-semibold text-slate-600 cursor-pointer list-none flex items-center justify-between">
          <span>📄 Problem Statement</span>
          <span className="text-slate-300 text-xs">click to expand</span>
        </summary>
        <div className="rounded-b-xl border border-t-0 border-slate-200 bg-white px-5 pb-4 pt-3 text-sm text-slate-600 leading-relaxed">
          <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest mr-2">Easy</span>
          Given an array of integers <code className="bg-slate-100 px-1 rounded">nums</code> sorted in ascending order and an integer <code className="bg-slate-100 px-1 rounded">target</code>, write a function to search for target. Return its index if found, otherwise return <code className="bg-slate-100 px-1 rounded">-1</code>. You must write an algorithm with <code className="bg-slate-100 px-1 rounded">O(log n)</code> runtime complexity.
        </div>
      </details>

      {/* Progress */}
      <div className="w-full h-1 bg-slate-100 overflow-hidden mt-4">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-400 to-sky-400"
          animate={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>

      <main className="flex-1 px-6 py-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Code Panel */}
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
                        animate={{ x: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                        className="ml-auto text-indigo-300 text-xs shrink-0"
                      >
                        ▶
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Pointer legend */}
            <div className="px-5 py-4 border-t border-slate-100 flex items-center gap-4">
              <span className="text-xs text-slate-300 font-semibold uppercase tracking-widest">Pointers</span>
              {[{ label: "L", desc: "left", color: "bg-indigo-500" }, { label: "M", desc: "mid", color: "bg-sky-400" }, { label: "R", desc: "right", color: "bg-violet-400" }].map((p) => (
                <div key={p.label} className="flex items-center gap-1.5">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white ${p.color}`}>{p.label}</div>
                  <span className="text-xs text-slate-400">{p.desc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Visualization Panel */}
          <section className="relative rounded-2xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col gap-5 overflow-hidden">
            <Confetti active={showConfetti} />

            {/* Array */}
            <div>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">Array · target = {target}</p>
              <div className="flex gap-1.5 flex-nowrap overflow-x-auto">
                {nums.map((num, index) => {
                  const isLeft = index === left;
                  const isRight = index === right;
                  const isMid = index === mid && mid !== null;
                  const isFound = index === currentStep.found;
                  const inRange = index >= left && index <= right;

                  return (
                    <div key={index} className="flex flex-col items-center gap-1">
                      <div className="flex gap-0.5 h-5 items-center">
                        <AnimatePresence>
                          {isLeft && <PointerLabel key="L" label="L" />}
                          {isMid && <PointerLabel key="M" label="M" />}
                          {isRight && <PointerLabel key="R" label="R" />}
                        </AnimatePresence>
                        {!isLeft && !isRight && !isMid && <div className="w-5 h-5" />}
                      </div>
                      <motion.div
                        animate={{
                          scale: isFound ? 1.15 : isMid ? 1.08 : 1,
                          y: isFound ? -4 : 0,
                          boxShadow: isFound ? "0 8px 24px rgba(16,185,129,0.2)" : isMid ? "0 4px 14px rgba(56,189,248,0.2)" : "none",
                        }}
                        transition={{ type: "spring", stiffness: 340, damping: 20 }}
                        className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center text-xs font-bold transition-colors duration-300 ${
                          isFound ? "bg-emerald-50 border-emerald-400 text-emerald-600"
                          : isMid ? "bg-sky-50 border-sky-400 text-sky-600"
                          : inRange ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                          : "bg-slate-50 border-slate-150 text-slate-300"
                        }`}
                      >
                        {num}
                      </motion.div>
                      <span className={`text-[9px] font-mono transition-colors duration-200 ${inRange ? "text-slate-300" : "text-slate-200"}`}>{index}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Search Range */}
            <div>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3">Search Range</p>
              <div className="flex gap-3">
                {[
                  { label: "l", val: left, color: "border-indigo-200 bg-indigo-50 text-indigo-600" },
                  { label: "mid", val: mid !== null ? mid : "—", color: "border-sky-200 bg-sky-50 text-sky-600" },
                  { label: "r", val: right, color: "border-violet-200 bg-violet-50 text-violet-600" },
                ].map((p) => (
                  <div key={p.label} className={`flex-1 rounded-xl border-2 p-3 text-center ${p.color}`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">{p.label}</p>
                    <motion.p
                      key={`${p.label}-${p.val}`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-2xl font-bold font-mono"
                    >
                      {p.val}
                    </motion.p>
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={stepIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className={`rounded-xl border p-4 ${isSolved ? "bg-emerald-50 border-emerald-200" : missFlash ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-100"}`}
              >
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${isSolved ? "text-emerald-400" : missFlash ? "text-red-400" : "text-slate-300"}`}>
                  {isSolved ? "✓ Found" : missFlash ? "✕ Wrong half" : "Explanation"}
                </p>
                <p className={`text-sm font-medium leading-relaxed ${isSolved ? "text-emerald-700" : missFlash ? "text-red-600" : "text-slate-600"}`}>
                  {currentStep.explanation}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="flex flex-wrap gap-2 items-center">
              <button onClick={goPrev} disabled={isFirst} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 transition disabled:opacity-25 disabled:cursor-not-allowed">← Prev</button>
              <motion.button whileTap={{ scale: 0.96 }} onClick={() => setPlaying((p) => !p)} disabled={isLast}
                className={`rounded-full px-6 py-2 text-sm font-bold transition ${playing ? "bg-sky-400 text-white hover:bg-sky-500" : "bg-slate-900 text-white hover:bg-slate-700"} disabled:opacity-30 disabled:cursor-not-allowed`}>
                {playing ? "⏸ Pause" : "▶ Play"}
              </motion.button>
              <button onClick={goNext} disabled={isLast} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 transition disabled:opacity-25 disabled:cursor-not-allowed">Next →</button>
              <button onClick={reset} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 transition">Reset</button>
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-xs text-slate-300 mr-1">Speed</span>
                {[{ label: "1×", val: 1800 }, { label: "2×", val: 900 }, { label: "3×", val: 400 }].map((s) => (
                  <button key={s.val} onClick={() => setSpeed(s.val)}
                    className={`text-xs px-2.5 py-1 rounded-full border font-semibold transition ${speed === s.val ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-200 hover:border-slate-400"}`}>
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
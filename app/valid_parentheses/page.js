"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const input = "({[]})";

// codeLines indices:
// 0: def isValid(self, s):
// 1:   stack = []
// 2:   close_open = {")":"(","]":"[","}":"{"}
// 3:   for c in s:
// 4:     if c in close_open:
// 5:       if stack and stack[-1] == close_open[c]:
// 6:         stack.pop()
// 7:       else:
// 8:         return False
// 9:     else: stack.append(c)
// 10:  return not stack

const steps = [
  {
    activeLine: 1,
    charIndex: null,
    stack: [],
    explanation: "Initialize an empty stack to track unmatched opening brackets.",
    status: "running",
    currentChar: null,
    action: null,
  },
  {
    activeLine: 2,
    charIndex: null,
    stack: [],
    explanation: "Define the mapping: each closing bracket maps to its expected opening bracket.",
    status: "running",
    currentChar: null,
    action: null,
  },
  {
    activeLine: 3,
    charIndex: 0,
    stack: [],
    explanation: "Start iterating. c = '('.",
    status: "running",
    currentChar: "(",
    action: null,
  },
  {
    activeLine: 4,
    charIndex: 0,
    stack: [],
    explanation: "Is '(' in close_open? No — it's an opening bracket.",
    status: "running",
    currentChar: "(",
    action: null,
  },
  {
    activeLine: 9,
    charIndex: 0,
    stack: ["("],
    explanation: "Push '(' onto the stack.",
    status: "running",
    currentChar: "(",
    action: "push",
  },
  {
    activeLine: 3,
    charIndex: 1,
    stack: ["("],
    explanation: "Next character. c = '{'.",
    status: "running",
    currentChar: "{",
    action: null,
  },
  {
    activeLine: 4,
    charIndex: 1,
    stack: ["("],
    explanation: "Is '{' in close_open? No — it's an opening bracket.",
    status: "running",
    currentChar: "{",
    action: null,
  },
  {
    activeLine: 9,
    charIndex: 1,
    stack: ["(", "{"],
    explanation: "Push '{' onto the stack.",
    status: "running",
    currentChar: "{",
    action: "push",
  },
  {
    activeLine: 3,
    charIndex: 2,
    stack: ["(", "{"],
    explanation: "Next character. c = '['.",
    status: "running",
    currentChar: "[",
    action: null,
  },
  {
    activeLine: 9,
    charIndex: 2,
    stack: ["(", "{", "["],
    explanation: "Push '[' onto the stack.",
    status: "running",
    currentChar: "[",
    action: "push",
  },
  {
    activeLine: 3,
    charIndex: 3,
    stack: ["(", "{", "["],
    explanation: "Next character. c = ']'.",
    status: "running",
    currentChar: "]",
    action: null,
  },
  {
    activeLine: 4,
    charIndex: 3,
    stack: ["(", "{", "["],
    explanation: "Is ']' in close_open? Yes. close_open[']'] = '['. Check top of stack.",
    status: "running",
    currentChar: "]",
    action: "check",
  },
  {
    activeLine: 5,
    charIndex: 3,
    stack: ["(", "{", "["],
    explanation: "Stack is not empty and stack[-1] = '[' == close_open[']']. Match!",
    status: "running",
    currentChar: "]",
    action: "check",
  },
  {
    activeLine: 6,
    charIndex: 3,
    stack: ["(", "{"],
    explanation: "Pop '[' off the stack. ✓",
    status: "running",
    currentChar: "]",
    action: "pop",
  },
  {
    activeLine: 3,
    charIndex: 4,
    stack: ["(", "{"],
    explanation: "Next character. c = '}'.",
    status: "running",
    currentChar: "}",
    action: null,
  },
  {
    activeLine: 5,
    charIndex: 4,
    stack: ["(", "{"],
    explanation: "stack[-1] = '{' == close_open['}']. Match!",
    status: "running",
    currentChar: "}",
    action: "check",
  },
  {
    activeLine: 6,
    charIndex: 4,
    stack: ["("],
    explanation: "Pop '{' off the stack. ✓",
    status: "running",
    currentChar: "}",
    action: "pop",
  },
  {
    activeLine: 3,
    charIndex: 5,
    stack: ["("],
    explanation: "Next character. c = ')'.",
    status: "running",
    currentChar: ")",
    action: null,
  },
  {
    activeLine: 5,
    charIndex: 5,
    stack: ["("],
    explanation: "stack[-1] = '(' == close_open[')']. Match!",
    status: "running",
    currentChar: ")",
    action: "check",
  },
  {
    activeLine: 6,
    charIndex: 5,
    stack: [],
    explanation: "Pop '(' off the stack. ✓ Stack is now empty.",
    status: "running",
    currentChar: ")",
    action: "pop",
  },
  {
    activeLine: 10,
    charIndex: null,
    stack: [],
    explanation: "Return not stack. Stack is empty so return True. Every bracket matched! 🎉",
    status: "success",
    currentChar: null,
    action: null,
  },
];

const codeLines = [
  { text: "def isValid(self, s):", indent: 0 },
  { text: "stack = []", indent: 1 },
  { text: 'close_open = {")":"(","]":"[","}":"{"}', indent: 1 },
  { text: "for c in s:", indent: 1 },
  { text: "if c in close_open:", indent: 2 },
  { text: "if stack and stack[-1] == close_open[c]:", indent: 3 },
  { text: "stack.pop()", indent: 4 },
  { text: "else:", indent: 3 },
  { text: "return False", indent: 4 },
  { text: "else: stack.append(c)", indent: 2 },
  { text: "return not stack", indent: 1 },
];

const bracketColor = (b) => {
  if (b === "(" || b === ")") return { bg: "bg-violet-100", border: "border-violet-300", text: "text-violet-700" };
  if (b === "{" || b === "}") return { bg: "bg-sky-100", border: "border-sky-300", text: "text-sky-700" };
  return { bg: "bg-indigo-100", border: "border-indigo-300", text: "text-indigo-700" };
};

const OPEN = new Set(["(", "{", "["]);

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

export default function ValidParenthesesPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(2300);
  const [showConfetti, setShowConfetti] = useState(false);
  const intervalRef = useRef(null);

  const currentStep = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;
  const isSolved = currentStep.status === "success";

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

      {/* Nav */}
      <nav className="w-full px-8 py-4 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-400 hover:text-slate-600 transition text-sm">←</Link>
          <div className="w-px h-4 bg-slate-200" />
          <span className="text-xs font-bold tracking-[0.18em] uppercase text-slate-400">StepTrace</span>
          <div className="w-px h-4 bg-slate-200" />
          <span className="text-sm font-semibold text-slate-700">Valid Parentheses</span>
          <span className="hidden sm:inline text-xs bg-violet-50 text-violet-500 border border-violet-100 rounded-full px-2.5 py-0.5 font-medium">Stack</span>
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
          Given a string <code className="bg-slate-100 px-1 rounded">s</code> containing just the characters <code className="bg-slate-100 px-1 rounded">( ) [ ] {"{ }"}</code>, determine if the input string is valid. Brackets must close in the correct order and every closing bracket must have a corresponding open bracket of the same type.
        </div>
      </details>

      {/* Progress */}
      <div className="w-full h-1 bg-slate-100 overflow-hidden mt-4">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-400 to-indigo-400"
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
                    animate={{ backgroundColor: isActive ? "#f5f3ff" : "transparent" }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center gap-3 px-3 py-[9px] rounded-xl border ${isActive ? "border-violet-200" : "border-transparent"}`}
                  >
                    <span className="w-4 text-right text-xs text-slate-200 select-none shrink-0">{index + 1}</span>
                    <span
                      className={`transition-colors duration-200 ${isActive ? "text-violet-700 font-semibold" : "text-slate-400"}`}
                      style={{ paddingLeft: `${line.indent * 14}px` }}
                    >
                      {line.text}
                    </span>
                    {isActive && (
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                        className="ml-auto text-violet-300 text-xs shrink-0"
                      >
                        ▶
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex items-center gap-4 flex-wrap">
              <span className="text-xs text-slate-300 font-semibold uppercase tracking-widest">Colors</span>
              {[["()", "violet"], ["{}", "sky"], ["[]", "indigo"]].map(([b, c]) => (
                <div key={b} className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold bg-${c}-100 text-${c}-700 border border-${c}-200`}>{b[0]}</div>
                  <span className="text-xs text-slate-400 font-mono">{b}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Visualization Panel */}
          <section className="relative rounded-2xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col gap-5 overflow-hidden">
            <Confetti active={showConfetti} />

            {/* Input string */}
            <div>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3">Input String</p>
              <div className="flex gap-2 items-end flex-wrap">
                {input.split("").map((char, i) => {
                  const isCurrent = i === currentStep.charIndex;
                  const isPast = currentStep.charIndex !== null && i < currentStep.charIndex;
                  const c = bracketColor(char);
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-[10px] text-slate-300 font-mono">{i}</span>
                      <motion.div
                        animate={{ scale: isCurrent ? 1.2 : 1, y: isCurrent ? -4 : 0 }}
                        transition={{ type: "spring", stiffness: 340, damping: 20 }}
                        className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-bold font-mono transition-all duration-200 ${
                          isCurrent ? `${c.bg} ${c.border} ${c.text} shadow-md`
                          : isPast ? "bg-slate-50 border-slate-200 text-slate-300"
                          : "bg-white border-slate-200 text-slate-600"
                        }`}
                      >
                        {char}
                      </motion.div>
                    </div>
                  );
                })}
                <AnimatePresence>
                  {currentStep.currentChar && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="ml-2 flex items-center gap-2"
                    >
                      <span className="text-xs text-slate-400">reading</span>
                      <span className={`text-lg font-bold font-mono px-2 py-1 rounded-lg ${bracketColor(currentStep.currentChar).bg} ${bracketColor(currentStep.currentChar).text}`}>
                        '{currentStep.currentChar}'
                      </span>
                      <span className={`text-xs font-semibold ${OPEN.has(currentStep.currentChar) ? "text-violet-500" : "text-indigo-500"}`}>
                        {OPEN.has(currentStep.currentChar) ? "push" : "match & pop"}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Stack */}
            <div>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3">Stack <span className="font-normal normal-case tracking-normal">(top →)</span></p>
              <div className="relative min-h-[90px] rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 flex flex-col-reverse gap-2 items-start">
                <div className="absolute top-2 right-3 text-[10px] text-slate-200 font-mono">top ↑</div>
                <AnimatePresence>
                  {currentStep.stack.length === 0 ? (
                    <motion.span key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-slate-300 text-xs font-mono self-center mx-auto">
                      [ ] empty
                    </motion.span>
                  ) : (
                    [...currentStep.stack].map((bracket, i) => {
                      const isTop = i === currentStep.stack.length - 1;
                      const c = bracketColor(bracket);
                      return (
                        <motion.div
                          key={`${bracket}-${i}`}
                          layout
                          initial={{ opacity: 0, x: -20, scale: 0.8 }}
                          animate={{ opacity: 1, x: 0, scale: isTop ? 1.05 : 1 }}
                          exit={{ opacity: 0, x: 20, scale: 0.8 }}
                          transition={{ type: "spring", stiffness: 300, damping: 22 }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-mono font-bold text-lg ${c.bg} ${c.border} ${c.text} ${isTop ? "shadow-md" : "opacity-70"}`}
                        >
                          {bracket}
                          {isTop && <span className="text-[10px] font-sans font-semibold opacity-50 ml-1">← top</span>}
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
              <AnimatePresence>
                {currentStep.action && (
                  <motion.div
                    key={currentStep.action + stepIndex}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mt-2 text-xs font-bold flex items-center gap-1.5 ${
                      currentStep.action === "push" ? "text-violet-500"
                      : currentStep.action === "pop" ? "text-emerald-500"
                      : "text-amber-500"
                    }`}
                  >
                    {currentStep.action === "push" && "↓ Pushing onto stack"}
                    {currentStep.action === "pop" && "✓ Match found — popping"}
                    {currentStep.action === "check" && "⟳ Checking top of stack..."}
                  </motion.div>
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
                  {isSolved ? "✓ Valid!" : "Explanation"}
                </p>
                <p className={`text-sm font-medium leading-relaxed ${isSolved ? "text-emerald-700" : "text-slate-600"}`}>
                  {currentStep.explanation}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="flex flex-wrap gap-2 items-center">
              <button onClick={goPrev} disabled={isFirst} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 transition disabled:opacity-25 disabled:cursor-not-allowed">← Prev</button>
              <motion.button whileTap={{ scale: 0.96 }} onClick={() => setPlaying((p) => !p)} disabled={isLast}
                className={`rounded-full px-6 py-2 text-sm font-bold transition ${playing ? "bg-violet-400 text-white hover:bg-violet-500" : "bg-slate-900 text-white hover:bg-slate-700"} disabled:opacity-30 disabled:cursor-not-allowed`}>
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
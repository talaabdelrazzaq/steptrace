"use client";
 
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
 
const PROBLEMS = [
  { value: "two_sum", label: "Two Sum", tag: "Hash Map", ready: true },
  { value: "binary_search", label: "Binary Search", tag: "Divide & Conquer", ready: true },
  { value: "valid_parentheses", label: "Valid Parentheses", tag: "Stack", ready: true },
];
 
export default function Home() {
  const [selectedProblem, setSelectedProblem] = useState("two_sum");
  const router = useRouter();
 
  const handleStart = () => {
    router.push(`/${selectedProblem}`);
  };
 
  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-sky-50 text-slate-800 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-2xl rounded-3xl border border-white/60 bg-white/70 backdrop-blur shadow-[0_20px_80px_rgba(15,23,42,0.08)] p-10 md:p-14"
      >
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400 mb-5">
          StepTrace
        </p>
 
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-2">
          Learn algorithms
        </h1>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-400 mb-6">
          step by step
        </h1>
 
        <p className="text-base text-slate-500 mb-10 max-w-xl leading-relaxed">
          Interactive visual walkthroughs for common coding interview problems.
          Watch the algorithm think — one step at a time.
        </p>
 
        <div className="space-y-3 mb-8">
          <label className="block text-sm font-medium text-slate-500">
            Choose a problem
          </label>
          {PROBLEMS.map((p) => (
            <motion.button
              key={p.value}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelectedProblem(p.value)}
              className={`w-full flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all ${
                selectedProblem === p.value
                  ? "border-slate-900 bg-slate-900 text-white shadow-md"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-2 h-2 rounded-full ${
                    selectedProblem === p.value ? "bg-emerald-400" : "bg-slate-300"
                  }`}
                />
                <span className="font-medium">{p.label}</span>
              </div>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  selectedProblem === p.value
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {p.tag}
              </span>
            </motion.button>
          ))}
        </div>
 
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStart}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-8 py-3.5 text-white text-sm font-semibold hover:bg-slate-700 transition"
        >
          Open Visualizer
          <span className="text-slate-400">→</span>
        </motion.button>
      </motion.div>
    </main>
  );
}
 
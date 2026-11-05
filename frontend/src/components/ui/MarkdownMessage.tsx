"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownMessageProps {
  content: string;
  className?: string;
  isUser?: boolean;
}

export function MarkdownMessage({ content, className = "", isUser = false }: MarkdownMessageProps) {
  if (isUser) {
    return <div className={`whitespace-pre-wrap leading-relaxed ${className}`}>{content}</div>;
  }

  return (
    <div className={`prose-sm max-w-none text-xs sm:text-[13px] leading-relaxed space-y-1.5 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base font-extrabold text-slate-900 dark:text-white mt-2 mb-1 flex items-center gap-1.5">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mt-2 mb-1 flex items-center gap-1.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1.5 mb-0.5 flex items-center gap-1.5">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="leading-relaxed text-slate-800 dark:text-slate-200 mb-1 last:mb-0">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-slate-900 dark:text-white">
              {children}
            </strong>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1 my-1 pl-4 list-disc marker:text-emerald-500">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1 my-1 pl-4 list-decimal marker:text-emerald-500 font-medium">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed text-slate-700 dark:text-slate-200 pl-0.5">
              {children}
            </li>
          ),
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold bg-slate-200/80 dark:bg-slate-700/80 text-emerald-700 dark:text-emerald-300">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-emerald-500 pl-2.5 py-0.5 italic text-slate-600 dark:text-slate-400 my-1 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-r-lg">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 dark:text-emerald-400 underline font-semibold hover:text-emerald-700 dark:hover:text-emerald-300"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}


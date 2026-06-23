"use client";

import { useEffect, useRef } from "react";

type DetailContentProps = {
  content: string;
};

export default function DetailContent({ content }: DetailContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    // Stagger-reveal each heading and paragraph
    const children = el.querySelectorAll("h3, p, strong");
    children.forEach((child, i) => {
      (child as HTMLElement).style.transitionDelay = `${i * 60}ms`;
      (child as HTMLElement).classList.add("content-block");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("content-block-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    children.forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [content]);

  return (
    <section className="w-full pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div
          ref={contentRef}
          className="project-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </section>
  );
}
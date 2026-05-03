"use client";

import { useState } from "react";
import { Icon } from "./icons";
import Link from "next/link";

interface CourseResource {
  id: number;
  name: string;
  url: string;
  file_type: string;
}

interface CourseLesson {
  id: number;
  title: string;
  slug: string;
  video_url: string | null;
  duration_minutes: number | null;
  sort_order: number;
  content_html: string;
  course_resources: CourseResource[];
}

interface CourseModule {
  id: number;
  title: string;
  sort_order: number;
  course_lessons: CourseLesson[];
}

interface CourseProduct {
  id: number;
  name: string;
  brand: string;
  blurb: string;
  meta: string;
}

interface CourseShellProps {
  product: CourseProduct;
  modules: CourseModule[];
  progressIds: number[];
}

export function CourseShell({ product, modules, progressIds: initialProgress }: CourseShellProps) {
  const [progress, setProgress] = useState<Set<number>>(new Set(initialProgress));
  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  const allLessons = modules.flatMap((m) => m.course_lessons);
  const totalLessons = allLessons.length;
  const completedLessons = allLessons.filter((l) => progress.has(l.id)).length;
  const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const nextLesson = allLessons.find((l) => !progress.has(l.id));

  const toggleComplete = async (lessonId: number) => {
    setToggling(lessonId);
    const completed = !progress.has(lessonId);
    try {
      await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_id: lessonId, completed }),
      });
      setProgress((prev) => {
        const next = new Set(prev);
        if (completed) next.add(lessonId);
        else next.delete(lessonId);
        return next;
      });
    } catch {
      // ignore
    } finally {
      setToggling(null);
    }
  };

  const openLesson = (lesson: CourseLesson) => {
    setActiveLesson(lesson);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeLesson = () => setActiveLesson(null);

  const currentIndex = activeLesson ? allLessons.findIndex((l) => l.id === activeLesson.id) : -1;
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLessonNav = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  if (activeLesson) {
    return (
      <>
        <section className="crs-main">
          <div className="crs-inner">
            <button className="crs-back" onClick={closeLesson}>
              <span className="crs-back-arrow"><Icon name="arrow-right" size={14} /></span> Back to {product.name}
            </button>

            <div className="crs-lesson-head">
              <h1 className="crs-lesson-title">{activeLesson.title}</h1>
              {activeLesson.duration_minutes && (
                <span className="crs-lesson-duration">
                  <Icon name="clock" size={14} /> {activeLesson.duration_minutes} min
                </span>
              )}
            </div>

            {activeLesson.video_url && (
              <div className="crs-video">
                <iframe
                  src={activeLesson.video_url}
                  title={activeLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {activeLesson.content_html && (
              <div
                className="crs-content prose"
                dangerouslySetInnerHTML={{ __html: activeLesson.content_html }}
              />
            )}

            {activeLesson.course_resources.length > 0 && (
              <div className="crs-resources">
                <h3 className="crs-resources-title">Resources</h3>
                {activeLesson.course_resources.map((r) => (
                  <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="crs-resource">
                    <Icon name="arrow-up-right" size={14} />
                    <span>{r.name}</span>
                    <span className="crs-resource-type">{r.file_type.toUpperCase()}</span>
                  </a>
                ))}
              </div>
            )}

            <div className="crs-lesson-actions">
              <button
                className={"crs-complete-btn" + (progress.has(activeLesson.id) ? " crs-complete-btn-done" : "")}
                onClick={() => toggleComplete(activeLesson.id)}
                disabled={toggling === activeLesson.id}
              >
                <Icon name="check" size={16} />
                {progress.has(activeLesson.id) ? "Completed" : "Mark as complete"}
              </button>
            </div>

            <div className="crs-lesson-nav">
              {prevLesson ? (
                <button className="crs-nav-btn" onClick={() => openLesson(prevLesson)}>
                  <span className="crs-nav-arrow crs-nav-prev"><Icon name="arrow-right" size={14} /></span>
                  <span className="crs-nav-label">Previous</span>
                  <span className="crs-nav-name">{prevLesson.title}</span>
                </button>
              ) : <div />}
              {nextLessonNav ? (
                <button className="crs-nav-btn crs-nav-btn-next" onClick={() => openLesson(nextLessonNav)}>
                  <span className="crs-nav-label">Next</span>
                  <span className="crs-nav-name">{nextLessonNav.title}</span>
                  <span className="crs-nav-arrow"><Icon name="arrow-right" size={14} /></span>
                </button>
              ) : <div />}
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="crs-main">
        <div className="crs-inner">
          <Link href="/dashboard" className="crs-back">
            <span className="crs-back-arrow"><Icon name="arrow-right" size={14} /></span> Back to dashboard
          </Link>

          <div className="crs-header">
            <div>
              <div className="crs-brand">{product.brand}</div>
              <h1 className="crs-h1">{product.name}</h1>
              <p className="crs-blurb">{product.blurb}</p>
              <div className="crs-meta">{product.meta}</div>
            </div>
          </div>

          <div className="crs-progress">
            <div className="crs-progress-info">
              <span className="crs-progress-label">{completedLessons} of {totalLessons} lessons complete</span>
              <span className="crs-progress-pct">{pct}%</span>
            </div>
            <div className="crs-progress-bar">
              <div className="crs-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            {nextLesson && pct < 100 && (
              <button className="crs-continue-btn" onClick={() => openLesson(nextLesson)}>
                {completedLessons === 0 ? "Start course" : "Continue"} <Icon name="arrow-right" size={14} />
              </button>
            )}
            {pct === 100 && (
              <div className="crs-complete-msg">
                <Icon name="check" size={16} /> Course complete
              </div>
            )}
          </div>

          <div className="crs-modules">
            {modules.map((mod, mi) => {
              const modCompleted = mod.course_lessons.filter((l) => progress.has(l.id)).length;
              const modTotal = mod.course_lessons.length;

              return (
                <div key={mod.id} className="crs-module">
                  <div className="crs-module-head">
                    <span className="crs-module-num">Module {mi + 1}</span>
                    <h2 className="crs-module-title">{mod.title}</h2>
                    <span className="crs-module-progress">{modCompleted}/{modTotal}</span>
                  </div>
                  <div className="crs-lesson-list">
                    {mod.course_lessons.map((lesson, li) => {
                      const done = progress.has(lesson.id);
                      return (
                        <button
                          key={lesson.id}
                          className={"crs-lesson-row" + (done ? " crs-lesson-done" : "")}
                          onClick={() => openLesson(lesson)}
                        >
                          <span className="crs-lesson-check">
                            {done ? <Icon name="check" size={14} /> : <span className="crs-lesson-num">{mi + 1}.{li + 1}</span>}
                          </span>
                          <span className="crs-lesson-name">{lesson.title}</span>
                          {lesson.duration_minutes && (
                            <span className="crs-lesson-dur">{lesson.duration_minutes} min</span>
                          )}
                          {lesson.video_url && <span className="crs-lesson-badge">Video</span>}
                          {lesson.course_resources.length > 0 && (
                            <span className="crs-lesson-badge">{lesson.course_resources.length} file{lesson.course_resources.length !== 1 ? "s" : ""}</span>
                          )}
                          <span className="crs-lesson-arrow"><Icon name="arrow-right" size={12} /></span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

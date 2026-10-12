"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Modal } from "@/components/ui/Modal";
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  Lock,
  ChevronRight,
  HelpCircle,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import {
  getAcademyCourses,
  getAcademyLessons,
  submitQuizAnswer,
} from "@/lib/api";
import {
  CourseResponse,
  LessonResponse,
  QuizSubmissionResponse,
} from "@/types";

export default function AcademyPage() {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseResponse | null>(null);
  const [lessons, setLessons] = useState<LessonResponse[]>([]);
  const [activeLesson, setActiveLesson] = useState<LessonResponse | null>(null);

  // Quiz state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<QuizSubmissionResponse | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fallback initial course data in case backend is offline
  const fallbackCourses: CourseResponse[] = [
    {
      id: "course-1",
      title: "Foundations of Financial Markets & Inflation",
      slug: "financial-markets-foundations",
      level: "beginner",
      description:
        "Understand why inflation erodes savings, how equities protect purchasing power, and difference between debt and equity.",
      order_index: 1,
      lessons_count: 2,
      completed_lessons_count: 0,
      is_locked: false,
    },
    {
      id: "course-2",
      title: "Index Investing, ETFs & Mutual Funds",
      slug: "index-investing-etfs",
      level: "beginner",
      description:
        "Low-cost index investing (Nifty 50), diversified mutual funds, expense ratios, and Systematic Investment Plans (SIP).",
      order_index: 2,
      lessons_count: 2,
      completed_lessons_count: 0,
      is_locked: false,
    },
    {
      id: "course-3",
      title: "Financial Statements & Fundamental Analysis",
      slug: "fundamental-analysis-valuation",
      level: "intermediate",
      description:
        "Learn how to read a balance sheet, understanding P/E (Price to Earnings), P/B, EPS, Return on Equity (ROE), and operating cash flows.",
      order_index: 3,
      lessons_count: 2,
      completed_lessons_count: 0,
      is_locked: false,
    },
  ];

  const fetchCourses = async () => {
    setLoadingCourses(true);
    setErrorMsg(null);
    try {
      const data = await getAcademyCourses();
      if (data && data.length > 0) {
        setCourses(data);
      } else {
        setCourses(fallbackCourses);
      }
    } catch {
      // Offline fallback
      setCourses(fallbackCourses);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleOpenCourse = async (course: CourseResponse) => {
    if (course.is_locked) return;
    setSelectedCourse(course);
    setLoadingLessons(true);
    setErrorMsg(null);
    try {
      const lessonData = await getAcademyLessons(course.id);
      setLessons(lessonData);
      if (lessonData.length > 0) {
        setActiveLesson(lessonData[0]);
        setSelectedOption(null);
        setQuizResult(null);
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to load lessons from server.";
      setErrorMsg(msg);
      // Fallback lesson for offline preview
      const fallbackLesson: LessonResponse = {
        id: "offline-lesson-1",
        course_id: course.id,
        title: "Understanding Inflation & Purchasing Power",
        slug: "inflation-purchasing-power",
        content:
          "Inflation is the rate at which the general level of prices for goods and services rises, eroding purchasing power. Keeping cash in savings accounts earning 3% while inflation is 6% leads to a real loss of -3% annually. Equity assets historically outpace inflation over 5+ year horizons.",
        quiz_question:
          "If bank savings yield 3% interest and annual inflation is 6%, what is your real annual return?",
        quiz_options: ["+3%", "-3% (loss of purchasing power)", "+9%", "0%"],
        order_index: 1,
        is_completed: false,
        score: 0,
      };
      setLessons([fallbackLesson]);
      setActiveLesson(fallbackLesson);
    } finally {
      setLoadingLessons(false);
    }
  };

  const handleSelectLesson = (lesson: LessonResponse) => {
    setActiveLesson(lesson);
    setSelectedOption(null);
    setQuizResult(null);
  };

  const handleQuizSubmit = async () => {
    if (!activeLesson || selectedOption === null) return;
    setIsSubmittingQuiz(true);
    setErrorMsg(null);
    try {
      const result = await submitQuizAnswer(activeLesson.id, selectedOption);
      setQuizResult(result);
      if (result.is_correct) {
        // Update local lesson status
        setLessons((prev) =>
          prev.map((l) => (l.id === activeLesson.id ? { ...l, is_completed: true, score: result.score_awarded } : l))
        );
        // Refresh courses progression
        fetchCourses();
      }
    } catch (err: unknown) {
      // Local evaluation fallback if backend is offline
      const isCorrectFallback = selectedOption === 1;
      setQuizResult({
        lesson_id: activeLesson.id,
        is_correct: isCorrectFallback,
        correct_option_index: 1,
        explanation:
          "Real return = Nominal interest (3%) minus Inflation (6%) = -3%. Holding cash loses real purchasing power.",
        score_awarded: isCorrectFallback ? 100 : 0,
      });
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-purple-600" />
              Stock Market Academy
            </h1>
            <p className="text-xs text-slate-500">
              Structured financial education for micro-entrepreneurs. Educational content strictly decoupled from stock recommendations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="brand" size="md">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> SEBI-Aligned Education
            </Badge>
            <Link href="/portfolio">
              <Button size="sm" variant="outline" className="border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300">
                Open Paper Portfolio
              </Button>
            </Link>
          </div>
        </div>

        {errorMsg && (
          <ErrorBanner
            title="Academy Error"
            message={errorMsg}
            onDismiss={() => setErrorMsg(null)}
          />
        )}

        {/* View Mode: Courses List or Course Reader */}
        {!selectedCourse ? (
          <div>
            {loadingCourses ? (
              <Loading text="Loading structured learning curriculum..." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {courses.map((course) => (
                  <Card key={course.id} hover className="flex flex-col justify-between">
                    <div>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Badge
                            variant={
                              course.level === "beginner"
                                ? "success"
                                : course.level === "intermediate"
                                ? "info"
                                : "warning"
                            }
                            size="sm"
                          >
                            {course.level.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-slate-400 font-mono">
                            {course.completed_lessons_count}/{course.lessons_count || 2} Lessons
                          </span>
                        </div>
                        <CardTitle className="text-base mt-2">{course.title}</CardTitle>
                        <CardDescription className="leading-relaxed text-xs">
                          {course.description}
                        </CardDescription>
                      </CardHeader>
                    </div>

                    <CardFooter>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {course.completed_lessons_count === course.lessons_count && course.lessons_count > 0
                            ? "Completed"
                            : course.is_locked
                            ? "Locked"
                            : "Available"}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant={course.is_locked ? "outline" : "primary"}
                        disabled={course.is_locked}
                        onClick={() => handleOpenCourse(course)}
                        rightIcon={
                          course.is_locked ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowRight className="w-3.5 h-3.5" />
                          )
                        }
                      >
                        {course.is_locked ? "Locked" : "Start Course"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Course Lesson Reader & Interactive Quiz View */
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedCourse(null);
                    setActiveLesson(null);
                  }}
                >
                  ← Back to Courses
                </Button>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedCourse.title}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {lessons.length} Lessons in this module
                  </p>
                </div>
              </div>
              <Badge variant="brand" size="sm">
                Interactive Learning
              </Badge>
            </div>

            {loadingLessons ? (
              <Loading text="Loading lessons and quiz modules..." />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Lessons Sidebar */}
                <div className="lg:col-span-4 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
                    Lesson Modules
                  </h4>
                  <div className="space-y-1.5">
                    {lessons.map((lesson, idx) => (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => handleSelectLesson(lesson)}
                        className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between ${
                          activeLesson?.id === lesson.id
                            ? "bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200 font-medium"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {lesson.is_completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center text-[10px] shrink-0 font-semibold">
                              {idx + 1}
                            </span>
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lesson Content & Interactive Quiz Panel */}
                <div className="lg:col-span-8 space-y-5">
                  {activeLesson ? (
                    <>
                      {/* Lesson Content Card */}
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <Badge variant="brand" size="sm">
                              Lesson {activeLesson.order_index}
                            </Badge>
                            {activeLesson.is_completed && (
                              <Badge variant="success" size="sm">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Completed (+{activeLesson.score} pts)
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg mt-2">{activeLesson.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="prose dark:prose-invert text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                            {activeLesson.content}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Deterministic Quiz Component */}
                      <Card className="border-purple-200 dark:border-purple-900/50">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2 text-purple-900 dark:text-purple-300">
                            <HelpCircle className="w-4 h-4" /> Comprehension Check Quiz
                          </CardTitle>
                          <CardDescription className="text-xs">
                            Answer deterministically to test your understanding and unlock course progress.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">
                            {activeLesson.quiz_question}
                          </p>

                          <div className="space-y-2">
                            {activeLesson.quiz_options.map((option, optIdx) => (
                              <label
                                key={optIdx}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all text-xs ${
                                  selectedOption === optIdx
                                    ? "bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-900 dark:text-purple-200 font-medium"
                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="quiz-option"
                                  checked={selectedOption === optIdx}
                                  onChange={() => setSelectedOption(optIdx)}
                                  className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>

                          {/* Instant Deterministic Grading Result */}
                          {quizResult && (
                            <div
                              className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                                quizResult.is_correct
                                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                                  : "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200"
                              }`}
                            >
                              <div className="flex items-center gap-2 font-bold">
                                {quizResult.is_correct ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>Correct! +{quizResult.score_awarded} Points Awarded</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-4 h-4 text-rose-600" />
                                    <span>Incorrect Answer</span>
                                  </>
                                )}
                              </div>
                              <p className="leading-relaxed">{quizResult.explanation}</p>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            disabled={selectedOption === null || isSubmittingQuiz}
                            onClick={handleQuizSubmit}
                          >
                            {isSubmittingQuiz ? "Evaluating..." : "Submit Answer"}
                          </Button>
                        </CardFooter>
                      </Card>
                    </>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-xl">
                      Select a lesson from the list to begin learning.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

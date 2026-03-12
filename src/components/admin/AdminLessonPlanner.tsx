import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, isToday, isPast, isFuture } from "date-fns";
import { ChevronLeft, ChevronRight, User, BookOpen, Clock, CalendarDays, X, GraduationCap, FileText, ChevronDown, Users } from "lucide-react";

interface LessonWithTeacher {
  id: string;
  teacher_email: string;
  teacher_name: string;
  lesson_date: string;
  period_number: number;
  class_name: string;
  subject: string;
  topic: string;
  notes: string | null;
  color: string | null;
}

const TEACHER_COLORS = [
  "hsl(235,78%,58%)", "hsl(340,72%,52%)", "hsl(160,55%,40%)", "hsl(25,90%,52%)",
  "hsl(200,80%,48%)", "hsl(270,65%,55%)", "hsl(45,90%,48%)", "hsl(180,60%,40%)",
];

const AdminLessonPlanner = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lessons, setLessons] = useState<LessonWithTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");
  const [teachers, setTeachers] = useState<{ email: string; name: string }[]>([]);
  const [detailLesson, setDetailLesson] = useState<LessonWithTeacher | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [lessonsRes, teachersRes] = await Promise.all([
      supabase.from("lesson_plans").select("*").order("lesson_date", { ascending: true }),
      supabase.from("teacher_accounts").select("email, first_name, last_name").eq("status", "approved"),
    ]);
    const teacherMap: Record<string, string> = {};
    if (teachersRes.data) {
      teachersRes.data.forEach((t: any) => { teacherMap[t.email] = `${t.first_name} ${t.last_name}`; });
      setTeachers(teachersRes.data.map((t: any) => ({ email: t.email, name: `${t.first_name} ${t.last_name}` })));
    }
    if (lessonsRes.data) {
      setLessons((lessonsRes.data as any[]).map((l) => ({ ...l, teacher_name: teacherMap[l.teacher_email] || l.teacher_email })));
    }
    setLoading(false);
  };

  const getTeacherColor = (email: string) => {
    const idx = teachers.findIndex((t) => t.email === email);
    return TEACHER_COLORS[idx % TEACHER_COLORS.length] || TEACHER_COLORS[0];
  };

  const filteredLessons = useMemo(
    () => (selectedTeacher === "all" ? lessons : lessons.filter((l) => l.teacher_email === selectedTeacher)),
    [lessons, selectedTeacher]
  );

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = useMemo(() => Array.from({ length: 6 }, (_, i) => addDays(weekStart, i)), [weekStart.toISOString()]);

  const getLessonsForDate = (date: Date) =>
    filteredLessons.filter((l) => l.lesson_date === format(date, "yyyy-MM-dd")).sort((a, b) => a.period_number - b.period_number);

  const totalLessons = filteredLessons.length;
  const totalTeachersActive = new Set(filteredLessons.map((l) => l.teacher_email)).size;

  return (
    <div className="px-3 sm:px-6 pb-6">
      {/* ── Top Summary Bar ── */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <div className="p-3.5 rounded-2xl bg-primary/8 border border-primary/15">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
              <CalendarDays size={14} className="text-primary" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Lessons</span>
          </div>
          <div className="text-2xl font-black text-primary">{totalLessons}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-accent border border-accent-foreground/10">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-accent-foreground/10 flex items-center justify-center">
              <Users size={14} className="text-accent-foreground" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Teachers</span>
          </div>
          <div className="text-2xl font-black text-accent-foreground">{totalTeachersActive}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-secondary/8 border border-secondary/15">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-secondary/15 flex items-center justify-center">
              <Clock size={14} className="text-secondary" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">This Week</span>
          </div>
          <div className="text-2xl font-black text-secondary">
            {weekDays.reduce((acc, d) => acc + getLessonsForDate(d).length, 0)}
          </div>
        </div>
      </div>

      {/* ── Teacher Filter Chips ── */}
      <div className="mb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedTeacher("all")}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
              selectedTeacher === "all"
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-card border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            All Teachers
          </button>
          {teachers.map((t, i) => {
            const isActive = selectedTeacher === t.email;
            const color = TEACHER_COLORS[i % TEACHER_COLORS.length];
            const count = lessons.filter((l) => l.teacher_email === t.email).length;
            return (
              <button
                key={t.email}
                onClick={() => setSelectedTeacher(isActive ? "all" : t.email)}
                className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold transition-all border ${
                  isActive
                    ? "border-primary/40 shadow-md"
                    : "bg-card border-border text-foreground hover:border-primary/30"
                }`}
                style={isActive ? { backgroundColor: color + "18", borderColor: color + "50" } : {}}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                  style={{ backgroundColor: color }}
                >
                  {t.name.charAt(0)}
                </div>
                <span>{t.name}</span>
                <span className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md text-[9px]">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Week Navigation ── */}
      <div className="flex items-center justify-between mb-4 p-3 rounded-2xl bg-card border border-border shadow-sm">
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-[0.97]">
            Today
          </button>
          <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="text-right">
          <div className="text-sm sm:text-base font-black text-foreground">{format(weekStart, "MMMM yyyy")}</div>
          <div className="text-[11px] text-muted-foreground font-medium">{format(weekStart, "MMM d")} – {format(weekEnd, "MMM d")}</div>
        </div>
      </div>

      {/* ── Day-by-Day Lesson List ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2.5">
          {weekDays.map((day) => {
            const dayLessons = getLessonsForDate(day);
            const today = isToday(day);
            const dateKey = format(day, "yyyy-MM-dd");
            const isExpanded = expandedDay === null || expandedDay === dateKey || today;
            const dayHasLessons = dayLessons.length > 0;

            return (
              <div
                key={day.toISOString()}
                className={`rounded-2xl border overflow-hidden transition-all ${
                  today
                    ? "border-primary/30 shadow-[0_4px_24px_-6px_hsl(var(--primary)/0.15)]"
                    : "border-border"
                } bg-card`}
              >
                {/* Day Header Row */}
                <button
                  onClick={() => setExpandedDay(expandedDay === dateKey ? null : dateKey)}
                  className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                    today ? "bg-primary/6" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Date block */}
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center ${
                      today ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-foreground"
                    }`}>
                      <span className="text-[9px] font-bold uppercase leading-none">{format(day, "EEE")}</span>
                      <span className="text-lg font-black leading-tight">{format(day, "d")}</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground text-left">{format(day, "EEEE")}</div>
                      <div className="text-[11px] text-muted-foreground">{format(day, "MMMM d, yyyy")}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {dayHasLessons && (
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        today ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        {dayLessons.length} lesson{dayLessons.length !== 1 ? "s" : ""}
                      </span>
                    )}
                    <ChevronDown size={16} className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {/* Expanded Lessons */}
                {isExpanded && (
                  <div className="border-t border-border">
                    {dayHasLessons ? (
                      <div className="divide-y divide-border">
                        {dayLessons.map((lesson) => {
                          const tColor = lesson.color || getTeacherColor(lesson.teacher_email);
                          return (
                            <div
                              key={lesson.id}
                              onClick={() => setDetailLesson(lesson)}
                              className="flex items-stretch cursor-pointer hover:bg-muted/30 transition-colors group"
                            >
                              {/* Color accent */}
                              <div className="w-1.5 shrink-0" style={{ backgroundColor: tColor }} />

                              {/* Period column */}
                              <div className="w-20 sm:w-24 shrink-0 flex flex-col items-center justify-center py-3 border-r border-border bg-muted/20">
                                <Clock size={13} className="text-muted-foreground mb-0.5" />
                                <span className="text-xs font-black text-foreground">P{lesson.period_number}</span>
                                <span className="text-[9px] text-muted-foreground">Period {lesson.period_number}</span>
                              </div>

                              {/* Main content */}
                              <div className="flex-1 px-4 py-3 min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    {/* Topic - most prominent */}
                                    <h4 className="text-sm font-bold text-foreground mb-1.5 leading-snug group-hover:text-primary transition-colors">
                                      📘 {lesson.topic}
                                    </h4>

                                    {/* Info chips */}
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[10px] font-bold text-foreground">
                                        <GraduationCap size={10} className="text-muted-foreground" />
                                        {lesson.class_name}
                                      </span>
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[10px] font-bold text-foreground">
                                        <BookOpen size={10} className="text-muted-foreground" />
                                        {lesson.subject}
                                      </span>
                                      {lesson.notes && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent text-[10px] font-medium text-accent-foreground">
                                          <FileText size={9} />
                                          Has notes
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Teacher avatar */}
                                  <div className="flex items-center gap-2 shrink-0">
                                    <div className="text-right hidden sm:block">
                                      <div className="text-[11px] font-bold text-foreground">{lesson.teacher_name}</div>
                                      <div className="text-[9px] text-muted-foreground">Teacher</div>
                                    </div>
                                    <div
                                      className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-sm"
                                      style={{ backgroundColor: tColor }}
                                    >
                                      {lesson.teacher_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-6 text-muted-foreground/50">
                        <CalendarDays size={16} strokeWidth={1.5} className="mr-2" />
                        <span className="text-xs font-medium">No lessons scheduled</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Lesson Detail Modal ── */}
      {detailLesson && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setDetailLesson(null)}>
          <div
            className="bg-card w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl border border-border shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "slideUp 0.35s ease forwards" }}
          >
            {/* Header with accent */}
            <div className="relative">
              <div className="h-2 w-full" style={{ backgroundColor: detailLesson.color || getTeacherColor(detailLesson.teacher_email) }} />
              <div className="p-5 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-black text-white shadow-lg"
                      style={{ backgroundColor: detailLesson.color || getTeacherColor(detailLesson.teacher_email) }}
                    >
                      {detailLesson.teacher_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-base font-bold text-foreground">{detailLesson.teacher_name}</div>
                      <div className="text-xs text-muted-foreground">{detailLesson.teacher_email}</div>
                    </div>
                  </div>
                  <button onClick={() => setDetailLesson(null)} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-destructive/10 transition-colors">
                    <X size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-5 pb-6 space-y-5">
              {/* Topic highlight */}
              <div className="p-4 rounded-2xl border border-border" style={{ backgroundColor: (detailLesson.color || getTeacherColor(detailLesson.teacher_email)) + "08" }}>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">📘 Lesson Topic</div>
                <div className="text-base font-bold text-foreground">{detailLesson.topic}</div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3">
                <InfoCard icon={<CalendarDays size={16} />} label="Date" value={format(new Date(detailLesson.lesson_date + "T00:00:00"), "EEEE")} sub={format(new Date(detailLesson.lesson_date + "T00:00:00"), "MMM d, yyyy")} />
                <InfoCard icon={<Clock size={16} />} label="Period" value={`Period ${detailLesson.period_number}`} sub={`Slot #${detailLesson.period_number} of 8`} />
                <InfoCard icon={<GraduationCap size={16} />} label="Class" value={detailLesson.class_name} sub="Assigned Class" />
                <InfoCard icon={<BookOpen size={16} />} label="Subject" value={detailLesson.subject} sub="Subject Area" />
              </div>

              {/* Notes */}
              {detailLesson.notes && (
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText size={11} /> Teacher Notes
                  </div>
                  <div className="text-sm text-foreground bg-muted/40 p-4 rounded-2xl border border-border leading-relaxed">{detailLesson.notes}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoCard = ({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) => (
  <div className="p-3 rounded-2xl bg-muted/40 border border-border">
    <div className="flex items-center gap-1.5 mb-2">
      <span className="text-primary">{icon}</span>
      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-sm font-bold text-foreground">{value}</div>
    <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>
  </div>
);

export default AdminLessonPlanner;

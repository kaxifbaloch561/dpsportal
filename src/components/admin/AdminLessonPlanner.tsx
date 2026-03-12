import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, X, Clock, BookOpen, GraduationCap, CalendarDays, FileText, Users } from "lucide-react";

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
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart.toISOString()]);

  const getLessonsForDate = (date: Date) =>
    filteredLessons.filter((l) => l.lesson_date === format(date, "yyyy-MM-dd")).sort((a, b) => a.period_number - b.period_number);

  const totalWeekLessons = weekDays.reduce((acc, d) => acc + getLessonsForDate(d).length, 0);
  const activeTeachers = new Set(filteredLessons.map((l) => l.teacher_email)).size;

  return (
    <div className="px-3 sm:px-6 pb-6">
      {/* ── Header Row ── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:shadow-md transition-all">
            Today
          </button>
          <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
            <ChevronRight size={16} />
          </button>
          <div className="ml-2">
            <div className="text-sm font-black text-foreground">{format(weekStart, "MMMM yyyy")}</div>
            <div className="text-[10px] text-muted-foreground">{format(weekStart, "MMM d")} – {format(addDays(weekStart, 6), "MMM d")}</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/8 border border-primary/15">
            <CalendarDays size={13} className="text-primary" />
            <span className="text-xs font-bold text-primary">{totalWeekLessons}</span>
            <span className="text-[10px] text-muted-foreground">lessons</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent border border-border">
            <Users size={13} className="text-accent-foreground" />
            <span className="text-xs font-bold text-accent-foreground">{activeTeachers}</span>
            <span className="text-[10px] text-muted-foreground">teachers</span>
          </div>
        </div>
      </div>

      {/* ── Teacher Filter ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none mb-4">
        <button
          onClick={() => setSelectedTeacher("all")}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
            selectedTeacher === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card border-border text-muted-foreground hover:border-primary/30"
          }`}
        >
          All
        </button>
        {teachers.map((t, i) => {
          const isActive = selectedTeacher === t.email;
          const color = TEACHER_COLORS[i % TEACHER_COLORS.length];
          return (
            <button
              key={t.email}
              onClick={() => setSelectedTeacher(isActive ? "all" : t.email)}
              className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                isActive ? "shadow-sm" : "bg-card border-border text-foreground hover:border-primary/30"
              }`}
              style={isActive ? { backgroundColor: color + "15", borderColor: color + "40", color } : {}}
            >
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white" style={{ backgroundColor: color }}>
                {t.name.charAt(0)}
              </div>
              {t.name.split(" ")[0]}
            </button>
          );
        })}
      </div>

      {/* ── Weekly Timeline ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-9 h-9 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {weekDays.map((day) => {
            const dayLessons = getLessonsForDate(day);
            const today = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`flex items-stretch rounded-2xl border transition-all overflow-hidden ${
                  today ? "border-primary/30 bg-primary/[0.03] shadow-[0_2px_16px_-4px_hsl(var(--primary)/0.12)]" : "border-border bg-card"
                }`}
              >
                {/* Day Label - Fixed left column */}
                <div className={`w-[72px] sm:w-[88px] shrink-0 flex flex-col items-center justify-center py-3 border-r ${
                  today ? "border-primary/20 bg-primary/[0.06]" : "border-border bg-muted/30"
                }`}>
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${today ? "text-primary" : "text-muted-foreground"}`}>
                    {format(day, "EEE")}
                  </span>
                  <span className={`text-xl font-black leading-tight ${today ? "text-primary" : "text-foreground"}`}>
                    {format(day, "d")}
                  </span>
                  <span className="text-[8px] text-muted-foreground mt-0.5">{format(day, "MMM")}</span>
                </div>

                {/* Lessons - Horizontal scroll */}
                <div className="flex-1 min-w-0 overflow-x-auto scrollbar-none">
                  {dayLessons.length > 0 ? (
                    <div className="flex items-stretch gap-2 p-2.5 min-h-[80px]">
                      {dayLessons.map((lesson) => {
                        const tColor = lesson.color || getTeacherColor(lesson.teacher_email);
                        return (
                          <div
                            key={lesson.id}
                            onClick={() => setDetailLesson(lesson)}
                            className="shrink-0 w-[200px] sm:w-[230px] rounded-xl border border-border bg-card cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group relative overflow-hidden"
                          >
                            {/* Top color bar */}
                            <div className="h-1 w-full" style={{ backgroundColor: tColor }} />

                            <div className="p-2.5">
                              {/* Period + Teacher row */}
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black" style={{ backgroundColor: tColor + "15", color: tColor }}>
                                  <Clock size={9} />
                                  P{lesson.period_number}
                                </span>
                                <div className="flex items-center gap-1">
                                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white" style={{ backgroundColor: tColor }}>
                                    {lesson.teacher_name.charAt(0)}
                                  </div>
                                  <span className="text-[9px] font-semibold text-muted-foreground max-w-[70px] truncate">
                                    {lesson.teacher_name.split(" ")[0]}
                                  </span>
                                </div>
                              </div>

                              {/* Topic */}
                              <h4 className="text-[11px] sm:text-xs font-bold text-foreground leading-tight mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
                                {lesson.topic}
                              </h4>

                              {/* Class + Subject */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                  <GraduationCap size={8} /> {lesson.class_name}
                                </span>
                                <span className="inline-flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                  <BookOpen size={8} /> {lesson.subject}
                                </span>
                                {lesson.notes && <FileText size={9} className="text-accent-foreground" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center h-full min-h-[60px] px-4">
                      <span className="text-[11px] text-muted-foreground/40 font-medium">No lessons scheduled</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Detail Modal ── */}
      {detailLesson && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setDetailLesson(null)}>
          <div
            className="bg-card w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl border border-border shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "slideUp 0.3s ease forwards" }}
          >
            {/* Color bar */}
            <div className="h-1.5 w-full" style={{ backgroundColor: detailLesson.color || getTeacherColor(detailLesson.teacher_email) }} />

            {/* Header */}
            <div className="p-5 pb-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black text-white shadow-md"
                  style={{ backgroundColor: detailLesson.color || getTeacherColor(detailLesson.teacher_email) }}
                >
                  {detailLesson.teacher_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">{detailLesson.teacher_name}</div>
                  <div className="text-[10px] text-muted-foreground">{detailLesson.teacher_email}</div>
                </div>
              </div>
              <button onClick={() => setDetailLesson(null)} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-destructive/10 transition-colors">
                <X size={14} />
              </button>
            </div>

            {/* Topic */}
            <div className="px-5 mb-4">
              <div className="p-3.5 rounded-xl border border-border" style={{ backgroundColor: (detailLesson.color || getTeacherColor(detailLesson.teacher_email)) + "08" }}>
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Lesson Topic</div>
                <div className="text-sm font-bold text-foreground">{detailLesson.topic}</div>
              </div>
            </div>

            {/* Details grid */}
            <div className="px-5 pb-4 grid grid-cols-2 gap-2">
              <DetailItem icon={<CalendarDays size={14} />} label="Date" value={format(new Date(detailLesson.lesson_date + "T00:00:00"), "EEE, MMM d")} />
              <DetailItem icon={<Clock size={14} />} label="Period" value={`Period ${detailLesson.period_number}`} />
              <DetailItem icon={<GraduationCap size={14} />} label="Class" value={detailLesson.class_name} />
              <DetailItem icon={<BookOpen size={14} />} label="Subject" value={detailLesson.subject} />
            </div>

            {/* Notes */}
            {detailLesson.notes && (
              <div className="px-5 pb-5">
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <FileText size={10} /> Notes
                </div>
                <div className="text-xs text-foreground bg-muted/40 p-3 rounded-xl border border-border leading-relaxed">{detailLesson.notes}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="p-2.5 rounded-xl bg-muted/40 border border-border">
    <div className="flex items-center gap-1 mb-1">
      <span className="text-primary">{icon}</span>
      <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-xs font-bold text-foreground">{value}</div>
  </div>
);

export default AdminLessonPlanner;

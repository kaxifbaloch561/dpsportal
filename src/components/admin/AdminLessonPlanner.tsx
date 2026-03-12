import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, User, BookOpen, Clock, Filter, CalendarDays, X } from "lucide-react";

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
  const totalTeachersWithLessons = new Set(filteredLessons.map((l) => l.teacher_email)).size;

  return (
    <div className="px-3 sm:px-6 pb-6">
      {/* Header with stats */}
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <CalendarDays size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-foreground">Lesson Plans Overview</h2>
            <p className="text-xs text-muted-foreground">
              {totalTeachersWithLessons} teacher{totalTeachersWithLessons !== 1 ? "s" : ""} • {totalLessons} lesson{totalLessons !== 1 ? "s" : ""} scheduled
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {teachers.slice(0, 4).map((t) => {
            const count = lessons.filter((l) => l.teacher_email === t.email).length;
            const isSelected = selectedTeacher === t.email;
            return (
              <button
                key={t.email}
                onClick={() => setSelectedTeacher(isSelected ? "all" : t.email)}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all duration-200 text-left ${
                  isSelected
                    ? "bg-primary/10 border-primary/30 shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.2)]"
                    : "bg-card border-border hover:border-primary/20 hover:shadow-md"
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black ${
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {t.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-foreground truncate">{t.name}</div>
                  <div className="text-[10px] text-muted-foreground">{count} lesson{count !== 1 ? "s" : ""}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Controls bar */}
        <div className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-muted/60 border border-border">
          <div className="flex items-center gap-1.5">
            <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="w-8 h-8 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-all">
              <ChevronLeft size={15} />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-[11px] font-bold shadow-sm hover:shadow-md transition-all">
              Today
            </button>
            <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="w-8 h-8 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-all">
              <ChevronRight size={15} />
            </button>
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-foreground">
            {format(weekStart, "MMM d")} — {format(weekEnd, "MMM d, yyyy")}
          </h3>
          {selectedTeacher !== "all" && (
            <button
              onClick={() => setSelectedTeacher("all")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20 transition-colors"
            >
              <Filter size={10} /> {teachers.find((t) => t.email === selectedTeacher)?.name}
              <X size={10} />
            </button>
          )}
        </div>
      </div>

      {/* Weekly Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-9 h-9 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {weekDays.map((day) => {
            const dayLessons = getLessonsForDate(day);
            const today = isToday(day);
            return (
              <div
                key={day.toISOString()}
                className={`rounded-2xl border overflow-hidden transition-all ${
                  today ? "border-primary/40 ring-2 ring-primary/10" : "border-border"
                } bg-card`}
              >
                {/* Day header */}
                <div className={`px-3 py-2.5 ${today ? "bg-primary" : "bg-muted/70"}`}>
                  <div className={`text-[10px] font-bold uppercase tracking-widest ${today ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {format(day, "EEEE")}
                  </div>
                  <div className={`text-xl font-black leading-tight ${today ? "text-primary-foreground" : "text-foreground"}`}>
                    {format(day, "d")}
                  </div>
                </div>

                {/* Lessons list */}
                <div className="p-2 space-y-1.5 min-h-[120px] sm:min-h-[200px]">
                  {dayLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      onClick={() => setDetailLesson(lesson)}
                      className="rounded-xl p-2.5 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-transparent hover:border-primary/15"
                      style={{
                        background: `linear-gradient(135deg, ${lesson.color || "hsl(235,78%,62%)"}12, ${lesson.color || "hsl(235,78%,62%)"}06)`,
                        borderLeft: `3px solid ${lesson.color || "hsl(235,78%,62%)"}`,
                      }}
                    >
                      {/* Teacher name badge */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black text-white"
                          style={{ backgroundColor: lesson.color || "hsl(235,78%,62%)" }}
                        >
                          {lesson.teacher_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[10px] font-bold text-primary truncate">{lesson.teacher_name}</span>
                      </div>

                      {/* Period badge */}
                      <div className="flex items-center gap-1 mb-1">
                        <Clock size={9} className="text-muted-foreground" />
                        <span className="text-[9px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">Period {lesson.period_number}</span>
                      </div>

                      {/* Topic */}
                      <div className="text-[11px] sm:text-xs font-bold text-foreground leading-snug">{lesson.topic}</div>

                      {/* Class & Subject */}
                      <div className="flex items-center gap-1 mt-1">
                        <BookOpen size={9} className="text-muted-foreground" />
                        <span className="text-[9px] text-muted-foreground">{lesson.class_name} • {lesson.subject}</span>
                      </div>
                    </div>
                  ))}
                  {dayLessons.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 sm:py-10 text-muted-foreground/40">
                      <CalendarDays size={20} strokeWidth={1.5} />
                      <span className="text-[10px] mt-1.5 font-medium">No lessons</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lesson Detail Drawer */}
      {detailLesson && (
        <div className="fixed inset-0 z-[200] bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setDetailLesson(null)}>
          <div
            className="bg-card w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl border border-border shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "slideUp 0.35s ease forwards" }}
          >
            {/* Colored header */}
            <div className="p-5 pb-4" style={{ background: `linear-gradient(135deg, ${detailLesson.color || "hsl(235,78%,62%)"}25, ${detailLesson.color || "hsl(235,78%,62%)"}08)` }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-black text-white shadow-md"
                    style={{ backgroundColor: detailLesson.color || "hsl(235,78%,62%)" }}
                  >
                    {detailLesson.teacher_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{detailLesson.teacher_name}</div>
                    <div className="text-xs text-muted-foreground">{detailLesson.teacher_email}</div>
                  </div>
                </div>
                <button onClick={() => setDetailLesson(null)} className="w-8 h-8 rounded-xl bg-card/80 border border-border flex items-center justify-center hover:bg-destructive/10 transition-colors">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Details grid */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <DetailItem icon={<CalendarDays size={14} />} label="Date" value={format(new Date(detailLesson.lesson_date + "T00:00:00"), "EEE, MMM d yyyy")} />
                <DetailItem icon={<Clock size={14} />} label="Period" value={`Period ${detailLesson.period_number}`} />
                <DetailItem icon={<User size={14} />} label="Class" value={detailLesson.class_name} />
                <DetailItem icon={<BookOpen size={14} />} label="Subject" value={detailLesson.subject} />
              </div>

              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Topic</div>
                <div className="text-sm font-bold text-foreground bg-muted/50 p-3 rounded-xl border border-border">{detailLesson.topic}</div>
              </div>

              {detailLesson.notes && (
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Notes</div>
                  <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border leading-relaxed">{detailLesson.notes}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="p-2.5 rounded-xl bg-muted/40 border border-border">
    <div className="flex items-center gap-1.5 mb-1">
      <span className="text-primary">{icon}</span>
      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-xs font-bold text-foreground">{value}</div>
  </div>
);

export default AdminLessonPlanner;

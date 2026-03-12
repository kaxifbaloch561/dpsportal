import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, startOfMonth, endOfMonth, addMonths, subMonths, eachDayOfInterval, isSameDay, isSameMonth, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, LayoutGrid, User, BookOpen, Clock, Search } from "lucide-react";

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

const COLORS_FALLBACK = "hsl(235,78%,62%)";

const AdminLessonPlanner = () => {
  const [view, setView] = useState<"week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lessons, setLessons] = useState<LessonWithTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");
  const [teachers, setTeachers] = useState<{ email: string; name: string }[]>([]);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [lessonsRes, teachersRes] = await Promise.all([
      supabase.from("lesson_plans").select("*").order("lesson_date", { ascending: true }),
      supabase.from("teacher_accounts").select("email, first_name, last_name").eq("status", "approved"),
    ]);

    const teacherMap: Record<string, string> = {};
    if (teachersRes.data) {
      teachersRes.data.forEach((t: any) => {
        teacherMap[t.email] = `${t.first_name} ${t.last_name}`;
      });
      setTeachers(teachersRes.data.map((t: any) => ({ email: t.email, name: `${t.first_name} ${t.last_name}` })));
    }

    if (lessonsRes.data) {
      setLessons(
        (lessonsRes.data as any[]).map((l) => ({
          ...l,
          teacher_name: teacherMap[l.teacher_email] || l.teacher_email,
        }))
      );
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

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = useMemo(
    () => eachDayOfInterval({ start: startOfWeek(monthStart, { weekStartsOn: 1 }), end: endOfWeek(monthEnd, { weekStartsOn: 1 }) }),
    [monthStart.toISOString()]
  );

  const getLessonsForDate = (date: Date) =>
    filteredLessons.filter((l) => l.lesson_date === format(date, "yyyy-MM-dd")).sort((a, b) => a.period_number - b.period_number);

  const navigatePrev = () => setCurrentDate(view === "week" ? subWeeks(currentDate, 1) : subMonths(currentDate, 1));
  const navigateNext = () => setCurrentDate(view === "week" ? addWeeks(currentDate, 1) : addMonths(currentDate, 1));

  return (
    <div className="px-3 sm:px-6 pb-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
        <div className="flex items-center gap-1.5">
          <button onClick={navigatePrev} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 rounded-xl bg-muted text-xs font-bold hover:bg-primary/10 transition-colors">
            Today
          </button>
          <button onClick={navigateNext} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
            <ChevronRight size={16} />
          </button>
          <h3 className="text-sm sm:text-base font-bold text-foreground ml-2">
            {view === "week" ? `${format(weekStart, "MMM d")} — ${format(weekEnd, "MMM d, yyyy")}` : format(currentDate, "MMMM yyyy")}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Teacher filter */}
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-muted border-none text-xs font-bold text-foreground focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="all">All Teachers</option>
            {teachers.map((t) => (
              <option key={t.email} value={t.email}>{t.name}</option>
            ))}
          </select>
          <div className="flex bg-muted rounded-xl p-0.5">
            <button
              onClick={() => setView("week")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === "week" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
            >
              <CalendarIcon size={13} className="inline mr-1" />Week
            </button>
            <button
              onClick={() => setView("month")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === "month" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid size={13} className="inline mr-1" />Month
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : view === "week" ? (
        <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
          {weekDays.map((day) => {
            const dayLessons = getLessonsForDate(day);
            const today = isToday(day);
            return (
              <div
                key={day.toISOString()}
                className={`rounded-2xl border p-2 sm:p-3 min-h-[180px] sm:min-h-[280px] transition-all ${today ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}
              >
                <div className="mb-2">
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${today ? "text-primary" : "text-muted-foreground"}`}>
                    {format(day, "EEE")}
                  </div>
                  <div className={`text-lg sm:text-xl font-black ${today ? "text-primary" : "text-foreground"}`}>
                    {format(day, "d")}
                  </div>
                </div>
                <div className="space-y-1.5">
                  {dayLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                      className="group relative rounded-xl p-2 cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                      style={{ backgroundColor: (lesson.color || COLORS_FALLBACK) + "18", borderLeft: `3px solid ${lesson.color || COLORS_FALLBACK}` }}
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <User size={9} className="text-muted-foreground" />
                        <span className="text-[8px] sm:text-[9px] font-bold text-primary truncate">{lesson.teacher_name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-muted-foreground">P{lesson.period_number}</span>
                      </div>
                      <div className="text-[10px] sm:text-xs font-bold text-foreground leading-tight truncate">{lesson.topic}</div>
                      <div className="text-[9px] text-muted-foreground truncate">{lesson.class_name} • {lesson.subject}</div>
                      {expandedLesson === lesson.id && lesson.notes && (
                        <div className="mt-1.5 pt-1.5 border-t border-border text-[9px] text-muted-foreground">{lesson.notes}</div>
                      )}
                    </div>
                  ))}
                  {dayLessons.length === 0 && (
                    <div className="text-[10px] text-muted-foreground/50 text-center py-4">No lessons</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="text-[10px] font-bold text-muted-foreground text-center py-1 uppercase tracking-wider">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {monthDays.map((day) => {
              const dayLessons = getLessonsForDate(day);
              const today = isToday(day);
              const inMonth = isSameMonth(day, currentDate);
              return (
                <div
                  key={day.toISOString()}
                  className={`rounded-xl border p-1.5 min-h-[70px] sm:min-h-[100px] transition-all ${
                    today ? "border-primary/40 bg-primary/5" : inMonth ? "border-border bg-card" : "border-transparent bg-muted/30"
                  }`}
                >
                  <div className={`text-[10px] sm:text-xs font-bold mb-1 ${today ? "text-primary" : inMonth ? "text-foreground" : "text-muted-foreground/50"}`}>
                    {format(day, "d")}
                  </div>
                  <div className="space-y-0.5">
                    {dayLessons.slice(0, 2).map((lesson) => (
                      <div
                        key={lesson.id}
                        onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                        className="rounded-md px-1 py-0.5 text-[7px] sm:text-[8px] font-bold truncate text-white cursor-pointer"
                        style={{ backgroundColor: lesson.color || COLORS_FALLBACK }}
                        title={`${lesson.teacher_name} — ${lesson.topic}`}
                      >
                        {lesson.teacher_name.split(" ")[0]}: {lesson.topic}
                      </div>
                    ))}
                    {dayLessons.length > 2 && (
                      <div className="text-[7px] text-muted-foreground font-bold text-center">+{dayLessons.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats summary */}
      {!loading && (
        <div className="mt-4 p-4 rounded-2xl bg-muted/50 border border-border">
          <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
            <BookOpen size={14} className="text-primary" /> Teachers' Lesson Summary
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {teachers.map((t) => {
              const count = lessons.filter((l) => l.teacher_email === t.email).length;
              if (count === 0) return null;
              return (
                <div key={t.email} className="flex items-center gap-2 p-2 rounded-xl bg-card border border-border">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User size={14} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-foreground truncate">{t.name}</div>
                    <div className="text-[10px] text-muted-foreground">{count} lesson{count !== 1 ? "s" : ""} planned</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLessonPlanner;

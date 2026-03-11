import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, startOfMonth, endOfMonth, addMonths, subMonths, eachDayOfInterval, isSameDay, isSameMonth, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, LayoutGrid, Trash2, Edit3, Clock, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface LessonPlan {
  id: string;
  teacher_email: string;
  lesson_date: string;
  period_number: number;
  class_name: string;
  subject: string;
  topic: string;
  notes: string | null;
  color: string | null;
}

const PERIOD_LABELS = Array.from({ length: 8 }, (_, i) => `Period ${i + 1}`);

const COLORS = [
  "hsl(235,78%,62%)", "hsl(340,80%,55%)", "hsl(160,60%,38%)", "hsl(45,95%,52%)",
  "hsl(200,85%,50%)", "hsl(270,72%,55%)", "hsl(20,85%,52%)", "hsl(350,72%,52%)",
];

const LessonPlannerPage = () => {
  const { user } = useAuth();
  const [view, setView] = useState<"week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lessons, setLessons] = useState<LessonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonPlan | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Form state
  const [formDate, setFormDate] = useState("");
  const [formPeriod, setFormPeriod] = useState(1);
  const [formClass, setFormClass] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formTopic, setFormTopic] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formColor, setFormColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    fetchLessons();
  }, [user?.email]);

  const fetchLessons = async () => {
    if (!user?.email) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("lesson_plans")
      .select("*")
      .eq("teacher_email", user.email)
      .order("lesson_date", { ascending: true });
    if (!error && data) setLessons(data as LessonPlan[]);
    setLoading(false);
  };

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = useMemo(() => Array.from({ length: 6 }, (_, i) => addDays(weekStart, i)), [weekStart.toISOString()]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = useMemo(() => eachDayOfInterval({ start: startOfWeek(monthStart, { weekStartsOn: 1 }), end: endOfWeek(monthEnd, { weekStartsOn: 1 }) }), [monthStart.toISOString()]);

  const getLessonsForDate = (date: Date) =>
    lessons.filter((l) => l.lesson_date === format(date, "yyyy-MM-dd")).sort((a, b) => a.period_number - b.period_number);

  const openAddForm = (date?: Date) => {
    setEditingLesson(null);
    setFormDate(format(date || new Date(), "yyyy-MM-dd"));
    setFormPeriod(1);
    setFormClass("");
    setFormSubject("");
    setFormTopic("");
    setFormNotes("");
    setFormColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    setShowForm(true);
  };

  const openEditForm = (lesson: LessonPlan) => {
    setEditingLesson(lesson);
    setFormDate(lesson.lesson_date);
    setFormPeriod(lesson.period_number);
    setFormClass(lesson.class_name);
    setFormSubject(lesson.subject);
    setFormTopic(lesson.topic);
    setFormNotes(lesson.notes || "");
    setFormColor(lesson.color || COLORS[0]);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formClass || !formSubject || !formTopic || !formDate) {
      toast.error("Please fill all required fields");
      return;
    }
    setSaving(true);
    const payload = {
      teacher_email: user!.email,
      lesson_date: formDate,
      period_number: formPeriod,
      class_name: formClass,
      subject: formSubject,
      topic: formTopic,
      notes: formNotes || null,
      color: formColor,
      updated_at: new Date().toISOString(),
    };

    if (editingLesson) {
      const { error } = await supabase.from("lesson_plans").update(payload).eq("id", editingLesson.id);
      if (error) toast.error("Failed to update lesson");
      else toast.success("Lesson updated!");
    } else {
      const { error } = await supabase.from("lesson_plans").insert(payload);
      if (error) toast.error("Failed to add lesson");
      else toast.success("Lesson added!");
    }
    setSaving(false);
    setShowForm(false);
    fetchLessons();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("lesson_plans").delete().eq("id", id);
    if (!error) {
      toast.success("Lesson deleted");
      fetchLessons();
    }
  };

  const navigatePrev = () => setCurrentDate(view === "week" ? subWeeks(currentDate, 1) : subMonths(currentDate, 1));
  const navigateNext = () => setCurrentDate(view === "week" ? addWeeks(currentDate, 1) : addMonths(currentDate, 1));
  const goToday = () => setCurrentDate(new Date());

  return (
    <PageShell>
      <DashboardHeader showBack subtitle="Lesson Planner" />

      {/* Toolbar */}
      <div className="px-3 sm:px-6 py-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <button onClick={navigatePrev} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button onClick={goToday} className="px-3 py-1.5 rounded-xl bg-muted text-xs font-bold hover:bg-primary/10 transition-colors">
            Today
          </button>
          <button onClick={navigateNext} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
            <ChevronRight size={16} />
          </button>
          <h3 className="text-sm sm:text-base font-bold text-foreground ml-2">
            {view === "week"
              ? `${format(weekStart, "MMM d")} — ${format(weekEnd, "MMM d, yyyy")}`
              : format(currentDate, "MMMM yyyy")}
          </h3>
        </div>
        <div className="flex items-center gap-2">
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
          <button
            onClick={() => openAddForm()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:-translate-y-0.5 hover:shadow-lg transition-all active:scale-[0.97]"
          >
            <Plus size={14} /> Add Lesson
          </button>
        </div>
      </div>

      {/* Calendar View */}
      <div className="flex-1 px-3 sm:px-6 pb-4 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : view === "week" ? (
          /* WEEKLY VIEW */
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
            {weekDays.map((day) => {
              const dayLessons = getLessonsForDate(day);
              const today = isToday(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`rounded-2xl border p-2 sm:p-3 min-h-[180px] sm:min-h-[280px] transition-all ${today ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className={`text-[10px] font-bold uppercase tracking-wider ${today ? "text-primary" : "text-muted-foreground"}`}>
                        {format(day, "EEE")}
                      </div>
                      <div className={`text-lg sm:text-xl font-black ${today ? "text-primary" : "text-foreground"}`}>
                        {format(day, "d")}
                      </div>
                    </div>
                    <button
                      onClick={() => openAddForm(day)}
                      className="w-6 h-6 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {dayLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        onClick={() => openEditForm(lesson)}
                        className="group relative rounded-xl p-2 cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                        style={{ backgroundColor: (lesson.color || COLORS[0]) + "18", borderLeft: `3px solid ${lesson.color || COLORS[0]}` }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-muted-foreground">P{lesson.period_number}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(lesson.id); }}
                            className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-md bg-destructive/10 text-destructive flex items-center justify-center transition-opacity"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                        <div className="text-[10px] sm:text-xs font-bold text-foreground leading-tight truncate">{lesson.topic}</div>
                        <div className="text-[9px] text-muted-foreground truncate">{lesson.class_name} • {lesson.subject}</div>
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
          /* MONTHLY VIEW */
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
                    onClick={() => { setSelectedDate(day); openAddForm(day); }}
                    className={`rounded-xl border p-1.5 min-h-[70px] sm:min-h-[100px] cursor-pointer hover:border-primary/30 transition-all ${
                      today ? "border-primary/40 bg-primary/5" : inMonth ? "border-border bg-card" : "border-transparent bg-muted/30"
                    }`}
                  >
                    <div className={`text-[10px] sm:text-xs font-bold mb-1 ${today ? "text-primary" : inMonth ? "text-foreground" : "text-muted-foreground/50"}`}>
                      {format(day, "d")}
                    </div>
                    <div className="space-y-0.5">
                      {dayLessons.slice(0, 3).map((lesson) => (
                        <div
                          key={lesson.id}
                          onClick={(e) => { e.stopPropagation(); openEditForm(lesson); }}
                          className="rounded-md px-1 py-0.5 text-[8px] sm:text-[9px] font-bold truncate text-white"
                          style={{ backgroundColor: lesson.color || COLORS[0] }}
                        >
                          {lesson.topic}
                        </div>
                      ))}
                      {dayLessons.length > 3 && (
                        <div className="text-[8px] text-muted-foreground font-bold text-center">+{dayLessons.length - 3} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div
            className="bg-card rounded-3xl p-5 sm:p-6 w-full max-w-md border border-border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "slideUp 0.4s ease forwards" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <BookOpen size={18} className="text-primary" />
                {editingLesson ? "Edit Lesson" : "Add Lesson"}
              </h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-destructive/10 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Date *</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border-none text-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Period *</label>
                  <select
                    value={formPeriod}
                    onChange={(e) => setFormPeriod(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border-none text-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
                  >
                    {PERIOD_LABELS.map((label, i) => (
                      <option key={i} value={i + 1}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Class *</label>
                  <input
                    type="text"
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    placeholder="e.g. Class 5"
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border-none text-foreground text-sm focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Subject *</label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="e.g. Mathematics"
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border-none text-foreground text-sm focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Topic *</label>
                <input
                  type="text"
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  placeholder="e.g. Fractions & Decimals"
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border-none text-foreground text-sm focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Notes (optional)</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Any additional notes..."
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border-none text-foreground text-sm focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground resize-none"
                />
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Color</label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setFormColor(c)}
                      className={`w-7 h-7 rounded-full transition-all ${formColor === c ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-110"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:-translate-y-0.5 hover:shadow-lg transition-all active:scale-[0.97] disabled:opacity-60"
              >
                {saving ? "Saving..." : editingLesson ? "Update Lesson" : "Add Lesson"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default LessonPlannerPage;

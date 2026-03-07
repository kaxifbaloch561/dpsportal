import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Subject {
  id: string;
  name: string;
  icon: string;
}

export interface ClassData {
  id: number;
  name: string;
  subjects: Subject[];
}

export const fetchClassesData = async (): Promise<ClassData[]> => {
  const { data: classes, error: classErr } = await supabase
    .from("classes")
    .select("*")
    .order("sort_order", { ascending: true });

  if (classErr) throw classErr;

  const { data: subjects, error: subErr } = await supabase
    .from("subjects")
    .select("*")
    .order("sort_order", { ascending: true });

  if (subErr) throw subErr;

  return (classes || []).map((cls: any) => ({
    id: cls.id,
    name: cls.name,
    subjects: (subjects || [])
      .filter((s: any) => s.class_id === cls.id)
      .map((s: any) => ({ id: s.id, name: s.name, icon: s.icon })),
  }));
};

export const useClassesData = () => {
  return useQuery({
    queryKey: ["classes-data"],
    queryFn: fetchClassesData,
    staleTime: 1000 * 60 * 5,
  });
};

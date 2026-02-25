import {
  BookText,
  Calculator,
  PenLine,
  Moon,
  FlaskConical,
  Monitor,
  Globe,
  Atom,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  BookText,
  Calculator,
  PenLine,
  Moon,
  FlaskConical,
  Monitor,
  Globe,
  Atom,
  BookOpen,
};

interface SubjectIconProps {
  name: string;
  size?: number;
  className?: string;
}

const SubjectIcon = ({ name, size = 24, className = "" }: SubjectIconProps) => {
  const Icon = iconMap[name] || BookOpen;
  return <Icon size={size} className={className} />;
};

export default SubjectIcon;

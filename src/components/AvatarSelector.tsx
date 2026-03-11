import { useState } from "react";
import { Camera, Upload, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { avatarMap } from "@/utils/avatarMap";

const maleAvatars = [
  { id: "male-1", gender: "male" as const },
  { id: "male-2", gender: "male" as const },
  { id: "male-3", gender: "male" as const },
  { id: "male-4", gender: "male" as const },
  { id: "male-5", gender: "male" as const },
];

const femaleAvatars = [
  { id: "female-1", gender: "female" as const },
  { id: "female-2", gender: "female" as const },
  { id: "female-3", gender: "female" as const },
  { id: "female-4", gender: "female" as const },
  { id: "female-5", gender: "female" as const },
];

const allAvatars = [...maleAvatars, ...femaleAvatars];

interface AvatarSelectorProps {
  value: string;
  onChange: (url: string, type: "avatar" | "photo") => void;
}

const AvatarSelector = ({ value, onChange }: AvatarSelectorProps) => {
  const [tab, setTab] = useState<"avatar" | "photo">("avatar");
  const [gender, setGender] = useState<"male" | "female">("male");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string, "photo");
    };
    reader.readAsDataURL(file);
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string, "photo");
    };
    reader.readAsDataURL(file);
  };

  const filteredAvatars = allAvatars.filter((a) => a.gender === gender);

  // Resolve current value for display
  const displayUrl = avatarMap[value] || value;

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-foreground">Profile Picture</label>

      {/* Current selection preview */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full border-4 border-primary/20 overflow-hidden bg-muted flex items-center justify-center">
          {displayUrl ? (
            <img src={displayUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User size={32} className="text-muted-foreground" />
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {value ? "Selected ✓" : "Choose an avatar or upload your photo"}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={tab === "avatar" ? "default" : "outline"}
          onClick={() => setTab("avatar")}
        >
          <User size={14} /> Avatars
        </Button>
        <Button
          type="button"
          size="sm"
          variant={tab === "photo" ? "default" : "outline"}
          onClick={() => setTab("photo")}
        >
          <Camera size={14} /> Photo
        </Button>
      </div>

      {tab === "avatar" && (
        <div className="space-y-3">
          {/* Gender toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setGender("male")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                gender === "male"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => setGender("female")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                gender === "female"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              Female
            </button>
          </div>

          {/* Avatar grid */}
          <div className="grid grid-cols-5 gap-3">
            {filteredAvatars.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                onClick={() => onChange(avatar.id, "avatar")}
                className={`w-14 h-14 rounded-full overflow-hidden border-3 transition-all hover:scale-110 ${
                  value === avatar.id
                    ? "border-primary ring-2 ring-primary/30 scale-110"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <img src={avatarMap[avatar.id]} alt={avatar.id} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === "photo" && (
        <div className="flex gap-3">
          <label className="flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-all">
            <Upload size={24} className="text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Upload Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <label className="flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-all">
            <Camera size={24} className="text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Take Photo</span>
            <input
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleCapture}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default AvatarSelector;

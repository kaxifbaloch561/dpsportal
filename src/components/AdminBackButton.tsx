import { useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

const AdminBackButton = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  if (searchParams.get("from") !== "admin") return null;

  return (
    <button
      onClick={() => navigate("/admin")}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-sm font-semibold"
    >
      <ShieldCheck size={16} />
      Back to Admin
    </button>
  );
};

export default AdminBackButton;

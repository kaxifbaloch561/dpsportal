import { useState, useEffect } from "react";
import { Download, Share, MoreVertical, ArrowLeft, Check, Smartphone, Wifi, WifiOff, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import schoolLogo from "@/assets/school-logo.png";

const InstallPage = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  const features = [
    { icon: Smartphone, text: "App jaisi feel — full screen, no browser bar" },
    { icon: WifiOff, text: "Offline access — cached chapters bina internet" },
    { icon: Zap, text: "Fast loading — instant startup" },
    { icon: Wifi, text: "Auto updates — hamesha latest version" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all active:scale-95">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-sm font-semibold text-foreground">Install DPS Portal</h1>
      </div>

      <div className="max-w-md mx-auto px-5 py-8 space-y-8">
        {/* Logo & Title */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg bg-background border border-border/30">
            <img src={schoolLogo} alt="DPS SIBI" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">DPS Portal</h2>
            <p className="text-sm text-muted-foreground mt-1">Divisional Public School, SIBI</p>
          </div>
        </div>

        {/* Already installed */}
        {isInstalled && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20">
            <Check className="text-primary shrink-0" size={20} />
            <p className="text-sm font-medium text-primary">App already installed hai! Home screen se open karein.</p>
          </div>
        )}

        {/* Install button (Android/Desktop) */}
        {deferredPrompt && !isInstalled && (
          <button
            onClick={handleInstall}
            className="w-full py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 transition-all active:scale-[0.98]"
          >
            <Download size={18} />
            Install App
          </button>
        )}

        {/* Features */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">App install karne ke fayde:</h3>
          <div className="space-y-2.5">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <f.icon size={15} className="text-primary" />
                </div>
                <p className="text-sm text-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* iOS Instructions */}
        {isIOS && !isInstalled && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">iPhone / iPad par install kaise karein:</h3>
            <div className="space-y-2">
              <Step n={1} text={<>Safari mein <Share size={14} className="inline text-primary" /> Share button dabayein</>} />
              <Step n={2} text={<>"Add to Home Screen" select karein</>} />
              <Step n={3} text={<>"Add" par tap karein — Done! ✅</>} />
            </div>
          </div>
        )}

        {/* Android Instructions */}
        {!isIOS && !deferredPrompt && !isInstalled && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Android par install kaise karein:</h3>
            <div className="space-y-2">
              <Step n={1} text={<>Chrome browser mein <MoreVertical size={14} className="inline text-primary" /> menu dabayein</>} />
              <Step n={2} text={<>"Install app" ya "Add to Home screen" select karein</>} />
              <Step n={3} text={<>"Install" par tap karein — Done! ✅</>} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Step = ({ n, text }: { n: number; text: React.ReactNode }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-bold">{n}</div>
    <p className="text-sm text-foreground pt-0.5">{text}</p>
  </div>
);

export default InstallPage;

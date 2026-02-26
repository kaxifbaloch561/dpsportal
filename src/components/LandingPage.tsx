import { useEffect, useRef } from "react";
import { Search, BookOpen, Lightbulb, Globe, Rocket, MessageCircle, Instagram, Facebook, Twitter, Linkedin, ArrowRight } from "lucide-react";
import schoolLogo from "@/assets/school-logo.png";

const LandingPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const blobs = containerRef.current.querySelectorAll<HTMLElement>("[data-speed]");
      blobs.forEach((el) => {
        const speed = Number(el.dataset.speed);
        const x = (e.clientX * speed) / 250;
        const y = (e.clientY * speed) / 250;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5 overflow-x-hidden"
      style={{
        background: "linear-gradient(-45deg, hsl(235, 60%, 68%), hsl(235, 65%, 58%), hsl(240, 50%, 72%), hsl(235, 70%, 62%))",
        backgroundSize: "400% 400%",
        animation: "gradientBG 15s ease infinite",
      }}
    >
      <div
        ref={containerRef}
        className="w-full max-w-[1400px] min-h-[750px] bg-card/95 backdrop-blur-xl relative overflow-hidden flex flex-col"
        style={{
          borderRadius: "40px",
          boxShadow: "0 40px 80px rgba(0,0,0,0.2), inset 0 0 0 2px rgba(255,255,255,0.5)",
          animation: "containerSpring 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
          height: "90vh",
        }}
      >
        {/* Background blobs */}
        <div data-speed="-2" className="absolute top-[-100px] left-[10%] w-[350px] h-[350px] bg-blob-blue rounded-full blur-[40px] z-0" style={{ animation: "floatBlob 8s ease-in-out infinite" }} />
        <div data-speed="3" className="absolute bottom-[-100px] right-[20%] w-[400px] h-[400px] bg-blob-pink blur-[40px] z-0" style={{ borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%", animation: "floatBlob 12s ease-in-out infinite reverse" }} />
        <div data-speed="-4" className="absolute top-[40%] left-[35%] w-[200px] h-[200px] bg-blob-green blur-[40px] z-0" style={{ borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%", animation: "floatBlob 10s ease-in-out infinite 2s" }} />

        {/* Header */}
        <header className="relative z-20 flex flex-wrap justify-between items-center px-10 md:px-20 py-8 gap-4" style={{ animation: "slideDown 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.3s", opacity: 0 }}>
          <div className="flex items-center gap-3 font-black text-2xl text-foreground cursor-pointer hover:scale-105 transition-transform">
            <img src={schoolLogo} alt="DPS SIBI" className="w-10 h-10" />
            <div className="leading-tight">DPS<br/>SIBI</div>
          </div>

          <div className="flex items-center bg-primary/85 backdrop-blur-md rounded-full p-1.5" style={{ boxShadow: "0 15px 35px hsl(235, 78%, 65%, 0.5)" }}>
            <nav>
              <ul className="flex list-none px-6 gap-6 md:gap-9">
                {["Home", "About", "Timing", "Courses"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-primary-foreground font-medium text-sm relative pb-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary-foreground after:rounded after:transition-all after:duration-300 hover:after:w-full">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex items-center bg-card rounded-full px-5 py-2.5 ml-2 shadow-inner">
              <input type="text" placeholder="Search courses..." className="border-none outline-none text-sm w-28 text-foreground font-medium bg-transparent placeholder:text-muted-foreground" />
              <Search size={16} className="text-primary cursor-pointer hover:scale-125 hover:text-secondary transition-all" />
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="relative z-10 flex flex-1 flex-col lg:flex-row items-center justify-between px-10 md:px-20 gap-10">
          <div className="flex-1 max-w-[600px] lg:pr-10 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground -mb-4" style={{ animation: "slideUp 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.5s", opacity: 0 }}>
              Let's
            </h2>
            <h1
              className="text-6xl md:text-8xl font-black leading-tight mb-1"
              style={{
                background: "linear-gradient(to right, hsl(235, 78%, 65%), hsl(270, 60%, 55%), hsl(235, 78%, 65%))",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                animation: "gradientText 3s linear infinite, slideUp 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.7s",
                opacity: 0,
              }}
            >
              E-learning
            </h1>
            <h3 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight mb-6" style={{ animation: "slideUp 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.9s", opacity: 0 }}>
              at your home
            </h3>
            <p className="text-muted-foreground text-base leading-relaxed mb-10" style={{ animation: "slideUp 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 1.1s", opacity: 0 }}>
              Unlock your potential with world-class education from the comfort of your living room. Interactive courses, expert tutors, and a community dedicated to your growth.
            </p>
            <div className="flex gap-5 justify-center lg:justify-start" style={{ animation: "slideUp 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 1.3s", opacity: 0 }}>
              <a
                href="#"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-base relative overflow-hidden transition-all duration-300 hover:-translate-y-2 z-[1]"
                style={{ boxShadow: "0 15px 30px hsl(235, 78%, 65%, 0.5)" }}
              >
                Apply now <ArrowRight size={18} />
                <span className="absolute top-0 w-1/2 h-full" style={{ background: "linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.4), rgba(255,255,255,0))", transform: "skewX(-25deg)", animation: "shine 4s infinite" }} />
              </a>
              <a href="#" className="px-8 py-4 rounded-full border-2 border-primary text-primary font-bold text-base transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:-translate-y-2 hover:shadow-lg">
                Read More
              </a>
            </div>
          </div>

          {/* Image section */}
          <div className="flex-1 flex justify-end items-center relative" style={{ animation: "popIn 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 1s", opacity: 0 }}>
            <div
              className="relative w-[90%] max-w-[550px] aspect-square flex items-center justify-center p-5 z-[5]"
              style={{
                background: "linear-gradient(135deg, hsl(var(--blob-blue)), hsl(var(--blob-green)))",
                animation: "morph 8s ease-in-out infinite",
                borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
                boxShadow: "0 30px 60px rgba(0,0,0,0.1)",
              }}
            >
              <div className="absolute w-[110%] h-[110%] border-2 border-dashed border-primary-glow pointer-events-none z-[1]" style={{ animation: "spinMorph 15s linear infinite", borderRadius: "55% 45% 40% 60% / 50% 60% 40% 50%" }} />
              <img
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800"
                alt="Teacher using digital portal"
                className="w-full h-full object-cover"
                style={{ animation: "morph 8s ease-in-out infinite", borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%", boxShadow: "inset 0 0 20px rgba(0,0,0,0.1)" }}
              />

              {/* Floating icons */}
              <div data-speed="4" className="absolute top-[10%] left-[-5%] w-16 h-16 bg-card rounded-full flex items-center justify-center shadow-xl z-10 text-amber-400" style={{ animation: "floatSlow 4s ease-in-out infinite" }}>
                <Lightbulb size={24} />
              </div>
              <div data-speed="-5" className="absolute bottom-[15%] left-[-10%] w-20 h-20 bg-card rounded-full flex items-center justify-center shadow-xl z-10 text-secondary" style={{ animation: "floatSlow 3s ease-in-out infinite 1s" }}>
                <Globe size={28} />
              </div>
              <div data-speed="3" className="absolute top-[20%] right-[-5%] w-14 h-14 bg-card rounded-full flex items-center justify-center shadow-xl z-10 text-cyan-500" style={{ animation: "floatSlow 5s ease-in-out infinite 0.5s" }}>
                <Rocket size={20} />
              </div>
            </div>
          </div>
        </main>

        {/* Bottom elements */}
        <div className="absolute bottom-8 w-full px-10 md:px-20 flex justify-between items-end z-20">
          <div className="flex gap-3" style={{ animation: "slideUp 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 1.5s", opacity: 0 }}>
            {[Instagram, Facebook, Twitter, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="w-11 h-11 rounded-full bg-card flex items-center justify-center text-primary shadow-md transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:-translate-y-2 hover:rotate-[360deg] hover:shadow-lg">
                <Icon size={18} />
              </a>
            ))}
          </div>
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-primary-foreground text-3xl cursor-pointer relative transition-all duration-300 hover:scale-110 hover:-translate-y-1"
            style={{
              background: "linear-gradient(135deg, hsl(235, 78%, 65%), hsl(270, 60%, 55%))",
              boxShadow: "0 15px 30px hsl(235, 78%, 65%, 0.5)",
              animation: "pulseGlow 2.5s infinite, popIn 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 1.7s",
              opacity: 0,
            }}
          >
            <MessageCircle size={28} />
            <span className="absolute top-0 right-0 w-5 h-5 bg-secondary rounded-full text-xs font-bold flex items-center justify-center border-2 border-card">3</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

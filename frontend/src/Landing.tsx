import { useState } from "react";
import { Linkedin, Instagram, X, Youtube, Smartphone } from "lucide-react";

export default function Landing() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return alert("Please enter a valid email");
    // 🔹 TODO: Integrate with your backend or Mailchimp here
    console.log("Subscribed:", email);
    setSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 w-screen h-screen flex items-center justify-center text-white overflow-hidden "
      style={{ minHeight: "100vh", minWidth: "100vw" }}
    >
      {/* 🌌 Animated Gradient Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          width: "100vw",
          height: "100vh",
          background:
            "radial-gradient(120% 120% at 50% 10%, #0a0a0a 20%, #1a1a1a 60%, #000 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-6 text-center font-sans">
        {/* Logo */}
        <div className="flex items-center space-x-2 mb-6 relative">
          <div className="flex flex-row items-center" style={{ position: 'relative' }}>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight">
            Conversia
          </h1>
        </div>

        {/* Headline */}
        <h2 className="text-5xl font-bold mb-4 text-white font-serif">
          Launching Soon
        </h2>

        {/* Subtitle */}
        <p className="max-w-2xl text-lg text-gray-300 mb-10 leading-relaxed">
          The next evolution in voice-based customer support.  
          <span className="text-white font-medium"> Conversia </span> uses conversational AI to power real-time, natural interactions —  
          boosting efficiency, engagement, and satisfaction.
        </p>

        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-md bg-white/10 rounded-xl overflow-hidden border border-white/20 backdrop-blur-sm"
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-white text-black px-6 font-semibold hover:bg-gray-200 transition"
            >
              Notify Me
            </button>
          </form>
        ) : (
          <p className="text-green-400 font-medium mb-6">
            Thank you! We'll notify you when we launch.
          </p>
        )}

        {/* 🌐 Social Links */}
        <div className="flex space-x-4 mt-8">
          {[
            { icon: Linkedin, href: "#" },
            { icon: Instagram, href: "#" },
            { icon: X, href: "#" },
            { icon: Youtube, href: "#" },
          ].map(({ icon: Icon, href }, i) => (
            <a
              key={i}
              href={href}
              className="bg-white/10 p-2.5 rounded-xl hover:bg-white/20 transition"
            >
              <Icon size={20} />
            </a>
          ))}
        </div>

        {/* Footer */}
        <footer className="absolute left-0 right-0 bottom-6 mx-auto text-xs text-gray-500 w-full text-center">
          © {new Date().getFullYear()} Conversia. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

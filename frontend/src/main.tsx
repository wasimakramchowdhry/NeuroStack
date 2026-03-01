import { createRoot } from "react-dom/client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import App from "./app/App.tsx";
import "./styles/index.css";

// Register GSAP plugins globally
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

createRoot(document.getElementById("root")!).render(<App />);

import { useEffect, useState } from "react";
import { PacmanLoader } from "react-spinners";
const ruetQuotes = [
  {
    header: "It’s slow, yes...",
    quote: "But not as slow as RUET’s new building construction. 😉",
  },
  {
    header: "Still waiting?",
    quote: "Don’t worry. We’re not grading you on this. Yet. 😬",
  },
  {
    header: "Hang in there!",
    quote: "Unlike your CGPA — this will actually improve. 🤭",
  },
  {
    header: "Just loading...",
    quote: "Not your final year thesis defense. Relax.",
  },
  {
    header: "Almost there!",
    quote: "Still faster than RUET results, promise!",
  },
  {
    header: "This might take a sec.",
    quote: "Like waiting for your 3rd semester result to publish.",
  },
  {
    header: "One moment...",
    quote: "At least this loads. Unlike the departmental Wi-Fi.",
  },
  {
    header: "Still loading...",
    quote: "But not as stuck as your brain during EM field exam.",
  },
  {
    header: "Pending...",
    quote: "Like your departmental clearance since 2019. 💀",
  },
  {
    header: "Almost there...",
    quote: "Better than standing in front of the exam notice board, right?",
  },
];
const Loader = () => {
  const [message, setMessage] = useState({ header: "", quote: "" });
  useEffect(() => {
    const random = Math.floor(Math.random() * ruetQuotes.length);
    setMessage(ruetQuotes[random]);
  }, []);
  return (
    <div className="flex items-center justify-center min-h-screen bg-white opacity-80">
      <div className="flex flex-col gap-4 w-full justify-center text-center items-center z-50">
        <h4 className="text-green-500 text-3xl sm:text-5xl font-bold flex gap-4 items-center">
          {message.header}
        </h4>
        <p className="text-black text-center max-w-md text-sm sm:text-base px-4">
          {message.quote}
        </p>
        <PacmanLoader size={32} color="#22c55e" />
      </div>
    </div>
  );
};

export default Loader;

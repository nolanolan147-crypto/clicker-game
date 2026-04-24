import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDw8p5OnQKdWhQKL3OqOU18VpcHJKY8Lqg",
  authDomain: "clicker-game-549d5.firebaseapp.com",
  projectId: "clicker-game-549d5",
  storageBucket: "clicker-game-549d5.firebasestorage.app",
  messagingSenderId: "191308459957",
  appId: "1:191308459957:web:1c8ae327a525eb809f33fc",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [running, setRunning] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [powerActive, setPowerActive] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [name, setName] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);

  // TIMER
  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setRunning(false);
          return 0;
        }
        return t - 1;
      });

      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  // LOAD LEADERBOARD
  const loadScores = async () => {
    const snap = await getDocs(collection(db, "scores"));
    const data = snap.docs.map((doc) => doc.data());

    data.sort((a, b) => b.score - a.score);
    setLeaderboard(data.slice(0, 5));
  };

  useEffect(() => {
    loadScores();
  }, []);

  // SAVE SCORE
  const saveScore = async () => {
    if (!name) return;

    await addDoc(collection(db, "scores"), {
      name,
      score,
    });

    loadScores();
  };

  // GAME START
  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setRunning(true);
    setMultiplier(1);
    setPowerActive(false);
  };

  // CLICK
  const handleClick = () => {
    if (!running) return;
    setScore((s) => s + multiplier);

    const audio = new Audio(
      "https://www.soundjay.com/buttons/sounds/button-16.mp3"
    );
    audio.play();
  };

  // POWER UP
  const activatePower = () => {
    if (powerActive || cooldown > 0 || !running) return;

    setMultiplier(2);
    setPowerActive(true);
    setCooldown(600); // 10 min

    setTimeout(() => {
      setMultiplier(1);
      setPowerActive(false);
    }, 5000);
  };

  // GAME OVER SAVE
  useEffect(() => {
    if (!running && timeLeft === 0 && score > 0) {
      saveScore();
    }
  }, [running, timeLeft]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        fontFamily: "Arial",
        padding: 10,
      }}
    >
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 20,
          width: "100%",
          maxWidth: 360,
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        }}
      >
        <h2>🎮 Click Game</h2>

        <input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: 10, width: "90%", borderRadius: 10 }}
        />

        <p>
          <b>Score:</b> {score}
        </p>
        <p>
          <b>Time:</b> {timeLeft}s
        </p>
        <p>
          <b>x{multiplier}</b>
        </p>

        <button
          onClick={handleClick}
          style={{
            padding: 14,
            width: "100%",
            borderRadius: 12,
            border: "none",
            background: "#667eea",
            color: "white",
            fontSize: 16,
            marginTop: 8,
          }}
        >
          🎯 Click
        </button>

        <button
          onClick={activatePower}
          style={{
            padding: 14,
            width: "100%",
            borderRadius: 12,
            border: "none",
            background: cooldown > 0 ? "gray" : "#28a745",
            color: "white",
            fontSize: 16,
            marginTop: 8,
          }}
        >
          ⚡ Power ({cooldown}s)
        </button>

        <button
          onClick={startGame}
          style={{
            padding: 14,
            width: "100%",
            borderRadius: 12,
            border: "none",
            background: "#764ba2",
            color: "white",
            fontSize: 16,
            marginTop: 8,
          }}
        >
          ▶ Start Game
        </button>

        {!running && timeLeft === 0 && (
          <div style={{ marginTop: 15 }}>
            <h3>Game Over</h3>
            <p>Your score: {score}</p>
          </div>
        )}

        <h3>🏆 Leaderboard</h3>
        {leaderboard.map((p, i) => (
          <p key={i}>
            {i + 1}. {p.name} - {p.score}
          </p>
        ))}
      </div>
    </div>
  );
}

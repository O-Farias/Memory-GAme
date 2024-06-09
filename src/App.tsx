import React, { useState, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import "./index.css";
import "./animations.css";

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const initialCards = (): Card[] => {
  const values = ["🍎", "🍌", "🍒", "🍇", "🍉", "🍓"];
  const cards = values.concat(values).map((value, index) => ({
    id: index,
    value,
    isFlipped: false,
    isMatched: false,
  }));
  return shuffle(cards);
};

const shuffle = (array: Card[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const App: React.FC = () => {
  const [cards, setCards] = useState<Card[]>(initialCards());
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);
  const [time, setTime] = useState<number>(0);
  const [intervalId, setIntervalId] = useState<ReturnType<
    typeof setInterval
  > | null>(null);

  useEffect(() => {
    if (flippedCards.length === 2) {
      setDisabled(true);
      setAttempts((prev) => prev + 1);

      setTimeout(() => {
        const [firstIndex, secondIndex] = flippedCards;
        const newCards = [...cards];
        if (cards[firstIndex].value === cards[secondIndex].value) {
          newCards[firstIndex].isMatched = true;
          newCards[secondIndex].isMatched = true;
        } else {
          newCards[firstIndex].isFlipped = false;
          newCards[secondIndex].isFlipped = false;
        }
        setCards(newCards);
        setFlippedCards([]);
        setDisabled(false);
      }, 1000);
    }

    if (cards.every((card) => card.isMatched)) {
      if (intervalId !== null) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }
  }, [flippedCards, cards, intervalId]);

  const startTimer = () => {
    if (intervalId === null) {
      const id = setInterval(() => setTime((prev) => prev + 1), 1000);
      setIntervalId(id);
    }
  };

  const handleCardClick = (index: number) => {
    if (disabled || cards[index].isFlipped || cards[index].isMatched) return;

    startTimer();

    const newCards = cards.map((card, i) =>
      i === index ? { ...card, isFlipped: true } : card
    );

    setCards(newCards);
    setFlippedCards((prev) => [...prev, index]);
  };

  const handleReset = () => {
    setCards(initialCards());
    setFlippedCards([]);
    setDisabled(false);
    setAttempts(0);
    setTime(0);
    if (intervalId !== null) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-5xl font-extrabold mb-8 text-gray-800">
        Jogo da Memória
      </h1>
      <button
        onClick={handleReset}
        className="mb-8 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
      >
        Reiniciar Jogo
      </button>
      <p className="text-2xl mb-4 text-gray-700">Tentativas: {attempts}</p>
      <p className="text-2xl mb-4 text-gray-700">Tempo: {time} segundos</p>
      <div className="grid grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className="relative w-24 h-24 transform transition-transform duration-300 hover:scale-105"
            onClick={() => handleCardClick(index)}
          >
            <CSSTransition
              in={card.isFlipped || card.isMatched}
              timeout={300}
              classNames="flip"
              unmountOnExit
            >
              <div
                className={`absolute inset-0 flex items-center justify-center bg-blue-500 text-white border border-gray-300 rounded-lg shadow-lg`}
              >
                <span className="text-3xl">{card.value}</span>
              </div>
            </CSSTransition>
            <CSSTransition
              in={!card.isFlipped && !card.isMatched}
              timeout={300}
              classNames="flip"
              unmountOnExit
            >
              <div
                className={`absolute inset-0 flex items-center justify-center bg-white text-gray-500 border border-gray-300 rounded-lg shadow-lg`}
              >
                <span className="text-3xl">?</span>
              </div>
            </CSSTransition>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;

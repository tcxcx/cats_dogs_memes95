"use client";

import React, { useEffect, useState, useCallback } from "react";

const lettersAndSymbols = "abcdefghijklmnopqrstuvwxyz!@#$%^&*-_+=;:<>,";
interface AnimatedTextProps {
  text: string;
  speed: number;
}

export function AnimatedText({ text, speed }: AnimatedTextProps) {
  const [animatedText, setAnimatedText] = useState("");

  const getRandomChar = useCallback(
    () =>
      lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)],
    [],
  );

  const animateText = useCallback(async () => {
    const duration = speed;
    const revealDuration = speed * 1.6;
    const initialRandomDuration = speed * 6;

    const generateRandomText = () =>
      text
        .split("")
        .map((char) => (char === ' ' ? ' ' : getRandomChar()))
        .join("");

    setAnimatedText(generateRandomText());

    const endTime = Date.now() + initialRandomDuration;
    while (Date.now() < endTime) {
      await new Promise((resolve) => setTimeout(resolve, duration));
      setAnimatedText(generateRandomText());
    }
    for (let i = 0; i < text.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, revealDuration));
      setAnimatedText(
        (prevText) => {
          const currentChar = text[i];
          const updatedText = text.slice(0, i + 1);
          const remainingText = prevText.slice(i + 1);
          const randomizedRemaining = remainingText
            .split("")
            .map((char) => (char === ' ' ? ' ' : getRandomChar()))
            .join("");

          return updatedText + randomizedRemaining;
        }
      );
    }
  }, [text, getRandomChar, speed]);

  useEffect(() => {
    animateText();
  }, [text, animateText]);

  return <div className="relative inline-block whitespace-pre-wrap">{animatedText}</div>;
}

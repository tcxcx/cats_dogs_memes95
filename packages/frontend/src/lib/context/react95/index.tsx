"use client";

import React, { ReactNode } from "react";
import { ThemeProvider } from "styled-components";
import shelbiTeal from "react95/dist/themes/shelbiTeal";

interface React95AppProps {
  children: ReactNode;
}

const React95App: React.FC<React95AppProps> = ({ children }) => {
  return <ThemeProvider theme={shelbiTeal}>{children}</ThemeProvider>;
};

export default React95App;

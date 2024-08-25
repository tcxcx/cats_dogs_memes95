"use client";

import React, { ReactNode } from "react";
import { ThemeProvider } from "styled-components";
import original from "react95/dist/themes/original";

interface React95AppProps {
  children: ReactNode;
}

const React95App: React.FC<React95AppProps> = ({ children }) => {
  return <ThemeProvider theme={original}>{children}</ThemeProvider>;
};

export default React95App;

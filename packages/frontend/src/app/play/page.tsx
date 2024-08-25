"use client";

import React, { useState } from "react";
import {
  Window,
  WindowHeader,
  WindowContent,
  Button,
  Toolbar,
  MenuList,
  MenuListItem,
  Separator,
  Frame,
} from "react95";
import styled from "styled-components";

const CardWrapper = styled.div`
  width: 60px;
  height: 84px;
  background: white;
  border: 2px solid ${({ theme }) => theme.borderDark};
  box-shadow: inset 1px 1px 0px 1px ${({ theme }) => theme.borderLightest},
    inset -1px -1px 0 1px ${({ theme }) => theme.borderDark};
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
`;

export default function Play() {
  const [open, setOpen] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleOpenMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleCloseMenu = () => {
    setOpenMenu(null);
  };

  return (
    <>
      {open && (
        <Window
          className="window bg-bg"
          style={{ width: "400px", margin: "0 auto" }}
        >
          <WindowHeader
            className="window-header"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>Solitaire.exe</span>
            <Button onClick={() => setOpen(false)}>
              <span
                style={{ fontWeight: "bold", transform: "translateY(-1px)" }}
              >
                x
              </span>
            </Button>
          </WindowHeader>
          <Toolbar>
            <Button
              variant="menu"
              size="sm"
              onClick={() => handleOpenMenu("file")}
            >
              File
            </Button>
            <Button
              variant="menu"
              size="sm"
              onClick={() => handleOpenMenu("edit")}
            >
              Edit
            </Button>
            <Button
              variant="menu"
              size="sm"
              onClick={() => handleOpenMenu("help")}
            >
              Help
            </Button>
          </Toolbar>
          {openMenu === "file" && (
            <MenuList
              style={{
                position: "absolute",
                left: "0px",
                top: "40px",
              }}
              onClick={handleCloseMenu}
            >
              <MenuListItem>New Game</MenuListItem>
              <MenuListItem>Exit</MenuListItem>
            </MenuList>
          )}
          <WindowContent>
            <Frame
              variant="well"
              style={{ padding: "1rem", marginBottom: "1rem" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  marginBottom: "1rem",
                }}
              >
                {["♠", "♥", "♦", "♣"].map((suit) => (
                  <CardWrapper key={suit}>{suit}</CardWrapper>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <CardWrapper style={{ marginRight: "0.5rem" }}>🂠</CardWrapper>
                <CardWrapper>A♠</CardWrapper>
              </div>
            </Frame>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Button onClick={() => alert("Dealing cards...")}>Deal</Button>
              <Button onClick={() => alert("Shuffling...")}>Shuffle</Button>
              <Button onClick={() => alert("Starting new game...")}>
                New Game
              </Button>
            </div>
          </WindowContent>
          <Frame
            variant="well"
            style={{ margin: "0.25rem", padding: "0.25rem", height: "30px" }}
          >
            <p style={{ fontSize: "12px" }}>Score: 0 | Time: 00:00</p>
          </Frame>
        </Window>
      )}
    </>
  );
}

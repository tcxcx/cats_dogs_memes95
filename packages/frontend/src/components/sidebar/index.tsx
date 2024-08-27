"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SparklesText from "@/components/magic-ui/sparkles-text";
import { cn } from "@/lib/utils";
import {
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Spade,
  BookMarked,
  PackageOpen,
  ShoppingBasket,
  Smile,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarLink {
  icon: React.ReactNode;
  route: string;
  label: string;
}

interface LinkComponentProps {
  item: SidebarLink;
  active: boolean;
  isExpanded: boolean;
}

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const isActive = (route: string) => {
    return pathname === route;
  };

  const sidebarLinks: SidebarLink[] = [
    {
      icon: <Smile />,
      route: "/",
      label: "Home",
    },

    {
      icon: <PackageOpen />,
      route: "/open-packs",
      label: "Buy/Open Packs",
    },
    {
      icon: <BookMarked />,
      route: "/collection",
      label: "Collection",
    },
    {
      icon: <Spade />,
      route: "/play",
      label: "Play",
    },
  ];

  const LinkComponent = ({ item, active, isExpanded }: LinkComponentProps) => {
    const linkContent = (
      <div className="flex items-center relative">
        <div className={cn("relative size-6", { "text-white": active })}>
          {item.icon}
        </div>
        {isExpanded && (
          <p
            className={cn("ml-3 text-16 font-semibold", {
              "text-white": active,
            })}
          >
            {item.label}
          </p>
        )}
      </div>
    );

    return (
      <Link
        href={item.route}
        className={cn(
          "flex items-center py-1 md:p-3 2xl:p-4 rounded-lg",
          "justify-start",
          "hover:bg-secondary/50",
          { "bg-indigo-600": active }
        )}
      >
        {linkContent}
      </Link>
    );
  };

  return (
    <section
      className={cn(
        "sticky left-0 top-0 flex h-screen flex-col justify-between pt-4 transition-all duration-300 bg-white/10 z-10",
        isExpanded ? "w-64 sm:p-4 xl:p-6" : "w-20 p-2",
        "max-md:hidden" // Hide on mobile devices
      )}
    >
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-white"
        >
          {isExpanded ? <ChevronLeft /> : <ChevronRight />}
        </button>
      </div>
      <nav className="flex flex-col gap-4 flex-grow">
        {sidebarLinks.map((item) => (
          <LinkComponent
            key={item.label}
            item={item}
            active={isActive(item.route)}
            isExpanded={isExpanded}
          />
        ))}
      </nav>

      <div className="sticky inset-x-0 bottom-0">
        {isExpanded ? (
          <button
            onClick={toggleTheme}
            className="flex items-center justify-start w-full py-2 px-4 text-sm font-medium rounded-lg hover:bg-secondary/50 hover:text-gray-700 dark:hover:text-white"
          >
            <div className="relative size-6 mr-2">
              {theme === "dark" ? <Sun /> : <Moon />}
            </div>
            <p className="text-16 font-semibold">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </p>
          </button>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-center w-full py-2 text-sm font-medium rounded-lg hover:bg-secondary/50 hover:text-gray-700 dark:hover:text-white"
                >
                  <div className="relative size-6">
                    {theme === "dark" ? <Sun /> : <Moon />}
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{theme === "dark" ? "Light Mode" : "Dark Mode"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </section>
  );
};

export default Sidebar;

"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@v1/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@v1/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@v1/ui/card";
import { Skeleton } from "@v1/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@v1/ui/alert";
import { AlertCircle } from "lucide-react";
import { Input } from "@v1/ui/input";
import { Button } from "@v1/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@v1/ui/select";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import {
  getPlayers,
  getMatches,
  getPlayerLeaderboard,
  getAwards,
} from "@/app/api/rollup/route";

export type PlayerTournament = {
  id: string;
  name: string;
  deck: string;
};

export type Match = {
  id: string;
  player1Id: string;
  player2Id: string;
  winnerId: string;
  startTime: string;
};

export type LeaderboardEntry = {
  id: string;
  name: string;
  wins: number;
};

export type Awards = Record<
  string,
  {
    id: string;
    name: string;
    wins: number;
    gamesPlayed: number;
  }
>;

const ENDPOINTS = {
  players: "/players",
  matches: "/matches",
  leaderboard: "/player-leaderboard",
  awards: "/awards",
};

const PRIZES = [
  { place: "1st", amount: "10,000 tokens", emoji: "🥇" },
  { place: "2nd", amount: "5,000 tokens", emoji: "🥈" },
  { place: "3rd", amount: "2,500 tokens", emoji: "🥉" },
];

const tableVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      when: "beforeChildren",
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100 },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const awardTitles: Record<string, { title: string; emoji: string }> = {
  mostWins: { title: "Most Wins", emoji: "🏆" },
  highestWinRate: { title: "Highest Win Rate", emoji: "📈" },
  mostGamesPlayed: { title: "Most Games Played", emoji: "🎮" },
};

const renderAwards = (awards: Awards) => {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      initial="hidden"
      animate="visible"
      variants={tableVariants}
    >
      {awards &&
        Object.entries(awards).map(([key, value]) => (
          <motion.div key={key} variants={rowVariants}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {awardTitles[key]?.emoji} {awardTitles[key]?.title || key}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {value && typeof value === "object" && (
                  <>
                    <p>Player ID: {value.id}</p>
                    <p>Name: {value.name}</p>
                    <p>Wins: {value.wins}</p>
                    <p>Games Played: {value.gamesPlayed}</p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
    </motion.div>
  );
};

export default function TournamentTable() {
  const [activeTab, setActiveTab] = useState("players");
  const [globalFilter, setGlobalFilter] = useState("");

  const {
    data: players,
    isLoading: playersLoading,
    error: playersError,
  } = useSWR<PlayerTournament[]>(ENDPOINTS.players, getPlayers);
  const {
    data: matches,
    isLoading: matchesLoading,
    error: matchesError,
  } = useSWR<Match[]>(ENDPOINTS.matches, getMatches);
  const {
    data: leaderboard,
    isLoading: leaderboardLoading,
    error: leaderboardError,
  } = useSWR<LeaderboardEntry[]>(ENDPOINTS.leaderboard, getPlayerLeaderboard);
  const {
    data: awards,
    isLoading: awardsLoading,
    error: awardsError,
  } = useSWR<Awards>(ENDPOINTS.awards, getAwards);

  const columns = useMemo(() => {
    const baseColumns: Record<string, ColumnDef<any>[]> = {
      players: [
        { accessorKey: "id", header: "ID" },
        { accessorKey: "name", header: "Name" },
        { accessorKey: "deck", header: "Deck" },
      ],
      matches: [
        { accessorKey: "id", header: "ID" },
        { accessorKey: "player1Id", header: "Player 1" },
        { accessorKey: "player2Id", header: "Player 2" },
        { accessorKey: "winnerId", header: "Winner" },
        { accessorKey: "startTime", header: "Start Time" },
      ],
      leaderboard: [
        { accessorKey: "id", header: "Player ID" },
        { accessorKey: "name", header: "Name" },
        { accessorKey: "wins", header: "Wins" },
      ],
    };
    return baseColumns[activeTab] || [];
  }, [activeTab]);

  const table = useReactTable({
    data:
      activeTab === "players"
        ? players || []
        : activeTab === "matches"
          ? matches || []
          : activeTab === "leaderboard"
            ? leaderboard || []
            : [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const renderSkeletonTable = (rowCount: number, columnCount: number) => (
    <Table style={{ width: "1000px" }}>
      <TableHeader>
        <TableRow>
          {Array(columnCount)
            .fill(0)
            .map((_, idx) => (
              <TableHead key={idx}>
                <Skeleton className="h-4 w-full" />
              </TableHead>
            ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array(rowCount)
          .fill(0)
          .map((_, rowIdx) => (
            <TableRow key={rowIdx}>
              {Array(columnCount)
                .fill(0)
                .map((_, colIdx) => (
                  <TableCell key={colIdx}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );

  const renderError = (error: Error) => (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  );

  const renderNoDataAlert = () => (
    <Alert variant="default">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>No Data Available</AlertTitle>
      <AlertDescription>
        There is currently no data to display.
      </AlertDescription>
    </Alert>
  );

  const renderPagination = () => (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        Showing{" "}
        {table.getState().pagination.pageIndex *
          table.getState().pagination.pageSize +
          1}{" "}
        to{" "}
        {Math.min(
          (table.getState().pagination.pageIndex + 1) *
            table.getState().pagination.pageSize,
          table.getFilteredRowModel().rows.length
        )}{" "}
        of {table.getFilteredRowModel().rows.length} entries
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="noShadow"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </Button>
          <Button
            variant="noShadow"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </Button>
          <Button
            variant="noShadow"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </Button>
          <Button
            variant="noShadow"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderTable = () => {
    if (!table.getRowModel().rows?.length) {
      return renderNoDataAlert();
    }

    return (
      <div className="overflow-x-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={tableVariants}
          style={{ width: "1000px" }}
        >
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="font-bold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <motion.tr key={row.id} variants={rowVariants}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "players":
        if (playersError) return renderError(playersError);
        return playersLoading ? renderSkeletonTable(5, 3) : renderTable();
      case "matches":
        if (matchesError) return renderError(matchesError);
        return matchesLoading ? renderSkeletonTable(5, 5) : renderTable();
      case "leaderboard":
        if (leaderboardError) return renderError(leaderboardError);
        return leaderboardLoading ? (
          renderSkeletonTable(5, 3)
        ) : (
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 font-departure">
                  Prize Distribution
                </h3>
                <p className="text-sm text-muted-foreground mb-1">
                  Prizes are awarded based on:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mb-2">
                  <li>Most wins</li>
                  <li>Highest win rate</li>
                  <li>Most games played</li>
                </ul>
              </div>
              <div>
                {PRIZES.map((prize, index) => (
                  <motion.p
                    key={index}
                    className="text-lg pt-4 font-departure"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="font-semibold">
                      {prize.emoji} {prize.place} place:
                    </span>{" "}
                    {prize.amount}
                  </motion.p>
                ))}
              </div>
            </div>
            {renderTable()}
          </motion.div>
        );
      case "awards":
        if (awardsError) return renderError(awardsError);
        return awardsLoading ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            style={{ width: "1000px" }}
          >
            {Array(3)
              .fill(0)
              .map((_, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <Skeleton className="h-4 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <div
              className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              style={{ width: "1000px" }}
            >
              <div>
                <p className="text-lg font-departure mb-1">🏆 Most Wins</p>
                <p className="text-sm text-muted-foreground">
                  Recognizing the player with the highest number of wins in the
                  tournament.
                </p>
              </div>
              <div>
                <p className="text-lg font-departure mb-1">
                  📈 Highest Win Rate
                </p>
                <p className="text-sm text-muted-foreground">
                  Awarded to the player with the best win percentage.
                </p>
              </div>
              <div>
                <p className="text-lg font-departure mb-1">
                  🎮 Most Games Played
                </p>
                <p className="text-sm text-muted-foreground">
                  Acknowledging the player with the most games played in the
                  tournament.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4 font-departure">
              {awards ? renderAwards(awards) : renderNoDataAlert()}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-4 my-4">
      <h2 className="text-2xl font-bold font-departure">Tournament Data</h2>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="font-departure">
          <TabsTrigger value="players">👥 Players</TabsTrigger>
          <TabsTrigger value="matches">⚔️ Matches</TabsTrigger>
          <TabsTrigger value="leaderboard">🏅 Leaderboard</TabsTrigger>
          <TabsTrigger value="awards">🎖️ Awards</TabsTrigger>
        </TabsList>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <TabsContent value={activeTab}>
              {activeTab !== "awards" && (
                <div className="mb-4">
                  <Input
                    placeholder="Search..."
                    value={globalFilter ?? ""}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="max-w-sm"
                  />
                </div>
              )}
              {renderContent()}
              {activeTab !== "awards" && renderPagination()}
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}

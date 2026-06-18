"use client";

import { useState, useMemo } from "react";
import { Goal, GoalType } from "../types/goal.types";
import { GoalCard } from "./GoalCard";
import { GoalForm } from "./GoalForm";
import { Target, TrendingUp, Archive, Filter, SortAsc, CheckCircle2, Clock, ChevronDown, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GoalsClientProps {
  goals: Goal[];
}

type FilterType = "all" | GoalType;
type StatusFilter = "active" | "completed" | "archived";
type SortBy = "newest" | "oldest" | "progress_asc" | "progress_desc" | "target_date";

export function GoalsClient({ goals }: GoalsClientProps) {
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  // Stats
  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");
  const archivedGoals = goals.filter((g) => g.status === "archived");

  // Type breakdown for active goals
  const typeBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {
      mingguan: 0,
      bulanan: 0,
      tahunan: 0,
      lifetime: 0,
    };
    activeGoals.forEach((g) => {
      if (g.goal_type in breakdown) breakdown[g.goal_type]++;
    });
    return breakdown;
  }, [activeGoals]);

  // Overall average progress (active goals only)
  const avgProgress = useMemo(() => {
    if (activeGoals.length === 0) return 0;
    const total = activeGoals.reduce((sum, g) => sum + g.progress, 0);
    return Math.round(total / activeGoals.length);
  }, [activeGoals]);

  // Filtered active goals
  const filteredActive = useMemo(() => {
    let filtered = activeGoals;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(g => g.title.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q));
    }
    if (typeFilter !== "all") {
      filtered = filtered.filter((g) => g.goal_type === typeFilter);
    }
    return sortGoals(filtered, sortBy);
  }, [activeGoals, typeFilter, sortBy]);

  // Filtered completed goals
  const filteredCompleted = useMemo(() => {
    let filtered = completedGoals;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(g => g.title.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q));
    }
    if (typeFilter !== "all") {
      filtered = filtered.filter((g) => g.goal_type === typeFilter);
    }
    return sortGoals(filtered, sortBy);
  }, [completedGoals, typeFilter, sortBy]);

  // Filtered archived goals
  const filteredArchived = useMemo(() => {
    let filtered = archivedGoals;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(g => g.title.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q));
    }
    if (typeFilter !== "all") {
      filtered = filtered.filter((g) => g.goal_type === typeFilter);
    }
    return sortGoals(filtered, sortBy);
  }, [archivedGoals, typeFilter, sortBy]);

  const typeTabs: { value: FilterType; label: string }[] = [
    { value: "all", label: "Semua" },
    { value: "mingguan", label: "Mingguan" },
    { value: "bulanan", label: "Bulanan" },
    { value: "tahunan", label: "Tahunan" },
    { value: "lifetime", label: "Lifetime" },
  ];

  const sortOptions: { value: SortBy; label: string }[] = [
    { value: "newest", label: "Terbaru" },
    { value: "oldest", label: "Terlama" },
    { value: "progress_desc", label: "Progress ↓" },
    { value: "progress_asc", label: "Progress ↑" },
    { value: "target_date", label: "Target Terdekat" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            Tujuan & Milestone
          </h2>
          <p className="text-muted-foreground mt-1">
            Lacak target jangka panjang dan rayakan setiap progress kecil.
          </p>
        </div>
        <GoalForm />
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50 border p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Tujuan Aktif</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
              {activeGoals.length}
            </p>
          </div>
          <Target className="h-8 w-8 text-blue-200 dark:text-blue-800/50" />
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50 border p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Selesai</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
              {completedGoals.length}
            </p>
          </div>
          <CheckCircle2 className="h-8 w-8 text-emerald-200 dark:text-emerald-800/50" />
        </div>
        <div className="bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/50 border p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Rata-rata Progress</p>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">
              {avgProgress}%
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-purple-200 dark:text-purple-800/50" />
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50 border p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Total</p>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">
              {goals.length}
            </p>
          </div>
          <Archive className="h-8 w-8 text-amber-200" />
        </div>
      </div>

      {/* Type Breakdown (active goals only) */}
      {activeGoals.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(typeBreakdown).map(([type, count]) => (
            <button
              key={type}
              onClick={() =>
                setTypeFilter((prev) =>
                  prev === type ? "all" : (type as GoalType)
                )
              }
              className={`p-3 rounded-lg border text-center transition-all ${
                typeFilter === type
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-500"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <p className="text-lg font-bold text-foreground">{count}</p>
              <p className="text-xs text-muted-foreground capitalize">{type}</p>
            </button>
          ))}
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-card p-4 rounded-xl border">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari tujuan..."
            className="pl-9 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Select Type */}
          <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val as FilterType)}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="Semua Tipe" />
            </SelectTrigger>
            <SelectContent>
              {typeTabs.map(tab => (
                 <SelectItem key={tab.value} value={tab.value}>{tab.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Select Sort */}
          <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortBy)}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(opt => (
                 <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Goals */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
          <Clock className="h-4 w-4 text-blue-500" />
          Tujuan Aktif
          {filteredActive.length > 0 && (
            <span className="text-xs text-muted-foreground font-normal">
              ({filteredActive.length})
            </span>
          )}
        </h2>
        <GoalList
          goals={filteredActive}
          emptyMessage={
            searchQuery
              ? `Tidak ada tujuan yang cocok dengan "${searchQuery}".`
              : typeFilter !== "all"
              ? `Tidak ada tujuan ${typeFilter} yang aktif.`
              : "Tidak ada tujuan aktif. Buat satu sekarang!"
          }
          action={!searchQuery && typeFilter === "all" && filteredActive.length === 0 ? <GoalForm /> : undefined}
        />
      </div>

      {/* Completed Goals */}
      {filteredCompleted.length > 0 && (
        <div className="pt-6 border-t">
          <h2 className="text-lg font-semibold mb-4 text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Tujuan Selesai
            <span className="text-xs text-muted-foreground font-normal">
              ({filteredCompleted.length})
            </span>
          </h2>
          <GoalList goals={filteredCompleted} emptyMessage="" />
        </div>
      )}

      {/* Archived Goals */}
      {archivedGoals.length > 0 && (
        <div className="pt-6 border-t">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2 text-lg font-semibold text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <Archive className="h-4 w-4" />
            Diarsipkan
            <span className="text-xs text-muted-foreground font-normal">
              ({archivedGoals.length})
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                showArchived ? "rotate-180" : ""
              }`}
            />
          </button>
          {showArchived && (
            <GoalList goals={filteredArchived} emptyMessage="" />
          )}
        </div>
      )}
    </div>
  );
}

// Helpers

function GoalList({
  goals,
  emptyMessage,
  action
}: {
  goals: Goal[];
  emptyMessage: string;
  action?: React.ReactNode;
}) {
  if (!goals || goals.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-xl bg-card">
        <Target className="h-10 w-10 mb-4 text-muted-foreground/30" />
        <p className="text-center mb-4">{emptyMessage}</p>
        {action && action}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {goals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} />
      ))}
    </div>
  );
}

function sortGoals(goals: Goal[], sortBy: SortBy): Goal[] {
  const sorted = [...goals];
  switch (sortBy) {
    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    case "oldest":
      return sorted.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    case "progress_desc":
      return sorted.sort((a, b) => b.progress - a.progress);
    case "progress_asc":
      return sorted.sort((a, b) => a.progress - b.progress);
    case "target_date":
      return sorted.sort((a, b) => {
        if (!a.target_date) return 1;
        if (!b.target_date) return -1;
        return (
          new Date(a.target_date).getTime() - new Date(b.target_date).getTime()
        );
      });
    default:
      return sorted;
  }
}

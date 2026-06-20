"use client";

import { useState, useMemo } from "react";
import { Goal, GoalType } from "../types/goal.types";
import { GoalCard } from "./GoalCard";
import { GoalForm } from "./GoalForm";
import { Target, TrendingUp, Archive, Filter, CheckCircle2, Clock, ChevronDown, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageContextSetter } from "@/features/ai/components/PageContextSetter";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';



interface GoalsClientProps {
  goals: Goal[];
}

type FilterType = "all" | GoalType;
type SortBy = "newest" | "oldest" | "progress_asc" | "progress_desc" | "target_date";

export function GoalsClient({ goals }: GoalsClientProps) {
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // Stats
  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");
  const archivedGoals = goals.filter((g) => g.status === "archived");

  // Extract unique categories dynamically
  const categories = useMemo(() => {
    const cats = goals.map((g) => g.category).filter((c): c is string => !!c);
    return Array.from(new Set(cats)).sort();
  }, [goals]);

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
      filtered = filtered.filter(g => 
        g.title.toLowerCase().includes(q) || 
        g.description?.toLowerCase().includes(q) ||
        g.category?.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== "all") {
      filtered = filtered.filter((g) => g.goal_type === typeFilter);
    }
    if (categoryFilter !== "all") {
      filtered = filtered.filter((g) => g.category === categoryFilter);
    }
    return sortGoals(filtered, sortBy);
  }, [activeGoals, typeFilter, categoryFilter, sortBy, searchQuery]);

  // Filtered completed goals
  const filteredCompleted = useMemo(() => {
    let filtered = completedGoals;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(g => 
        g.title.toLowerCase().includes(q) || 
        g.description?.toLowerCase().includes(q) ||
        g.category?.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== "all") {
      filtered = filtered.filter((g) => g.goal_type === typeFilter);
    }
    if (categoryFilter !== "all") {
      filtered = filtered.filter((g) => g.category === categoryFilter);
    }
    return sortGoals(filtered, sortBy);
  }, [completedGoals, typeFilter, categoryFilter, sortBy, searchQuery]);

  // Filtered archived goals
  const filteredArchived = useMemo(() => {
    let filtered = archivedGoals;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(g => 
        g.title.toLowerCase().includes(q) || 
        g.description?.toLowerCase().includes(q) ||
        g.category?.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== "all") {
      filtered = filtered.filter((g) => g.goal_type === typeFilter);
    }
    if (categoryFilter !== "all") {
      filtered = filtered.filter((g) => g.category === categoryFilter);
    }
    return sortGoals(filtered, sortBy);
  }, [archivedGoals, typeFilter, categoryFilter, sortBy, searchQuery]);

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

  const activeFilterCount = [
    typeFilter !== 'all',
    categoryFilter !== 'all',
    sortBy !== 'newest',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setTypeFilter('all');
    setCategoryFilter('all');
    setSortBy('newest');
  };

  return (
    <div className="space-y-6">
      <PageContextSetter context="Manajemen Tujuan" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-5 rounded-2xl border glow-card">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-7 w-7 text-primary" />
            Tujuan & Milestone
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Lacak target jangka panjang dan rayakan setiap progress kecil.
          </p>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Tujuan Aktif */}
        <div className="flex items-center gap-3 p-3 rounded-xl border bg-card/50 glow-card hover-border-primary transition-all">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-background text-blue-500">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold leading-none text-blue-500">{activeGoals.length}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Tujuan Aktif</div>
          </div>
        </div>

        {/* Selesai */}
        <div className="flex items-center gap-3 p-3 rounded-xl border bg-card/50 glow-card hover-border-primary transition-all">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-background text-emerald-500">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold leading-none text-emerald-500">{completedGoals.length}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Selesai</div>
          </div>
        </div>

        {/* Rata-rata Progress */}
        <div className="flex items-center gap-3 p-3 rounded-xl border bg-card/50 glow-card hover-border-primary transition-all">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-background text-purple-500">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold leading-none text-purple-500">{avgProgress}%</div>
            <div className="text-xs text-muted-foreground mt-0.5">Rata-rata Progress</div>
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center gap-3 p-3 rounded-xl border bg-card/50 glow-card hover-border-primary transition-all">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-background text-amber-500">
            <Archive className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold leading-none text-amber-500">{goals.length}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Total</div>
          </div>
        </div>
      </div>

      {/* Type Filter Tabs */}
      <div className="flex bg-muted/60 p-1 rounded-xl border gap-1 overflow-x-auto scrollbar-none">
        {typeTabs.map(tab => {
          const isActive = typeFilter === tab.value;
          // Count active goals for this type
          const count = tab.value === 'all' 
            ? activeGoals.length 
            : activeGoals.filter(g => g.goal_type === tab.value).length;

          return (
            <button
              key={tab.value}
              onClick={() => setTypeFilter(tab.value)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              <span className="capitalize">{tab.label}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/15 text-muted-foreground'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-card p-4 rounded-2xl border glow-card">
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
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger
              id="goal-filter-btn"
              className={`flex items-center gap-1.5 text-xs px-3 h-9 rounded-xl border transition-colors ${
                activeFilterCount > 0
                  ? 'bg-primary/10 border-primary/30 text-primary font-semibold'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filter
              {activeFilterCount > 0 && (
                <span className="bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground">Filter Lanjutan</h4>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-[10px] text-primary hover:underline font-semibold"
                    >
                      Reset semua
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Select Type */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tipe</label>
                    <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val as FilterType)}>
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Semua Tipe">
                          {typeTabs.find(t => t.value === typeFilter)?.label}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {typeTabs.map(tab => (
                           <SelectItem key={tab.value} value={tab.value}>{tab.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Select Category */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Kategori</label>
                    <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val || "all")}>
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Semua Kategori">
                          {categoryFilter === 'all' ? 'Semua Kategori' : categoryFilter}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        {categories.map(cat => (
                           <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Select Sort */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Urutan</label>
                    <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortBy)}>
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Urutkan">
                          {sortOptions.find(opt => opt.value === sortBy)?.label}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map(opt => (
                           <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <GoalForm />
        </div>
      </div>



      {/* Active Goals */}
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
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
          <h2 className="text-lg font-bold mb-4 text-muted-foreground flex items-center gap-2">
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
            className="flex items-center gap-2 text-lg font-bold text-muted-foreground hover:text-foreground transition-colors mb-4"
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

import { EmptyState } from "@/components/shared/empty-state";

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
      <EmptyState
        icon={<Target className="h-6 w-6" />}
        title="Tidak ada tujuan"
        description={emptyMessage}
        action={action}
      />
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

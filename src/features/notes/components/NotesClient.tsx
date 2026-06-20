"use client";

import { useState, useMemo } from "react";
import { NoteWithDetails } from "../types/note.types";
import { NoteList } from "./NoteList";
import { CreateNoteButton } from "./CreateNoteButton";
import { Search, X, Filter, ChevronDown, BookOpen, Star, Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SORT_LABELS: Record<string, string> = {
  newest: 'Terbaru Diperbarui',
  oldest: 'Terlama Diperbarui',
  title_asc: 'Judul A-Z',
  title_desc: 'Judul Z-A',
};
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PageContextSetter } from "@/features/ai/components/PageContextSetter";

interface NotesClientProps {
  initialNotes: NoteWithDetails[];
}

type TabType = "all" | "favorite" | "linked";
type SortBy = "newest" | "oldest" | "title_asc" | "title_desc";

export function NotesClient({ initialNotes }: NotesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [filterOpen, setFilterOpen] = useState(false);

  // Extract unique tags dynamically
  const uniqueTags = useMemo(() => {
    const tags = initialNotes.flatMap((n) => n.tags?.map((t) => t.tag) || []);
    return Array.from(new Set(tags)).sort();
  }, [initialNotes]);

  // Tab count stats
  const allCount = initialNotes.length;
  const favoriteCount = initialNotes.filter((n) => n.is_favorite).length;
  const linkedCount = initialNotes.filter((n) => n.links && n.links.length > 0).length;

  // Filter notes list
  const filteredNotes = useMemo(() => {
    let result = [...initialNotes];

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          (n.content && n.content.toLowerCase().includes(q)) ||
          (n.excerpt && n.excerpt.toLowerCase().includes(q)) ||
          n.tags?.some((t) => t.tag.toLowerCase().includes(q))
      );
    }

    // 2. Tab Filter
    if (activeTab === "favorite") {
      result = result.filter((n) => n.is_favorite);
    } else if (activeTab === "linked") {
      result = result.filter((n) => n.links && n.links.length > 0);
    }

    // 3. Tag Filter
    if (selectedTag !== "all") {
      result = result.filter((n) => n.tags?.some((t) => t.tag === selectedTag));
    }

    // 4. Sorting
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      }
      if (sortBy === "title_asc") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "title_desc") {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });

    return result;
  }, [initialNotes, searchQuery, activeTab, selectedTag, sortBy]);

  const activeFilterCount = [
    selectedTag !== "all",
    sortBy !== "newest",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedTag("all");
    setSortBy("newest");
  };

  return (
    <div className="space-y-6">
      <PageContextSetter context="Second Brain" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-5 rounded-2xl border glow-card">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary" />
            Second Brain
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Simpan ide, rangkuman, dan basis pengetahuan Anda secara terorganisir.
          </p>
        </div>
      </div>

      {/* Stats Cards (Visual Summary) */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-3 p-3 rounded-xl border bg-card/50 glow-card hover-border-primary transition-all">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-background text-primary">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold leading-none text-primary">{allCount}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Total Catatan</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl border bg-card/50 glow-card hover-border-primary transition-all">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-background text-yellow-500">
            <Star className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold leading-none text-yellow-500">{favoriteCount}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Favorit</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl border bg-card/50 glow-card hover-border-primary transition-all">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-background text-blue-500">
            <LinkIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold leading-none text-blue-500">{linkedCount}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Terkait Entitas</div>
          </div>
        </div>
      </div>

      {/* Segmented Tabs */}
      <div className="flex bg-muted/60 p-1 rounded-xl border gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "all"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <span>Semua</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
            activeTab === "all" ? "bg-primary text-primary-foreground" : "bg-muted-foreground/15 text-muted-foreground"
          }`}>
            {allCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("favorite")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "favorite"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <span>Favorit</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
            activeTab === "favorite" ? "bg-primary text-primary-foreground" : "bg-muted-foreground/15 text-muted-foreground"
          }`}>
            {favoriteCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("linked")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "linked"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <span>Terkait</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
            activeTab === "linked" ? "bg-primary text-primary-foreground" : "bg-muted-foreground/15 text-muted-foreground"
          }`}>
            {linkedCount}
          </span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-card p-4 rounded-2xl border glow-card">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari judul, isi, atau tag..."
            className="pl-9 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger
              id="notes-filter-btn"
              className={`flex items-center gap-1.5 text-xs px-3 h-9 rounded-xl border transition-colors ${
                activeFilterCount > 0
                  ? "bg-primary/10 border-primary/30 text-primary font-semibold"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filter
              {activeFilterCount > 0 && (
                <span className="bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${filterOpen ? "rotate-180" : ""}`} />
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
                  {/* Filter Tag */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tag</label>
                    <Select value={selectedTag} onValueChange={(val) => setSelectedTag(val || "all")}>
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Semua Tag">
                          {selectedTag === 'all' ? 'Semua Tag' : `#${selectedTag}`}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Tag</SelectItem>
                        {uniqueTags.map((tag) => (
                          <SelectItem key={tag} value={tag}>
                            #{tag}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Select Sort */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Urutan</label>
                    <Select value={sortBy} onValueChange={(val) => val && setSortBy(val as SortBy)}>
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Urutkan">
                          {SORT_LABELS[sortBy]}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Terbaru Diperbarui</SelectItem>
                        <SelectItem value="oldest">Terlama Diperbarui</SelectItem>
                        <SelectItem value="title_asc">Judul A-Z</SelectItem>
                        <SelectItem value="title_desc">Judul Z-A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <CreateNoteButton />
        </div>
      </div>

      {/* Note List */}
      <NoteList notes={filteredNotes} />
    </div>
  );
}

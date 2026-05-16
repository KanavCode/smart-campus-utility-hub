import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Search,
  Users,
  BookOpen,
  GraduationCap,
  User as UserIcon,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { searchService, SearchResult } from "@/services/searchService";
import { useDebounce } from "@/hooks/use-debounce";

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await searchService.globalSearch(debouncedQuery);
        setResults(response.data.results);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const onSelect = (result: SearchResult) => {
    setOpen(false);
    switch (result.type) {
      case "event":
        navigate(`/events?id=${result.id}`);
        break;
      case "club":
        navigate(`/clubs?id=${result.id}`);
        break;
      case "elective":
        navigate(`/electives?id=${result.id}`);
        break;
      case "subject":
        navigate(`/admin/subjects?id=${result.id}`);
        break;
      case "teacher":
        navigate(`/admin/teachers?id=${result.id}`);
        break;
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-accent/30 hover:bg-accent/50 rounded-md border border-border/50 transition-colors w-40 md:w-64"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 ml-auto">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search events, clubs, teachers..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {loading && <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>}
          {!loading && results.length === 0 && query.length >= 2 && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
          
          <CommandGroup heading="Events">
            {results.filter(r => r.type === 'event').map((result) => (
              <CommandItem key={`${result.type}-${result.id}`} onSelect={() => onSelect(result)}>
                <Calendar className="mr-2 h-4 w-4" />
                <span>{result.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Clubs">
            {results.filter(r => r.type === 'club').map((result) => (
              <CommandItem key={`${result.type}-${result.id}`} onSelect={() => onSelect(result)}>
                <Users className="mr-2 h-4 w-4" />
                <span>{result.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Electives">
            {results.filter(r => r.type === 'elective').map((result) => (
              <CommandItem key={`${result.type}-${result.id}`} onSelect={() => onSelect(result)}>
                <BookOpen className="mr-2 h-4 w-4" />
                <span>{result.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Academics">
            {results.filter(r => r.type === 'subject').map((result) => (
              <CommandItem key={`${result.type}-${result.id}`} onSelect={() => onSelect(result)}>
                <GraduationCap className="mr-2 h-4 w-4" />
                <span>{result.name}</span>
              </CommandItem>
            ))}
            {results.filter(r => r.type === 'teacher').map((result) => (
              <CommandItem key={`${result.type}-${result.id}`} onSelect={() => onSelect(result)}>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>{result.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

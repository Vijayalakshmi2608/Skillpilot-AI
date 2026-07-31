import { useMemo, useState } from "react";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SearchBar } from "@/components/common/SearchBar";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface ManagementColumn<T> {
  header: string;
  className?: string;
  hidden?: string; // tailwind responsive hide class
  render: (row: T) => React.ReactNode;
}

interface ManagementTableProps<T> {
  title: string;
  description?: string;
  data: T[];
  columns: ManagementColumn<T>[];
  searchKeys: (keyof T & string)[];
  searchPlaceholder?: string;
  filters?: { key: keyof T & string; label: string; options: string[] }[];
  addLabel?: string;
  icon?: React.ReactNode;
  pageSize?: number;
  entityName: string;
}

function ManagementTable<T>({
  title,
  description,
  data,
  columns,
  searchKeys,
  searchPlaceholder = "Search...",
  filters = [],
  addLabel,
  icon,
  pageSize = 8,
  entityName,
}: ManagementTableProps<T>) {
  const [query, setQuery] = useState("");
  const [filterState, setFilterState] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return data.filter((row) => {
      const mq = !q || searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q));
      const mf = filters.every((f) => !filterState[f.key] || filterState[f.key] === "All" || String(row[f.key] ?? "") === filterState[f.key]);
      return mq && mf;
    });
  }, [data, query, filterState, searchKeys, filters]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages - 1);
  const rows = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const reset = () => {
    setQuery("");
    setFilterState({});
    setPage(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {icon && <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">{icon}</span>}
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        {addLabel && (
          <Button size="sm" onClick={() => toast.info(`Add ${entityName} is a UI-only demo`)}>
            <Plus className="h-4 w-4" /> {addLabel}
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_repeat(auto-fit,minmax(150px,180px))]">
            <SearchBar value={query} onChange={(v) => { setQuery(v); setPage(0); }} placeholder={searchPlaceholder} />
            {filters.map((f) => (
              <Select key={f.key} value={filterState[f.key] ?? "All"} onChange={(e) => { setFilterState({ ...filterState, [f.key]: e.target.value }); setPage(0); }} aria-label={f.label}>
                <option value="All">{f.label}: All</option>
                {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </Select>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  {columns.map((c) => (
                    <th key={c.header} className={cn("px-5 py-3 font-semibold", c.hidden, c.className)}>{c.header}</th>
                  ))}
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b transition-colors last:border-0 hover:bg-muted/40">
                    {columns.map((c) => (
                      <td key={c.header} className={cn("px-5 py-3", c.hidden, c.className)}>{c.render(row)}</td>
                    ))}
                    <td className="px-5 py-3 text-right">
                      <DropdownMenu trigger={<Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>}>
                        {(close) => (
                          <>
                            <DropdownItem onClick={close}><Pencil className="h-4 w-4" /> Edit</DropdownItem>
                            <DropdownItem onClick={() => { close(); toast.info(`View ${entityName} details (UI demo)`); }}>View Details</DropdownItem>
                            <DropdownItem className="text-destructive" onClick={() => { close(); toast.error(`${entityName} deleted (UI demo)`); }}><Trash2 className="h-4 w-4" /> Delete</DropdownItem>
                          </>
                        )}
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.length === 0 && (
            <div className="p-6">
              <EmptyState title={`No ${entityName.toLowerCase()} found`} description="Try adjusting your search or filters." />
            </div>
          )}

          <div className="flex items-center justify-between border-t px-5 py-3 text-sm">
            <p className="text-muted-foreground">{filtered.length} {entityName.toLowerCase()} · page {safePage + 1} of {pages}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>Previous</Button>
              <Button size="sm" variant="outline" disabled={safePage >= pages - 1} onClick={() => setPage(safePage + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {Object.keys(filterState).some((k) => filterState[k] !== "All") && (
        <div className="text-center">
          <Button variant="ghost" size="sm" onClick={reset}>Reset filters</Button>
        </div>
      )}
    </div>
  );
}

export { ManagementTable };

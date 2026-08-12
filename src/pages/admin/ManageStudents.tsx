import { useMemo, useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBar } from "@/components/common/SearchBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/common/EmptyState";
import { DropdownMenu, DropdownItem } from "@/components/ui/dropdown-menu";
import { students } from "@/data/students";
import { cn } from "@/lib/utils";

function ManageStudents() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(0);
  const pageSize = 8;

  const filtered = useMemo(
    () =>
      students.filter((s) => {
        const q = query.toLowerCase();
        const mq = !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.city.toLowerCase().includes(q);
        const ms = status === "All" || s.status === status;
        return mq && ms;
      }),
    [query, status]
  );

  const pages = Math.ceil(filtered.length / pageSize);
  const rows = filtered.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Students"
        description="Search, filter and manage all registered students."
        breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Students" }]}
        icon={Users}
        actions={<Button size="sm" onClick={() => toast.info("Invite student (UI demo)")}>Invite Student</Button>}
      />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <SearchBar value={query} onChange={setQuery} placeholder="Search name, email, city..." className="flex-1" />
            <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }} className="md:w-44" aria-label="Status">
              <option>All</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Inactive</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Student</th>
                  <th className="hidden px-5 py-3 font-semibold md:table-cell">Stream</th>
                  <th className="hidden px-5 py-3 font-semibold lg:table-cell">Career Interest</th>
                  <th className="px-5 py-3 font-semibold">Progress</th>
                  <th className="hidden px-5 py-3 font-semibold sm:table-cell">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id} className="border-b transition-colors last:border-0 hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar initials={s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)} color="bg-gradient-to-br from-blue-600 to-indigo-600" size="sm" />
                        <div>
                          <p className="font-medium">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-5 py-3 md:table-cell"><Badge variant="muted">{s.stream}</Badge></td>
                    <td className="hidden px-5 py-3 lg:table-cell"><span className="text-muted-foreground">{s.domain}</span></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Progress value={s.progress} className="h-1.5 w-20" />
                        <span className="text-xs font-semibold">{s.progress}%</span>
                      </div>
                    </td>
                    <td className="hidden px-5 py-3 sm:table-cell">
                      <Badge variant={s.status === "Active" ? "success" : s.status === "Pending" ? "warning" : "muted"}>{s.status}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <DropdownMenu trigger={<Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>}>
                        {(close) => (
                          <>
                            <DropdownItem onClick={close}><Pencil className="h-4 w-4" /> Edit</DropdownItem>
                            <DropdownItem onClick={() => { close(); toast.info("View profile (UI demo)"); }}>View Profile</DropdownItem>
                            <DropdownItem className="text-destructive" onClick={() => { close(); toast.error("Student deleted (UI demo)"); }}><Trash2 className="h-4 w-4" /> Delete</DropdownItem>
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
              <EmptyState title="No students found" description="Try adjusting your search or filters." />
            </div>
          )}

          <div className="flex items-center justify-between border-t px-5 py-3 text-sm">
            <p className="text-muted-foreground">{filtered.length} students · page {page + 1} of {Math.max(pages, 1)}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
              <Button size="sm" variant="outline" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { ManageStudents };

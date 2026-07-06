import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Role } from "@prisma/client";
import type { User } from "@/hooks/useUsers";

const roleLabel: Record<Role, string> = {
  ADMIN: "Admin",
  DENTIST: "Stomatolog",
  ASSISTANT: "Asistent",
};
const roleBadgeVariant: Record<Role, "teal" | "info" | "warning"> = {
  ADMIN: "teal",
  DENTIST: "info",
  ASSISTANT: "warning",
};

interface Props {
  users: User[];
  isPending: boolean;
  currentUserId: string;
  onDeleteRequest: (id: string) => void;
}

export function StaffTable({
  users,
  isPending,
  currentUserId,
  onDeleteRequest,
}: Props) {
  const showClinicColumn = new Set(users.map((u) => u.clinic.name)).size > 1;
  return (
    <>
      {/* desktop table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ime</TableHead>
              <TableHead>Email</TableHead>
              {showClinicColumn && <TableHead>Klinika</TableHead>}
              <TableHead>Uloga</TableHead>
              <TableHead>Dodat</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending
              ? Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.email}
                    </TableCell>
                    {showClinicColumn && (
                      <TableCell className="text-muted-foreground">
                        {u.clinic.name}
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge variant={roleBadgeVariant[u.role]}>
                        {roleLabel[u.role]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(u.createdAt)}
                    </TableCell>
                    <TableCell>
                      {u.id !== currentUserId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-red-50"
                          onClick={() => onDeleteRequest(u.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* mobile cards */}
      <div className="block md:hidden space-y-3">
        {isPending
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))
          : users.map((u) => (
              <div
                key={u.id}
                className="flex items-start justify-between p-3 rounded-lg bg-muted/50"
              >
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                  {showClinicColumn && (
                    <p className="text-sm text-muted-foreground">
                      {u.clinic.name}
                    </p>
                  )}
                  <Badge variant={roleBadgeVariant[u.role]} className="mt-1">
                    {roleLabel[u.role]}
                  </Badge>
                </div>
                {u.id !== currentUserId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => onDeleteRequest(u.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
      </div>
    </>
  );
}

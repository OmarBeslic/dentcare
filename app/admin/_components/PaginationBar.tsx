"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  isPending?: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function PaginationBar({ page, totalPages, isPending, onPrev, onNext }: Props) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-2">
      <p className="text-sm text-muted-foreground">
        Stranica {page} od {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page === 1 || isPending} onClick={onPrev}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Prethodna
        </Button>
        <Button variant="outline" size="sm" disabled={page === totalPages || isPending} onClick={onNext}>
          Sljedeća <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

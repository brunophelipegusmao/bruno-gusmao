"use client";

import { useEffect, useState } from "react";
import { Button } from "@base-ui/react/button";
import CommonCard from "@/components/Common/commonCard";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export interface GridItemAction {
  label: string;
  href?: string;
}

export interface GridItem {
  id: number;
  image: { src: string; alt: string };
  title: string;
  description: string;
  badges: string[];
  actions: GridItemAction[];
}

interface CommonGridProps {
  items: GridItem[];
}

function useCardsPerPage() {
  const [cardsPerPage, setCardsPerPage] = useState(6);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = (e: MediaQueryList | MediaQueryListEvent) => {
      setCardsPerPage(e.matches ? 3 : 6);
    };
    update(mq);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return cardsPerPage;
}

export default function CommonGrid({ items }: CommonGridProps) {
  const cardsPerPage = useCardsPerPage();
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(items.length / cardsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [cardsPerPage]);

  const start = (currentPage - 1) * cardsPerPage;
  const visibleItems = items.slice(start, start + cardsPerPage);

  const goTo = (p: number) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

  return (
    <>
      <section className="w-full px-3 pb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleItems.map((item) => (
          <CommonCard
            key={item.id}
            image={item.image}
            title={item.title}
            description={item.description}
            badges={item.badges}
          >
            {item.actions.map((action) => (
              <Button
                key={action.label}
                className="bg-background text-foreground py-3 px-2 rounded-xl"
              >
                {action.label}
              </Button>
            ))}
          </CommonCard>
        ))}
      </section>

      <div className="py-8">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => { e.preventDefault(); goTo(currentPage - 1); }}
                aria-disabled={currentPage === 1}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const showPage = p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1;
              const showEllipsisBefore = p === currentPage - 2 && currentPage > 3;
              const showEllipsisAfter = p === currentPage + 2 && currentPage < totalPages - 2;

              if (showEllipsisBefore || showEllipsisAfter) {
                return (
                  <PaginationItem key={`ellipsis-${p}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              if (!showPage) return null;

              return (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => { e.preventDefault(); goTo(p); }}
                    isActive={p === currentPage}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => { e.preventDefault(); goTo(currentPage + 1); }}
                aria-disabled={currentPage === totalPages}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </>
  );
}

"use client";

import { Avatar, AvatarFallback } from "@fewtone/ui/components/avatar/avatar";
import { Button } from "@fewtone/ui/components/button/button";
import { Skeleton } from "@fewtone/ui/components/skeleton/skeleton";
import { blur, duration, ease } from "@fewtone/ui/lib/motion";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/*
 * Reload: the profile gives way to its skeleton, and comes back through the blur when it has "loaded". Both sit
 * in one grid cell, so nothing below moves. The skeleton only fades (it's a fill), the content sharpens in.
 * While it loads, the region is aria-busy and a status says so.
 */
export default function SkeletonLoading() {
  const [loading, setLoading] = useState(false);
  const reduce = useReducedMotion() ?? false;

  // Stands in for a request
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <div className="grid w-full max-w-xs justify-items-start gap-6">
      <div aria-busy={loading} className="grid w-full">
        <AnimatePresence initial={false}>
          {loading ? (
            <motion.div
              key="skeleton"
              className="col-start-1 row-start-1 flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: duration.fast, ease: ease.out }}
            >
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="grid flex-1 gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="profile"
              className="col-start-1 row-start-1 flex items-center gap-3"
              initial={{ opacity: 0, filter: reduce ? blur.shown : blur.hidden }}
              animate={{ opacity: 1, filter: blur.shown }}
              exit={{ opacity: 0, transition: { duration: duration.fast, ease: ease.in } }}
              transition={{ duration: duration.base, ease: ease.out }}
            >
              <Avatar size="lg">
                <AvatarFallback>SD</AvatarFallback>
              </Avatar>
              <div className="grid min-w-0">
                <span className="truncate text-sm font-medium">Sofia Davis</span>
                <span className="truncate text-sm text-muted-foreground">Design lead, Lisbon</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <span role="status" className="sr-only">
        {loading ? "Loading profile" : ""}
      </span>
      <Button variant="outline" size="sm" onClick={() => setLoading(true)}>
        Reload
      </Button>
    </div>
  );
}

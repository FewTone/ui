"use client";

import { blur, duration, ease } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { animate, useReducedMotion } from "motion/react";
import { Avatar as AvatarPrimitive } from "radix-ui";
import {
  type ComponentProps,
  createContext,
  type Ref,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

/*
 * An avatar on Radix Avatar (owner's roadmap, 2026-10-16: "A picture or initials, alone or in a group"), with
 * shadcn's parts: Avatar, AvatarImage, AvatarFallback, AvatarGroup and AvatarGroupCount ("+3"), in three sizes.
 * - Motion (.agents/rules/motion.md): once the picture has loaded, it comes in through the blur over the initials,
 *   which stay underneath until it's sharp, so nothing pops or jumps. With reduced motion it only fades.
 * - Nothing animates on first paint: the picture comes in only when the avatar was on screen without it first
 *   (rendered on the server, or still loading). A picture that's ready on the avatar's first paint just shows.
 * - The initials speak for the picture: while they stand in, they carry its alt as their name, so a screen reader
 *   hears "Olivia Martin" whether or not the picture has loaded. With alt="" (a name beside it) they're hidden too.
 * - Radix mounts the img only once it has loaded, and drops its own fallback that moment. So the fallback here is
 *   our own span, which the picture tells when it's fully in.
 * - In a group, a ring in the page's background colour separates the overlapping circles.
 */

/** Where the picture is: not on screen, coming in over the initials, or fully in */
type Picture = "none" | "entering" | "shown";

const AvatarContext = createContext<{
  picture: Picture;
  setPicture: (picture: Picture) => void;
  /** The picture's alt, which the initials carry while they stand in for it */
  alt: string | undefined;
  setAlt: (alt: string | undefined) => void;
  /** Rendered on the server, so the initials were painted before the picture could load */
  fromServer: boolean;
} | null>(null);

function useAvatar(part: string) {
  const avatar = useContext(AvatarContext);
  if (!avatar) throw new Error(`${part} must be used inside Avatar`);
  return avatar;
}

const subscribe = () => () => {};

const avatarVariants = cva("group/avatar relative flex shrink-0 overflow-hidden rounded-full select-none", {
  variants: {
    size: {
      sm: "size-6",
      md: "size-8",
      lg: "size-10",
    },
  },
  defaultVariants: { size: "md" },
});

export type AvatarProps = ComponentProps<typeof AvatarPrimitive.Root> & VariantProps<typeof avatarVariants>;

function Avatar({ className, size, ...props }: AvatarProps) {
  // While hydrating, React reads the server value (false): the avatar knows its initials were painted first
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [fromServer] = useState(!hydrated);
  const [picture, setPicture] = useState<Picture>("none");
  const [alt, setAlt] = useState<string>();
  const value = useMemo(() => ({ picture, setPicture, alt, setAlt, fromServer }), [picture, alt, fromServer]);

  return (
    <AvatarContext.Provider value={value}>
      <AvatarPrimitive.Root
        data-slot="avatar"
        data-size={size ?? "md"}
        className={cn(avatarVariants({ size }), className)}
        {...props}
      />
    </AvatarContext.Provider>
  );
}

/** Hands a node to our ref and to the caller's */
function useMergedRef<T>(own: RefObject<T | null>, theirs?: Ref<T>) {
  return useCallback(
    (node: T | null) => {
      own.current = node;
      if (typeof theirs === "function") theirs(node);
      else if (theirs) theirs.current = node;
    },
    [own, theirs],
  );
}

export type AvatarImageProps = ComponentProps<typeof AvatarPrimitive.Image>;

/**
 * The picture. Radix loads it first and only then puts it on the page, so a broken or missing `src` leaves the
 * initials. Give it an `alt` with the person's name, or alt="" when the name is written beside the avatar.
 */
function AvatarImage({ className, alt, ref, onLoadingStatusChange, ...props }: AvatarImageProps) {
  const { setPicture, setAlt, fromServer } = useAvatar("AvatarImage");
  const reduce = useReducedMotion() ?? false;
  const node = useRef<HTMLImageElement | null>(null);
  const setRef = useMergedRef(node, ref);
  const [loaded, setLoaded] = useState(false);
  // Whether the avatar has been on screen without its picture: then the picture comes in, rather than just
  // being there
  const waited = useRef(fromServer);
  // Read when the picture arrives, so a change of preference never replays it
  const reduceRef = useRef(reduce);
  useEffect(() => {
    reduceRef.current = reduce;
  }, [reduce]);

  useLayoutEffect(() => {
    setAlt(alt);
    return () => setAlt(undefined);
  }, [alt, setAlt]);

  // Radix reports "loaded" in the same commit that puts the img on the page, so this runs before it's painted
  useLayoutEffect(() => {
    const image = node.current;
    if (!loaded || !image) return;
    if (!waited.current) {
      setPicture("shown");
      return () => setPicture("none");
    }
    setPicture("entering");
    image.style.opacity = "0";
    let done = false;
    const controls = animate(
      image,
      reduceRef.current ? { opacity: [0, 1] } : { opacity: [0, 1], filter: [blur.hidden, blur.shown] },
      { duration: duration.base, ease: ease.out },
    );
    controls.then(() => {
      if (done) return;
      done = true;
      // No filter or inline opacity left behind (ADR 0011)
      image.style.removeProperty("filter");
      image.style.removeProperty("opacity");
      setPicture("shown");
    });
    return () => {
      done = true;
      controls.stop();
      setPicture("none");
    };
  }, [loaded, setPicture]);

  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      ref={setRef}
      alt={alt}
      onLoadingStatusChange={(status) => {
        // Loading and failing both leave the initials on screen for at least a frame
        if (status === "loading" || status === "error") waited.current = true;
        setLoaded(status === "loaded");
        onLoadingStatusChange?.(status);
      }}
      className={cn("absolute inset-0 size-full object-cover", className)}
      {...props}
    />
  );
}

export type AvatarFallbackProps = ComponentProps<"span"> & {
  /** Wait this long before showing the initials, so a picture that loads quickly never flashes them */
  delayMs?: number;
};

/** Initials (or an icon) shown until the picture has loaded, and instead of it when it can't */
function AvatarFallback({ className, delayMs, ...props }: AvatarFallbackProps) {
  const { picture, alt } = useAvatar("AvatarFallback");
  const [ready, setReady] = useState(delayMs === undefined);

  useEffect(() => {
    if (delayMs === undefined) return;
    const timer = window.setTimeout(() => setReady(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  if (!ready || picture === "shown") return null;
  // Standing in, it reads as the picture would. While the picture comes in over it, it's only seen.
  const standingIn = picture === "none";
  const name = standingIn && alt ? { role: "img", "aria-label": alt } : {};
  return (
    <span
      data-slot="avatar-fallback"
      aria-hidden={!standingIn || alt === "" ? true : undefined}
      {...name}
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground",
        "group-data-[size=sm]/avatar:text-xs group-data-[size=lg]/avatar:text-base",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Avatars that overlap, each ringed in the page's background colour. A group (role="group"): name it with
 * aria-label, for example "Team".
 */
function AvatarGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: a group of pictures, not form fields, so not a fieldset
    <div
      role="group"
      data-slot="avatar-group"
      className={cn(
        "group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
        className,
      )}
      {...props}
    />
  );
}

/** The last circle in a group, for the people not shown ("+3"). It takes the size of the avatars beside it. */
function AvatarGroupCount({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-group-count"
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground ring-2 ring-background",
        "group-has-data-[size=sm]/avatar-group:size-6 group-has-data-[size=sm]/avatar-group:text-xs",
        "group-has-data-[size=lg]/avatar-group:size-10",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage };

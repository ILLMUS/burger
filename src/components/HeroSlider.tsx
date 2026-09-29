import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

import heroSmash from "@/assets/hero-smash.jpg";
import heroDouble from "@/assets/hero-double.jpg";
import heroChicken from "@/assets/hero-chicken.jpg";
import heroFries from "@/assets/hero-fries.jpg";
import heroExperience from "@/assets/hero-experience.jpg";

const MENU_ITEMS = [
  {
    id: "big-smash",
    src: heroSmash,
    title: "Big Smash",
    category: "Signature Beef",
    price: "$11.99",
    tagline: "Crispy edges. Juicy center.",
  },
  {
    id: "double-smash",
    src: heroDouble,
    title: "Double Smash",
    category: "Double Stack",
    price: "$14.49",
    tagline: "Double Angus beef, melted cheddar.",
  },
  {
    id: "crispy-chicken",
    src: heroChicken,
    title: "Crispy Chicken",
    category: "Poultry",
    price: "$12.50",
    tagline: "Spicy glaze, honey mustard slaw.",
  },
  {
    id: "loaded-fries",
    src: heroFries,
    title: "Loaded Fries",
    category: "Sides",
    price: "$7.99",
    tagline: "Truffle oil, parmesan, cheddar.",
  },
  {
    id: "explorer",
    src: heroExperience,
    title: "Explorer Feast",
    category: "Feast for Two",
    price: "$28.99",
    tagline: "The ultimate curated tasting menu.",
  },
];

type TransitionDirection = "next" | "previous";

export function HeroSlider() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isSignedIn = !!user;

  const [index, setIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState<number | null>(null);
  const [direction, setDirection] =
    useState<TransitionDirection>("next");
  const [isAnimating, setIsAnimating] = useState(false);
  const [impact, setImpact] = useState(false);

  const autoPlayRef = useRef<number | null>(null);

  const current = MENU_ITEMS[index];
  const incoming =
    nextIndex !== null ? MENU_ITEMS[nextIndex] : null;

  const clearAutoPlay = () => {
    if (autoPlayRef.current !== null) {
      window.clearTimeout(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  };

  const getNextIndex = (
    requestedIndex: number,
  ) => {
    return (
      (requestedIndex + MENU_ITEMS.length) %
      MENU_ITEMS.length
    );
  };

  const changeProduct = useCallback(
    (
      requestedIndex: number,
      transitionDirection: TransitionDirection = "next",
    ) => {
      if (isAnimating) return;

      const normalizedIndex =
        getNextIndex(requestedIndex);

      if (normalizedIndex === index) return;

      clearAutoPlay();

      setDirection(transitionDirection);
      setNextIndex(normalizedIndex);
      setIsAnimating(true);
      setImpact(false);
    },
    [index, isAnimating],
  );

  const nextProduct = () => {
    changeProduct(
      index + 1,
      "next",
    );
  };

  const previousProduct = () => {
    changeProduct(
      index - 1,
      "previous",
    );
  };

  /*
   * Automatic rotation.
   */
  useEffect(() => {
    if (isAnimating) return;

    autoPlayRef.current = window.setTimeout(() => {
      nextProduct();
    }, 5000);

    return () => clearAutoPlay();
  }, [index, isAnimating]);

  /*
   * Cleanup.
   */
  useEffect(() => {
    return () => clearAutoPlay();
  }, []);

  /*
   * Called when the incoming burger reaches
   * the main product.
   */
  const handleIncomingComplete = () => {
    if (nextIndex === null) return;

    /*
     * Trigger the collision.
     */
    setImpact(true);

    /*
     * Give the collision a tiny visual moment,
     * then replace the product.
     */
    window.setTimeout(() => {
      setIndex(nextIndex);
      setNextIndex(null);
      setImpact(false);
      setIsAnimating(false);
    }, 120);
  };

  const handleOrder = () => {
    if (!isSignedIn) {
      void navigate({ to: "/login" });
      return;
    }

    void navigate({ to: "/checkout" });
  };

  /*
   * Incoming product starts on the RIGHT.
   *
   * It travels aggressively toward the center-left.
   */
  const incomingInitial =
    direction === "next"
      ? {
          x: 420,
          y: 55,
          rotate: 28,
          scale: 0.55,
          opacity: 0,
        }
      : {
          x: 420,
          y: -35,
          rotate: -22,
          scale: 0.55,
          opacity: 0,
        };

  const incomingAnimate = {
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    opacity: 1,
  };

  /*
   * The old product gets hit and thrown
   * toward the LEFT.
   */
  const oldProductExit =
    direction === "next"
      ? {
          x: -210,
          y: -32,
          rotate: -18,
          scale: 0.78,
          opacity: 0,
        }
      : {
          x: -250,
          y: 40,
          rotate: 22,
          scale: 0.78,
          opacity: 0,
        };

  return (
    <section
      aria-label="Viewport Fit Hero Showcase"
      className="relative flex h-[100dvh] max-h-[900px] w-full flex-col justify-between overflow-hidden bg-white py-6 text-neutral-900 lg:py-8"
    >
      <div className="mx-auto flex h-full w-full max-w-[1400px] flex-col justify-between px-4 sm:px-6 lg:px-10">

        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="flex items-end justify-between border-b border-neutral-100 pb-3">
          <div>
            <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400 sm:text-xs">
              Curated Selection
            </span>

            <h1 className="text-2xl font-black leading-none tracking-tight text-neutral-900 sm:text-4xl">
              The Menu
              <span className="text-neutral-300">.</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-neutral-500">
              0{index + 1}
              <span className="text-neutral-300">
                {" "}
                /{" "}
              </span>
              0{MENU_ITEMS.length}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Previous item"
                disabled={isAnimating}
                onClick={previousProduct}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm transition-all hover:border-neutral-900 hover:bg-neutral-900 hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                aria-label="Next item"
                disabled={isAnimating}
                onClick={nextProduct}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm transition-all hover:border-neutral-900 hover:bg-neutral-900 hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* =====================================================
            MAIN GRID
        ====================================================== */}
        <div className="my-auto grid grid-cols-1 items-center gap-4 lg:grid-cols-12 lg:gap-8">

          {/* ===================================================
              MAIN PRODUCT
          ==================================================== */}
          <motion.div
            className="relative flex flex-col justify-between overflow-visible rounded-2xl border border-neutral-200/60 bg-neutral-50 p-5 shadow-sm sm:p-8 lg:col-span-7"
            animate={
              impact
                ? {
                    x: [0, -8, 8, -5, 3, 0],
                    rotate: [0, -1.5, 1.5, -0.8, 0.4, 0],
                  }
                : {
                    x: 0,
                    rotate: 0,
                  }
            }
            transition={
              impact
                ? {
                    duration: 0.18,
                    ease: "easeOut",
                  }
                : {
                    duration: 0.2,
                  }
            }
          >

            {/* CATEGORY + PRICE */}
            <div className="relative z-30 flex items-center justify-between">
              <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-800 shadow-xs sm:text-xs">
                {current.category}
              </span>

              <span className="text-lg font-bold tracking-tight text-neutral-900 sm:text-xl">
                {isSignedIn
                  ? current.price
                  : "SIGN IN TO VIEW"}
              </span>
            </div>

            {/* =================================================
                PRODUCT COLLISION STAGE
            ================================================== */}
            <div className="relative my-3 flex h-[180px] items-center justify-center sm:my-4 sm:h-[240px]">

              {/* Ground shadow */}
              <motion.div
                className="absolute bottom-1 left-1/2 h-4 w-1/2 -translate-x-1/2 rounded-[100%] bg-black/10 blur-md"
                animate={
                  impact
                    ? {
                        scaleX: [1, 0.65, 1.2],
                        opacity: [0.25, 0.08, 0.2],
                      }
                    : {
                        scaleX: 1,
                        opacity: 0.25,
                      }
                }
                transition={{
                  duration: 0.25,
                }}
              />

              {/* =================================================
                  CURRENT / OLD PRODUCT

                  This is the stationary burger.

                  When the incoming burger hits it,
                  this one gets thrown LEFT.
              ================================================== */}
              <AnimatePresence initial={false}>
                {!nextIndex && !isAnimating ? (
                  <motion.img
                    key={`current-${current.id}`}
                    src={current.src}
                    alt={current.title}
                    className="absolute z-10 max-h-[170px] w-auto object-contain drop-shadow-[0_12px_16px_rgba(0,0,0,0.1)] sm:max-h-[230px]"
                    initial={{
                      opacity: 0,
                      scale: 0.94,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                  />
                ) : (
                  <motion.img
                    key={`old-${current.id}`}
                    src={current.src}
                    alt={current.title}
                    className="absolute z-10 max-h-[170px] w-auto object-contain drop-shadow-[0_12px_16px_rgba(0,0,0,0.1)] sm:max-h-[230px]"
                    animate={
                      impact
                        ? oldProductExit
                        : {
                            x: 0,
                            y: 0,
                            rotate: 0,
                            scale: 1,
                            opacity: 1,
                          }
                    }
                    transition={
                      impact
                        ? {
                            type: "spring",
                            stiffness: 320,
                            damping: 18,
                            mass: 0.65,
                          }
                        : {
                            duration: 0.1,
                          }
                    }
                  />
                )}
              </AnimatePresence>

              {/* =================================================
                  INCOMING PRODUCT

                  STARTS ON RIGHT

                  THEN FLIES INTO THE OLD PRODUCT.
              ================================================== */}
              <AnimatePresence>
                {incoming && (
                  <motion.img
                    key={`incoming-${incoming.id}`}
                    src={incoming.src}
                    alt={incoming.title}
                    className="absolute z-20 max-h-[170px] w-auto object-contain drop-shadow-[0_22px_28px_rgba(0,0,0,0.18)] sm:max-h-[230px]"
                    initial={incomingInitial}
                    animate={
                      impact
                        ? {
                            x: -3,
                            y: 0,
                            rotate: 2,
                            scale: 1.06,
                            opacity: 1,
                          }
                        : incomingAnimate
                    }
                    transition={{
                      x: {
                        type: "spring",
                        stiffness: 230,
                        damping: 17,
                        mass: 0.7,
                      },
                      y: {
                        type: "spring",
                        stiffness: 250,
                        damping: 18,
                        mass: 0.65,
                      },
                      rotate: {
                        type: "spring",
                        stiffness: 260,
                        damping: 16,
                        mass: 0.7,
                      },
                      scale: {
                        type: "spring",
                        stiffness: 280,
                        damping: 17,
                        mass: 0.65,
                      },
                      opacity: {
                        duration: 0.08,
                      },
                    }}
                    onAnimationComplete={() => {
                      if (!impact) {
                        handleIncomingComplete();
                      }
                    }}
                  />
                )}
              </AnimatePresence>

              {/* =================================================
                  IMPACT FLASH
              ================================================== */}
              <AnimatePresence>
                {impact && (
                  <>
                    <motion.div
                      className="pointer-events-none absolute z-40 h-10 w-10 rounded-full bg-white"
                      initial={{
                        opacity: 0,
                        scale: 0.2,
                      }}
                      animate={{
                        opacity: [0, 0.95, 0],
                        scale: [0.2, 1.2, 2.4],
                      }}
                      transition={{
                        duration: 0.2,
                        ease: "easeOut",
                      }}
                    />

                    <motion.div
                      className="pointer-events-none absolute z-40 h-20 w-20 rounded-full border-4 border-neutral-900/20"
                      initial={{
                        opacity: 0,
                        scale: 0.2,
                      }}
                      animate={{
                        opacity: [0, 0.7, 0],
                        scale: [0.2, 1, 2.2],
                      }}
                      transition={{
                        duration: 0.32,
                        ease: "easeOut",
                      }}
                    />

                    {/* Little impact particles */}
                    {[
                      { x: -42, y: -25, rotate: -30 },
                      { x: 42, y: -18, rotate: 30 },
                      { x: -35, y: 30, rotate: -55 },
                      { x: 38, y: 28, rotate: 50 },
                    ].map((particle, i) => (
                      <motion.span
                        key={i}
                        className="pointer-events-none absolute z-40 h-2 w-2 rounded-full bg-neutral-900"
                        initial={{
                          opacity: 0,
                          x: 0,
                          y: 0,
                          scale: 0,
                        }}
                        animate={{
                          opacity: [0, 1, 0],
                          x: particle.x,
                          y: particle.y,
                          scale: [0, 1, 0.2],
                          rotate: particle.rotate,
                        }}
                        transition={{
                          duration: 0.3,
                          ease: "easeOut",
                        }}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* =================================================
                PRODUCT INFO
            ================================================== */}
            <div className="relative z-30 flex items-center justify-between border-t border-neutral-200/60 pt-3">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-neutral-900 sm:text-2xl">
                  {current.title}
                </h2>

                <p className="mt-0.5 max-w-[220px] truncate text-xs font-medium text-neutral-500 sm:max-w-xs">
                  {current.tagline}
                </p>
              </div>

              <button
                type="button"
                onClick={handleOrder}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-white shadow-xs transition-all hover:bg-neutral-800 active:scale-95"
              >
                <span>
                  {isSignedIn ? "Order" : "Sign In"}
                </span>

                <ArrowUpRight size={13} />
              </button>
            </div>
          </motion.div>

          {/* ===================================================
              RIGHT SHELF
          ==================================================== */}
          <div className="flex flex-col gap-2 lg:col-span-5">
            {MENU_ITEMS.map((item, itemIdx) => {
              const isActive =
                itemIdx === index;

              const isIncoming =
                itemIdx === nextIndex;

              return (
                <motion.button
                  key={item.id}
                  type="button"
                  disabled={isAnimating}
                  onClick={() =>
                    changeProduct(
                      itemIdx,
                      itemIdx > index
                        ? "next"
                        : "previous",
                    )
                  }
                  className={cn(
                    "group relative flex items-center justify-between rounded-xl border p-2.5 text-left sm:p-3",
                    isActive
                      ? "border-neutral-900 bg-neutral-900 text-white shadow-md"
                      : "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
                    isIncoming &&
                      "pointer-events-none",
                  )}
                  animate={
                    isIncoming
                      ? {
                          x: 18,
                          scale: 0.98,
                          opacity: 0.35,
                        }
                      : {
                          x: 0,
                          scale: isActive ? 1.01 : 1,
                          opacity: 1,
                        }
                  }
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 24,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border sm:h-12 sm:w-12",
                        isActive
                          ? "border-neutral-700 bg-neutral-800"
                          : "border-neutral-200 bg-neutral-100",
                      )}
                      animate={
                        isIncoming
                          ? {
                              scale: 0.9,
                              rotate: -4,
                            }
                          : {
                              scale: 1,
                              rotate: 0,
                            }
                      }
                    >
                      <img
                        src={item.src}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </motion.div>

                    <div>
                      <h3
                        className={cn(
                          "text-xs font-semibold tracking-tight sm:text-sm",
                          isActive
                            ? "text-white"
                            : "text-neutral-900",
                        )}
                      >
                        {item.title}
                      </h3>

                      <p
                        className={cn(
                          "text-[10px] font-medium sm:text-xs",
                          isActive
                            ? "text-neutral-400"
                            : "text-neutral-500",
                        )}
                      >
                        {item.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "text-xs font-bold sm:text-sm",
                        isActive
                          ? "text-amber-400"
                          : "text-neutral-700",
                      )}
                    >
                      {isSignedIn
                        ? item.price
                        : "VIEW PRICE"}
                    </span>

                    <div
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full transition-all",
                        isActive
                          ? "bg-white text-neutral-900"
                          : "bg-neutral-100 text-neutral-400 group-hover:bg-neutral-200",
                      )}
                    >
                      <ArrowUpRight size={12} />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}
        <div className="flex items-center justify-between border-t border-neutral-100 pt-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
          <span>Scroll for Menu Details</span>
          <span className="animate-bounce">
            ↓
          </span>
        </div>
      </div>
    </section>
  );
}
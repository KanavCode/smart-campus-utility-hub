import { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Compass, GraduationCap, Home, MapPinned } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
    document.title = "Page Not Found | Smart Campus Hub";
  }, []);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.22),_transparent_32%),radial-gradient(circle_at_bottom_right,_hsl(var(--accent)/0.18),_transparent_28%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-secondary/60 via-transparent to-transparent"
      />

      <section className="relative flex min-h-screen items-center px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="glass mx-auto grid w-full max-w-6xl gap-8 overflow-hidden rounded-[2rem] border border-border/60 p-6 shadow-2xl shadow-accent/10 md:grid-cols-[1.05fr_0.95fr] md:p-10"
        >
          <div className="flex flex-col justify-between gap-8">
            <div className="space-y-5">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground">
                <GraduationCap className="h-4 w-4 text-primary" />
                Smart Campus Hub
              </div>

              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">
                  Error 404
                </p>
                <h1
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-balance text-4xl font-bold tracking-tight outline-none sm:text-5xl lg:text-6xl"
                >
                  We couldn&apos;t find that page.
                </h1>
                <p
                  id="not-found-description"
                  className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg"
                >
                  The page you requested may have moved, expired, or the link may be incorrect.
                  Use one of the recovery actions below to get back to the right place quickly.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="min-w-[10rem] font-semibold glow-primary-hover">
                <Link to="/" aria-describedby="not-found-description">
                  <Home className="h-4 w-4" />
                  Go Home
                </Link>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleGoBack}
                className="min-w-[10rem] font-semibold"
                aria-describedby="not-found-description"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            </div>
          </div>

          <aside
            aria-labelledby="not-found-help-heading"
            className="relative rounded-[1.5rem] border border-border/60 bg-secondary/30 p-6 sm:p-8"
          >
            <div
              aria-hidden="true"
              className="absolute right-6 top-6 h-20 w-20 rounded-full bg-primary/20 blur-2xl"
            />

            <div className="relative space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Compass className="h-6 w-6" />
                </div>
                <div>
                  <h2 id="not-found-help-heading" className="text-xl font-semibold">
                    Helpful next steps
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    A quick path back into the platform.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <MapPinned className="h-4 w-4 text-primary" />
                    Requested route
                  </p>
                  <p className="break-all rounded-xl bg-secondary/70 px-3 py-2 font-mono text-sm text-muted-foreground">
                    {location.pathname}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="text-sm font-semibold">Return home</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Head back to the landing page and restart your navigation.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="text-sm font-semibold">Go to the previous page</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Use browser history to recover if you followed a broken link.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </motion.div>
      </section>
    </main>
  );
};

export default NotFound;

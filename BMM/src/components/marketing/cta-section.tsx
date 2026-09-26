import { ArrowRight, Heart } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-24">
      <Container>
        <Reveal direction="scale">
          <div className="bg-primary text-primary-foreground relative overflow-hidden rounded-md px-8 py-16 text-center sm:px-16">
            <div className="relative flex flex-col items-center gap-6">
              <h2 className="font-display max-w-2xl text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
                Rejoignez le réseau qui transforme la générosité en vies sauvées
              </h2>
              <p className="text-primary-foreground/80 max-w-xl text-pretty">
                Inscrivez-vous comme donneur ou mobilisez votre communauté pour
                la prochaine campagne.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" variant="secondary" className="group">
                  <Link href="/donate">
                    Devenir donneur
                    <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Link href="/soutenir">
                    <Heart className="size-4" />
                    Soutenir la plateforme
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

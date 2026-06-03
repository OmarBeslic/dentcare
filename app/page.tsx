import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import {
  Stethoscope,
  Smile,
  Shield,
  Star,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const services = [
  {
    icon: Stethoscope,
    title: "Ortodoncija",
    desc: "Fiksne i mobilne proteze, breketi i moderni aligneri za savršen osmeh.",
  },
  {
    icon: Shield,
    title: "Implanti",
    desc: "Trajno rešenje za nedostajuće zube sa vrhunskim implantatima.",
  },
  {
    icon: Smile,
    title: "Estetska stomatologija",
    desc: "Izbeljivanje, ljuspice i kompletna estetska korekcija osmeha.",
  },
  {
    icon: Star,
    title: "Preventiva",
    desc: "Redovni pregledi, čišćenje kamenca i zaštita od karijesa.",
  },
];

const features = [
  "Iskusan tim stomatologa",
  "Moderna oprema i tehnologije",
  "Bezbolan tretman i sedacija",
  "Fleksibilni termini 7 dana",
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden" style={{ background: "linear-gradient(135deg, var(--primary-light) 0%, var(--background) 50%, var(--accent-light) 100%)" }}>
          <div className="max-w-6xl mx-auto px-4 py-20 relative w-full">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full mb-6 border" style={{ background: "var(--primary-light)", color: "var(--primary)", borderColor: "color-mix(in srgb, var(--primary) 20%, transparent)" }}>
                <Star className="w-4 h-4" />
                Pouzdana stomatološka nega
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: "var(--foreground)" }}>
                Vaš osmeh je{" "}
                <span style={{ color: "var(--primary)" }}>naša strast</span>
              </h1>
              <p className="text-lg leading-relaxed mb-8 max-w-xl" style={{ color: "var(--muted-foreground)" }}>
                Pružamo savremenu stomatološku negu sa toplinom i pažnjom.
                Vaše zdravlje i osmeh su naš prioritet.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/book" className="flex items-center gap-2">
                    Zakažite pregled <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link href="/#services">Naše usluge</Link>
                </Button>
              </div>
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-sm" style={{ color: "var(--muted-foreground)" }}>
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "var(--success)" }} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="py-20" style={{ background: "var(--background)" }}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
                Naše usluge
              </h2>
              <p className="max-w-md mx-auto" style={{ color: "var(--muted-foreground)" }}>
                Pružamo kompletan spektar stomatoloških usluga za celu porodicu.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map(({ icon: Icon, title, desc }) => (
                <Card key={title} className="hover:shadow-md transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--primary-light)" }}>
                      <Icon className="w-6 h-6" style={{ color: "var(--primary)" }} />
                    </div>
                    <h3 className="font-semibold text-base mb-2">{title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="py-20" style={{ background: "var(--muted)" }}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="rounded-2xl aspect-square flex items-center justify-center" style={{ background: "var(--primary-light)" }}>
                <Stethoscope className="w-24 h-24" style={{ color: "color-mix(in srgb, var(--primary) 30%, transparent)" }} />
              </div>
              <div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">
                  O nama
                </h2>
                <p className="leading-relaxed mb-6" style={{ color: "var(--muted-foreground)" }}>
                  DentCare je moderna stomatološka ordinacija koja kombinuje
                  vrhunsku medicinsku ekspertizu sa toplim i prijatnim okruženjem.
                  Naš tim iskusnih stomatologa predano radi na tome da svaki posjet
                  bude što ugodniji.
                </p>
                <p className="leading-relaxed mb-8" style={{ color: "var(--muted-foreground)" }}>
                  Koristimo najmoderniju opremu i materijale kako bismo pružili
                  dugotrajne rezultate koji prevazilaze vaša očekivanja.
                </p>
                <Button asChild>
                  <Link href="/book">Zakažite pregled</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20" style={{ background: "var(--primary)" }}>
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Spermni ste za savršen osmeh?
            </h2>
            <p className="mb-8 text-lg" style={{ color: "rgba(255,255,255,0.8)" }}>
              Zakažite pregled danas i napravite prvi korak ka zdravijim zubima.
            </p>
            <Button asChild size="lg" className="bg-white hover:bg-white/90" style={{ color: "var(--primary)" }}>
              <Link href="/book" className="flex items-center gap-2">
                Zakaži odmah <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { Stethoscope, Smile, Shield, Star, CheckCircle, Quote, Phone, UserRound } from "lucide-react";

const credentials = ["Estetska stomatologija", "Implantologija", "Ortodoncija"];

const services = [
  {
    icon: Stethoscope,
    title: "Ortodoncija",
    desc: "Fiksne i mobilne proteze, breketi i moderni aligneri za savršen osmijeh.",
  },
  {
    icon: Shield,
    title: "Implanti",
    desc: "Trajno rješenje za nedostajuće zube sa vrhunskim implantatima.",
  },
  {
    icon: Smile,
    title: "Estetska stomatologija",
    desc: "Izbjeljivanje, ljuspice i kompletna estetska korekcija osmijeha.",
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

const stats = [
  { value: "12+", label: "godina iskustva" },
  { value: "5000+", label: "zadovoljnih pacijenata" },
  { value: "4.9/5", label: "prosječna ocjena" },
  { value: "7", label: "dana u nedjelji" },
];

const testimonials = [
  {
    quote: "Najbolje iskustvo kod stomatologa koje sam imala. Osoblje je ljubazno, a doktor mi je strpljivo objasnio svaki korak tretmana.",
    name: "Milica R.",
  },
  {
    quote: "Ugradio sam implant nakon višegodišnjeg odlaganja. Bezbolno, brzo i bez ikakvih komplikacija — toplo preporučujem.",
    name: "Nikola P.",
  },
  {
    quote: "Djeca mi se ne plaše odlaska kod zubara otkad dolazimo ovdje. Pristup je strpljiv i pun razumijevanja.",
    name: "Jovana M.",
  },
];

export default function HomePage() {
  return (
    <div className="theme-public bg-background text-foreground min-h-screen">
      <Navbar />
      <main>
        <section className="py-24 lg:py-32">
          <div className="max-w-6xl mx-auto px-4">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold tracking-widest uppercase text-accent mb-4">
                Stomatološka ordinacija u Podgorici
              </p>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-foreground">
                Vaš osmijeh je <span className="text-accent">naša strast</span>
              </h1>
              <p className="text-lg leading-relaxed mb-8 max-w-xl text-muted-foreground">
                Pružamo savremenu stomatološku njegu sa toplinom i pažnjom. Vaše
                zdravlje i osmijeh su naš prioritet.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="w-full sm:w-auto shadow-none">
                  <Link href="/#services">Naše usluge</Link>
                </Button>
              </div>
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 shrink-0 text-accent" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-primary text-white py-14">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-3xl sm:text-4xl font-bold text-accent">{s.value}</p>
                <p className="text-sm text-white/70 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="services" className="py-20 border-t border-border">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                Naše usluge
              </h2>
              <p className="max-w-md mx-auto text-muted-foreground">
                Pružamo kompletan spektar stomatoloških usluga za cijelu porodicu.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {services.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="border-t-2 border-accent pt-6">
                  <Icon className="w-7 h-7 text-accent mb-4" />
                  <h3 className="font-semibold text-base mb-2 text-foreground">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 border-t border-border bg-muted">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                Šta kažu naši pacijenti
              </h2>
              <p className="max-w-md mx-auto text-muted-foreground">
                Povjerenje pacijenata gradimo iz dana u dan, iz osmijeha u osmijeh.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div key={t.name} className="bg-card border border-border rounded-lg p-6">
                  <Quote className="w-6 h-6 text-accent-2 mb-3" />
                  <p className="text-sm leading-relaxed text-foreground mb-4">
                    {t.quote}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 text-accent-2 fill-accent-2" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="py-20 border-t border-border">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="rounded-lg border border-border bg-card aspect-square flex items-center justify-center">
                <Stethoscope className="w-20 h-20 text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6 text-foreground">
                  O nama
                </h2>
                <p className="leading-relaxed mb-6 text-muted-foreground">
                  DentCare je moderna stomatološka ordinacija koja kombinuje
                  vrhunsku medicinsku ekspertizu sa toplim i prijatnim
                  okruženjem. Naš tim iskusnih stomatologa predano radi na tome
                  da svaki posjet bude što ugodniji.
                </p>
                <p className="leading-relaxed mb-8 text-muted-foreground">
                  Koristimo najmoderniju opremu i materijale kako bismo pružili
                  dugotrajne rezultate koji prevazilaze vaša očekivanja.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 border-t border-border">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <p className="text-sm font-semibold tracking-widest uppercase text-accent-2 mb-4">
                  Upoznajte doktora
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                  Dr. Ana Jovanović
                </h2>
                <p className="text-sm font-medium text-muted-foreground mb-6">
                  Vodeći stomatolog i osnivačica DentCare-a
                </p>
                <p className="leading-relaxed mb-6 text-muted-foreground">
                  Sa više od 12 godina iskustva u opštoj i estetskoj stomatologiji,
                  dr. Jovanović predvodi tim DentCare-a sa posvećenošću svakom
                  pacijentu ponaosob. Diplomirala je na Stomatološkom fakultetu i
                  kontinuirano se usavršava na međunarodnim edukacijama.
                </p>
                <div className="flex flex-wrap gap-2">
                  {credentials.map((c) => (
                    <span
                      key={c}
                      className="text-xs font-medium px-3 py-1.5 rounded-full border border-accent-2/30 text-accent-2 bg-accent-2-light"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div className="order-1 md:order-2 flex justify-center">
                <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-border bg-card flex items-center justify-center">
                  <UserRound className="w-24 h-24 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-accent text-white py-16">
          <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
                Spremni za blistav osmijeh?
              </h2>
              <p className="text-white/80">
                Pozovite nas i zakažite pregled još danas.
              </p>
            </div>
            <Button asChild size="lg" variant="outline" className="shadow-none bg-transparent border-white text-white hover:bg-white hover:text-accent">
              <a href="tel:+38220123456">
                <Phone className="w-4 h-4" /> +382 20 123 456
              </a>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

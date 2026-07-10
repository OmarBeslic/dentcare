import Link from "next/link";
import { SmilePlus, Phone, MapPin, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <SmilePlus className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-xl font-bold">DentCare</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Savremena stomatološka njega sa pažnjom i toplinom. Vaš osmijeh je naš prioritet.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Kontakt</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-sm text-white/70">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+382 20 123 456</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-white/70">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>Bulevar Ivana Crnojevića 42, Podgorica</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Radno vrijeme</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2.5 text-sm text-white/70">
                <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p>Pon – Pet: 08:00 – 16:00</p>
                  <p>Subota: 09:00 – 14:00</p>
                  <p>Nedjelja: Zatvoreno</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/40">© {new Date().getFullYear()} DentCare. Sva prava zadržana.</p>
          <Link href="/admin/login" className="text-xs text-white/30 hover:text-white/60 transition-colors">
            Admin panel
          </Link>
        </div>
      </div>
    </footer>
  );
}

import React from 'react';
import {
  ShieldAlert,
  Smartphone,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Zap
} from 'lucide-react';

export const InstallationGuide: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* HEADER HERO */}
      <div className="bg-[#2e3036]/70 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 md:p-8 text-[#e2e2e6] relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#d1e4ff]/20 border border-[#d1e4ff]/30 text-[#d1e4ff] text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Guide d'Intégration Android Studio API 24+</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#e2e2e6]">
            Configuration de la Barre Latérale Flottante sur Tablette Android
          </h2>
          <p className="text-sm text-[#c4c6cf] leading-relaxed">
            Apprenez à intégrer l'overlay flottant `SYSTEM_ALERT_WINDOW`, à configurer le service d'arrière-plan en premier plan, et à contourner les restrictions d'économie de batterie des constructeurs.
          </p>
        </div>
      </div>

      {/* STEP BY STEP GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Step 1 */}
        <div className="bg-[#2e3036]/50 backdrop-blur-xl border border-[#44474e] rounded-3xl p-5 text-[#e2e2e6] space-y-3 shadow-xl">
          <div className="w-9 h-9 rounded-2xl bg-[#d1e4ff] text-[#00315c] font-bold flex items-center justify-center text-sm shadow-md">
            1
          </div>
          <h3 className="text-sm font-bold text-[#e2e2e6]">
            Importation dans Android Studio
          </h3>
          <p className="text-xs text-[#c4c6cf] leading-relaxed">
            Créez un nouveau projet Android avec le package <code className="text-[#d1e4ff] bg-black/30 px-1.5 py-0.5 rounded-md font-mono">com.example.floatingsidebar</code>. Copiez le fichier <code className="text-amber-300">AndroidManifest.xml</code> et les classes Kotlin/Java.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-[#2e3036]/50 backdrop-blur-xl border border-[#44474e] rounded-3xl p-5 text-[#e2e2e6] space-y-3 shadow-xl">
          <div className="w-9 h-9 rounded-2xl bg-[#d1e4ff] text-[#00315c] font-bold flex items-center justify-center text-sm shadow-md">
            2
          </div>
          <h3 className="text-sm font-bold text-[#e2e2e6]">
            Permission Superposition
          </h3>
          <p className="text-xs text-[#c4c6cf] leading-relaxed">
            Au lancement, <code className="text-[#b8f397] bg-black/30 px-1.5 py-0.5 rounded-md font-mono">MainActivity</code> redirige l'utilisateur vers <code className="text-[#d1e4ff]">Settings.ACTION_MANAGE_OVERLAY_PERMISSION</code> pour activer l'affichage par-dessus d'autres applications.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-[#2e3036]/50 backdrop-blur-xl border border-[#44474e] rounded-3xl p-5 text-[#e2e2e6] space-y-3 shadow-xl">
          <div className="w-9 h-9 rounded-2xl bg-[#d1e4ff] text-[#00315c] font-bold flex items-center justify-center text-sm shadow-md">
            3
          </div>
          <h3 className="text-sm font-bold text-[#e2e2e6]">
            Optimisation Constructeurs
          </h3>
          <p className="text-xs text-[#c4c6cf] leading-relaxed">
            Sur Xiaomi MIUI/HyperOS, Samsung OneUI ou Lenovo, désactivez la gestion batterie agressive et autorisez les "fenêtres surgissantes en arrière-plan".
          </p>
        </div>
      </div>

      {/* MANUFACTURER SPECIFIC TROUBLESHOOTING */}
      <div className="bg-[#2e3036]/50 backdrop-blur-xl border border-[#44474e] rounded-3xl p-6 text-[#e2e2e6] shadow-xl space-y-4">
        <h3 className="text-base font-bold text-[#e2e2e6] flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Dépannage & Permissions Spéciales par Marque
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Xiaomi */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
            <span className="font-bold text-amber-300 uppercase text-[10px] tracking-wider block">
              Xiaomi / Poco / RedMi (MIUI & HyperOS)
            </span>
            <ul className="space-y-1.5 text-[#c4c6cf] list-disc list-inside">
              <li>Aller dans <strong>Paramètres &gt; Applications &gt; Gérer les applications</strong></li>
              <li>Sélectionner votre application</li>
              <li>Activer <strong>"Afficher les fenêtres surgissantes en arrière-plan"</strong></li>
              <li>Mettre l'économie de batterie sur <strong>"Pas de restrictions"</strong></li>
            </ul>
          </div>

          {/* Samsung */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
            <span className="font-bold text-[#d1e4ff] uppercase text-[10px] tracking-wider block">
              Samsung Galaxy Tab & SmartPhones (One UI)
            </span>
            <ul className="space-y-1.5 text-[#c4c6cf] list-disc list-inside">
              <li>Aller dans <strong>Paramètres &gt; Maintenance de l'appareil &gt; Batterie</strong></li>
              <li>Cliquer sur <strong>"Limites d'utilisation en arrière-plan"</strong></li>
              <li>Ajouter l'app dans <strong>"Applications jamais en veille"</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

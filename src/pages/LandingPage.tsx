import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Database,
  ExternalLink,
  Eye,
  Github,
  Layers3,
  Map,
  Menu,
  Radio,
  ShieldCheck,
  Signal,
  Wind,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { landingScreenshots } from '../data/landingContent';
import './LandingPage.css';

const REPOSITORY_URL = 'https://github.com/pnoualhier/Radiator';
const REFERENCE_APP_URL = 'https://radiation-france-surveillance-radiologique.ai.studio/';

const navigation = [
  { href: '#presentation', label: 'Présentation' },
  { href: '#fonctionnalites', label: 'Fonctionnalités' },
  { href: '#sources', label: 'Sources' },
  { href: '#captures', label: 'Captures' },
  { href: '#apropos', label: 'À propos' },
];

const pillars: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Layers3,
    title: 'Rassembler',
    text: 'Explorer plusieurs réseaux et environnements depuis une même interface, selon les données effectivement disponibles.',
  },
  {
    icon: Map,
    title: 'Visualiser',
    text: 'Situer les stations et consulter les informations géographiques offertes par le module cartographique.',
  },
  {
    icon: Activity,
    title: 'Comparer',
    text: 'Mettre en regard des séries de stations compatibles, en gardant leurs unités et leur contexte en vue.',
  },
  {
    icon: BookOpen,
    title: 'Comprendre',
    text: 'Lire des repères méthodologiques et distinguer une observation, une estimation et une donnée de démonstration.',
  },
];

const features: { icon: LucideIcon; title: string; text: string; tab: string; tag: string }[] = [
  {
    icon: Activity,
    title: 'Tableau de bord',
    text: 'Une vue d’ensemble des mesures chargées et des outils proposés par l’application. Les compteurs de l’interface ne valent pas certification des sources.',
    tab: 'home',
    tag: 'Vue générale',
  },
  {
    icon: Map,
    title: 'Carte',
    text: 'Explorer la répartition des stations et leurs informations disponibles. Les points et couches locales ne prouvent pas à eux seuls une mesure en direct.',
    tab: 'map',
    tag: 'Géographie',
  },
  {
    icon: Radio,
    title: 'Annuaire des stations',
    text: 'Rechercher des stations et consulter les métadonnées affichées dans l’application ; un catalogue n’est pas une preuve de réception de mesures.',
    tab: 'stations',
    tag: 'Stations',
  },
  {
    icon: Activity,
    title: 'Comparaison',
    text: 'Comparer des séries proposées par l’interface. Les données visibles en mode DÉMO sont synthétiques et ne décrivent pas une évolution réelle.',
    tab: 'compare',
    tag: 'Analyse',
  },
  {
    icon: Wind,
    title: 'Environnements',
    text: 'L’interface comprend des vues consacrées aux types de mesure, dont l’air et l’eau ; la présence de ces vues ne garantit pas un flux direct.',
    tab: 'types',
    tag: 'Air · eau · gamma',
  },
  {
    icon: BookOpen,
    title: 'Méthodologie et sources',
    text: 'Consulter les unités, les précautions d’interprétation et les références déclarées par le projet.',
    tab: 'info',
    tag: 'Documentation',
  },
];

const sources: {
  category: string;
  name: string;
  status: string;
  statusType: 'partial' | 'conditional' | 'separate' | 'unconfirmed';
  description: string;
  url: string;
  linkLabel: string;
}[] = [
  {
    category: 'Réseau institutionnel français',
    name: 'Téléray · ASNR',
    status: 'Catalogue interrogé',
    statusType: 'partial',
    description: 'Le serveur tente de récupérer le catalogue des stations. L’intégration frontend auditée ne confirme pas de flux direct de mesures Téléray.',
    url: 'https://teleray.asnr.fr/',
    linkLabel: 'Site Téléray',
  },
  {
    category: 'Surveillance environnementale',
    name: 'OPERA-Air & HydroTéléray',
    status: 'Flux direct non confirmé',
    statusType: 'unconfirmed',
    description: 'Des pages et structures de données existent dans le dépôt, avec des valeurs locales préchargées ; elles ne démontrent pas une connexion à des mesures actuelles.',
    url: 'https://www.asnr.fr/',
    linkLabel: 'ASNR',
  },
  {
    category: 'Réseau européen',
    name: 'EURDEP · JRC',
    status: 'Backend distinct',
    statusType: 'separate',
    description: 'Le connecteur est présent dans le backend Python séparé, qui n’est pas branché automatiquement au frontend par défaut.',
    url: 'https://remap.jrc.ec.europa.eu/',
    linkLabel: 'Plateforme EURDEP',
  },
  {
    category: 'Réseau citoyen',
    name: 'OpenRadiation',
    status: 'Disponibilité variable',
    statusType: 'conditional',
    description: 'Un connecteur frontend est présent. La disponibilité dépend du service et de sa configuration ; toute mesure doit conserver sa provenance.',
    url: 'https://openradiation.org/',
    linkLabel: 'OpenRadiation',
  },
  {
    category: 'Réseau citoyen',
    name: 'Safecast',
    status: 'Connexion non garantie',
    statusType: 'conditional',
    description: 'Un connecteur existe, mais les points ou valeurs locales ne prouvent pas qu’un flux distant a été reçu.',
    url: 'https://safecast.org/',
    linkLabel: 'Safecast',
  },
];

const faqs = [
  {
    question: 'Qu’est-ce que Radiation France ?',
    answer: 'Une application indépendante qui rassemble des interfaces de visualisation et des informations sur des réseaux de surveillance radiologique. Elle n’est pas un réseau de mesure officiel.',
  },
  {
    question: 'D’où proviennent les données ?',
    answer: 'Le dépôt contient des connecteurs, des catalogues, des données locales et des fixtures de démonstration. La disponibilité réelle varie selon la source ; consultez les statuts et la provenance affichés, puis vérifiez auprès du producteur.',
  },
  {
    question: 'L’application est-elle officielle ?',
    answer: 'Non. Radiation France est un projet indépendant, sans affiliation ni approbation de l’ASNR, de l’IRSN ou des autorités publiques.',
  },
  {
    question: 'Pourquoi les réseaux de surveillance ne sont-ils pas directement comparables ?',
    answer: 'Ils peuvent mesurer des grandeurs différentes, utiliser des instruments et des protocoles distincts, et publier à des fréquences différentes. Une conversion d’unité ne suffit pas à harmoniser ces contextes.',
  },
  {
    question: 'Comment interpréter une valeur en µSv/h ?',
    answer: 'Le µSv/h est une unité de débit d’équivalent de dose. L’interprétation dépend de la grandeur réellement mesurée, de l’instrument, de l’emplacement, de la durée et du contexte. Une mesure isolée ne permet pas de conclure à un risque sanitaire.',
  },
  {
    question: 'Peut-on consulter un historique ou comparer des stations ?',
    answer: 'L’interface comporte un comparateur et des visualisations de séries. Leur contenu dépend des données disponibles ; en mode DÉMO, les séries sont synthétiques et ne doivent pas être interprétées comme des tendances réelles.',
  },
  {
    question: 'Les données sont-elles actualisées en temps réel ?',
    answer: 'Aucune actualisation générale en temps réel n’est garantie. Les sources ont des disponibilités et des fréquences variables ; le cache local peut également être ancien.',
  },
  {
    question: 'L’application peut-elle être installée sur un smartphone ?',
    answer: 'Le projet configure une application web progressive et une interface adaptative. La disponibilité de l’installation dépend du navigateur et du déploiement utilisé.',
  },
  {
    question: 'L’application fonctionne-t-elle hors connexion ?',
    answer: 'Partiellement et selon ce qui a déjà été mis en cache sur l’appareil. Une première visite hors connexion, des données récentes ou tous les écrans ne sont pas garantis.',
  },
  {
    question: 'Que faire en cas d’alerte radiologique ?',
    answer: 'Suivez les consignes des autorités et les canaux officiels, notamment FR-Alert et la préfecture. Cette application n’est pas un service d’alerte ni une source de consignes d’urgence.',
  },
];

const applicationUrl = (tab?: string) =>
  tab ? `/app?tab=${encodeURIComponent(tab)}` : '/app';

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rf-reveal ${className}`}>{children}</div>;
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeImage, setActiveImage] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.title = 'Radiation France — Surveillance radiologique et données environnementales';
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
      ?.setAttribute('href', `${window.location.origin}/`);
    document.querySelector<HTMLMetaElement>('meta[property="og:url"]')
      ?.setAttribute('content', `${window.location.origin}/`);

    const updateHeader = () => setScrolled(window.scrollY > 12);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    let revealObserver: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      revealObserver = new IntersectionObserver(
        entries => entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver?.unobserve(entry.target);
          }
        }),
        { threshold: 0.12 },
      )
    }
    document.querySelectorAll('.rf-reveal').forEach(element => {
      if (revealObserver) revealObserver.observe(element);
      else element.classList.add('is-visible');
    });

    return () => {
      window.removeEventListener('scroll', updateHeader);
      revealObserver?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (activeImage !== null && !dialog.open) dialog.showModal();
    if (activeImage === null && dialog.open) dialog.close();
  }, [activeImage]);

  useEffect(() => {
    if (activeImage === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        setActiveImage(current => current === null ? null : (current + 1) % landingScreenshots.length);
      } else if (event.key === 'ArrowLeft') {
        setActiveImage(current => current === null
          ? null
          : (current - 1 + landingScreenshots.length) % landingScreenshots.length);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeImage]);

  const currentImage = activeImage === null ? null : landingScreenshots[activeImage];

  return (
    <div className="rf-landing">
      <a className="rf-skip-link" href="#main-content">Passer au contenu</a>

      <header className={`rf-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="rf-header-inner">
          <a className="rf-brand" href="#top" aria-label="Radiation France, accueil">
            <img src="/logo.svg" width="38" height="38" alt="" />
            <span>
              <strong>Radiation France</strong>
              <small>Surveillance radiologique</small>
            </span>
          </a>

          <nav id="mobile-navigation" className={`rf-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Navigation principale">
            {navigation.map(item => (
              <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
              </a>
            ))}
            <a className="rf-nav-mobile-cta" href={applicationUrl()} onClick={() => setMenuOpen(false)}>
              Accéder à l’application <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </nav>

          <div className="rf-header-actions">
            <a className="rf-button rf-button-small rf-button-primary" href={applicationUrl()}>
              Accéder à l’application <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <button
              ref={menuButtonRef}
              className="rf-menu-toggle"
              type="button"
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen(open => !open)}
            >
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </header>

      <main id="main-content">
        <section className="rf-hero" id="top" aria-labelledby="hero-title">
          <div className="rf-hero-glow" aria-hidden="true" />
          <div className="rf-container rf-hero-layout">
            <div className="rf-hero-copy">
              <div className="rf-eyebrow"><span className="rf-eyebrow-dot" /> Un projet indépendant · Données à vérifier</div>
              <h1 id="hero-title">Comprendre et explorer la <span>surveillance radiologique.</span></h1>
              <p className="rf-hero-lede">
                Une interface indépendante pour parcourir les réseaux, visualiser les informations disponibles et mieux comprendre leur contexte.
              </p>
              <div className="rf-hero-actions">
                <a className="rf-button rf-button-primary" href={applicationUrl()}>
                  Explorer l’application <ArrowUpRight size={17} aria-hidden="true" />
                </a>
                <a className="rf-button rf-button-quiet" href="#fonctionnalites">
                  Découvrir les fonctionnalités <ArrowDown size={16} aria-hidden="true" />
                </a>
              </div>
              <p className="rf-hero-note"><ShieldCheck size={15} aria-hidden="true" /> Projet non officiel · Les mesures restent celles de leurs producteurs</p>
            </div>

            <div className="rf-hero-visual">
              <div className="rf-orbit rf-orbit-one" aria-hidden="true" />
              <div className="rf-orbit rf-orbit-two" aria-hidden="true" />
              <div className="rf-hero-signal" aria-hidden="true"><Signal size={20} /></div>
              <figure className="rf-browser-frame">
                <div className="rf-browser-bar" aria-hidden="true">
                  <span className="rf-window-dots"><i /><i /><i /></span>
                  <span className="rf-browser-address"><span /> radiation-france · aperçu local</span>
                  <span className="rf-browser-control">•••</span>
                </div>
                <button
                  type="button"
                  className="rf-hero-image-button"
                  onClick={() => setActiveImage(0)}
                  aria-label="Agrandir la capture du tableau de bord en mode démonstration"
                >
                  <img
                    src={landingScreenshots[0].src}
                    alt={landingScreenshots[0].alt}
                    width={landingScreenshots[0].width}
                    height={landingScreenshots[0].height}
                    fetchPriority="high"
                    decoding="async"
                  />
                </button>
                <figcaption className="rf-demo-caption"><span>MODE DÉMO</span> Valeurs d’essai — pas des relevés radiologiques réels</figcaption>
              </figure>
            </div>
          </div>
          <div className="rf-container rf-hero-bottom">
            <span>Une lecture plus accessible des réseaux de surveillance</span>
            <a href="#presentation">Découvrir le projet <ArrowDownRight size={15} aria-hidden="true" /></a>
          </div>
        </section>

        <section className="rf-section rf-intro" id="presentation" aria-labelledby="intro-title">
          <div className="rf-container">
            <Reveal className="rf-section-heading rf-section-heading-split">
              <div>
                <p className="rf-kicker">Pourquoi Radiation France</p>
                <h2 id="intro-title">La surveillance radiologique, <span>plus lisible.</span></h2>
              </div>
              <p className="rf-section-lede">
                Situer l’information, comprendre ce qui est mesuré et garder à l’esprit d’où viennent les données : une interface n’est utile que si ses limites sont visibles.
              </p>
            </Reveal>

            <div className="rf-pillar-grid">
              {pillars.map(({ icon: Icon, title, text }, index) => (
                <Reveal key={title} className="rf-pillar-card">
                  <span className="rf-card-index">0{index + 1}</span>
                  <span className="rf-icon-box"><Icon size={20} aria-hidden="true" /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="rf-section rf-feature-section" id="fonctionnalites" aria-labelledby="features-title">
          <div className="rf-container">
            <Reveal className="rf-section-heading">
              <p className="rf-kicker">Dans l’application</p>
              <h2 id="features-title">Des outils pour <span>explorer, pas extrapoler.</span></h2>
              <p className="rf-section-lede rf-section-lede-wide">
                Les modules ci-dessous existent dans l’interface. La disponibilité et la qualité des mesures dépendent toutefois des sources et de leur intégration effective.
              </p>
            </Reveal>

            <div className="rf-feature-grid">
              {features.map(({ icon: Icon, title, text, tab, tag }, index) => (
                <Reveal key={title} className={`rf-feature-card ${index === 0 ? 'rf-feature-card-highlight' : ''}`}>
                  <div className="rf-feature-card-top">
                    <span className="rf-icon-box"><Icon size={20} aria-hidden="true" /></span>
                    <span className="rf-feature-tag">{tag}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <a href={applicationUrl(tab)} aria-label={`Ouvrir le module ${title} dans l’application`}>
                    Ouvrir le module <ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="rf-section rf-dashboard-section" aria-labelledby="dashboard-title">
          <div className="rf-container rf-showcase-layout">
            <Reveal className="rf-showcase-copy">
              <p className="rf-kicker">Un aperçu, sans chiffres inventés</p>
              <h2 id="dashboard-title">Une interface pensée pour <span>mettre les données en contexte.</span></h2>
              <p>
                Le tableau de bord rassemble les vues et accès principaux de l’application. Les données qui apparaissent dans cette capture sont des fixtures de démonstration : elles illustrent l’interface, pas l’état radiologique du territoire.
              </p>
              <ul className="rf-check-list">
                <li><Check size={17} aria-hidden="true" /> Les valeurs de démonstration sont signalées.</li>
                <li><Check size={17} aria-hidden="true" /> La provenance doit être vérifiée pour chaque source.</li>
                <li><Check size={17} aria-hidden="true" /> Un cache local peut contenir des données anciennes.</li>
              </ul>
              <a className="rf-text-link" href={applicationUrl('home')}>Voir le tableau de bord <ArrowRight size={16} aria-hidden="true" /></a>
            </Reveal>
            <Reveal className="rf-dashboard-image">
              <button type="button" onClick={() => setActiveImage(1)} aria-label="Agrandir la capture du tableau de bord en thème clair">
                <img
                  src={landingScreenshots[1].src}
                  alt={landingScreenshots[1].alt}
                  width={landingScreenshots[1].width}
                  height={landingScreenshots[1].height}
                  loading="lazy"
                  decoding="async"
                />
              </button>
              <span className="rf-image-label"><Eye size={14} aria-hidden="true" /> Capture locale · mode DÉMO</span>
            </Reveal>
          </div>
        </section>

        <section className="rf-section rf-map-section" aria-labelledby="map-title">
          <div className="rf-container rf-map-layout">
            <Reveal className="rf-map-card">
              <div className="rf-map-card-header">
                <div className="rf-map-title"><span className="rf-map-mark"><Map size={19} aria-hidden="true" /></span><span><strong>Cartographie</strong><small>Module disponible dans l’application</small></span></div>
                <span className="rf-map-status"><i /> Vue de l’interface</span>
              </div>
              <div className="rf-map-placeholder">
                <div className="rf-map-contours" aria-hidden="true" />
                <Map size={42} strokeWidth={1.2} aria-hidden="true" />
                <p>La carte interactive s’ouvre dans l’application</p>
                <span>Cette présentation ne simule pas de carte ni de relevé.</span>
              </div>
              <a className="rf-map-card-link" href={applicationUrl('map')}>Ouvrir le module carte <ArrowUpRight size={15} aria-hidden="true" /></a>
            </Reveal>
            <Reveal className="rf-map-copy">
              <p className="rf-kicker">Explorer le territoire</p>
              <h2 id="map-title">La carte donne un <span>contexte géographique.</span></h2>
              <p>
                Le module cartographique permet de parcourir les stations et les informations associées. Les points préchargés et couches calculées ne sont pas nécessairement des observations actuelles ; l’interpolation, lorsqu’elle est affichée, reste une estimation.
              </p>
              <div className="rf-inline-caution"><ShieldCheck size={18} aria-hidden="true" /><span>Pas de capture de carte publiée : les valeurs disponibles n’offraient pas une provenance assez claire pour une présentation fiable.</span></div>
              <a className="rf-text-link" href={applicationUrl('map')}>Découvrir la carte <ArrowRight size={16} aria-hidden="true" /></a>
            </Reveal>
          </div>
        </section>

        <section className="rf-section rf-analysis-section" aria-labelledby="analysis-title">
          <div className="rf-container rf-analysis-layout">
            <Reveal className="rf-analysis-copy">
              <p className="rf-kicker">Comparer avec méthode</p>
              <h2 id="analysis-title">Observer les séries, <span>sans confondre les grandeurs.</span></h2>
              <p>
                Le comparateur permet de consulter des courbes et de mettre en regard des stations. Une comparaison pertinente suppose une grandeur, une unité et un contexte compatibles. La capture ci-contre utilise des données de démonstration.
              </p>
              <div className="rf-measurement-note"><Activity size={18} aria-hidden="true" /><span><strong>Unité affichée dans la capture :</strong> débit de dose gamma ambiant (nSv/h). Les données sont synthétiques.</span></div>
              <a className="rf-text-link" href={applicationUrl('compare')}>Ouvrir le comparateur <ArrowRight size={16} aria-hidden="true" /></a>
            </Reveal>
            <Reveal className="rf-analysis-image">
              <button type="button" onClick={() => setActiveImage(2)} aria-label="Agrandir la capture du comparateur en mode démonstration">
                <img
                  src={landingScreenshots[2].src}
                  alt={landingScreenshots[2].alt}
                  width={landingScreenshots[2].width}
                  height={landingScreenshots[2].height}
                  loading="lazy"
                  decoding="async"
                />
              </button>
              <span className="rf-image-label"><span className="rf-demo-dot" /> Séries synthétiques · mode DÉMO</span>
            </Reveal>
          </div>
        </section>

        <section className="rf-section rf-sources-section" id="sources" aria-labelledby="sources-title">
          <div className="rf-container">
            <Reveal className="rf-section-heading rf-section-heading-split">
              <div>
                <p className="rf-kicker">Transparence des sources</p>
                <h2 id="sources-title">Les mesures appartiennent <span>à leurs producteurs.</span></h2>
              </div>
              <p className="rf-section-lede">
                Un connecteur dans le dépôt ne signifie pas qu’un flux est actif. Voici l’état documenté dans le code audité, pas une promesse de disponibilité en production.
              </p>
            </Reveal>
            <div className="rf-source-grid">
              {sources.map(source => (
                <article className="rf-source-card" key={source.name}>
                  <p className="rf-source-category">{source.category}</p>
                  <div className="rf-source-title-row">
                    <h3>{source.name}</h3>
                    <span className={`rf-source-status rf-status-${source.statusType}`}><i />{source.status}</span>
                  </div>
                  <p>{source.description}</p>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.linkLabel} <ExternalLink size={14} aria-hidden="true" />
                  </a>
                </article>
              ))}
            </div>
            <div className="rf-source-footnote">
              <Database size={17} aria-hidden="true" />
              <p>
                Les conditions d’attribution et de réutilisation varient selon les producteurs. Voir la <a href={`${REPOSITORY_URL}/blob/main/docs/sources.md`} target="_blank" rel="noreferrer">documentation des sources</a> et vérifier les licences directement auprès de chaque organisme.
              </p>
            </div>
          </div>
        </section>

        <section className="rf-section rf-gallery-section" id="captures" aria-labelledby="gallery-title">
          <div className="rf-container">
            <Reveal className="rf-section-heading rf-section-heading-split">
              <div>
                <p className="rf-kicker">Galerie de l’application</p>
                <h2 id="gallery-title">Des captures authentiques, <span>avec leur contexte.</span></h2>
              </div>
              <p className="rf-section-lede">
                Toutes les images viennent du dépôt et montrent le mode DÉMO, sauf les paramètres système. Ouvrez une capture pour l’agrandir.
              </p>
            </Reveal>
            <div className="rf-gallery-grid">
              {landingScreenshots.slice(1).map((image, offset) => {
                const index = offset + 1;
                return (
                  <Reveal className={`rf-gallery-item rf-gallery-item-${image.category.toLowerCase()}`} key={image.title}>
                    <button
                      type="button"
                      className="rf-gallery-image"
                      onClick={() => setActiveImage(index)}
                      aria-label={`Agrandir : ${image.title}. ${image.caption}`}
                    >
                      <img
                        src={image.src}
                        alt={image.alt}
                        width={image.width}
                        height={image.height}
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="rf-gallery-zoom"><Eye size={17} aria-hidden="true" /> Agrandir</span>
                    </button>
                    <div className="rf-gallery-caption">
                      <div><span>{image.category}</span><h3>{image.title}</h3></div>
                      <p>{image.caption}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
            <p className="rf-gallery-note">
              Aucune capture de carte, de page de sources, d’alertes ou de chronologie n’est publiée : les écrans disponibles pouvaient suggérer à tort des données directes ou vérifiées. Le <a href={`${REPOSITORY_URL}/blob/main/docs/SCREENSHOTS_CATALOG.md`} target="_blank" rel="noreferrer">catalogue des captures</a> détaille ces exclusions.
            </p>
          </div>
        </section>

        <section className="rf-section rf-mobile-section" aria-labelledby="mobile-title">
          <div className="rf-container rf-mobile-layout">
            <Reveal className="rf-mobile-copy">
              <p className="rf-kicker">Une interface adaptative</p>
              <h2 id="mobile-title">Pensée pour <span>les petits écrans aussi.</span></h2>
              <p>
                L’application adapte son interface aux écrans mobiles. Le projet configure une PWA et des mécanismes de cache ; l’accès hors connexion reste partiel et dépend des ressources déjà enregistrées sur l’appareil.
              </p>
              <div className="rf-mobile-facts">
                <div><Check size={16} aria-hidden="true" /><span>Interface responsive</span></div>
                <div><Check size={16} aria-hidden="true" /><span>Installation selon le navigateur</span></div>
                <div><CircleHelp size={16} aria-hidden="true" /><span>Cache incomplet ou potentiellement ancien</span></div>
              </div>
              <a className="rf-text-link" href={applicationUrl()}>Essayer l’application <ArrowRight size={16} aria-hidden="true" /></a>
            </Reveal>
            <Reveal className="rf-mobile-shot-wrap">
              <div className="rf-mobile-halo" aria-hidden="true" />
              <button
                type="button"
                className="rf-phone-frame"
                onClick={() => setActiveImage(5)}
                aria-label="Agrandir la capture mobile en mode démonstration"
              >
                <span className="rf-phone-speaker" aria-hidden="true" />
                <img
                  src={landingScreenshots[5].src}
                  alt={landingScreenshots[5].alt}
                  width={landingScreenshots[5].width}
                  height={landingScreenshots[5].height}
                  loading="lazy"
                  decoding="async"
                />
              </button>
              <p className="rf-phone-caption">Capture mobile · mode DÉMO · valeurs simulées</p>
            </Reveal>
          </div>
        </section>

        <section className="rf-section rf-trust-section" id="apropos" aria-labelledby="trust-title">
          <div className="rf-container rf-trust-layout">
            <Reveal className="rf-trust-intro">
              <p className="rf-kicker">Indépendance et limites</p>
              <h2 id="trust-title">La confiance commence par <span>ce que l’on ne prétend pas.</span></h2>
              <p>
                Radiation France est un projet indépendant de visualisation. Les producteurs des données restent responsables de leurs mesures ; disponibilité, fréquence et méthodes varient d’un réseau à l’autre.
              </p>
            </Reveal>
            <Reveal className="rf-trust-points">
              <div><ShieldCheck size={20} aria-hidden="true" /><span><strong>Non officiel</strong><small>Ni service de l’ASNR, ni de l’IRSN, ni des autorités publiques.</small></span></div>
              <div><Database size={20} aria-hidden="true" /><span><strong>Sources externes</strong><small>Une valeur affichée ne devient pas une mesure produite par l’application.</small></span></div>
              <div><Activity size={20} aria-hidden="true" /><span><strong>Contexte nécessaire</strong><small>Une mesure isolée ne prouve ni danger ni absence de danger.</small></span></div>
            </Reveal>
          </div>
          <div className="rf-container">
            <Reveal className="rf-safety-notice">
              <span className="rf-safety-icon"><ShieldCheck size={22} aria-hidden="true" /></span>
              <div>
                <p className="rf-kicker">Information importante</p>
                <h3>Un outil de visualisation, pas un service d’urgence.</h3>
                <p>
                  Cette application n’est ni un dispositif officiel d’alerte, ni un outil de diagnostic, ni un système de prévision d’accident. En situation d’urgence radiologique, suivez les consignes des autorités, de votre préfecture et de <a href="https://www.fr-alert.gouv.fr/" target="_blank" rel="noreferrer">FR-Alert</a>.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="rf-section rf-faq-section" id="faq" aria-labelledby="faq-title">
          <div className="rf-container rf-faq-layout">
            <Reveal className="rf-faq-heading">
              <p className="rf-kicker">Questions fréquentes</p>
              <h2 id="faq-title">Mieux comprendre <span>le projet.</span></h2>
              <p>Réponses fondées sur l’état actuel du dépôt ; les intégrations et disponibilités peuvent évoluer.</p>
              <a className="rf-text-link" href={`${REPOSITORY_URL}/blob/main/README.md`} target="_blank" rel="noreferrer">Lire la documentation <ArrowRight size={16} aria-hidden="true" /></a>
            </Reveal>
            <div className="rf-faq-list">
              {faqs.map((item, index) => (
                <details className="rf-faq-item" key={item.question}>
                  <summary><span className="rf-faq-number">{String(index + 1).padStart(2, '0')}</span><span>{item.question}</span><ChevronDown size={18} aria-hidden="true" /></summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="rf-final-cta" aria-labelledby="cta-title">
          <div className="rf-container rf-cta-inner">
            <div className="rf-cta-glow" aria-hidden="true" />
            <div>
              <p className="rf-kicker">Explorer avec discernement</p>
              <h2 id="cta-title">Découvrez les données <span>et leurs limites.</span></h2>
              <p>Parcourez les réseaux, les vues et les informations disponibles dans Radiation France.</p>
            </div>
            <div className="rf-cta-actions">
              <a className="rf-button rf-button-primary" href={applicationUrl()}>Accéder à l’application <ArrowUpRight size={17} aria-hidden="true" /></a>
              <a className="rf-button rf-button-outline" href={REPOSITORY_URL} target="_blank" rel="noreferrer">Consulter le projet <Github size={17} aria-hidden="true" /></a>
            </div>
          </div>
        </section>
      </main>

      <footer className="rf-footer">
        <div className="rf-container">
          <div className="rf-footer-main">
            <div className="rf-footer-brand">
              <a className="rf-brand" href="#top">
                <img src="/logo.svg" width="38" height="38" alt="" />
                <span><strong>Radiation France</strong><small>Surveillance radiologique</small></span>
              </a>
              <p>Une interface indépendante pour explorer les réseaux et mieux comprendre les informations disponibles.</p>
              <a className="rf-footer-github" href={REPOSITORY_URL} target="_blank" rel="noreferrer"><Github size={16} aria-hidden="true" /> pnoualhier/Radiator <ExternalLink size={13} aria-hidden="true" /></a>
            </div>
            <div className="rf-footer-links">
              <div><h3>Explorer</h3><a href="#presentation">Le projet</a><a href="#fonctionnalites">Fonctionnalités</a><a href="#sources">Sources</a><a href="#captures">Captures</a></div>
              <div><h3>Ressources</h3><a href={applicationUrl()}>Application</a><a href={`${REPOSITORY_URL}/blob/main/README.md`} target="_blank" rel="noreferrer">Documentation</a><a href={`${REPOSITORY_URL}/blob/main/docs/architecture.md`} target="_blank" rel="noreferrer">Architecture</a></div>
            </div>
          </div>
          <div className="rf-footer-bottom">
            <span>© {new Date().getFullYear()} Radiation France · Projet indépendant.</span>
            <span>Fond cartographique : © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">Contributeurs OpenStreetMap</a>. Aucune licence globale du dépôt n’est confirmée.</span>
          </div>
        </div>
      </footer>

      <dialog
        className="rf-lightbox"
        ref={dialogRef}
        aria-label={currentImage ? `Visionneuse : ${currentImage.title}` : 'Visionneuse de captures'}
        onClose={() => setActiveImage(null)}
        onClick={event => {
          if (event.target === event.currentTarget) setActiveImage(null);
        }}
      >
        {currentImage && activeImage !== null && (
          <div className="rf-lightbox-content">
            <div className="rf-lightbox-top">
              <div><span>{currentImage.category}</span><h2>{currentImage.title}</h2></div>
              <button type="button" onClick={() => setActiveImage(null)} aria-label="Fermer la visionneuse"><X size={21} /></button>
            </div>
            <div className="rf-lightbox-image-wrap">
              <button
                type="button"
                className="rf-lightbox-arrow rf-lightbox-prev"
                aria-label="Capture précédente"
                onClick={() => setActiveImage((activeImage - 1 + landingScreenshots.length) % landingScreenshots.length)}
              >
                <ChevronLeft size={22} />
              </button>
              <img src={currentImage.src} alt={currentImage.alt} width={currentImage.width} height={currentImage.height} />
              <button
                type="button"
                className="rf-lightbox-arrow rf-lightbox-next"
                aria-label="Capture suivante"
                onClick={() => setActiveImage((activeImage + 1) % landingScreenshots.length)}
              >
                <ChevronRight size={22} />
              </button>
            </div>
            <div className="rf-lightbox-caption">
              <p>{currentImage.caption}</p>
              <span>{activeImage + 1} / {landingScreenshots.length}</span>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}

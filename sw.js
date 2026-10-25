/*
  Service worker du menu "Mes albums".
  Il garde en mémoire uniquement le menu et les pochettes listés ci-dessous,
  pour que le menu s'ouvre vite (et même sans réseau).
  Les pages des albums et les MP3 ne sont PAS stockés : ils restent en ligne.

  >>> QUAND TU MODIFIES LE MENU OU AJOUTES UN ALBUM :
      1. ajoute/retire l'image dans la liste FICHIERS
         (chaque fichier listé DOIT exister sur GitHub, sinon rien ne fonctionne) ;
      2. change le numéro de version (v1 -> v2 -> v3...).
*/
const CACHE = "mes-albums-v1";
const FICHIERS = [
  "./",
  "./index.html",
  "./cd_mariage_recto.png",
  "./cd_noel_recto.png",
  "./cd_audeladesetoiles_recto.png",
  "./icon-192.png",
  "./icon-512.png"
];

const ADRESSES = FICHIERS.map((f) => new URL(f, self.location).href);

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHIERS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((cles) =>
      Promise.all(cles.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Seulement pour le menu et ses images : réseau d'abord, mémoire si pas de connexion.
// Tout le reste (pages des albums, musique) passe normalement par Internet.
self.addEventListener("fetch", (e) => {
  const url = e.request.url.split("#")[0].split("?")[0];
  if (e.request.method !== "GET" || !ADRESSES.includes(url)) return;

  e.respondWith(
    fetch(e.request)
      .then((rep) => {
        const copie = rep.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copie));
        return rep;
      })
      .catch(() => caches.match(e.request))
  );
});

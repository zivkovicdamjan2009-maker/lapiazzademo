# La Piazza — Pizzeria & Gelateria

Statični sajt, spreman za GitHub Pages. Bez build koraka, bez zavisnosti (samo Google Fonts sa CDN-a).

## Struktura

```
index.html
assets/
  style.css
  site.js
  la-piazza-logo.png
  favicon.png
  photos/           <- ovde idu fotografije
.nojekyll
```

## Objavljivanje na GitHub Pages

1. Napravi repo (npr. `la-piazza`) i ubaci sadržaj ove `dist/` mape u koren repoa.
2. Push na `main`.
3. Repo → **Settings → Pages** → Source: `Deploy from a branch`, Branch: `main` / `/ (root)` → Save.
4. Sajt je za minut-dva na `https://<korisnik>.github.io/la-piazza/`.

Za sopstveni domen: dodaj fajl `CNAME` u koren sa domenom (npr. `lapiazza.rs`) i podesi DNS kod registrara.

## Fotografije

Sve fotografije su već u `assets/photos/`, optimizovane za web (širina do 2000px, JPG ~80%). Zamena je jednostavna: prepiši fajl istim imenom. Dok fajl ne postoji, prikazuje se diskretan placeholder sa nazivom.

| Fajl | Gde se koristi | Preporučeno |
| --- | --- | --- |
| `hero.jpg` | hero, prvi ekran | 1920×1200 |
| `about-1.jpg` | O nama, široka | 1600×1000 |
| `about-2.jpg` | O nama, uspravna | 900×1120 |
| `pizza-hero.jpg` | Pizza, glavna | 1200×1500 |
| `pizza-1…4.jpg` | Pizza, horizontalni niz | 900×1200 |
| `gelato.jpg` | Gelato | 1200×1200 |
| `trg.jpg` | Trg slobode, ceo ekran | 1920×1100 |
| `g1…g7.jpg` | Galerija | 900–1800 px šire strane |

Optimizuj slike pre uploada (JPG kvalitet ~75, širina do 1920px) da se sajt učitava brzo.

## Izmena sadržaja

- **Tekst:** direktno u `index.html`. Svaki dvojezični element ima srpski tekst u HTML-u i engleski u `data-en` atributu.
- **Meni:** lista kategorija je u `assets/site.js`, konstanta `CATS` — naziv, podnaslov i broj redova. Placeholder redovi (`Jelo 01`, cena `—`) menjaju se pravim jelima i cenama u funkciji `pageHTML`.
- **Boje i tipografija:** CSS varijable na vrhu `assets/style.css`.
- **Telefon / adresa:** pretraži `+38163632432` i `Trg slobode` u `index.html`.

## Šta je uključeno

Preloader sa progres linijom, fixed header koji se menja na scroll, fullscreen navigacija, scroll reveal animacije, blur-to-sharp reveal slika, listanje menija kao knjige (rAF animacija, na mobilnom jedna strana po listu), SR/EN prekidač sa pamćenjem izbora, Google mapa, poštovanje `prefers-reduced-motion`.

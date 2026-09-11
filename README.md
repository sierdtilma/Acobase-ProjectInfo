# Projectinfo — Power BI custom visual (Acobase)

Power BI custom visual voor het tonen van projectinformatie (project, projectnummer, adviseur, datum metingen, meetnorm).

Doel: dit project certificeren via Microsoft AppSource, zodat de visual via "Get more visuals" / SourceApp beschikbaar wordt zonder tenant-restricties.

## Ontwikkelen

```powershell
npm install
npm start          # start de visual in ontwikkelmode (localhost)
npm run package    # bouwt de .pbiviz (verhoogt automatisch de build-versie)
```

## Pre-certificatie controle (Fase A)

Voer na elke wijziging aan de visual de geautomatiseerde controle uit. Dit script bundelt lint, type-check, `npm audit`, een scan op verboden/onveilige patronen en een check op verplichte metadata/bestanden volgens de [Microsoft AppSource-richtlijnen](https://learn.microsoft.com/power-bi/developer/visuals/guidelines-powerbi-visuals).

```powershell
npm run certify
```

Los losse checks:

```powershell
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm audit           # kwetsbaarheden in dependencies
```

`npm run certify` faalt (exit code ≠ 0) zolang er nog fouten zijn. Waarschuwingen blokkeren niet, maar moeten voor certificering wel beoordeeld worden (bijv. gebruikte privileges).

### Wat de check (nog) niet automatisch afvangt — handmatig nalopen

- Werkt de visual correct in Power BI Desktop, Service, mobiele app, "Analyseren in Excel" en bij export naar PDF/PowerPoint?
- Toetsenbordnavigatie en screenreader-ondersteuning (focus states, ARIA waar relevant).
- Gedrag bij lege data, zeer veel rijen, `null`/lege waarden.
- Gedrag met Row-Level Security (RLS) ingeschakeld.
- High-contrast / donker thema van Power BI.
- Kloppen de screenshots/omschrijving die je in Partner Center gebruikt nog met de huidige visual?

`npm run package` (pbiviz/webpack) toont zelf ook nog welke door Microsoft **aanbevolen** (niet verplichte) features ontbreken, o.a.:
Allow Interactions, Color Palette, Context Menu, High Contrast, Highlight Data, Keyboard Navigation, Landing Page, Localizations, Rendering Events, Tooltips. Dit zijn geen harde blokkades voor certificering, maar verhogen de kans op goedkeuring zonder revisierondes en verbeteren de store-vindbaarheid.

## Stappenplan certificering

### Fase A — Code & repository gereedmaken
1. GitHub-repository aanmaken en pushen (zie hieronder) — repository moet **publiek** zijn, certificering en de support-URL verwijzen ernaar.
2. `npm run certify` schoon laten draaien (0 fouten); waarschuwingen beoordelen en oplossen.
3. Echte waarden invullen in [`pbiviz.json`](pbiviz.json): `visual.supportUrl` (zie [`SUPPORT.md`](SUPPORT.md)), `author.email`, `visual.gitHubUrl` (geen `example.com`-placeholders meer).
4. Handmatige checklist hierboven doorlopen.
5. `npm run package` — resulterende `.pbiviz` testen door hem in Power BI Desktop te importeren.

### Fase B — Publiceren op AppSource
6. Account aanmaken in [Microsoft Partner Center](https://partner.microsoft.com/).
7. Nieuw "Power BI visual"-aanbod aanmaken: `.pbiviz` uploaden, store-listing invullen (beschrijving, screenshots, privacyverklaring-URL, support-URL, terms of use).

### Fase C — Certificering
8. [Certificeringsformulier](https://learn.microsoft.com/power-bi/developer/visuals/power-bi-custom-visuals-certified) indienen, met link naar deze (publiek toegankelijke) GitHub-repository.
9. Reageren op eventuele opmerkingen uit de Microsoft-review.
10. Na goedkeuring: visual krijgt de "Certified"-badge en is bruikbaar in Power BI Service/embed/export, ook voor tenants die alleen gecertificeerde visuals toestaan.

## GitHub-repository opzetten

Deze visual heeft een eigen, dedicated repository (los van andere Acobase-repo's). Lokale repo is al geïnitialiseerd. Om te verbinden met GitHub:

```powershell
git remote add origin https://github.com/sierdtilma/Acobase-ProjectInfo.git
git branch -M main
git push -u origin main
```

(Repository is aangemaakt op github.com als **publieke** repository `Acobase-ProjectInfo` — vereist voor certificering en voor de support-/gitHubUrl in [`pbiviz.json`](pbiviz.json).)

## Support-pagina

`visual.supportUrl` in [`pbiviz.json`](pbiviz.json) verwijst naar [`SUPPORT.md`](SUPPORT.md) in deze (publieke) repository. Dit bestand beschrijft hoe gebruikers een issue melden of contact opnemen. Werk [`SUPPORT.md`](SUPPORT.md) bij als de repo-naam/eigenaar wijzigt, zodat de link geldig blijft.

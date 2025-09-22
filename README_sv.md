# Domänbetyg Kontrollant Pro

Ett professionellt verktyg för domänbetygskontroll med automatisering, rapportering och omfattande SEO-mätningsspårning.

## Funktioner

### Kärnfunktionalitet
- ✅ Enskilda domänbetygskontroller
- ✅ Bulk-domänanalys via CSV-uppladdning
- ✅ Flera datakällor (Ahrefs, Moz, grundläggande mätningar)
- ✅ Realtidsresultatvisning
- ✅ Historisk datalagring

### Automatisering & Rapportering
- ✅ Schemalagda automatiska kontroller (dagligen/veckovis/månadsvis)
- ✅ E-postrapportleverans
- ✅ CSV-exportfunktionalitet
- ✅ Resultatspårning och historik

### Professionellt UI
- ✅ Modern, responsiv design
- ✅ Flikgränssnitt för enkel navigering
- ✅ Realtidsladdningsindikatorer
- ✅ Professionell styling med animationer

## Snabbstart

### 1. Installation

```bash
# Klona eller ladda ner projektet
cd domain-rating-checker

# Installera beroenden
npm install

# Skapa miljöfil
cp .env.example .env
```

### 2. Konfiguration

Redigera `.env`-filen med dina API-nycklar och e-postinställningar:

```env
# API-nycklar (Valfritt - för förbättrad noggrannhet)
AHREFS_API_KEY=din_ahrefs_api_nyckel
MOZ_API_KEY=din_moz_api_nyckel
SERANKING_API_KEY=din_seranking_api_nyckel

# E-postkonfiguration (Krävs för rapporter)
EMAIL_USER=din_email@gmail.com
EMAIL_PASS=ditt_app_lösenord

PORT=3000
```

### 3. Kör Applikationen

```bash
# Utvecklingsläge
npm run dev

# Produktionsläge
npm start
```

Besök `http://localhost:3000` i din webbläsare.

## Användarguide

### Enskild Domänkontroll
1. Gå till fliken "Domänkontrollant"
2. Ange en domän i fältet för enskild domän
3. Klicka på "Kontrollera" för att få omedelbara resultat

### Bulk Domänanalys
1. Förbered en CSV-fil med en "domain"-kolumn (se `sample-domains.csv`)
2. Ladda upp CSV-filen med uppladdningsknappen
3. Klicka på "Bearbeta Domäner" för att analysera alla domäner

### Automatiseringsinställning
1. Gå till fliken "Inställningar"
2. Aktivera "Automatisk Kontroll"
3. Välj ditt föredragna schema
4. Konfigurera e-postrapporter vid behov
5. Spara inställningar

### Visa Resultat
1. Gå till fliken "Resultat" för att se all historisk data
2. Exportera resultat till CSV för vidare analys
3. Resultaten inkluderar domänbetyg, bakåtlänkar och hänvisande domäner

## API-slutpunkter

### Kontrollera Enskild Domän
```http
POST /api/check-domain
Content-Type: application/json

{
  "domain": "example.com"
}
```

### Ladda upp CSV
```http
POST /api/upload-csv
Content-Type: multipart/form-data

csvFile: [fil]
```

### Hämta Resultat
```http
GET /api/results
```

### Exportera CSV
```http
GET /api/export-csv
```

### Inställningshantering
```http
GET /api/settings
POST /api/settings
```

## Datakällor

Verktyget integrerar med flera datakällor för omfattande analys:

1. **Seranking.com API** - Högkvalitativa domänmätningar inklusive Domain Trust (DT), bakåtlänkar och hänvisande domäner
2. **Ahrefs API** - Premium domänmätningar
3. **Moz API** - Domänauktoritet och länkdata
4. **Grundläggande Webbskrapning** - Reservmätningar och grundläggande webbplatsinformation

## Filstruktur

```
domain-rating-checker/
├── lib/
│   ├── domainChecker.js    # Kärnlogik för domänanalys
│   └── database.js         # SQLite databasoperationer
├── public/
│   ├── index.html         # Huvud-UI
│   ├── style.css          # Professionell styling
│   ├── script.js          # Frontend-funktionalitet
│   └── translations.js    # Svenska översättningar
├── data/                  # SQLite databaslagring
├── exports/               # CSV-exportfiler
├── uploads/               # Temporära CSV-uppladdningar
├── server.js              # Express-server
├── package.json           # Beroenden
└── README.md             # Denna fil
```

## Databasschema

### domain_results
- id (PRIMÄRNYCKEL)
- domain (TEXT)
- domain_rating (INTEGER)
- backlinks (INTEGER)
- referring_domains (INTEGER)
- organic_traffic (TEXT)
- status (TEXT)
- error (TEXT)
- checked_at (DATETIME)

### settings
- id (PRIMÄRNYCKEL)
- key (TEXT)
- value (TEXT)
- updated_at (DATETIME)

### tracked_domains
- id (PRIMÄRNYCKEL)
- domain (TEXT)
- added_at (DATETIME)

## Automatiseringsfunktioner

### Schemalagda Kontroller
- Dagligen kl 09:00
- Veckovis (Måndagar kl 09:00)
- Månadsvis (1:a dagen kl 09:00)
- Anpassade cron-uttryck stöds

### E-postrapporter
- Automatisk HTML-e-postgenerering
- Professionell tabellformatering
- Konfigurerbar mottagare-e-post
- Felhantering och återförsökslogik

## Säkerhetsöverväganden

- API-nycklar lagrade i miljövariabler
- Filuppladdningsvalidering
- SQL-injektionsförebyggande
- Hastighetsbegränsning för API-anrop
- Inmatningssanitisering

## Felsökning

### Vanliga Problem

1. **API-hastighetsbegränsningar**
   - Verktyget inkluderar inbyggd hastighetsbegränsning
   - Batchbearbetning med fördröjningar mellan förfrågningar

2. **E-post Skickas Inte**
   - Verifiera EMAIL_USER och EMAIL_PASS i .env
   - Använd app-specifika lösenord för Gmail

3. **CSV-uppladdningsproblem**
   - Säkerställ att CSV har "domain"-kolumnrubrik
   - Kontrollera filbehörigheter i uploads/-katalogen

4. **Databasfel**
   - Säkerställ att data/-katalogen finns och är skrivbar
   - SQLite-databasen skapas automatiskt

## Utveckling

### Lägga till Nya Datakällor
1. Utöka `DomainChecker`-klassen i `lib/domainChecker.js`
2. Lägg till nya API-integrationsmetoder
3. Uppdatera resultatextraktionslogik

### Anpassa UI
1. Modifiera `public/style.css` för stiländringar
2. Uppdatera `public/script.js` för funktionalitet
3. Redigera `public/index.html` för strukturändringar

## Licens

MIT-licens - använd och modifiera fritt för dina projekt.

## Support

För problem och funktionsförfrågningar, vänligen skapa ett ärende i projektets repository.

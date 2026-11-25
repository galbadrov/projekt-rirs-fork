# Pregled prevzetega projekta

## Obseg pregleda

Pregledani so bili projektna dokumentacija, arhitekturne odločitve (ADR), podatkovni model, backend in frontend koda ter navodila za lokalni zagon. Rešitev uporablja React in TypeScript na frontendu, Express in TypeScript na backendu, PostgreSQL ter Prisma ORM. Dostop je zaščiten z JWT v `HttpOnly` piškotku in s preverjanjem vlog `EMPLOYEE`, `TECHNICIAN` ter `ADMIN`.

## Implementirane funkcionalnosti MVP

Uspešno oziroma pretežno uspešno so implementirane naslednje funkcionalnosti:

- prijava in odjava uporabnikov ter omejevanje dostopa glede na vlogo;
- oddaja IT zahtevka z naslovom, opisom, kategorijo, vplivom in nujnostjo (manjka le povezava do podrobnosti v potrditvi oddaje);
- dodeljevanje in prerazporejanje zahtevkov aktivnim IT-tehnikom s strani administratorja;
- postopek obravnave `OPEN` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`, vključno z opisom rešitve ter časom rešitve in zaprtja;
- komunikacija med prijaviteljem in dodeljenim tehnikom prek komentarjev;
- pregled zahtevkov glede na vlogo ter kombinirano filtriranje po statusu in prioriteti.

Samodejno določanje prioritete ni implementirano. Backend ob ustvarjanju vsakemu zahtevku nastavi prioriteto `MEDIUM`, ne glede na izbrani vpliv in nujnost. MVP zato kot celota še ni v celoti dokončan.

## Pregled uporabniških zgodb MVP

Pregledanih je bilo vseh šest MVP-zgodb iz datoteke `05-uporabniske-zgodbe.md`.

| Uporabniška zgodba | Ocena | Ugotovitve |
| --- | --- | --- |
| US-01 – Prijava IT težave | Delno zadošča | Obrazec in API preverjata obvezna polja, dovoljene stopnje ter obstoj kategorije. Zahtevek dobi prijavitelja, čas in status `OPEN`, po oddaji pa se izpiše njegova številka. Manjka zahtevana povezava do podrobnosti novega zahtevka. |
| US-02 – Samodejno določanje prioritete | Ne zadošča | Preslikava devetih kombinacij vpliva in nujnosti ni implementirana. Vrednost je vedno `MEDIUM`; zaposleni je sicer ne more poslati ali spreminjati prek obrazca oziroma API-ja. |
| US-03 – Dodeljevanje zahtevkov tehnikom | Zadošča | Administrator vidi dodelitev, izbira le med aktivnimi tehniki in jo lahko spremeni. API zavrne druge vloge, dodeljeni zahtevek pa je zaradi filtriranja po `assignedTo` viden izbranemu tehniku. |
| US-04 – Obravnava zahtevka po postopku | Zadošča | API dovoljuje samo zaporedne prehode. Začetek in rešitev sta dovoljena le dodeljenemu tehniku, zaprtje pa le prijavitelju. Opis rešitve je obvezen, čas rešitve in zaprtja se shranita, stanje pa je vidno v seznamu in podrobnostih. |
| US-05 – Komunikacija pri zahtevku | Zadošča | Branje in dodajanje komentarjev je omejeno na prijavitelja in dodeljenega tehnika. Prazen ali predolg komentar se zavrne, komentar hrani avtorja in čas, prikaz pa je kronološki. Na zaprtem zahtevku komentiranje ni mogoče. |
| US-06 – Pregled in filtriranje zahtevkov | Zadošča | Zaposleni vidi svoje zahtevke, tehnik dodeljene, administrator pa vse. Filtra po statusu in prioriteti delujeta tudi skupaj. Če ni zadetkov, se prikažeta sporočilo in možnost ponastavitve filtrov. |

Od šestih pregledanih zgodb so štiri v celoti izpolnjene, ena je izpolnjena delno, ena pa ni izpolnjena. Implementirane funkcionalnosti zato uporabniškim zgodbam MVP ne zadoščajo v celoti.

## Lokalni zagon in tehnična preveritev

Odvisnosti so bile nameščene iz datotek `package-lock.json`, ustvarjen je bil Prisma Client, frontend in backend pa sta se uspešno zgradila. Frontend je uspešno prestal tudi ESLint. PostgreSQL je bil zagnan z Docker Compose, izvedena je bila migracija, ustvarjeni so bili testni uporabniki in začetne kategorije, nato pa sta bila hkrati zagnana backend in frontend. Endpointa `/api/health` in `/api/db-health` ter frontend so vrnili odgovor `200 OK`.

Praktično je bil uspešno preverjen celoten osnovni tok: prijava, oddaja zahtevka, dodelitev tehniku, komentar, začetek obravnave, vnos rešitve in zaprtje s strani prijavitelja. Test z vplivom `HIGH` in nujnostjo `HIGH` je vrnil prioriteto `MEDIUM`, kar potrjuje ugotovitev, da US-02 ni implementirana. Lokalno okolje ima Node.js 20, medtem ko README zahteva Node.js 24 ali novejši; kljub opozorilu o različici sta gradnja in zagon uspela.

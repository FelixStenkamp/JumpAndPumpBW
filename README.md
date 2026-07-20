# Jump & Pump Bad Waldsee – Event-Monitor

Kleines Web-Tool für die Veranstaltung, das mehrere RaceResult-Ansichten (Ergebnisse, Live, Teilnehmer) sowie eine Ziel-Foto-Station in einem einheitlichen Design bündelt. Rein statische HTML/JS-Seiten, lauffähig z. B. über GitHub Pages.

## Seiten

| Datei | Zweck |
|---|---|
| `index.html` | Startseite mit vier Kacheln zur Navigation |
| `results.html` | Ergebnisliste (RaceResult `RRPublish`) |
| `live.html` | Live-Ansicht (RaceResult `RRPublish`) |
| `cam.html` | Startnummer-Eingabe für die Foto-Station |
| `aufnahme.html` | Kamera-Aufnahme (16:9, Countdown, Upload zu Cloudinary, Speichern in RaceResult) |
| `teilnehmer.html` | Startnummer-Eingabe für Teilnehmerdetails |
| `teilnehmerseite.html` | Teilnehmerdetails (RaceResult `RRParticipantView`) |
| `variables.js` | Zentrale Konfiguration (siehe unten) |

## Einrichtung für ein neues Event

Nur **`variables.js`** anpassen – keine andere Datei muss verändert werden:

- `RR_EVENT_ID` – Event-ID in RaceResult
- `RR_WRITE_API_KEY` – Custom-API-Key mit `part/savevalue`-Recht
- `RR_READ_API_KEY` – List-API-Key (Felder: Bib, Finish Pic, Vorname, Nachname, Verein)
- `RR_FIELD_NAME` – Feldname für die Ziel-Foto-URL
- `RR_PAGE_TYPE_RESULTS` / `RR_PAGE_TYPE_LIVE` / `RR_PAGE_TYPE_DETAILS` – Bezeichnungen der RaceResult-Publish-Seiten
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_UPLOAD_PRESET` – Zugangsdaten für den Bild-Upload (unsigned Preset)

## Funktionsweise Foto-Station

1. Startnummer eingeben (eigener Touch-Nummernblock, kein Systemtastatur nötig)
2. Prüfung, ob bereits ein Foto hinterlegt ist → ggf. Option zum Überschreiben
3. Kamera mit 5-Sekunden-Countdown
4. Foto wird zu Cloudinary hochgeladen, die Bild-URL anschließend im konfigurierten Feld in RaceResult gespeichert

## Design

Die Akzentfarbe wird automatisch aus der in RaceResult hinterlegten Veranstaltungsfarbe übernommen (`--brandColorDark`), mit Rot (`#a81815`) als Rückfallwert, falls keine gesetzt ist. Wird lokal zwischengespeichert, damit sie beim Seitenwechsel sofort verfügbar ist.

## Hosting

Alle Dateien (inkl. `images/`-Ordner) im selben Verzeichnis eines Web-Hostings ablegen, z. B. GitHub Pages. `variables.js` muss im selben Verzeichnis wie die HTML-Dateien liegen.

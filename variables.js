/* =========================================================
   ZENTRALE KONFIGURATION – Jump & Pump Bad Waldsee
   Bei Übernahme für ein neues Event NUR diese Datei anpassen.
   Alle anderen Seiten beziehen sich ausschließlich auf diese
   Variablen und müssen selbst nicht verändert werden.
   ========================================================= */

// RaceResult Event
const RR_EVENT_ID = "410823";

// RaceResult API-Keys (Access Rights / Simple API)
const RR_WRITE_API_KEY = "JVO4S5NUVOQJ7AHC2IHDVE9H2BLX9HWY"; // Custom-Key, nur "part/savevalue"
const RR_READ_API_KEY  = "X9JQNUP2KLJPPA16B6YI7I1MDUUN60I8"; // List-Key (Bib, Finish Pic, Vorname, Nachname, Verein)

// Feldname, in dem die Zielfoto-URL gespeichert wird
const RR_FIELD_NAME = "FinishPic";

// Bezeichnungen der RaceResult-Seiten (RRPublish / RRParticipantView)
const RR_PAGE_TYPE_RESULTS = "resmonitor";
const RR_PAGE_TYPE_LIVE = "live";
const RR_PAGE_TYPE_DETAILS = "detailsmonitor";

// Cloudinary (Bild-Hosting)
const CLOUDINARY_CLOUD_NAME = "fqcfrlxz";
const CLOUDINARY_UPLOAD_PRESET = "JumpAndPumpBW";

/* ---------------------------------------------------------
   Ab hier nichts mehr anpassen – wird automatisch berechnet
   --------------------------------------------------------- */
const RR_WRITE_URL = `https://api.raceresult.com/${RR_EVENT_ID}/${RR_WRITE_API_KEY}`;
const RR_READ_URL  = `https://api.raceresult.com/${RR_EVENT_ID}/${RR_READ_API_KEY}`;
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/* ---------------------------------------------------------
   Veranstaltungsfarbe aus RaceResult übernehmen
   RaceResult setzt bei RRPublish/RRParticipantView automatisch
   die CSS-Variable --brandColorDark mit der im Event hinterlegten
   Veranstaltungsfarbe. Ist keine Farbe gewählt oder lässt sich
   nichts auslesen, bleibt unser bisheriges Rot (#a81815) erhalten.

   Damit die Seite nicht bei jedem Aufruf kurz rot aufblitzt,
   während die Farbe ermittelt wird, wird das Ergebnis lokal
   zwischengespeichert (localStorage) und beim nächsten Laden
   sofort angewendet, noch bevor irgendetwas gerendert wird.
   Im Hintergrund wird nur alle paar Stunden erneut geprüft,
   ob sich die Farbe geändert hat.
   --------------------------------------------------------- */
const ACCENT_FALLBACK_COLOR = "#a81815";
const ACCENT_CACHE_KEY = `rr_accent_color_${RR_EVENT_ID}`;
const ACCENT_CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000; // 6 Stunden

// Sofort beim Einbinden dieser Datei (also vor dem <style>-Block der Seite)
// eine evtl. zwischengespeicherte Farbe anwenden – verhindert das rote Aufblitzen.
(function applyCachedAccentColorImmediately(){
  try{
    const cached = JSON.parse(localStorage.getItem(ACCENT_CACHE_KEY) || "null");
    if(cached && cached.color){
      document.documentElement.style.setProperty('--accent-color', cached.color);
    }
  }catch(err){ /* localStorage evtl. nicht verfügbar – kein Problem, Fallback bleibt Rot */ }
})();

function getCachedAccentColor(){
  try{
    const cached = JSON.parse(localStorage.getItem(ACCENT_CACHE_KEY) || "null");
    return cached || null;
  }catch(err){
    return null;
  }
}

function isCacheFresh(cached){
  return !!(cached && cached.timestamp && (Date.now() - cached.timestamp) < ACCENT_CACHE_MAX_AGE_MS);
}

function applyAccentColor(color){
  const finalColor = (color && color.trim()) ? color.trim() : ACCENT_FALLBACK_COLOR;
  document.documentElement.style.setProperty('--accent-color', finalColor);
  try{
    localStorage.setItem(ACCENT_CACHE_KEY, JSON.stringify({ color: finalColor, timestamp: Date.now() }));
  }catch(err){ /* localStorage evtl. nicht verfügbar */ }
}

function readBrandColorFromElement(el){
  if(!el) return null;
  try{
    const val = getComputedStyle(el).getPropertyValue('--brandColorDark').trim();
    return val || null;
  }catch(err){
    return null;
  }
}

// Prüft in kurzen Abständen (statt einer festen Wartezeit), ob die Farbe
// schon verfügbar ist, und wendet sie an, sobald sie gefunden wird.
function pollForBrandColor(el, maxWaitMs = 2500, intervalMs = 100){
  const start = Date.now();
  const timer = setInterval(() => {
    const color = readBrandColorFromElement(el);
    if(color){
      clearInterval(timer);
      applyAccentColor(color);
    } else if(Date.now() - start > maxWaitMs){
      clearInterval(timer);
      // Nichts gefunden: nur anwenden, falls noch kein (auch kein gecachter) Wert gesetzt ist
      if(!getCachedAccentColor()){
        applyAccentColor(null);
      }
    }
  }, intervalMs);
}

// Für Seiten OHNE eigene RRPublish/RRParticipantView-Einbindung:
// lädt unsichtbar eine minimale Instanz, nur um die Veranstaltungsfarbe auszulesen.
// Wird übersprungen, falls bereits ein aktueller Cache-Wert vorliegt (spart Ladezeit).
function loadBrandColorStandalone(){
  if(isCacheFresh(getCachedAccentColor())){
    return; // Farbe ist bereits aktuell im Cache – kein erneutes Nachladen nötig
  }

  try{
    const probe = document.createElement('div');
    probe.style.display = 'none';
    document.body.appendChild(probe);

    const script = document.createElement('script');
    script.src = 'https://my.raceresult.com/RRPublish/load.js?lang=de';
    script.onload = function(){
      try{
        new RRPublish(probe, RR_EVENT_ID, RR_PAGE_TYPE_RESULTS);
        pollForBrandColor(probe);
      }catch(err){
        if(!getCachedAccentColor()) applyAccentColor(null);
      }
    };
    script.onerror = function(){
      if(!getCachedAccentColor()) applyAccentColor(null);
    };
    document.head.appendChild(script);
  }catch(err){
    if(!getCachedAccentColor()) applyAccentColor(null);
  }
}

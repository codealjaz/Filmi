const API_KLJUC = "8f7a42e2";

const vnos = document.getElementById("iskanje");
const rezultat = document.getElementById("rezultat");

document.getElementById("isci")
  .addEventListener("click", isci);

vnos.addEventListener("keydown", (dogodek) => {
  if (dogodek.key === "Enter") {
    isci();
  }
});

async function isci() {
  const naslov = vnos.value.trim();

  if (!naslov) {
    prikaziSporocilo("Vpiši naslov filma.");
    return;
  }

  prikaziNalaganje();

  try {
    const url = new URL("https://www.omdbapi.com/");

    url.search = new URLSearchParams({
      apikey: API_KLJUC,
      s: naslov,
      type: "movie",
      r: "json"
    });

    const odgovor = await fetch(url);
    const podatki = await odgovor.json();

    if (podatki.Response === "False") {
      prikaziSporocilo("Filma nisem našel.");
      return;
    }

    rezultat.replaceChildren();

    for (const film of podatki.Search) {
      const kartica = document.createElement("div");
      kartica.className = "film";

      // Slika
      const slika = document.createElement("img");
      slika.className = "film-slika";
      slika.style.cursor = "pointer"; // Dodaj pokazovalec
      
      if (film.Poster && film.Poster !== "N/A") {
        slika.src = film.Poster;
        slika.alt = film.Title;
      } else {
        slika.className = "film-slika ni-slike";
        slika.innerHTML = "🎥";
        slika.alt = "Ni dostopne slike";
      }

      // KLIK NA SLIKO
      slika.addEventListener("click", () => {
        odpriPodnapise(film.imdbID);
        odpriPirateBay(film.Title, film.Year);
      });

      // Informacije
      const info = document.createElement("div");
      info.className = "film-info";

      const naslovFilma = document.createElement("h2");
      naslovFilma.className = "film-naslov";
      naslovFilma.textContent = film.Title;

      const leto = document.createElement("p");
      leto.className = "film-leto";
      leto.textContent = `Leto: ${film.Year}`;

      // Kartici dodaj element (brez gumba!)
      info.append(naslovFilma, leto);
      kartica.append(slika, info);
      rezultat.appendChild(kartica);
    }

  } catch (napaka) {
    prikaziSporocilo("Pri iskanju je prišlo do napake. Poskusi znova.");
    console.error(napaka);
  }
}

function prikaziSporocilo(besedilo) {
  rezultat.innerHTML = `<div class="oseba-sporocilo">${besedilo}</div>`;
}

function prikaziNalaganje() {
  rezultat.innerHTML = `<div class="nalaganje"><div class="spinner"></div><p>Iščem filme...</p></div>`;
}

function odpriPodnapise(imdbID) {
  const imdbStevilka = imdbID.replace(/^tt/, "");
  const naslov = vnos.value.trim();

  const povezava =
    "https://www.opensubtitles.org/en/search/" +
    `imdbid-${encodeURIComponent(imdbStevilka)}/` +
    "sublanguageid-slv/" +
    `moviename-${encodeURIComponent(naslov)}`;

  window.open(
    povezava,
    "_blank",
    "noopener,noreferrer"
  );
}

function odpriPirateBay(naslov, leto) {
  const iskalniNiz = `${naslov} (${leto})`;
  
  const povezava =
    "https://thepiratebay.party/search/" +
    encodeURIComponent(iskalniNiz) +
    "/1/99/0";

  window.open(
    povezava,
    "_blank",
    "noopener,noreferrer"
  );
}

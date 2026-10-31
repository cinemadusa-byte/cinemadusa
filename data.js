const CINEMADUSA_CONFIG = {
  source: "https://v3-cinemeta.strem.io",
  movieCount: 150,
  seriesCount: 100,
  pageSize: 100
};

let films = [];
let series = [];

async function fetchCatalog(type, targetCount) {
  const results = [];
  const seen = new Set();

  for (
    let skip = 0;
    skip < targetCount;
    skip += CINEMADUSA_CONFIG.pageSize
  ) {
    const url =
      `${CINEMADUSA_CONFIG.source}/catalog/${type}/top.json?skip=${skip}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`${type} kataloğu yüklenemedi: ${response.status}`);
    }

    const data = await response.json();
    const metas = data.metas || [];

    if (!metas.length) break;

    for (const meta of metas) {
      if (!meta.id || seen.has(meta.id)) continue;

      seen.add(meta.id);

      results.push({
        id: meta.id,
        type: type === "series" ? "series" : "movie",
        title: meta.name || "İsimsiz Yapım",
        poster: meta.poster || "",
        year: meta.year || "",
        rating: Number(meta.imdbRating) || 0,
        genres: Array.isArray(meta.genres) ? meta.genres : [],
        description: meta.description || "",
        director: meta.director || [],
        cast: meta.cast || [],
        country: meta.country || ""
      });

      if (results.length >= targetCount) break;
    }

    if (metas.length < CINEMADUSA_CONFIG.pageSize) break;
  }

  return results.slice(0, targetCount);
}

async function loadCatalog() {
  const [movieResults, seriesResults] = await Promise.all([
    fetchCatalog("movie", CINEMADUSA_CONFIG.movieCount),
    fetchCatalog("series", CINEMADUSA_CONFIG.seriesCount)
  ]);

  films = movieResults;
  series = seriesResults;

  console.log("CINEMADUSA arşivi yüklendi.");
  console.log("Filmler:", films.length);
  console.log("Diziler:", series.length);

  return {
    films,
    series
  };
}
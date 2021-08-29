const noImg = "http://tinyurl.com/missing-tv";
const searchUrl = "http://api.tvmaze.com/search/shows?q="

// search for shows using GET with appended query based on user input
async function searchShows(query) {
  let res = await axios.get(searchUrl + query);
  let shows = res.data.map(queryResults => {
  let show = queryResults.show;

    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image ? show.image.medium : noImg, // if no image available, show default image
    };
  });

  return shows;
}

// adds shows returned from query to the DOM
function populateShows(shows) {
  const showsList = $("#shows-list");
  showsList.empty();

  for (let show of shows) {
    
    let showItem = $(`<div class="Show" data-show-id=${show.id}></div>`)
    let showId = $(`<div data-show-id="${show.id}>`)
    let showImg = $(`<img src="${show.image}"></img>`)
    let showName = $(`<h3>${show.name}</h3>`)
    let showSummary = $(` <p>${show.summary}</p>`)
    let episodeBtn = $(`<button class="btn btn-primary get-episodes">Episodes</button>`)

    showsList.append(showItem)
    showItem.append(showId)
    showItem.append(showImg)
    showItem.append(showName)
    showItem.append(showSummary)
    showItem.append(episodeBtn)
  }
}

// When form submitted, check if query returns anything; if not, do nothing. 
// Otherwise, hide the epsisode element until the API returns something, then populate the screen.
$("#search-form").on("submit", async function handleSearch(evt) {
  evt.preventDefault();

  let q = $("#search-query").val();
  if (!q) {
    return "Nothing Found";
  }

  $("#episodes-area").hide();

  let shows = await searchShows(q);

  populateShows(shows);
});

// GETs episodes related to the show selected by the user. 
async function getEpisodes(id) {
  const episodesUrl = `http://api.tvmaze.com/shows/${id}/episodes`;
  let res = await axios.get(episodesUrl);

  let episodes = res.data.map(episode => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number,
  }));

  return episodes;
}

// adds episodes to the bottom of the page for the selected show
function populateEpisodes(episodes) {
  const episodesList = $("#episodes-list");
  episodesList.empty();
    
  for (let episode of episodes) {
    let li = $("<li>")
    let episodeName = `<b> ${episode.name} </b>`
    let season = episode.season
    let episodeNum = episode.number

    episodesList.append(li)
    li.append(episodeName)
    li.append(` Season ${season}, Epsisode ${episodeNum}`)
  }

  $("#episodes-area").show();
}

// handles clicks on the Episodes button. Calls getEpisodes() and populateEpisodes().
$("#shows-list").on("click", ".get-episodes", async function episodeClick(event) {
  let show = $(event.target).closest(".Show").data("show-id");
  let episodes = await getEpisodes(show);
  populateEpisodes(episodes);
});
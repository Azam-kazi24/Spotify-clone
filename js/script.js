console.log("Lets write JavaScript");

let currentSong = new Audio();
let songs;
let currFolder;
function formatSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  // Ensure both minutes and seconds are always two digits
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
  const formattedSeconds =
    remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;

  let as = div.getElementsByTagName("a");

  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];

  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li><img class="invert" src="img/music.svg" alt="" srcset="" />
                <div class="info">
                  <div> ${song.replaceAll("%20", " ")}</div>
                  <div>Azam</div>
                </div>
                <div class="playNow">
                  <span>Play Now</span>
                  <img class="invert" src="img/play.svg" alt="" srcset="" />
                </div>
             
    
   </li>`;
  }

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs
}
const playMusic = (track, pause = false) => {
  // let audio = new Audio("/songs/" + track);
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00";
};

async function displayAlbums() {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");

  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    {
      if (e.href.includes("/songs")) {
        let folder = e.href.split("/").slice(-2)[0];
        // Get the meta data of the folder
        let a = await fetch(`/songs/${folder}/info.json`);
        let response = await a.json();
        console.log(response);

        cardContainer.innerHTML =
          cardContainer.innerHTML +
          `<div data-folder=${folder} class="card">
              <div class="play">
                <div class="circle-bg">
                  <svg
                    version="1.1"
                    id="Controls"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 128 128"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                  >
                    <g id="row1" transform="translate(32, 0)">
                      <path id="_x31_" fill="#000000" d="M0 127V1l128 63z" />
                    </g>
                  </svg>
                </div>
              </div>
              <img
                src="/songs/${folder}/cover.jpeg"
                alt=""
              />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`;
      }
      
    }
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
      e.addEventListener("click", async (item) => {
        songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        playMusic(songs[0])
      });
    });
  }
}

async function main() {
  await getSongs(`songs/b`);
  playMusic(songs[0], true);

  //Display all the albums on the page

  displayAlbums();
  // Attach event listner to play, next and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  // Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatSeconds(
      currentSong.currentTime
    )}/${formatSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add an event listner for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  //Add an event listner to previous
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });
  next.addEventListener("click", () => {
    currentSong.pause();
    console.log("next clicked");

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("Setting volume to", e.target.value, "/100");
      currentSong.volume = parseInt(e.target.value) / 100;
    });

  // add event listner to mute the track

  document.querySelector(".volume>img").addEventListener("click", (e) => {
    console.log(e.target);
    console.log("changing", e.target.src);
    if (e.target.src.includes("volume.svg")) {
      e.target.src=  e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document
    .querySelector(".range")
    .getElementsByTagName("input")[0].value=0
    } else {
      e.target.src=  e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document
    .querySelector(".range")
    .getElementsByTagName("input")[0].value=10
    }
  });
 

}

main();

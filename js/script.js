let songs;
let currFolder;

let currentSong = new Audio();

function SecondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    try {
        let a = await fetch(`/songs/${folder}/`);
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        let as = div.getElementsByTagName("a");
        songs = [];
        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                songs.push(decodeURIComponent(element.href.split(`/${folder}/`)[1]));
            }
        }
        updateSongList(songs);
    } catch (error) {
        console.error("Error fetching songs:", error);
    }
}

function updateSongList(songs) {
    let songUL = document.querySelector(".song-list").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li><img class="invert" src="images/music.svg" alt="music logo">
        <div class="info">
            <div>${song}</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <img class="invert play" src="images/play.svg" alt="">
        </div></li>`;
    }

    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(songListItem => {
        songListItem.addEventListener('click', () => {
            const songTitle = songListItem.querySelector(".info").firstElementChild.innerHTML.trim();
            playMusic(songTitle);
        });
    });

    return songs
}


const playMusic = (track, pause = false) => {
    currentSong.src = `songs/${currFolder}/${track}`;
    if (!pause) {
        currentSong.play();
        play.src = "images/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card ">
            <div class="play-card">
            <svg width="25" height="25" viewBox="0 0 24 24" fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="#1fdf64" />
            <path d="M6 19L21 12L6 5V19Z" fill="black" />
            </svg>
            </div>
            <img src="songs/${folder}/cover.jpg" alt="playlist image">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
            </div> `
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            await getSongs(item.currentTarget.dataset.folder);
            playMusic(songs[0])
        });
    });
}

async function main() {
    await getSongs("Hindi");
    playMusic(songs[0], true);

    displayAlbums()

    play.addEventListener('click', () => {
        const isPaused = currentSong.paused;
        if (isPaused) {
            currentSong.play();
            play.src = "images/pause.svg";
        } else {
            currentSong.pause();
            play.src = "images/play.svg";
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.code === "Space") {
            event.preventDefault();
            const isPaused = currentSong.paused;
            if (isPaused) {
                currentSong.play();
                play.src = "images/pause.svg";
            } else {
                currentSong.pause();
                play.src = "images/play.svg";
            }
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.code === "ArrowRight") {
            event.preventDefault();
            currentSong.currentTime += 5;
        }
    });
    document.addEventListener("keydown", (event) => {
        if (event.code === "ArrowLeft") {
            event.preventDefault();
            currentSong.currentTime -= 5;
        }
    });

    currentSong.addEventListener("ended", () => {
        play.src = "images/play.svg";
    });

    currentSong.addEventListener("timeupdate", () => {
        let currentTime = currentSong.currentTime;
        let duration = currentSong.duration;
        let percentage = (currentTime / duration) * 100;
        
        document.querySelector(".songtime").innerHTML = `${SecondsToMinutes(currentTime)}/${SecondsToMinutes(duration)}`;
        const seekbar = document.querySelector(".seekbar");
        
        // Update the circle position
        document.querySelector(".circle").style.left = percentage + "%";
    
        // Update the seekbar color
        seekbar.style.background = `linear-gradient(to right, white ${percentage}%, rgb(107, 107, 107) ${percentage}%)`;
    });
    
    document.querySelector(".seekbar").addEventListener("click", e => {
        const seekbar = e.target;
        const offsetX = e.offsetX;
        const width = seekbar.clientWidth;
        const percent = (offsetX / width) * 100;
        const newTime = (currentSong.duration) * percent / 100;
        
        currentSong.currentTime = newTime;
        document.querySelector(".circle").style.left = percent + "%";
        seekbar.style.background = `linear-gradient(to right, white ${percent}%, rgb(107, 107, 107) ${percent}%)`;
    });
    

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        let currentTrack = decodeURIComponent(currentSong.src.split('/').pop());
        let index = songs.indexOf(currentTrack);
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        let currentTrack = decodeURIComponent(currentSong.src.split('/').pop());
        let index = songs.indexOf(currentTrack);
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log('Setting volume to ', e.target.value, "/100");
        currentSong.volume = parseInt(e.target.value) / 100;
        if(currentSong.volume>0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("images/mute.svg", "images/volume.svg")
        }
    });

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("images/volume.svg")) {
            e.target.src = e.target.src.replace("images/volume.svg", "images/mute.svg")
            currentSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else {
            e.target.src = e.target.src.replace("images/mute.svg", "images/volume.svg")
            currentSong.volume = 0.1
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })
    
    currentSong.addEventListener("ended", () => {
        play.src = "images/play.svg";
        
        const currentIndex = songs.findIndex(song => decodeURIComponent(currentSong.src.split('/').pop()) === song);
        if (currentIndex < songs.length - 1) {
            playMusic(songs[currentIndex + 1]);
        } else {
            currentSong.pause();
        }
    });
    

}

main();

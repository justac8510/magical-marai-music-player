import { Player, Ease } from "textalive-app-api";
import * as THREE from "three";

const player = new Player({
    app: {
        token: "taF3S0hSDOG6ov9O",
    }, 
    mediaElement: document.querySelector("#media"),
    mediaBannerPosition: "bottom right"
});

// Song queue management
let songs = [
    {
        url: "https://piapro.jp/t/ULcJ/20250205120202",
        video: {
            beatId: 4694275,
            chordId: 2830730,
            repetitiveSegmentId: 2946478,
            lyricId: 67810,
            lyricDiffId: 20654
        }
    }, 
    {
        url: "https://piapro.jp/t/CyPO/20250128183915", 
        video: {
            beatId: 4694280,
            chordId: 2830735,
            repetitiveSegmentId: 2946483,
            lyricId: 67815,
            lyricDiffId: 20659
        },
    }
];


player.addListener({
    onAppReady, 
    onVideoReady, 
    onPause, 
    onPlay,
    onTimeUpdate,
    onAppMediaChange
});

// DOM elements
let playBtn = document.querySelector("#play-btn");
let stopBtn = document.querySelector("#stop-btn");
let prevBtn = document.querySelector("#prev-btn");
let nextBtn = document.querySelector("#next-btn");
let rewindBtn = document.querySelector("#rewind-btn");
let mainScreen = document.querySelector("#main");

let index = 0;
const timelineContainer = document.querySelector('.timeline-container');
const timelineProgress = timelineContainer.querySelector('.timeline-progress');
let timelineWidth;
let b;
let mx, my;
let playerProgress = {
    isPlaying: false,
    phrase: null, 
    word: null, 
    char: null,
}
let prevWord, prevChar;
let lyrics = []

updateTimeline(0);

// Update timeline position based on current time
function updateTimeline(position, duration) {
    const progress = parseInt((position * 1000) / duration) / 10;
    timelineProgress.style.width = `${progress}%`;
}

// Add click handler to seek
timelineContainer.addEventListener('click', (e) => {
    e.preventDefault();

    if (player) {
        player.requestMediaSeek(
            (player.video.duration * e.offsetX) /
            timelineContainer.clientWidth
        );
    }
});

// Function to load a song
function loadSong(i) {
    if (i >= 0 && i < songs.length) {
        index = i;
        player.createFromSongUrl(songs[i].url, { video: songs[i].video });
    }
}

// Add event listeners for buttons
function setupButtonListeners() {
    playBtn.addEventListener('click', () => {
        if (player.video){
            player.requestPlay();
        }
        playBtn.disabled = true;
        stopBtn.disabled = false;
        rewindBtn.disabled = false;
        index == songs.length - 1 ? nextBtn.disabled = true : nextBtn.disabled = false;
        index == 0 ? prevBtn.disabled = true : prevBtn.disabled = false;
    });

    stopBtn.addEventListener('click', () => {
        if (player.video){
            player.requestPause();
        }
        stopBtn.disabled = true;
        playBtn.disabled = false;
        rewindBtn.disabled = false;
    });

    rewindBtn.addEventListener('click', () => {
        return player.video && player.requestMediaSeek(0);
    });

    nextBtn.addEventListener('click', () => {
        if (player.video) {
            player.requestPause();
            loadSong(index + 1);
        }
        stopBtn.disabled = true;
        playBtn.disabled = false;
        rewindBtn.disabled = false;
        playerProgress.isPlaying = false;

        index == songs.length - 1 ? nextBtn.disabled = true : nextBtn.disabled = false;
        index == 0 ? prevBtn.disabled = true : prevBtn.disabled = false;
    });

    prevBtn.addEventListener('click', () => {
        if (player.video) {
            player.requestPause();
            loadSong(index - 1);
        }

        stopBtn.disabled = true;
        playBtn.disabled = false;
        rewindBtn.disabled = false;
        playerProgress.isPlaying = false;

        index == songs.length - 1 ? nextBtn.disabled = true : nextBtn.disabled = false;
        index == 0 ? prevBtn.disabled = true : prevBtn.disabled = false;
    });
}

onmousemove = (e) => {
    mx = e.clientX;
    my = e.clientY;
    
    // Convert mouse position to normalized device coordinates
    const x = (mx / window.innerWidth) * 2 - 1;
    const y = -(my / window.innerHeight) * 2 + 1;
    
    // Create floating character if we have a current character
    if (playerProgress.char) {
        createFloatingChar(playerProgress.char.text, x, y);
    }
}


//main listener: onAppReady, onVideoReady, onTimeUpdate, onPlay, onPause, onStop, requestAnimation
function onAppReady(app) {
    if (!app.managed) {
        setupButtonListeners();
    }

    if (!app.songUrl) {
        // Load the first song from queue
        loadSong(0);
    }
}

function onVideoReady(video){
    document.querySelector("#songTitle span").textContent = player.data.song.artist.name;
    document.querySelector("#artist span").textContent = player.data.song.name;

    timelineWidth = timelineContainer.offsetWidth;
    timelineProgress.style.width = '0%';
}

function onPlay(){
    playerProgress.isPlaying = true;
    return
}

function onPause(){
    playerProgress.isPlaying = false;
    return
}

function onAppMediaChange() {
    document.querySelector("#songTitle span").textContent = "";
    document.querySelector("#artist span").textContent = "";
}

function onTimeUpdate(position) {
    updateTimeline(position, player.video.duration);

    //check the phrase, word, and char
    const currentWord = player.video.findWord(position);
    const currentChar = player.video.findChar(position)
    
    //update c
    if (player.video){
        if (currentWord && currentWord.startTime < position + 500){
            if (prevWord !== currentWord){
                prevWord = currentWord;
            }
        }
        if (currentChar && currentChar.startTime < position + 1000){
            if (prevChar !== currentChar){
                prevChar = currentChar;
            }
        }
    }

    //create beat
    let beat = player.findBeat(position);
    let chord = player.findChord(position); //音階
    let chorus = player.findChorus(position); //副歌

    if (beat){
        if (b !== beat){
            requestAnimationFrame(() => {document.querySelector("#beat").style.display = "block";})
        }
        else{
            requestAnimationFrame(() => {document.querySelector("#beat").style.display = "none";})
        }
        b = beat;
    }
}
import { useEffect, useState } from "react";
import player from "../player";
const useAsyncState = (options = { wait: 0 }, ...urls) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchDataPromises = urls.map((url) =>
          fetch(url).then((res) => res.json())
        );
        const fetchedData = await Promise.all(fetchDataPromises);

        fetchedData.forEach((response, index) => {
          const url = urls[index];
          cache[url] = { data: response, timestamp: Date.now() };
        });

        if (options.wait) {
          await new Promise((resolve) => setTimeout(resolve, options.wait));
        }
        setData(fetchedData);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    // Check if any of the URLs exist in the cache and are still valid
    const cachedData = urls.filter(
      (url) => cache[url] && cache[url].timestamp + 300000 > Date.now()
    );
    if (cachedData.length === urls.length) {
      // If all URLs are cached, set data from cache and return
      setData(cachedData.map((url) => cache[url].data));
      setLoading(false);
    } else {
      // Fetch data for uncached URLs
      fetchData();
    }
  }, []);

  return { data, loading, error };
};
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
};
function calculateViews(views ) {
  if (views < 1000) {
    return views;
  } else if (views < 1000000) {
    return `${(views / 1000).toFixed(1)}K`;
  } else {
    return `${(views / 1000000).toFixed(1)}M`;
  }
}
export function SearchModal() {
  let [searchQ, setSearchQ] = useState("");
  let [keyIsPressed, setKeyIsPressed] = useState(false);
  let [searchResults, setSearchResults] = useState([]);
  let [searchActive, setSearchActive] = useState(false);
  const [typingTimer, setTypingTimer] = useState(null);

  useEffect(() => {
    // Function to fetch search results
    const fetchData = async () => {
      if (searchQ === "") return setSearchResults([]);
      try {
        const response = await fetch(
          `https://musiclyapp.vercel.app/search?query=${searchQ}`
        );
        const data = await response.json();
        setSearchResults(data);
        setSearchActive(false);
      } catch (error) {
        console.error("Error fetching search results:", error);
        setSearchResults([]);
      }
    };

    // Clear typing timer and initiate new timer
    const handleInputChange = () => {
      clearTimeout(typingTimer);
      setTypingTimer(
        setTimeout(() => {
          fetchData();
        }, 1000)
      ); // Adjust the delay time as needed
    };

    // Handle input change
    const handleInput = (event) => {
      setSearchQ(event.target.value);
    };

    // Event listeners for input change
    document.addEventListener("input", handleInput);
    document.addEventListener("input", handleInputChange);

    // Cleanup
    return () => {
      clearTimeout(typingTimer);
      document.removeEventListener("input", handleInput);
      document.removeEventListener("input", handleInputChange);
    };
  }, [searchQ, typingTimer]);

  var shouldusePlaceholder;
  return (
    <div
      id="search"
      className="modal"
      style={{
        zIndex: "0 !important",
      }}
    >
      <div
        className="flex"
        style={{
          alignItems: "center",
          gap: "2rem",
          lineHeight: 0,
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 1 + "!important",
          right: 0,
          padding: "20px",
          height: "100px",
          backdropFilter: "blur(10px)",
          backgroundColor: " rgba(0, 0, 0, 0)",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          width="24"
          height="24"
          onClick={() => {
            search?.classList.toggle("active");
          }}
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
          />
        </svg>

        <input
          type="text"
          id="search-input"
          className="input"
          placeholder="Search songs, artists, albums"
          onChange={(e) => {
            setSearchActive(true);
            setSearchQ(e.target.value);
          }}
        />
      </div>
      <div
        style={{
          marginTop: "1rem",
          marginBottom: "10rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          overflowY: "scroll",
        }}
      >
        {!searchActive &&
          searchResults.map((result, index) => {
            document.createElement("img").src = result.thumbnail;
            let shouldusePlaceholder = false;
            let img = new Image();
            img.src = result.thumbnail;
            img.onerror = () => {
              shouldusePlaceholder = true;
            };
            result.title = result.title.slice(0, 30);
            return (
              <div
                key={result.id}
                className="card-search"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("toggleSongModal", {
                      detail: {
                        ...result,
                        minimized: true,
                      },
                    })
                  );
                  player.setPlaylist(searchResults);
                  player.states.currentPlaylistIndex =
                    player.states.currentPlaylist.findIndex(
                      (song) => song.id === result.id
                    );
                  player.play();
                }}
                {...(index === 0 ? { style: { marginTop: "4rem" } } : {})}
              >
                <img
                  src={
                    shouldusePlaceholder ? "placeholder.png" : result.thumbnail
                  }
                  alt={result.title}
                />
                <div>
                  <h4>{result.title}</h4>
                  <p>
                    {result.artist} - {calculateViews(result.views)} views
                  </p>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

function toRGBImage(img) {
  var r = 0,
    g = 0,
    b = 0;
  var count = 0;
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
  var data = ctx.getImageData(0, 0, img.width, img.height).data;
  for (var i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count++;
  }
  r = Math.floor(r / count);
  g = Math.floor(g / count);
  b = Math.floor(b / count);
  return { r, g, b };
}

export function SongModal() {
  let [song, setSong] = useState(
    window.song || {
      title: "",
      artist: "",
      thumbnail: "",
      views: 0,
      id: "",
    }
  );
  let [minimized, setMinimized] = useState(window.minimized || false);
  let [showModal, setShowModal] = useState(window.showModal || false);
  let [rgb, setRGB] = useState({ r: 0, g: 0, b: 0 });
  useEffect(() => {
    window.addEventListener("toggleSongModal", (event) => {
      event.detail.title = event.detail.title.replace(
        "(Official Music Video)",
        ""
      );
      event.detail.title = event.detail.title.replace("[", "").replace("(", "");
      event.detail.title = event.detail.title.substring(0, 30);
      setSong(event.detail);
      if (!event.detail.playlist) {
        player.setPlaylist([event.detail]);
      }
      if (event.detail.playlist) {
        player.setPlaylist(event.detail.playlist);
        player.setId(event.detail.playlistID);
      }
      player.states.currentPlaylistIndex = event.detail.index || 0;
      window.song = event.detail;
      window.minimized = event.detail.minimized;
      setMinimized(event.detail.minimized);
      setShowModal(true);
      window.showModal = true;
      player.play();
    });
  }, []);

  if (!song) return null;
  let img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = song.thumbnail;
  img.onload = () => {
    let { r, g, b } = toRGBImage(img);
    setRGB({ r, g, b });
  };

  let [playing, setPlaying] = useState(window.isPlaying || false);

  let [time, setTime] = useState(0);
  let [formattedTime, setFormattedTime] = useState("0:00");
  useEffect(() => {
    player.on("play", (data) => {
      setPlaying(true);
      window.isPlaying = true;
    });
    player.on("pause", (data) => {
      setPlaying(false);
      window.isPlaying = false;
    });
    player.on("timeupdate", (data) => {
      setTime(player.audio.currentTime);
      setFormattedTime(player.formatTime(player.audio.currentTime));
      if (document.querySelector(".slider-range")) {
        document.querySelector(".slider-range").value =
          (player.audio.currentTime / player.audio.duration) * 180;
      }
    });
    player.on("next", (data) => {
      console.log("next");
      setSong(player.states.currentSong);
      window.song = player.states.currentSong;
    });
    player.on("previous", () => {
      setSong(player.states.currentSong);
      window.song = player.states.currentSong;
    });
  }, []);
  const minimizedContent = (
    <>
      <div
        style={{
          display: "flex",
          padding: "7px",
        }}
      >
        <img
          src={song.thumbnail}
          alt={song.title}
          style={{
            width: "50px",
            height: "50px",
            objectFit: "cover",
            marginRight: "10px",
          }}
          onClick={() => {
            setMinimized(!minimized);
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <p
            style={{
              width: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {song.title}
          </p>
          <p
            className="op-5"
            style={{
              fontSize: "12px",
            }}
          >
            {song.artist}
          </p>
        </div>

        {playing ? (
          <svg
            onClick={() => {
              player.pause();
            }}
            style={{ marginLeft: "auto", marginRight: "10px" }}
            width="36"
            height="36"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 5.25v13.5m-7.5-13.5v13.5"
            />
          </svg>
        ) : (
          <svg
            onClick={() => {
              player.audio.play();
            }}
            style={{ marginLeft: "auto", marginRight: "10px" }}
            xmlns="http://www.w3.org/2000/svg"
            height="36"
            viewBox="0 0 24 24"
            width="36"
            fill="#FFFFFF"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </div>
      <div className="progress" style={{ marginLeft: "7px" }}>
        <div
          className="progress-bar"
          style={{
            width:
              (player.audio.currentTime / player.audio.duration) * 100 + "%",
          }}
        ></div>
      </div>
    </>
  );
  const expandedContent = (
    <>
      <div id="songModal" style={{ padding: "5px" }}>
        <div
          className="hero"
          style={{
            display: "flex",
            padding: "15px",
            justifyContent: "space-between",
          }}
        >
          <svg
            width="24"
            height="24"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            onClick={() => {
              setMinimized(!minimized);
            }}
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
          <p>{song.title}</p>
          <p>
            <svg
              width="24"
              height="24"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
              />
            </svg>
          </p>
        </div>

        <div style={{ marginTop: "3rem", padding: 0 }}>
          <img
            src={song.thumbnail}
            alt={song.title}
            style={{
              width: "370px",
              padding: "15px",
              height: "240px",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
              margin: "auto",
            }}
          />
        </div>
        <div style={{ padding: "15px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h3>{song.title}</h3>
              <p className="op-5">{song.artist}</p>
            </div>
            <div
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("savetoPlayListModal", { detail: song })
                );
              }}
              style={{
                display: "flex",
                fontSize: "12px",
                alignItems: "center",
                gap: "5px",
                background: "rgba(0,0,0,0.5)",
                padding: "5px 5px",
                borderRadius: "9999px",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                viewBox="0 -960 960 960"
                width="24"
              >
                <path d="M120-320v-80h280v80H120Zm0-160v-80h440v80H120Zm0-160v-80h440v80H120Zm520 480v-160H480v-80h160v-160h80v160h160v80H720v160h-80Z" />
              </svg>

              <strong>Save</strong>
            </div>
          </div>

          <div style={{ lineHeight: 0, marginTop: "1rem" }}>
            <input
              type="range"
              className="slider-range"
              max={180}
              onInput={(e) => {
                player.audio.currentTime = e.target.value;
              }}
            />
            <div></div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "1rem",
              }}
            >
              <p>{formattedTime}</p>
              <p>{player.formatTime(player.audio.duration || 0)}</p>
            </div>
          </div>
          <div
            style={{
              padding: "15px",
              display: "flex",
              marginTop: "3rem",
              justifyContent: "space-between",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="36"
              viewBox="0 -960 960 960"
              width="36"
              onClick={() => {
                player.previous();
              }}
            >
              <path d="M220-240v-480h80v480h-80Zm520 0L380-480l360-240v480Zm-80-240Zm0 90v-180l-136 90 136 90Z" />
            </svg>
            {playing ? (
              <svg
                onClick={() => {
                  player.pause();
                }}
                width="45"
                height="45"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 5.25v13.5m-7.5-13.5v13.5"
                />
              </svg>
            ) : (
              <svg
                onClick={() => {
                  player.audio.play();
                }}
                xmlns="http://www.w3.org/2000/svg"
                height="45"
                viewBox="0 0 24 24"
                width="45"
                fill="#FFFFFF"
              >
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M8 5v14l11-7z" />
              </svg>
            )}

            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="36"
              viewBox="0 -960 960 960"
              width="36"
              onClick={() => {
                player.next();
              }}
            >
              <path d="M660-240v-480h80v480h-80Zm-440 0v-480l360 240-360 240Zm80-240Zm0 90 136-90-136-90v180Z" />
            </svg>
          </div>
          <svg
            width="30"
            height="30"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 -960 960 960"
          >
            <path d="M680-80H280q-33 0-56.5-23.5T200-160v-640q0-33 23.5-56.5T280-880h400q33 0 56.5 23.5T760-800v640q0 33-23.5 56.5T680-80Zm0-80v-640H280v640h400ZM480-600q33 0 56.5-23.5T560-680q0-33-23.5-56.5T480-760q-33 0-56.5 23.5T400-680q0 33 23.5 56.5T480-600Zm0 400q66 0 113-47t47-113q0-66-47-113t-113-47q-66 0-113 47t-47 113q0 66 47 113t113 47Zm0-80q-33 0-56.5-23.5T400-360q0-33 23.5-56.5T480-440q33 0 56.5 23.5T560-360q0 33-23.5 56.5T480-280ZM280-800v640-640Z" />
          </svg>
        </div>
      </div>

      <SaveToPlayListModal song={song} />
    </>
  );
  return (
    <div
      style={{
        height: minimized ? "60px" : "100vh",
        transition: "all 0.5s",
        position: "fixed",
        top: minimized ? "calc(100vh - 137px)" : 0,
        width: minimized ? "100%" : "100vw",

        //frosty glass effect with rgb values
        background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
        backdropFilter: "blur(10px)",
        zIndex: 1000,
        color: "white",
        display: showModal ? "block" : "none",
        alignItems: "center",
      }}
    >
      {minimized ? minimizedContent : expandedContent}
    </div>
  );
}

window.toggles = [
  "toggleSongModal",
  "togglePlayListModal",
  "toggleSearchModal",
  "toggleSaveToPlayListModal",
];

export function PlayListModal() {
  let [show, setShow] = useState(false);
  let [data, setData] = useState(null);
  console.log(data);
  let [playList, setPlayList] = useState(
    JSON.parse(localStorage.getItem("library"))
  );
  let [playing, setPlaying] = useState(
    playList
      .find((playlist) => playlist.type === data?.type)
      ?.songs.find((song) => song.id === player.states.currentSong.id)
  );
  let [loop, setLoop] = useState(player.states.loop);
  useEffect(() => {
    window.addEventListener("togglePlayListModal", (e) => {
      window.activeModal = "playlist";
      setData(e.detail); 
      let songs = playList.find(
        (playlist) => playlist.id === e.detail.id
      )?.songs;
      player.states.currentPlaylist = songs;
      console.log(player.states.currentPlaylist);
      player.setPlaylist(songs); 
      player.states.autplaynext = false;
      setShow(true);
    });  
  }, []);
  return (
    <>
      <div
        style={{
          display: show ? "block" : "none",
          width: "100%",
          marginBottom: "200px",
          position: "fixed",
          overflowY: "scroll",
          top: 0,
          left: 0,
          bottom: 0,
          backgroundColor: ` rgba(0, 0, 0, 1)`,
          padding: "15px",
          height: "100%",
        }}
      >
        <div
          style={{
            padding: "2px",
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            width="26"
            height="26"
            stroke="white"
            onClick={() => {
              setShow(false);
            }}
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
          <p>{(data && data.name) || ""}</p>
          <svg
            width="25"
            height="25"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="w-6 h-6"
            onClick={() => { 
              window.dispatchEvent(
                new CustomEvent("toggleEditPlayListPanel", {
                  detail: data,
                })
              );
            }}
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
            />
          </svg>
        </div>
        <div
          style={{
            marginTop: "4rem",
            display: "flex",
            margin: "auto",
            justifyContent: "center",
          }}
        >
          {data && data.type === "liked" ? (
            <div style={{}}>
              <div
                style={{
                  background:
                    " linear-gradient(45deg, hsla(320, 78%, 79%, 1) 0%, hsla(313, 39%, 93%, 1) 30%, hsla(193, 81%, 84%, 1) 100%)",
                  width: "220px",
                  height: "189px",
                  display: "flex",
                  alignContent: "center",
                  marginTop: "15px",
                  alignItems: "center",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1);",
                  justifyContent: "center",
                  backdropFilter: "blur(100%)",
                  borderRadius: "5px",
                }}
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("togglePlayListModal", {
                      detail: {
                        name: "Liked Music",
                        type: "liked",
                        id: "liked",
                        description: "Songs you liked",
                      },
                    })
                  );
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="44"
                  viewBox="0 -960 960 960"
                  width="44"
                  fill="black"
                >
                  <path d="M720-120H320v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h218q32 0 56 24t24 56v80q0 7-1.5 15t-4.5 15L794-168q-9 20-30 34t-44 14ZM240-640v520H80v-520h160Z" />
                </svg>
              </div>
            </div>
          ) : (
            // use song images
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "2px",
                padding: "9px",
                width: "280px",
                margin: "0 auto",
                justifyContent: "center",
              }}
            >
              {data?.songs && data?.songs.map((song, index) => {
                  if (index >= 4) return;
                  return (
                    <img
                      src={song.thumbnail}
                      alt={song.title}
                      height="130px"
                      style={{
                        objectFit: "cover",
                        width:
                          index ===
                            playList.find(
                              (playlist) => playlist.id === data?.id
                            )?.songs.length -
                              1 &&
                          playList.find((playlist) => playlist.id === data?.id)
                            ?.songs.length < 4
                            ? "100%"
                            : "130px",
                      }}
                    />
                  );
                })}
            </div>
          )}
        </div>
        <div
          style={{
            lineHeight: "20px",
            padding: "15px",
            textAlign: "center",
            display: "flex",
            gap: "5px",
            flexDirection: "column",
          }}
        >
          <h2>{data && data.name}</h2>
          <p>{(data && data.description) || ""}</p>
          <p>
            {data &&
               data?.songs
                .length}{" "}
            songs
          </p>
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              padding: "10px",
              justifyContent: "center",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {loop ? (
              <svg
                onClick={() => {
                  player.states.loop = true;
                  player.states.autplaynext = true;
                  setLoop(false);
                }}
                style={{ fill: "red" }}
                xmlns="http://www.w3.org/2000/svg"
                height="33"
                viewBox="0 -960 960 960"
                width="33"
              >
                <path d="M280-80 120-240l160-160 56 58-62 62h406v-160h80v240H274l62 62-56 58Zm-80-440v-240h486l-62-62 56-58 160 160-160 160-56-58 62-62H280v160h-80Z" />
              </svg>
            ) : (
              <svg
                onClick={() => {
                  player.states.loop = true;
                  setLoop(true);
                }}
                xmlns="http://www.w3.org/2000/svg"
                height="33"
                viewBox="0 -960 960 960"
                width="33"
              >
                <path d="M280-80 120-240l160-160 56 58-62 62h406v-160h80v240H274l62 62-56 58Zm-80-440v-240h486l-62-62 56-58 160 160-160 160-56-58 62-62H280v160h-80Z" />
              </svg>
            )}
            <svg
              style={{
                backgroundColor: "white",
                fill: "black",
                padding: "5px",
                borderRadius: "9999px",
              }}
              onClick={() => {
                console.log("not playing");
                player.audio.pause();
                player.audio.currentTime = 0;
                player.states.currentPlaylistIndex = 0;
                player.setId(data?.id);
                player.setPlaylist(data?.songs);
                player.play();
                setPlaying(true);
                player.setPlaylist(
                  playList.find((playlist) => playlist.type === data?.type)
                    ?.songs
                );
                window.dispatchEvent(
                  new CustomEvent("toggleSongModal", {
                    detail: {
                      ...player.states.currentSong,
                      minimized: true,
                      auto: true,
                      playlist: playList.find(
                        (playlist) => playlist.type === data?.type
                      )?.songs,
                    },
                  })
                );
                player.setMediaData(player.states.currentSong);
              }}
              fill="black"
              xmlns="http://www.w3.org/2000/svg"
              height="44"
              viewBox="0 -960 960 960"
              width="44"
            >
              <path d="M320-200v-560l440 280-440 280Z" />
            </svg>
          </div>
          <br></br>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            marginBottom: "200px",
            overflowY: "scroll",
          }}
        >
          {data?.songs ?  data?.songs.map((song) => {
              return (
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={song.thumbnail}
                    alt={song.title}
                    width="50px"
                    height={50}
                    style={{ objectFit: "cover" }}
                    onClick={() => {
                      window.dispatchEvent(
                        new CustomEvent("toggleSongModal", {
                          detail: {
                            ...song,
                            minimized: true,
                            auto: true,
                            playlistID: data?.id,
                            playlist: playList.find(
                              (playlist) => playlist.type === data?.type
                            )?.songs,
                            index: playList
                              .find((playlist) => playlist.type === data?.type)
                              ?.songs.findIndex((s) => s.id === song.id),
                          },
                        })
                      );
                    }}
                  />
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <h4>{song.title}</h4>
                      <svg
                        width="24"
                        height="24"
                        style={{ position: "absolute", right: "5px" }}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-6 h-6"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                        />
                      </svg>
                    </div>
                    <p>
                      {song.artist}  
                    </p>
                  </div>
                </div>
              );
            }) : null}
        </div>
      </div>
      <EditPlayListPanel data={data} />
    </>
  );
}

export function SaveToPlayListModal({ song }) {
  let [show, setShow] = useState(false);
  let [data, setData] = useState(null);
  useEffect(() => {
    window.addEventListener("savetoPlayListModal", (e) => {
      window.activeModal = "savetoPlayList";
      setData(e.detail);
      setShow(true);
    });
  }, []);
  useEffect(() => {
    if (show) {
      view.style.opacity = "30%";
      document.getElementById("songModal")
        ? (document.getElementById("songModal").style.opacity = "30%")
        : null;
    } else {
      view.style.opacity = "100%";
      document.getElementById("songModal").style.opacity = "100%";
    }
  }, [show]);
  return (
    <>
      <div
        style={{
          display: show ? "block" : "none",
          width: "100%",
          height: "200px",
          position: "fixed",
          overflowY: "scroll",
          transition: "all 5s ease-in-out",
          left: 0,
          bottom: 0,
          backgroundColor: ` rgba(0, 0, 0, 1)`,
          padding: "15px",
        }}
      >
        <div
          style={{
            padding: "2px",
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <h3>Save Song To Playlist</h3>
          <svg
            width="20"
            height={24}
            onClick={() => {
              setShow(false);
            }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </div>
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            marginTop: "10px",
            overflowY: "scroll",
            height: "50px",
          }}
        >
          <div
            style={{
              background:
                " linear-gradient(45deg, hsla(320, 78%, 79%, 1) 0%, hsla(313, 39%, 93%, 1) 30%, hsla(193, 81%, 84%, 1) 100%)",
              width: "39px",
              height: "39px",
              display: "flex",
              alignContent: "center",
              alignItems: "center",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1);",
              justifyContent: "center",
              backdropFilter: "blur(100%)",
              borderRadius: "5px",
            }}
            onClick={() => {
              // toggle
              // save to library
              let playlists = JSON.parse(localStorage.getItem("library"));
              let playlist = playlists.find(
                (playlist) => playlist.type === "liked"
              );
              if (!playlist) {
                playlists.push({
                  type: "liked",
                  songs: [song],
                });
              } else if (!playlist.songs.find((s) => s.id === song.id)) {
                playlist.songs.push(song);
              }
              localStorage.setItem("library", JSON.stringify(playlists));
              setShow(false);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="20"
              viewBox="0 -960 960 960"
              width="20"
              fill="black"
            >
              <path d="M720-120H320v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h218q32 0 56 24t24 56v80q0 7-1.5 15t-4.5 15L794-168q-9 20-30 34t-44 14ZM240-640v520H80v-520h160Z" />
            </svg>
          </div>
          <div style={{ fontSize: "14px" }}>
            <p>Liked Music</p>
            <p>
              {
                JSON.parse(localStorage.getItem("library")).find(
                  (playlist) => playlist.type === "liked"
                ).songs.length
              }{" "}
              Songs
            </p>
          </div>
        </div>
        {JSON.parse(localStorage.getItem("library")).map((playlist) => {
          if (playlist.type === "liked") return null;
          return (
            <div>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  marginTop: "10px",
                }}
              >
                <div
                  style={{
                    background:
                      " linear-gradient(45deg, hsla(320, 78%, 79%, 1) 0%, hsla(313, 39%, 93%, 1) 30%, hsla(193, 81%, 84%, 1) 100%)",
                    width: "39px",
                    height: "39px",
                    display: "flex",
                    alignContent: "center",
                    alignItems: "center",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1);",
                    justifyContent: "center",
                    backdropFilter: "blur(100%)",
                    borderRadius: "5px",
                  }}
                  onClick={() => {
                    // toggle
                    // save to library
                    let playlists = JSON.parse(localStorage.getItem("library"));
                    let pt = playlists.find((p) => p.id === playlist.id);
                    if (!pt.songs.find((s) => s.id === song.id)) {
                      playlist.songs.push(song);
                    }
                    playlists = playlists.map((p) => {
                      if (p.id === playlist.id) {
                        return playlist;
                      }
                      return p;
                    });
                    localStorage.setItem("library", JSON.stringify(playlists));
                    setShow(false);
                  }}
                   
                > 
                <img src={playlist?.songs[0]?.thumbnail} alt={playlist?.songs[0]?.title} width="39px" height="39px" style={{objectFit: "cover"}}/>
                </div>
                <div style={{ fontSize: "14px" }}>
                  <p>{playlist.name}</p>
                  <p>{playlist.songs.length} Songs</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function CreatePlaylistModal() {
  let [show, setShow] = useState(false);
  let [library, setLibrary] = useState(
    JSON.parse(localStorage.getItem("library"))
  );
  let [data, setData] = useState({ name: "", description: "", id: "" });
  useEffect(() => {
    window.addEventListener("toggleCreatePlaylistModal", (e) => {
      setShow(true);
    });
  }, []);

  function createPlaylist() {
    let name = data.name;
    let description = data.description;
    let playlists = JSON.parse(localStorage.getItem("library"));
    if (!playlists) {
      playlists = [];
    }
    if (playlists.find((playlist) => playlist.name === name)) {
      return alert("Playlist already exists");
    }
    let id = name + Math.random();
    playlists.push({
      name,
      description,
      id,
      songs: [],
    });
    localStorage.setItem("library", JSON.stringify(playlists));
    setShow(false);
    window.dispatchEvent(
      new CustomEvent("togglePlayListModal", {
        detail: { name, type: name, id, description , songs: []},
      })
    );
  }

  return (
    <div
      style={{
        display: show ? "block" : "none",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: "calc(50% - 150px)",
          left: "calc(50% - 130px)",
          backgroundColor: "#121212",
          padding: "20px",
          borderRadius: "10px",
          height: "220px",
          width: "260px",
        }}
      >
        <h3>New Playlist</h3>
        <input
         onChange={(e) => {
           setData({ ...data, name: e.target.value });
         }}
          type="text"
          placeholder="Playlist Name"
          style={{
            padding: "10px",
            width: "100%",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            borderBottom: "1px solid white",
            backgroundColor: "transparent",
            color: "white",
          }}
        />
        <input
          type="text"
          onchange={(e) => {
            setData({ ...data, description: e.target.value });
          }}
          placeholder="Playlist Description"
          style={{
            padding: "10px",
            width: "100%",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            borderBottom: "1px solid white",
            backgroundColor: "transparent",
            color: "white",
            marginTop: "10px",
          }}
        />

        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: "20px",
            right: "20px",
            gap: "10px",
          }}
        >
          <button
            onClick={() => {
              setShow(false);
            }}
            style={{
              padding: "10px",
              background: "transparent",
              border: "1px solid white",
              borderRadius: "9999px",
              color: "white",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              createPlaylist();
            }}
            style={{
              padding: "10px",
              background: "transparent",
              border: "1px solid white",
              borderRadius: "9999px",
              color: "white",
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}


export function EditPlayListPanel(){
  let [show, setShow] = useState(false);
  let [lib, setLib] = useState({name: "", description: "", id: "", songs: []});
  useEffect(() => {
    window.addEventListener("toggleEditPlayListPanel", (e) => {
      console.log(e.detail);
      setShow(true);
      setLib(e.detail);
    });
  }, []);
  function editPlaylist(){
    let name = document.querySelector('input[placeholder="Playlist Name"]').value;
    let description = document.querySelector('input[placeholder="Playlist Description"]').value;
    let playlists = JSON.parse(localStorage.getItem("library"));
    let playlist = playlists.find((playlist) => playlist.id === lib.id);
    playlist.name = name.length > 0 ? name : playlist.name;
    playlist.description =  description.length > 0 ? description : playlist.description;
    localStorage.setItem("library", JSON.stringify(playlists));
    setShow(false);
    window.dispatchEvent(new CustomEvent("togglePlayListModal", {detail: playlist}));
  }
  function clear(){
    document.querySelector('input[placeholder="Playlist Name"]').value = "";
    document.querySelector('input[placeholder="Playlist Description"]').value = "";
    setShow(false); 
  }
  return (
    <div style={{display: show ? "block" : "none", position: "fixed", top: 0, left: 0, right: 0, height: "100vh", backgroundColor: "rgba(0, 0, 0, 0.5)"}}>
      <div style={{position: "fixed", top: "calc(50% - 150px)", left: "calc(50% - 130px)", backgroundColor: "#121212", padding: "20px", borderRadius: "10px", height: "220px", width: "260px"}}>
        <h3>Edit Playlist</h3>
        <input type="text" placeholder="Playlist Name" style={{padding: "10px", width: "100%", borderTop: "none", borderLeft: "none", borderRight: "none", borderBottom: "1px solid white", backgroundColor: "transparent", color: "white"}}/>
        <input type="text" placeholder="Playlist Description" style={{padding: "10px", width: "100%", borderTop: "none", borderLeft: "none", borderRight: "none", borderBottom: "1px solid white", backgroundColor: "transparent", color: "white", marginTop: "10px"}}/>
        <div style={{display: "flex", position: "absolute", bottom: "20px", right: "20px", gap: "10px"}}>
          <button onClick={() => {clear()}} style={{padding: "10px", background: "transparent", border: "1px solid white", borderRadius: "9999px", color: "white"}}>Cancel</button>
          <button onClick={() => {editPlaylist()}} style={{padding: "10px", background: "transparent", border: "1px solid white", borderRadius: "9999px", color: "white"}}>Edit</button>
        </div>
      </div> 
    </div>
  )
}
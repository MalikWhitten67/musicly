import { Navbar } from "../components/navbar";
import { BottomNav } from "../components/bottomnavbar";
import { PlayListModal, SearchModal, SongModal } from "../modals";
import { useEffect, useLayoutEffect, useState } from "react";
import player from "../player";
const cache  = {};
const useAsyncState = (options = { wait: 0 }, ...urls) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useLayoutEffect(()=>{
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

        if (options.wait ){
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
      setLoading(false)
    } else {
      // Fetch data for uncached URLs
      fetchData();
    }
  }, []); 
  return { data, loading, error }
};
window.isFirstLoad = true;
export default function Home({route, setRoute}) {
  const { data, loading } = useAsyncState(
    { wait: 1000 },
    "https://musiclyapp.vercel.app/playlist/1?page=1&filter=10",
    "https://musiclyapp.vercel.app/playlist/2",
    "https://musiclyapp.vercel.app/playlist/3", 
    "https://musiclyapp.vercel.app/playlist/4", 
    "https://musiclyapp.vercel.app/playlist/5",
  );
  let [isPlaying, setIsPlaying] = useState(player.states.currentSong);
  useEffect(() => {
    player.on("play", (data) => { 
        setIsPlaying(player.states.currentSong);
    });
    player.on("pause", (data) => { 
        setIsPlaying(player.states.currentSong);
    });
    window.isFirstLoad = false;
  }, [])
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        <img
          src="/images/logo_transparent.png"
          alt="logo"
          style={{ width: "100px" }}
        /> 
      </div>
    );
  }
  
  return (
    <>
      <div id="view">
        <div
          style={{
            overflow: "scroll",
            width: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
          className="topgradient-red"
        >
          <Navbar />
          <div
            className="  container"
            style={{ marginBottom: "200px", marginTop: "60px" }}
          >
            <div className=" flex between" style={{ padding: "5px" }}>
              <div>
                <p className="op-5">For You</p>
                <h2>Trending Songs</h2>
              </div>
            </div>

            {/**
             *  4 columns grid
             */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "5px",
                marginTop: "20px",
                overflowX: "scroll",
                overflowY: "hidden",
              }}
            >
              {data[0] && data[0].map(
                (item) => (
                  (item.title = item.title.replace("(Official Music Video)")),
                  (item.title = item.title.replace("[").replace("(")),
                  (item.title = item.title.substring(0, 27)),
                  (
                    <div key={item.id}
                    onClick={() => {
                        item.minimized = true;
                        player.setPlaylist(data[0]);
                        player.states.currentPlaylistIndex =
                          data[0].findIndex(
                            (song) => song.id === item.id
                          );
                        player.play();
                        window.dispatchEvent(
                          new CustomEvent("toggleSongModal", { detail: item })
                        );
                      }}
                    className="card">
                      <img
                         
                        src={item.thumbnail}
                        alt={item.title}
                      />
                      <div
                        style={{
                          fontSize: "15px",
                          padding: "15px;",
                          display: "flex",
                          justifyContent: "space-between",
                          lineHeight: "1.5",
                        }}
                      >
                        <div style={{ fontSize: "15px", padding: "15px;" }}>
                          <p
                            style={{
                              width: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "flex",
                              justifyContent: "space-between",
                              ...(isPlaying.id === item.id ? { color: "#62fc21" } : {}),
                            }}
                          >
                            {item.title}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              width="24"
                              height="24"
                              stroke="currentColor"
                              className="text-white"
                              style={{ marginLeft: "15px" }}
                              stroke-width="1.5" 
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                              />
                            </svg>
                          </p>
                          <p style={{ fontSize: "12px" }}>{item.artist}</p>
                           
                        </div>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
            <div className="flex between" style={{ padding: "5px" }}>
              <div>
                <p className="op-5">Listen endlessly with curated playlists</p>
                <h2>Curated Playlists</h2>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "15px",
                marginTop: "20px",
                overflowX: "scroll",
                overflowY: "hidden",
              }}
            >
              <div
                style={{
                  width: "150px",
                  height: "160px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <img
                  src="/images/mood.jpg"
                  alt="mood"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("togglePlayListModal", {
                      detail: {
                        name: "Mood",
                        type: "custom",
                        id: 3,
                        description: "Songs for every mood",
                        songs: data[3],
                      },
                    }));
                  }}
                />
              </div>
              <div
                style={{
                  width: "150px",
                  height: "160px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <img
                  src="/images/the_trenches.jpg"
                  alt="The Trenches"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("togglePlayListModal", {
                      detail: {
                        name: "The Trenches",
                        type: "custom",
                        id: 2,
                        description: "The Trenches",
                        songs: data[1],
                      },
                    }));
                  }}
                />
              </div>
              <div
                style={{
                  width: "150px",
                  height: "160px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <img
                  src="/images/timeless.jpg"
                  alt="mood"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("togglePlayListModal", {
                      detail: {
                        name:  "Timeless Classics",
                        type: "custom",
                        id: 4,
                        description:  "The latest timeless classics",
                        songs: data[2],
                      },
                    }));
                  }}
                />
              </div>
              <div
                style={{
                  width: "150px",
                  height: "160px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <img
                  src="/images/90_hits.jpg"
                  alt="mood"
                  style={{ objectFit: "cover", width: "100%" }}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("togglePlayListModal", {
                      detail: {
                        name: "90's Hits",
                        type: "custom",
                        id: 5,
                        description: "The best of the 90's",
                        songs: data[4],
                      },
                    }));
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "70px" }}>
        <SearchModal /> 
        <PlayListModal />
        <BottomNav  route={route} navigate={setRoute} />
      </div> 
      
      <SongModal />
    </>
  );
}

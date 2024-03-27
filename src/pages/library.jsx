import { useState } from "react";
import { BottomNav } from "../components/bottomnavbar";
import { Navbar } from "../components/navbar";
import {
  CreatePlaylistModal,
  PlayListModal,
  SearchModal,
  SongModal,
} from "../modals";
export default function Library({ route, setRoute }) {
  let [library, setLibrary] = useState(
    JSON.parse(localStorage.getItem("library")) || []
  );

  return (
    <>
      <div id="view">
        <Navbar page="library" />
        <div
          style={{
            marginTop: "5rem",
            marginBottom: "200px",
            padding: "15px",
            zIndex: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "15px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                background:
                  " linear-gradient(45deg, hsla(320, 78%, 79%, 1) 0%, hsla(313, 39%, 93%, 1) 30%, hsla(193, 81%, 84%, 1) 100%)",

                width: "50px",
                height: "50px",
                padding: "10px",
                backdropFilter: "blur(100%)",
              }}
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("togglePlayListModal", {
                    detail: {
                      name: "Liked Music", type: "liked", id: "liked",
                      description: "Songs you liked",
                    },
                  })
                );
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="27"
                viewBox="0 -960 960 960"
                width="27"
                fill="black"
              >
                <path d="M720-120H320v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h218q32 0 56 24t24 56v80q0 7-1.5 15t-4.5 15L794-168q-9 20-30 34t-44 14ZM240-640v520H80v-520h160Z" />
              </svg>
            </div>
            <div>
              <h4>Liked Music</h4>
              <p>Auto Playlist</p>
            </div>
          </div>
          <div style={{
            marginTop: '20px',
            display: "flex",
            flexDirection: "column",
            position: "relative",
            gap: "15px",
          }}>
            {library.map((item, index) => {
              console.log(item);
              if (item.type === "liked") return;
              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: "15px",
                  }}
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent("togglePlayListModal", {
                        detail: {
                          name: item.name,
                          type: 'custom',
                          id: item.id,
                          description: item.description,
                          songs: item.songs || [],
                        },
                      })
                    );
                  }}
                >
                  <div>
                    <div
                      style={{
                        /**like 4 images stacked */
                        display: "flex",
                        gap: "5px",
                        alignItems: "center",
                        justifyContent: "center",
                        flexWrap: "wrap",
                        width: "50px",
                      }}
                      onClick={() => {
                        window.dispatchEvent(
                          new CustomEvent("togglePlayListModal", {
                            detail: {
                              name: item.name,
                              type: 'custom',
                              id: item.id,
                              description: item.description,
                              songs: item.songs || [],
                            },
                          })
                        );
                      }}
                    >
                      {
                        item.songs.length > 0 ? item.songs.map((song, index) => {
                          if (index !== 0) return;
                          return (
                            <img
                              key={index}
                              src={song.thumbnail}
                              alt={song.name}
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                              }}
                            />
                          )
                        })
                          : <div style={{ fill: 'white' }}>

                            <svg xmlns="http://www.w3.org/2000/svg"
                              width={46} height={46}
                              viewBox="0 -960 960 960"  ><path d="M120-320v-80h320v80H120Zm0-160v-80h480v80H120Zm0-160v-80h480v80H120Zm520 520v-320l240 160-240 160Z" /></svg>
                          </div>
                      }
                    </div>

                    <div></div>
                  </div>
                  <div>
                    <p>{item.name}</p>
                    <p>{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            style={{
              padding: "14px 20px",
              backgroundColor: "white",
              border: "none",
              borderRadius: "99999px",
              color: "black",
              margin: "auto",
              width: "fit-content",
              position: "fixed",
              bottom: "10rem",
              left: "0",

              right: "1rem",
            }}
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent("toggleCreatePlaylistModal")
              );
            }}
          >
            Create PlayList
          </button>
        </div>
      </div>

      <SongModal />
      <PlayListModal />
      <CreatePlaylistModal />
      <SearchModal />
      <BottomNav route={route} navigate={setRoute} />

    </>
  );
}

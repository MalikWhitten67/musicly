import { useState } from "react";
export function BottomNav({route, navigate}) { 
  window.onpopstate = () => {
    setRoute(
      new URLSearchParams(window.location.search).get("route") || "home"
    );
  }; 
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        right: "0px",
        gap: "10px",
        left: "0px",
        zIndex: 1,
        fontSize:'12px',
        alignItems: "center",
        textAlign: "center",
        backgroundColor: "rgba(0,0,0,0.8)",
      }}
    >
      <div
        style={{
          margin: "15px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div
          onClick={() => {
            navigate("home");
          }}
        >
          {route === "home" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="25"
              viewBox="0 -960 960 960"
              width="25"
            >
              <path d="M160-120v-480l320-240 320 240v480H560v-250H400v250H160Z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="25"
              viewBox="0 -960 960 960"
              width="25"
            >
              <path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z" />
            </svg>
          )}

          <p>Home</p>
        </div>
        <div
          onClick={() => {
            navigate("library");
          }}
        >
          {route === "library" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="25"
              viewBox="0 -960 960 960"
              width="25"
            >
              <path d="M500-360q42 0 71-29t29-71v-220h120v-80H560v220q-13-10-28-15t-32-5q-42 0-71 29t-29 71q0 42 29 71t71 29ZM320-240q-25 0-56.5-23.5T240-320v-480q0-25 23.5-56.5T320-880h480q25 0 56.5 23.5T880-800v480q0 25-23.5 56.5T800-240H320ZM160-80q-25 0-56.5-23.5T80-160v-560h80v560h560v80H160Z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="25"
              viewBox="0 -960 960 960"
              width="25"
            >
              <path d="M500-360q42 0 71-29t29-71v-220h120v-80H560v220q-13-10-25-15t-32-5q-42 0-71 29t-29 71q0 42 29 71t71 29ZM320-240q-25 0-56.5-23.5T240-320v-480q0-25 23.5-56.5T320-880h480q25 0 56.5 23.5T880-800v480q0 25-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-25 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z" />
            </svg>
          )}

          <p>Library</p>
        </div>
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 -960 960 960"
            height="25"
            width="25"
          >
            <path d="m260-260 250-140 140-250-250 140-140 250Zm220-180q-17 0-25.5-11.5T440-480q0-17 11.5-25.5T480-520q17 0 25.5 11.5T520-480q0 17-11.5 25.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
          </svg>
          <p>Explore</p>
        </div>
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            height="25"
            width="25"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            />
          </svg>

          <p>More</p>
        </div>
      </div>
    </div>
  );
}

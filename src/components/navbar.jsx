import { useState } from "react";
export function Navbar({ page }) {
  return (
    <>
      <ul className="nav hero">
        {page !== "library" ? (
          <>
            <li>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                width="24"
                height="24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </li>
            <li
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Musicly
            </li>
          </>
        ) : (
          <li> 
            <p
            style={{fontSize:'20px'}}
            >Library</p>
          </li>
        )}
        <li
          onClick={() => {   
            const search = document.getElementById("search");
            console.log(search)
            search?.classList.toggle("active");  
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 -960 960 960"
            width="24"
            stroke="currentColor"
            className="text-white"
          >
            <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
          </svg>
        </li>
      </ul>
    </>
  );
}

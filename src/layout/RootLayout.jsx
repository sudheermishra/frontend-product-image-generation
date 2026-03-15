// import styles from "./RootLayout.module.css";

import { NavLink, Outlet } from "react-router-dom";
function RootLayout() {
  return (
    <>
      <header>

      </header>

      <main>
        <Outlet />
      </main>
    </>
  );
}

export default RootLayout;

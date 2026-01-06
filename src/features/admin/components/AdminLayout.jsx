import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import AdminTopNavbar from "./AdminTopNavbar";
import Navbar from "./NavBar";
import "@/assets/styles/Admin.css";
import "@/assets/styles/Admin.Main.css";

export default function AdminLayout() {
  return (
    <div className="wrapper">
      <Navbar />
      <AdminTopNavbar />
      <Suspense fallback={<div className="p-4 text-center text-muted">Loading…</div>}>
        <Outlet />
      </Suspense>
      <footer className="main-footer">
        <strong>
          &copy; 2021{" "}
          <a href="#" target="_blank" rel="noreferrer">
            Mosarrof Pvt Ltd.
          </a>
          .
        </strong>
        All rights reserved.
        <div className="float-right d-none d-sm-inline-block">
          <b>Version</b> 3.1.0
        </div>
      </footer>
      <div id="sidebar-overlay"></div>
    </div>
  );
}

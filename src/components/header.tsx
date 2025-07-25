"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";

import Image from "next/image";
import IconSvg from "@/app/icon.svg";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-900 border-b border-gray-700">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* <!-- Mobile menu button--> */}
            {/* aria-controls binds the button to the mobile menu */}
            <button
              type="button"
              className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset"
              aria-controls="mobile-menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {/* Creates invisible clickable area and expands the clickable area around button */}
              <span className="absolute -inset-0.5"></span>
              {/* Hides text visually, but readable by screen readers  */}
              <span className="sr-only">Open main menu</span>
              {/* <!--
                        3 lines icon when menu is closed.
                        Menu open: "hidden", Menu closed: "block"
                    --> */}
              {!menuOpen && <FontAwesomeIcon size="xl" icon={faBars} />}
              {/* <!--
                        X icon when menu is open.
                        Menu open: "block", Menu closed: "hidden"
                    --> */}
              {menuOpen && <FontAwesomeIcon size="xl" icon={faXmark} />}
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-6">
                {/* <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" --> */}
                <Link
                  href="/"
                  className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white flex items-center justify-center"
                  aria-current="page"
                >
                  <Image
                    src={IconSvg}
                    alt="Logo"
                    width={30}
                    height={30}
                    className="inline-block mr-2"
                  />
                </Link>
                <Link
                  href="/arrays"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white flex items-center justify-center"
                >
                  Arrays
                </Link>
                <Link
                  href="/graphs"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white flex items-center justify-center"
                >
                  Graphs
                </Link>
                <Link
                  href="/trees"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white flex items-center justify-center"
                >
                  Trees
                </Link>
                <Link
                  href="/linked-lists"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white flex items-center justify-center"
                >
                  Linked Lists
                </Link>
                <Link
                  href="/heaps"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white flex items-center justify-center"
                >
                  Heaps
                </Link>
                <Link
                  href="/dynamic-programming"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white flex items-center justify-center"
                >
                  Dynamic Programming
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <!-- Mobile menu, show/hide based on menu state. --> */}
      {menuOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="space-y-1 px-2 pt-2 pb-3">
            {/* <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" --> */}
            <Link
              href="/"
              className=" rounded-md bg-gray-900 px-3 py-2 text-base font-medium text-white hover:bg-gray-700 flex items-center justify-center"
              aria-current="page"
            >
              Home
            </Link>
            <Link
              href="/arrays"
              className="rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white flex items-center justify-center"
            >
              Arrays
            </Link>
            <Link
              href="/graphs"
              className="rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white flex items-center justify-center"
            >
              Graphs
            </Link>
            <Link
              href="/trees"
              className="rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white flex items-center justify-center"
            >
              Trees
            </Link>
            <Link
              href="/linked-lists"
              className="rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white flex items-center justify-center"
            >
              Linked Lists
            </Link>
            <Link
              href="/heaps"
              className="rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white flex items-center justify-center"
            >
              Heaps
            </Link>
            <Link
              href="/dynamic-programming"
              className="rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white flex items-center justify-center"
            >
              Dynamic Programming
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;

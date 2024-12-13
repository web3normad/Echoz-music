import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Download, LogOut, Settings, User } from "lucide-react";
import blockies from "ethereum-blockies";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const blockie = blockies.create({
    seed: "user123",
    size: 8,
    scale: 4,
  });

  const blockieImageURL = blockie.toDataURL();

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const truncateWalletAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="flex justify-between items-center bg-black text-white p-4 z-10">
      {/* Search Bar */}
      <div className="flex-grow max-w-lg">
        <input
          type="text"
          placeholder="Search by artists, songs or albums"
          className="w-full px-4 py-2 rounded-md bg-zinc-800 text-white placeholder-gray-500 focus:outline-none"
        />
      </div>

      {/* User Profile with Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="flex items-center justify-between space-x-4 px-5 py-2 rounded w-60 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <img
            src={blockieImageURL}
            alt="Profile"
            className="rounded-md w-8 h-8"
          />
          <div className="flex flex-col items-start flex-grow">
            <span className="font-semibold">Wade Warren</span>
            <span className="text-gray-500 text-sm">
              {truncateWalletAddress(
                "0xA17F2Eff7B4cB12AD2582B4ac40C0516749f05F6"
              )}
            </span>
          </div>
          <ChevronDown
            className={`transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div
            className="absolute right-0 mt-2 w-60 bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-lg shadow-lg z-50"
            style={{
              visibility: isDropdownOpen ? "visible" : "hidden",
              opacity: isDropdownOpen ? 1 : 0,
              transition: "opacity 0.2s, visibility 0.2s",
            }}
          >
            <div className="py-1">
              {/* Profile Link */}
              <NavLink
                to="/artist-dashboard"
                className={({ isActive }) =>
                  `flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors ${
                    isActive ? "bg-gray-100 dark:bg-zinc-700" : ""
                  }`
                }
              >
                <User className="mr-3 w-4 h-4" />
                Profile
              </NavLink>

              {/* Settings Link */}
              <NavLink
                to="/upload-music"
                className={({ isActive }) =>
                  `flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors ${
                    isActive ? "bg-gray-100 dark:bg-zinc-700" : ""
                  }`
                }
              >
                <Settings className="mr-3 w-4 h-4" />
                Settings
              </NavLink>

                  {/* Revenue Link */}
                  <NavLink
                to="/revenue"
                className={({ isActive }) =>
                  `flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors ${
                    isActive ? "bg-gray-100 dark:bg-zinc-700" : ""
                  }`
                }
              >
                <Settings className="mr-3 w-4 h-4" />
                Revenue
              </NavLink>

                {/* InvestorLink */}
                <NavLink
                to="/investor"
                className={({ isActive }) =>
                  `flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors ${
                    isActive ? "bg-gray-100 dark:bg-zinc-700" : ""
                  }`
                }
              >
                <Settings className="mr-3 w-4 h-4" />
                Investor
              </NavLink>

              {/* Global Stream Link */}
              <NavLink
                to="/global-stream"
                className={({ isActive }) =>
                  `flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors ${
                    isActive ? "bg-gray-100 dark:bg-zinc-700" : ""
                  }`
                }
              >
                <Settings className="mr-3 w-4 h-4" />
                Global Stream
              </NavLink>



                {/* User Profile Link */}
                <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors ${
                    isActive ? "bg-gray-100 dark:bg-zinc-700" : ""
                  }`
                }
              >
                <Settings className="mr-3 w-4 h-4" />
                Profile
              </NavLink>

              <div className="border-t dark:border-zinc-700 my-1"></div>

              {/* Logout Link */}
              <NavLink
                to="/logout"
                className={({ isActive }) =>
                  `flex items-center w-full px-4 py-2 text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${
                    isActive ? "bg-red-50 dark:bg-red-900/20" : ""
                  }`
                }
              >
                <LogOut className="mr-3 w-4 h-4" />
                Logout
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

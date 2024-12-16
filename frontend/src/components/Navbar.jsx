import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import blockies from "ethereum-blockies";
import { NavLink } from "react-router-dom";

import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Access Dynamic Labs context
  const { primaryWallet, user, disconnectWallet } = useDynamicContext();

  // Truncate wallet address for display
  const truncateWalletAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Generate blockies image
  const generateBlockie = (address) => {
    const blockie = blockies.create({
      seed: address || "user123",
      size: 8,
      scale: 4,
    });
    return blockie.toDataURL();
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

      {/* Wallet Connect and Profile */}
      <div className="flex items-center space-x-4">
        {/* Wallet Connect Button */}
        <div className="relative">
          <DynamicWidget />
        </div>

        {/* Profile Dropdown (only visible when a wallet is connected) */}
        {primaryWallet && (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center justify-between space-x-4 px-5 py-2 rounded w-60 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <img
                src={generateBlockie(primaryWallet.address)}
                alt="Profile"
                className="rounded-md w-8 h-8"
              />
              <div className="flex flex-col items-start flex-grow">
                <span className="font-semibold">
                  {user?.name || "Web3Nomad"}
                </span>
                <span className="text-gray-500 text-sm">
                  {truncateWalletAddress(primaryWallet.address)}
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
                ref={dropdownRef}
              >
                <div className="py-1">
                  <NavLink
                    to="/artist-dashboard"
                    className={({ isActive }) =>
                      `flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors ${
                        isActive ? "bg-gray-100 dark:bg-zinc-700" : ""
                      }`
                    }
                  >
                    <User className="mr-3 w-4 h-4" />
                    Stats
                  </NavLink>
                  <NavLink
                    to="/upload-music"
                    className={({ isActive }) =>
                      `flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors ${
                        isActive ? "bg-gray-100 dark:bg-zinc-700" : ""
                      }`
                    }
                  >
                    <Settings className="mr-3 w-4 h-4" />
                    Add Music
                  </NavLink>
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
                  <div className="border-t dark:border-zinc-700 my-1"></div>
                  <button
                    onClick={() => disconnectWallet()}
                    className="flex items-center w-full px-4 py-2 text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="mr-3 w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

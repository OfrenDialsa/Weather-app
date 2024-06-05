"use client";

import React, { useState } from "react";
import { MdLocationOn, MdMyLocation, MdWbSunny } from "react-icons/md";
import SearchBox from "./searchBox";
import axios from "axios";
import { useAtom } from "jotai";
import { loadingCityAtom, placeAtom } from "@/app/atom";
import { Switch } from "@/components/ui/switch"
import { ThemeSwitch } from "@/components/themeSwitch"
import { ModeToggle } from "@/components/themeToggle"
import { TiWeatherCloudy } from "react-icons/ti";

type Props = { location?: string };
const API_KEY = process.env.NEXT_PUBLIC_WEATHER_KEY;

export default function Navbar({ location }: Props) {
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  //
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [place, setPlace] = useAtom(placeAtom);
  const [_, setLoadingCity] = useAtom(loadingCityAtom);

  async function handleInputChang(value: string) {
    setCity(value);
    if (value.length >= 3) {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/find?q=${value}&appid=${API_KEY}`
        );

        const Suggestions = response.data.list.map((item: any) => item.name);
        setSuggestions(Suggestions);
        setError("");
        setShowSuggestions(true);
      } catch (error) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }
  function handleSuggestionClick(value: string) {
    setCity(value);
    setShowSuggestions(false);
  }

  function handleSubmitSearch(e: React.FormEvent<HTMLFormElement>) {
    setLoadingCity(true);
    e.preventDefault();
    if (suggestions.length == 0) {
      setError("Location not found");
      setLoadingCity(false);
    } else {
      setError("");
      setTimeout(() => {
        setLoadingCity(false);
        setPlace(city);
        setShowSuggestions(false);
      }, 500);
    }
  }

  function handleCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          setLoadingCity(true);
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}%lon=${longitude}&appid=${API_KEY}`
          );
          setTimeout(() => {
            setLoadingCity(false);
            setPlace(response.data.name);
          }, 500);
        } catch (error) {
          setLoadingCity(false);
        }
      });
    }
  }
  return (
    <>
      <nav className="shadow-sm sticky top-0 left-0 z-50 bg-white dark:bg-slate-800">
        <div className="h-[80px] w-full flex justify-between items-center max-w-7xl px-3 mx-auto">
          <div className=" flex-col items-center justify-center gap-2 -space-y-6">
            <div className="flex">
              <h2 className="text-gray-700 dark:text-gray-200 text-3xl">Weather app</h2>
              <MdWbSunny className="text-4xl text-yellow-300 mt-1" />
            </div>
            <br />
            <p className="text-gray-500 dark:text-gray-500 text-sm ml-24">By Ofren Dialsa</p>
          </div>
          <section className="flex items-center gap-3">
            <MdMyLocation
              title="Your Current Location"
              onClick={handleCurrentLocation}
              className="text-3xl text-gray-500 cursor-pointer"
            />
            <MdLocationOn className="text-3xl cursor-pointer" />
            <p className="text-slate-900/80 dark:text-slate-200/80 text-sm mr-2">{location}</p>
            <div className="relative hidden md:flex">
              {/* SearchBox */}

              <SearchBox
                value={city}
                onSubmit={handleSubmitSearch}
                onChange={(e) => handleInputChang(e.target.value)}
              />
              <SuggestionBox
                {...{
                  showSuggestions,
                  suggestions,
                  handleSuggestionClick,
                  error,
                }}
              />
            </div>
            <ModeToggle/>
          </section>
        </div>
      </nav>
      <section className="fle max-w-7xl px-3 md:hidden">
        <div className="relative">
          {/* SearchBox */}

          <SearchBox
            value={city}
            onSubmit={handleSubmitSearch}
            onChange={(e) => handleInputChang(e.target.value)}
          />
          <SuggestionBox
            {...{
              showSuggestions,
              suggestions,
              handleSuggestionClick,
              error,
            }}
          />
        </div>
      </section>
      
    </>
  );
}

function SuggestionBox({
  showSuggestions,
  suggestions,
  handleSuggestionClick,
  error,
}: {
  showSuggestions: boolean;
  suggestions: string[];
  handleSuggestionClick: (item: string) => void;
  error: string;
}) {
  return (
    <>
      {((showSuggestions && suggestions.length > 1) || error) && (
        <ul className="mb-4 bg-white dark:bg-black absolute border top-[44px] left-0 border-gray-300 rounded-md min-w-[200px] flex flex-col gap-1 py-2 px-2">
          {error && suggestions.length < 1 && (
            <li className="text-red-500 p-1">{error}</li>
          )}
          {suggestions.map((item, i) => (
            <li
              key={i}
              onClick={() => handleSuggestionClick(item)}
              className="cursor-pointer p-1 rounded hover:bg-gray-200"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

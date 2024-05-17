import React from "react";
import { MdLocationOn, MdMyLocation, MdWbSunny } from "react-icons/md";
import SearchBox from "./searchBox";

type Props = {};

export default function Navbar({}: Props) {
  return (
    <nav className="shadow-sm sticky top-0 left-0 z-50 bg-white">
      <div className="h-[80px] w-full flex justify-between items-center max-w-7xl px-3 mx-auto">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-gray-500 text-3xl">Weather</h2>
          <MdWbSunny className="text-4xl text-yellow-300 mt-1" />
          <br/>
          <p className="text-gray-500 text-sm">By Ofren Dialsa</p>
        </div>
        <section className="flex items-center gap-2">
          <MdMyLocation className="text-3xl text-gray-500 cursor-pointer" />
          <MdLocationOn className="text-3xl cursor-pointer" />
          <p className="text-slate-900/80 text-sm mr-2">Indonesia</p>
          <div>
            <SearchBox value={""} />
          </div>
        </section>
      </div>
    </nav>
  );
}

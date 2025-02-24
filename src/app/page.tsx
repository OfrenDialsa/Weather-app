/** @format */
"use client";

import Image from "next/image";
import "./globals.css";
import Navbar from "@/components/navbar";
import { useQuery } from "react-query";
import axios from "axios";
import { format, fromUnixTime, parseISO } from "date-fns";
import Container from "@/components/container";
import { converKtoC } from "@/utils/convertKtoC";
import WeatherIcon from "@/components/weatherIcon";
import { GetDorNIcon } from "@/utils/getDorNIcons";
import WeatherDetail from "@/components/weatherDetail";
import { MtoK } from "@/utils/MtoK";
import { ConvertWind } from "@/utils/convertWind";
import ForecastWeatherDetail from "@/components/forecastWeatherDetail";
import { loadingCityAtom, placeAtom } from "./atom";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Switch } from "@/components/ui/switch"
import { ThemeSwitch } from "@/components/themeSwitch"


interface WeatherDetail {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level: number;
    grnd_level: number;
    humidity: number;
    temp_kf: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  visibility: number;
  pop: number;
  sys: {
    pod: string;
  };
  dt_txt: string;
}

interface WeatherData {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherDetail[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export default function Home() {
  const [place, setPlace] = useAtom(placeAtom);
  const [loadingCity] = useAtom(loadingCityAtom);
  const { isLoading, error, data, refetch } = useQuery<WeatherData>(
    "repoData",
    async () => {
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}&cnt=56`
      );

      return data;
    }
  );

  useEffect(() => {
    refetch();
  }, [place, refetch]);

  const firstData = data?.list[0];

  console.log("data", data);

  const uniqueDates = [
    ...new Set(
      data?.list.map(
        (entry) => new Date(entry.dt * 1000).toISOString().split("T")[0]
      )
    ),
  ];

  const firstDataForEachDate = uniqueDates.map((date) => {
    return data?.list.find((entry) => {
      const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0];
      const entryTime = new Date(entry.dt * 1000).getHours();
      return entryDate === date && entryTime >= 4;
    });
  });

  if (isLoading)
    return (
      <div className="flex items-center min-h-screen justify-center">
        <p className="animate-bounce">Loading....</p>
      </div>
    );

  return (
    <div className="flex flex-col gap-4 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <Navbar location={data?.city.name} />
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
        {/* Today Data */}
        {loadingCity ? (
          <LoadingSkeleton />
        ) : (
          <>
            <section className="space-y-4">
              <div>
                <h2 className="flex gap-1 text-2xl items-ends">
                  <p> {format(parseISO(firstData?.dt_txt ?? ""), "EEEE")} </p>
                  <p className="text-lg mt-1">
                    {" "}
                    ({format(parseISO(firstData?.dt_txt ?? ""), "dd.MM.yyyy")})
                  </p>
                </h2>
                <Container className="gap-10 px-6 items-center">
                  {/*Temperature*/}
                  <div className="flex flex-col px-4">
                    <span className="text-5xl">
                      {converKtoC(firstData?.main.temp ?? 298.34)}°
                    </span>
                    <p className="text-xs space-x-1 whitespace-nowrap">
                      <span> Feels like</span>
                      <span>
                        {converKtoC(firstData?.main.feels_like ?? 298.34)}°
                      </span>
                    </p>
                    <p className="text-xs space-x-2">
                      <span>
                        {converKtoC(firstData?.main.temp_min ?? 0)}°↓{" "}
                      </span>
                      <span>
                        {" "}
                        {converKtoC(firstData?.main.temp_max ?? 0)}°↑
                      </span>
                    </p>
                  </div>
                  {/*Time and Weather icon*/}
                  <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
                    {data?.list.map((d, i) => (
                      <div
                        key={i}
                        className="flex flex-col justify-between gap-2 items-center text-xs font-semibold"
                      >
                        <p className="whitespace-nowrap">
                          {format(parseISO(d.dt_txt), "h:mm a")}
                        </p>

                        {/*<WeatherIcon iconName={d.weather[0].icon}/>*/}
                        <WeatherIcon
                          iconName={GetDorNIcon(d.weather[0].icon, d.dt_txt)}
                        />
                        <p>{converKtoC(d?.main.temp ?? 0)}°</p>
                      </div>
                    ))}
                  </div>
                </Container>
              </div>

              <div className="flex gap-4">
                {/*kiri */}
                <Container className="w-fit justify-center flex-col px-4 items-center">
                  <p className="capitalize text-center">
                    {firstData?.weather[0].description}
                  </p>
                  <WeatherIcon
                    iconName={GetDorNIcon(
                      firstData?.weather[0].icon ?? "",
                      firstData?.dt_txt ?? ""
                    )}
                  />
                </Container>
                {/*kanan */}
                <Container className="bg-yellow-400/80 dark:bg-yellow-600/80 px-6 gap-4 justify-between overflow-x-auto">
                  <WeatherDetail
                    visability={MtoK(firstData?.visibility ?? 10000)}
                    humidity={`${firstData?.main.humidity}%`}
                    windSpeed={ConvertWind(firstData?.wind.speed ?? 1.64)}
                    airPressure={`${firstData?.main.pressure} hpa`}
                    sunrise={format(
                      fromUnixTime(data?.city.sunrise ?? 1715986850),
                      "H:mm"
                    )}
                    sunset={format(
                      fromUnixTime(data?.city.sunset ?? 1716030200),
                      "H:mm"
                    )}
                  />
                </Container>
              </div>
            </section>
            {/* 7 day forcast Data */}
            <section className="flex flex-col w-full gap-4">
              <p className="text-2xl">Forecast (7 days)</p>
              {firstDataForEachDate.map((d, i) => (
                <ForecastWeatherDetail
                  key={i}
                  weaterIcon={d?.weather[0].icon ?? "01d"}
                  date={format(parseISO(d?.dt_txt ?? ""), "dd.MM")}
                  day={format(parseISO(d?.dt_txt ?? ""), "EEEE")}
                  temp={d?.main.temp ?? 0}
                  feels_like={d?.main.feels_like ?? 0}
                  temp_min={d?.main.temp_min ?? 0}
                  temp_max={d?.main.temp_max ?? 0}
                  description={d?.weather[0].description ?? ""}
                  visability={`${MtoK(d?.visibility ?? 10000)}`}
                  humidity={`${d?.main.humidity ?? 90}% `}
                  windSpeed={`${ConvertWind(d?.wind.speed ?? 1.64)}`}
                  airPressure={`${d?.main.pressure ?? 1008} hPa`}
                  sunrise={format(
                    fromUnixTime(data?.city.sunrise ?? 1715986850),
                    "H:mm"
                  )}
                  sunset={format(
                    fromUnixTime(data?.city.sunset ?? 1716030200),
                    "H:mm"
                  )}
                />
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
      {/* Today Data */}
      <section className="space-y-4">
        <div>
          <h2 className="flex gap-1 text-2xl items-end">
            <div className="bg-gray-300 w-24 h-8 rounded animate-pulse"></div>
            <div className="bg-gray-300 w-28 h-6 mt-1 rounded animate-pulse"></div>
          </h2>
          <div className="flex gap-10 px-6 items-center">
            {/* Temperature */}
            <div className="flex flex-col px-4">
              <div className="bg-gray-300 w-24 h-20 rounded animate-pulse mb-2"></div>
              <div className="bg-gray-300 w-32 h-4 rounded animate-pulse mb-1"></div>
              <div className="bg-gray-300 w-32 h-4 rounded animate-pulse"></div>
            </div>
            {/* Time and Weather icon */}
            <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col justify-between gap-2 items-center text-xs font-semibold"
                >
                  <div className="bg-gray-300 w-12 h-4 rounded animate-pulse"></div>
                  <div className="bg-gray-300 w-12 h-12 rounded-full animate-pulse"></div>
                  <div className="bg-gray-300 w-8 h-4 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Left */}
          <div className="flex flex-col w-fit justify-center px-4 items-center">
            <div className="bg-gray-300 w-24 h-5 rounded animate-pulse mb-2"></div>
            <div className="bg-gray-300 w-16 h-16 rounded-full animate-pulse"></div>
          </div>
          {/* Right */}
          <div className="flex flex-col gap-4 justify-between w-full px-6">
            <div className="flex flex-col gap-2">
              <div className="bg-gray-300 w-full h-5 rounded animate-pulse"></div>
              <div className="bg-gray-300 w-full h-5 rounded animate-pulse"></div>
              <div className="bg-gray-300 w-full h-5 rounded animate-pulse"></div>
              <div className="bg-gray-300 w-full h-5 rounded animate-pulse"></div>
              <div className="bg-gray-300 w-full h-5 rounded animate-pulse"></div>
              <div className="bg-gray-300 w-full h-5 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>
      {/* 7 day forecast Data */}
      <section className="flex flex-col w-full gap-4">
        <div className="bg-gray-300 w-36 h-8 rounded animate-pulse"></div>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="bg-gray-300 w-16 h-16 rounded-full animate-pulse"></div>
            <div className="flex flex-col gap-2 w-full">
              <div className="bg-gray-300 w-24 h-5 rounded animate-pulse"></div>
              <div className="bg-gray-300 w-full h-5 rounded animate-pulse"></div>
              <div className="bg-gray-300 w-full h-5 rounded animate-pulse"></div>
              <div className="bg-gray-300 w-full h-5 rounded animate-pulse"></div>
              <div className="bg-gray-300 w-full h-5 rounded animate-pulse"></div>
              <div className="bg-gray-300 w-full h-5 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

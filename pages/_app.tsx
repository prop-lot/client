import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App() {
  return (
    <>
      <Head>
        <title>Prop Lot</title>
        <meta name="description" content="Vote on nounish ideas." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="max-w-2xl mx-auto mt-4">
        <h1 className="text-2xl font-bold text-center">Goodbye for now!</h1>
        <p className="text-gray-700 mt-4">
          After two years of service, PropLot has been deprecated. Since January
          of 2024, only 3 ideas have been posted to PropLot, and the team
          decided it is not worth the infra cost to host the project + database
          given the limited use. Thank you for two great years of ideas!
        </p>
        <p className="text-gray-700 mt-4">
          The code and snapshots of the data can be found below.
        </p>
        <div className="flex flex-col mt-4">
          <a
            href="https://github.com/prop-lot/client"
            target="_blank"
            rel="noreferrer"
            className="text-blue-500"
          >
            Code
          </a>
          <a
            href="https://github.com/prop-lot/client/tree/main/data_snapshot"
            target="_blank"
            rel="noreferrer"
            className="text-blue-500"
          >
            Data
          </a>
        </div>
      </main>
    </>
  );
}

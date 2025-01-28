import { JSX } from "react";

/**
 * @returns The unauthenticated landing page, ie. the first page the user sees
 */
export default function LandingPage(): JSX.Element {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center ">
        <h1 className="text-3xl sm:text-4xl">My OAuth Demo</h1>
        <section className="flex flex-col gap-4 items-center">
          <p>
            This is a demo of a Next.js app written in TypeScript which implements OAuth authentication using Google.
          </p>
          <p>
            You are currently on the unauthenticated landing page which is available to everybody on the internet.
          </p>
          <p>
            Perhaps you should try logging in...
          </p>
        </section>

        <section className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="/login"
            // target="_blank"
            rel="noopener noreferrer"
          >
            Log in
          </a>
        </section>
      </main>
    </div>
  );
}

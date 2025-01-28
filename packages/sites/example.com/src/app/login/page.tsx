/**
 * Login page
 * 
 * This is the page the user see's when they want to log in. It 
 * can contain multiple login options, some using OAuth like Google, 
 * GitHub, Twitter, etc. and some using a username and password. 
 * For the purposes of this demo it'll only contain a single button: 
 *      "Login with Google"
 * 
 * The login flow is illustrated here: 
 *    https://developers.google.com/identity/protocols/oauth2#webserver
 * 
 * As the above link shows, also part of the flow is an API endpoint 
 * (ie. a page the user doesn't see, api/auth/gettoken.ts) which takes 
 * a short-lived 'code' provided by Google and exchanges it for a long-lived
 * Google-issued JWT. 
*/
'use client';
import { JSX } from "react";
import Image from "next/image";

const redirect_url = "/api/auth/start-oauth"

/**
 * @returns The unauthenticated page from which users initiate login
*/
export default function LoginPage(): JSX.Element {

    const openPopup = () => {
        const width = Math.floor(window.screen.width * 0.6);
        const height = Math.floor(window.screen.height * 0.6);
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        window.open(
            redirect_url,
            'GoogleLogin',
            `width=${width},height=${height},top=${top},left=${left}`
        );
    }

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center ">
                <h1 className="text-3xl sm:text-4xl">Login</h1>
                <section className="flex flex-col gap-4 items-center">
                    <p>
                        How would you like to authenticate this fine day?
                    </p>
                    <button
                        className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44 gap-2"
                        onClick={openPopup}
                    >
                        <Image
                            aria-hidden
                            src="/google.svg"
                            alt="Google icon"
                            width={16}
                            height={16}
                        />
                        &nbsp;Log in with Google
                    </button>
                    <a
                        className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center opacity-50 cursor-not-allowed text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44 gap-2"
                        href="_blank"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-disabled
                    >
                        <Image
                            aria-hidden
                            src="/github.svg"
                            alt="GitHub icon"
                            width={16}
                            height={16}
                            className="invert"
                        />
                        &nbsp;Log in with GitHub
                    </a>

                </section>


            </main>

        </div>
    );
}



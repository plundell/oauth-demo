import { JSX } from "react";

/**
 * @returns The authenticated page users see after they've logged in
 */
export default function DashboardPage(): JSX.Element {
    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center">
                <h1 className="text-3xl sm:text-4xl">Dashboard</h1>
                <section className="flex flex-col gap-4 items-center">
                    <p>
                        You are now logged in!
                    </p>
                </section>
            </main>
        </div>
    );
}
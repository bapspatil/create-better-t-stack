import type { ReactNode } from "react";
import Footer from "./_components/Footer";
import Navbar from "./_components/Navbar";

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<main className="relative z-10 grid min-h-svh grid-cols-1 grid-rows-[auto_1fr_auto] overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 transition-color duration-300 dark:from-gray-950 dark:to-black">
			<Navbar />
			<div className="pt-16">{children}</div>
			<Footer />
		</main>
	);
}

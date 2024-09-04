import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col bg-bg">
      <Image
        src="/404.jpg"
        alt="Not Found"
        className="h-2/3 w-full object-cover"
        priority
        width={800}
        height={400}
      />

      <div className="flex flex-1 items-center justify-center">
        <div className="mx-auto max-w-xl px-4 py-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl font-departure">
            We can`t find that page.
          </h1>

          <p className="mt-4 text-gray-500 font-departure">
            Try searching again, or return home to start from the beginning.
          </p>

          <Link
            className="mt-6 inline-block rounded bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring font-departure"
            href="/"
          >
            {" "}
            Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maintenance Mode | MotionLife RP Crafting Optimizer",
  description:
    "The site is currently under maintenance. Please check back later.",
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-10 h-10 text-gray-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Under Maintenance
          </h1>{" "}
          <p className="text-gray-400 text-lg mb-6">
            We&apos;re currently performing some maintenance on our crafting
            optimizer.
          </p>
          <p className="text-gray-500">
            The MotionLife RP Crafting Optimizer is temporarily unavailable
            while we make improvements to serve you better.
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          {" "}
          <h2 className="text-xl font-semibold text-white mb-3">
            What&apos;s happening?
          </h2>
          <ul className="text-gray-400 text-sm space-y-2 text-left">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              System updates and improvements
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Performance optimizations
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              New features being added
            </li>
          </ul>
        </div>

        <div className="mt-8 text-gray-500 text-sm">
          <p>Expected to be back online soon.</p>
          <p className="mt-2">
            Follow us on{" "}
            <a
              href="https://github.com/aw4e/mlrpcrafting"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              GitHub
            </a>{" "}
            for updates.
          </p>
        </div>

        <div className="mt-8">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
          >
            Check Again
          </button>
        </div>
      </div>
    </div>
  );
}

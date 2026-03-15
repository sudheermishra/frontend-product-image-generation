import { NavLink } from "react-router-dom";

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-900 px-4">
      <div className="w-full max-w-lg text-center">
        <h1 className="text-2xl font-semibold text-slate-100 tracking-tight mb-2">
          Choose what to create
        </h1>
        <p className="text-slate-400 text-sm mb-10">
          Generate images or videos from your prompts
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <NavLink
            to="/generate-image"
            className="group flex flex-col items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 p-8 shadow-sm transition-all hover:border-slate-600 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-700 text-slate-300 transition-colors group-hover:bg-slate-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
            </span>
            <span className="font-medium text-slate-100">Image</span>
            <span className="text-xs text-slate-400">Generate images from text</span>
          </NavLink>

          <NavLink
            to="/generate-video"
            className="group flex flex-col items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 p-8 shadow-sm transition-all hover:border-slate-600 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-700 text-slate-300 transition-colors group-hover:bg-slate-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
            </span>
            <span className="font-medium text-slate-100">Video</span>
            <span className="text-xs text-slate-400">Generate videos from text</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

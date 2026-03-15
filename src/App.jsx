import {
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements,
} from "react-router-dom";

import RootLayout from "./layout/RootLayout";
import ImageGenPage from "./pages/ImageGenPage";
import VideoGenPage from "./pages/VideoGenPage";
import HomePage from "./pages/HomePage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<HomePage />} />
      <Route path="generate-image" element={<ImageGenPage />} />
      <Route path="generate-video" element={<VideoGenPage />} />
    </Route>,
  ),
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

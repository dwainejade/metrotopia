import { routes } from "./App.jsx";
import { ViteReactSSG } from "vite-react-ssg";

import "./styles/normalize.css";

export const createRoot = ViteReactSSG({
	routes,
	basename: import.meta.env.BASE_URL,
});
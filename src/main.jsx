// import React from "react";
// import { createRoot } from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";
import { routes } from "./App.jsx";
import { ViteReactSSG } from "vite-react-ssg";
// import App from "./App.jsx";

import "./styles/normalize.css";

export const createRoot = ViteReactSSG({
	routes,
	basename: import.meta.env.BASE_URL,
});
// createRoot(document.getElementById("root")).render(
// 	<React.StrictMode>
// 		<BrowserRouter basename="/city-builder-interactive/">
// 			<App />
// 		</BrowserRouter>
// 	</React.StrictMode>
// );

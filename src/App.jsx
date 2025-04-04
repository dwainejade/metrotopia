import React from "react";

import "./styles/App.css";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/shift-away-subtle.css";
import "tippy.js/dist/backdrop.css";


export const routes = [
	{
		path: "/",
		Component: React.lazy(() => import("./routes/Main")),
	},
	{
		path: "/main",
		Component: React.lazy(() => import("./routes/Main")),
	},
	{
		path: "/ess",
		Component: React.lazy(() => import("./routes/ESS")),
	},
	{
		path: "/aag",
		Component: React.lazy(() => import("./routes/AAG")),
	},
	{
		path: "/ee",
		Component: React.lazy(() => import("./routes/EE")),
	},
	{
		path: "/lwl",
		Component: React.lazy(() => import("./routes/LWL")),
	},
	{
		path: "/pp",
		Component: React.lazy(() => import("./routes/PP")),
	},
	{
		path: "/sandbox", // No Restrictions for how and where buildings are placed
		Component: React.lazy(() => import("./routes/Sandbox")),
	}
];

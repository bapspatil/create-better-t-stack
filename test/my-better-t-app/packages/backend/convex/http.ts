import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import { polar } from "./polar";

const http = httpRouter();

// Register Better Auth routes
authComponent.registerRoutes(http, createAuth);

// Register Polar webhook handler at /polar/events
polar.registerRoutes(http as any, {
	// Optional: customize the webhook endpoint path (defaults to "/polar/events")
	// path: "/polar/events",
	// Optional: add callbacks for webhook events
	// onSubscriptionUpdated: async (ctx, event) => {
	//   // Handle subscription updates
	// },
	// onSubscriptionCreated: async (ctx, event) => {
	//   // Handle new subscriptions
	// },
});

export default http;

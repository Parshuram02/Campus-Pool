# Campus Pool — Interview Prep

## 30-second pitch
"Campus Pool is a MERN carpooling app for college students. Students post a
ride with source, destination, time, and cost; others browse and request to
join; the host accepts or rejects; once you're in, there's a live group chat
for that ride and a fare-split calculator so everyone knows what they owe.
There's also a safety filter so a host can mark a ride 'female-only'."

## Tech stack & why
| Layer | Choice | Why you'd say |
|---|---|---|
| Frontend | React + React Router | Component reuse for ride cards, client-side routing without full reloads |
| Styling | Tailwind CSS | Fast to iterate, no separate CSS files to keep in sync |
| Backend | Node.js + Express | Same language as frontend, huge middleware ecosystem |
| Database | MongoDB + Mongoose | Ride documents are naturally nested (a ride embeds its join requests) — avoids 3 join tables for a relationship that's read together 95% of the time |
| Real-time | Socket.io | Chat needs push, not poll; Socket.io gives room-based broadcast (`join_ride`) for free |
| Auth | JWT + bcrypt | Stateless auth, no server-side session store needed |

## Architecture (request flow)
1. **Auth**: `POST /api/auth/register` hashes the password in a Mongoose
   `pre('save')` hook, signs a JWT (`{ userId }`, 7-day expiry), client stores
   it and sends it back on every request as the `x-auth-token` header.
2. **Middleware**: `middleware/auth.js` verifies the JWT and attaches
   `req.user = decoded.userId` — every protected route controller reads the
   caller's identity from there, never from the request body.
3. **Rides**: `GET /api/rides` is the main list (paginated, filterable by
   destination, sortable by time/price/seats), `GET /api/rides/:id` for a
   single ride, `POST /:id/request` to ask to join, `PUT /:id/request/:reqId`
   for the host to accept/reject.
4. **Chat**: client connects a Socket.io socket, emits `join_ride` to join a
   room named after the ride's Mongo `_id`. Messages are saved to a `Chat`
   document (one per ride, messages array) *and* broadcast to the room in the
   same handler — so chat history persists and new messages still arrive live.

## Data model (and why it's shaped this way)
- **User**: name, email (unique), registrationNo (unique), branch, gender,
  hashed password, plus denormalized `ridesHosted`/`ridesJoined` counters.
- **Ride**: source/destination as plain strings *and* as GeoJSON `Point`s
  (`fromCoordinates`/`toCoordinates`) with `2dsphere` indexes — so the schema
  is ready for "rides near me" geo-queries even though the UI doesn't expose
  that yet. `requests` is an **embedded** array of `{ user, status }`, not a
  separate collection — a ride and its pending requests are always read
  together (host's "manage requests" view), so embedding avoids a join.
  `members` is a flat array of accepted user IDs for fast occupancy checks.
- **Chat**: one document per ride, `messages` as an embedded array. Simpler
  than one-document-per-message at this scale, and it means "get all chat for
  this ride" is a single `findOne`.

## Real challenges I hit (use these — they're true, from this codebase)
1. **Stale unique index after a schema change.** Earlier in the project the
   `User` schema had `regNo`/`phone` fields that were later renamed/removed,
   but MongoDB still enforced old unique indexes on those names — so new user
   inserts failed for reasons that looked unrelated to the data being sent.
   Fixed by inspecting `collection.indexes()` and dropping the stale ones.
   *Talking point: "I learned that Mongoose doesn't sync schema changes to
   existing indexes automatically — you own that migration yourself."*
2. **Mongoose pre-save hook bug.** The password-hashing hook declared a
   `next` callback parameter but the installed Mongoose version treats async
   functions as promise-based, not callback-based — so calling `next()`
   manually inside an async hook threw `next is not a function` and broke
   registration. Fixed by dropping the callback entirely and letting the
   async function's promise/throw drive completion.
   *Talking point: "Mixing callback-style and promise-style middleware in the
   same function is a classic footgun — pick one."*
3. **No single-resource endpoint.** The ride details page originally fetched
   *all* rides and filtered client-side for the one it needed — it doesn't
   break visibly with 10 rides, but it's an O(n) fetch for an O(1) lookup and
   wouldn't survive real traffic. Added `GET /api/rides/:id`.
4. **Missing idempotency guard.** Accepting a join request didn't check
   whether that request was already handled — a duplicate accept call (double
   click, retried request) would silently double-count the seat and add the
   same member twice. Added a guard that rejects re-processing a non-pending
   request.
   *Talking point: "Any endpoint that mutates a counter needs to be safe
   against being called twice — networks retry."*
5. **Two competing UIs for the same screen.** During development I ended up
   with both a basic and a polished version of the rides page, and only one
   was actually wired into the router — the other was dead code. Consolidated
   to one, deleted the rest. *Talking point about keeping a single source of
   truth and not letting half-finished experiments linger in the codebase.*

## Likely cross-questions & how to answer them
**Q: Why MongoDB instead of a relational DB?**
A: The dominant access pattern is "give me a ride and everything about it" —
host, requests, members — read as one unit. Embedding requests/members in the
Ride document means that's a single document read instead of 3 joins. The
trade-off: if requests needed independent querying (e.g., "show me all my
pending requests across every ride") that'd be a collection scan across
Rides instead of an indexed query on a Requests table — acceptable here
because a student has at most a handful of pending requests at once.

**Q: How is a password never exposed?**
A: It's hashed with bcrypt (10 salt rounds) before save, and every query that
returns a user explicitly does `.select('-password')` to strip it server-side
— so it's never even serialized into the response, not just hidden client-side.

**Q: How do you stop someone editing another host's ride?**
A: The route handler reads the actor's ID from the verified JWT
(`req.user`, set by the auth middleware), not from anything in the request
body, and compares it to `ride.admin` server-side. A client can't lie about
who it is because it can't forge a valid JWT without the server's secret.

**Q: Why Socket.io rooms instead of a global broadcast?**
A: Rooms (`socket.join(rideId)`) scope a broadcast to only the people viewing
that specific ride's chat — without rooms every client would receive every
ride's messages and you'd filter client-side, which leaks data to clients
that shouldn't see it and wastes bandwidth.

**Q: What would break first if this had 10,000 users?**
A: Three things, in order: (1) `GET /api/rides` without the destination index
in place would do a regex scan — added pagination, but a text index on
destination would help more at scale; (2) one Socket.io process can't scale
horizontally without a shared adapter (Redis) so multiple server instances
share room membership; (3) the chat schema (one doc, growing messages array)
would eventually hit MongoDB's 16MB document size limit for very long-lived,
very active rides — fine for a ride's natural lifecycle (a few hours), wrong
for a permanent group chat.

**Q: What would you do differently next time?**
A: Add a request/response validation layer (e.g. zod or Joi) — right now
malformed input mostly surfaces as a generic 500 instead of a clear 400, and
add automated tests; this project doesn't have any yet, which is the most
honest answer if asked.

## Honest limitations (better to say these than be caught out)
- No automated test suite.
- No rate limiting / input validation library — relies on Mongoose schema
  validation only.
- `fromCoordinates`/`toCoordinates` exist and are geo-indexed but the UI
  doesn't yet do a real "near me" search — they're collected but unused
  beyond storage today.
- CORS is wide open (`origin: "*"`) for local development; would need to be
  locked to the deployed frontend origin in production.

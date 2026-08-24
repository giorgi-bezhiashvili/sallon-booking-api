# Salon Booking API

A NestJS + MongoDB backend for a salon: manage staff, and let customers book a slot with a given employee, confirmed via SMS OTP.

## Stack

- [NestJS](https://nestjs.com/) on [Fastify](https://fastify.dev/)
- MongoDB via [Mongoose](https://mongoosejs.com/)
- [ClamAV](https://www.clamav.net/) for virus-scanning staff photo uploads
- Mock SMS provider (logs to console — swap for Twilio later)

## Project setup

```bash
npm install
```

Copy `.env.example` to `.env` and adjust as needed:

```bash
cp .env.example .env
```

| Variable      | Purpose                                                        | Default       |
| ------------- | ---------------------------------------------------------------| ------------- |
| `CLAMD_HOST`  | Host of a running `clamd` daemon, used to scan uploaded photos | `127.0.0.1`   |
| `CLAMD_PORT`  | Port for `clamd`                                                | `3310`        |
| `UPLOAD_DIR`  | Where scanned, clean photos are written                        | `./uploads`   |

The app also expects a MongoDB instance reachable at `mongodb://localhost:27017/my-nest-db` (see `src/app.module.ts` — hardcoded for now, move to `.env` before deploying anywhere shared).

## Running

```bash
# development
npm run start

# watch mode
npm run start:dev

# production
npm run build
npm run start:prod
```

Server listens on `http://localhost:3000`.

## Testing the API

`.rest` at the repo root has ready-to-run requests for every endpoint (staff CRUD + the full booking/OTP flow, including the failure cases) — open it with the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension in VS Code and run requests top to bottom.

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# coverage
npm run test:cov
```

## API

### Staff

> ⚠️ `POST /staff` and `PATCH /staff/:id` are temporary — kept in for local seeding/testing while there's no other way to manage staff yet. **Remove both before production**, along with `StaffService.addWorker` / `StaffService.update` and their DTOs.

| Method | Route         | Body                                                  | Notes                                              |
| ------ | ------------- | ------------------------------------------------------| --------------------------------------------------|
| GET    | `/staff`      | —                                                      | List all staff                                    |
| GET    | `/staff/:id`  | —                                                      | Get one staff member                              |
| POST   | `/staff`      | `multipart/form-data`: `name`, `roles` (comma-separated), up to 5 `photos` files | Photos are virus-scanned before saving. `name` has no uniqueness constraint — duplicate names are allowed. |
| PATCH  | `/staff/:id`  | JSON: any subset of `{ name, roles }`                  | No photo support in this endpoint                 |
| DELETE | `/staff/:id`  | —                                                      | —                                                   |

### Booking

Two-step flow: hold a slot, then confirm it with a one-time code sent by SMS (currently mocked — the code is printed to the server console instead of actually being texted).

| Method | Route             | Body                                                                                          |
| ------ | ------------------| ------------------------------------------------------------------------------------------------|
| POST   | `/booking/request`| `{ staffId, startTime (ISO 8601), durationMinutes (5–60), customerPhone (E.164), customerName? }` |
| POST   | `/booking/verify` | `{ bookingId, otp (6 digits) }`                                                                   |

**`POST /booking/request`**
- Checks the staff member exists.
- Rejects if `durationMinutes` > 60.
- Rejects if `startTime` is in the past.
- Rejects with `409 Conflict` if the requested window overlaps another `pending_otp` or `confirmed` booking for that staff member.
- On success, creates the booking as `pending_otp`, generates a 6-digit OTP (5 minute expiry), sends it via the mock SMS service, and returns `bookingId` + `otpExpiresAt`.

**`POST /booking/verify`**
- `404` if the booking doesn't exist.
- `400` if the booking is already confirmed, cancelled, or otherwise not awaiting OTP.
- `410 Gone` if the OTP has expired, or if too many wrong codes have been entered (5 max) — in both cases the booking flips to `expired`, freeing the slot for a new request.
- `400` if the code is wrong (attempt is counted).
- On success, booking becomes `confirmed` and the OTP fields are cleared.

## Project structure

## Known gaps / follow-ups

- No auth on any route yet.
- Mongo connection string is hardcoded in `app.module.ts`.
- Staff `name` has no DB-level uniqueness — if you previously had a `unique` index on it (from an older schema version), drop it manually (`db.staffs.dropIndex("name_1")`) or it'll reject legitimate duplicate names.
- SMS is mocked; wire up a real provider (e.g. Twilio) in `src/sms/sms.service.ts` before production — nothing else needs to change, `BookingService` only depends on `SmsService.sendOtp()`.
- Remove `POST /staff` and `PATCH /staff/:id` before production (see note above).
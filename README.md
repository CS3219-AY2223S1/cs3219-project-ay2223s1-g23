# CS3219-AY22-23-Project-Skeleton

This is a template repository for CS3219 project.

## User Service

1. Rename `.env.sample` file to `.env`.
2. Create a Cloud DB URL using Mongo Atlas.
3. Enter the DB URL created as `DB_CLOUD_URI` in `.env` file.
4. Enter `JWT_SECRET` in `.env` file generated from `require('crypto').randomBytes(64).toString('hex')`.
5. Install npm packages using `npm i`.
6. Run User Service using `npm run dev`.

## Matching Service

1. Rename `.env.sample` file to `.env`.
2. For dev, change `ENV` to "DEV" and enter your `DB_LOCAL_URI`.
3. For prod, change `ENV` to `PROD` and create a Cloud DB URL using Mongo Atlas.
4. Enter the DB URL created as `DB_CLOUD_URI` in `.env` file.
5. Install npm packages using `npm i`.
6. Run User Service using `npm run dev`.

## Frontend

1. Install npm packages using `npm i`.
2. Run Frontend using `npm start`.

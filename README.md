# CS3219-AY22-23-Project-Skeleton

This is a template repository for CS3219 project.

## PeerPressure

After setting up the environment variables and installing all the package dependencies for the 6 services, a convenient way to run all the 6 services and the frontend concurrently is as follows:

1. From the root directory, `cd PeerPressure`
2. Install npm packages using `npm i`.
3. Run `npm run dev`.

## User Service

1. Rename `.env.sample` file to `.env`.
2. Create a Cloud DB URL using Mongo Atlas.
3. Enter the DB URL created as `DB_CLOUD_URI` in `.env` file.
4. Enter "PROD" as the value for `ENV` in `.env` file.
5. Enter `JWT_SECRET` in `.env` file. Eg it can be generated from `require('crypto').randomBytes(64).toString('hex')`.
6. Install npm packages using `npm i`.
7. Run User Service using `npm run dev`.

## Matching Service

1. Rename `.env.sample` file to `.env`.
2. Create a Cloud DB URL using Mongo Atlas.
3. Enter the DB URL created as `DB_CLOUD_URI` in `.env` file.
4. Enter "PROD" as the value for `ENV` in `.env` file.
5. Enter `JWT_SECRET` in `.env` file. Eg it can be generated from `require('crypto').randomBytes(64).toString('hex')`.
6. Install npm packages using `npm i`.
7. Run User Service using `npm run dev`.

## Collaboration Service

1. Rename `.env.sample` file to `.env`.
2. Create a Cloud DB URL using Mongo Atlas.
3. Enter the DB URL created as `DB_CLOUD_URI` in `.env` file.
4. Enter "PROD" as the value for `ENV` in `.env` file.
5. Install npm packages using `npm i`.
6. Run Collaboration Service using `npm run dev`.

## Question Service

1. Rename `.env.sample` file to `.env`.
2. Create a Cloud DB URL using Mongo Atlas.
3. Enter the DB URL created as `DB_CLOUD_URI` in `.env` file.
4. Enter "PROD" as the value for `ENV` in `.env` file.
5. Enter the Redis URL created as `REDIS_CLOUD_URI` in `.env` file.
6. Install npm packages using `npm i`.
7. Run Question Service using `npm run dev`.

## History Service

1. Rename `.env.sample` file to `.env`.
2. Create a Cloud DB URL using Mongo Atlas.
3. Enter the DB URL created as `DB_CLOUD_URI` in `.env` file.
4. Enter "PROD" as the value for `ENV` in `.env` file.
5. Install npm packages using `npm i`.
6. Run History Service using `npm run dev`.

## Communication Service

1. Install npm packages using `npm i`.
2. Run Communication Service using `npm run dev`.

## Frontend

1. Install npm packages using `npm i`.
2. Run Frontend using `npm start`.

## Testing each service

1. cd into the service
2. Enter the DB TEST URL created as `DB_TEST_URI` in `.env` file.
3. For matching service only: make sure question and history service is running
4. Run tests using `npm run test`

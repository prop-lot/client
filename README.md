## Proplot Client

Deprecated.
The original maintainers are no longer supporting this version of Prop Lot in favor of moving efforts towards v2. PRs are welcome.
Please not that redeploying via GH actions will break the build. There are environment variables that are extremely annoying to set up via fly.io (the current provider).
As a result, environment variables need to be set from the local command line and a build will need to be queued there.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Migrations

Both staging and production databases are hosted on fly.io. It can be a bit difficult to run migrations.
Here are the steps I use to run migrations manually.

1. Get the database url.

```bash
flyctl ssh console -a proplot-client
echo $DATABASE_URL
```

2. Copy the database url in your .env, but replace the host with `localhost`

3. Proxy the connection from local port 5432 to the fly.io port.

```bash
flyctl proxy 5432 -a proplot-client-db
```

4. Run migrations like normal.

## GraphQL Changes

When making changes to the GraphQL schema you will want to auto generate the types for use in the code. There are two commands to generate types, one for the API code and one for the client queries.

The commands are:

```
npm run generate-server-graph

npm run generate-client-graph
```

You'll want to make your schema changes on the API and run `npm run generate-server-graph` first, then you can build/update your client side queries in `./graphql/queries`. Once you've updated these you can run `npm run generate-client-graph` to generate the types to use on the client code.

All generated types are stored in `./graphql/types/__generated__`. The API specific types are in the `apiTypes.ts` file.

## Setting Env Vars

tbd.

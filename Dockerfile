# Install dependencies only when needed
FROM node:16-alpine AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .
RUN npm install --legacy-peer-deps

ENV NEXT_TELEMETRY_DISABLED 1

# Add `ARG` instructions below if you need `NEXT_PUBLIC_` variables
# then put the value on your fly.toml
# Example:
# ARG NEXT_PUBLIC_EXAMPLE="value here"

ARG SECRET_AUTH_PASSWORD
ARG JSON_RPC_CLIENT
ARG NEXT_PUBLIC_TEST_SECRET

ENV NODE_ENV production
ENV SECRET_AUTH_PASSWORD=$SECRET_AUTH_PASSWORD
ENV JSON_RPC_CLIENT=$JSON_RPC_CLIENT
ENV NEXT_PUBLIC_TEST_SECRET=$NEXT_PUBLIC_TEST_SECRET
ENV NEXT_TELEMETRY_DISABLED 1


RUN echo "Test output $SECRET_AUTH_PASSWORD"
RUN echo "Test output $JSON_RPC_CLIENT"
RUN echo "Test output $NEXT_PUBLIC_TEST_SECRET"

RUN SECRET_AUTH_PASSWORD=$SECRET_AUTH_PASSWORD JSON_RPC_CLIENT=$JSON_RPC_CLIENT NEXT_PUBLIC_TEST_SECRET=$NEXT_PUBLIC_TEST_SECRET npm run build

# Production image, copy all the files and run next
FROM node:16-alpine AS runner
WORKDIR /app


RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

CMD ["npm", "run", "start"]

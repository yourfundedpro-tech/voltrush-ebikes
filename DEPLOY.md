## Publish VoltRush

This app is ready to deploy on a host that supports:

- a Node.js web service
- a persistent disk/volume for SQLite
- environment variables

### Recommended host

Railway

### Required environment variables

```env
STRIPE_SECRET_KEY=...
STRIPE_PUBLISHABLE_KEY=...
STRIPE_CURRENCY=usd
STRIPE_MERCHANT_COUNTRY=US
JWT_SECRET=replace_with_a_long_random_secret
DATABASE_PATH=/app/server/data/voltrush.sqlite
```

### Railway steps

1. Push this project to GitHub.
2. Create a new Railway project from the GitHub repo.
3. Add a volume and mount it at `/app/server/data`.
4. Add the environment variables above.
5. Deploy.

### Notes

- `Dockerfile` builds the frontend and starts the Node server.
- Do not upload `.env`.
- Apple Pay requires a live HTTPS domain registered in Stripe payment method domains.

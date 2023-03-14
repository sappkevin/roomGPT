
# [cozyspotai.com](https://cozyspotai.com)

## Todos left for auth

- test it on deployment URL, make sure reset time is real
- roll it out to prod with instant rollback

## Todos for UI
- Create pipeline to auto generate Sample photos on main screen using Google image bucket or Amazon S3 storage
- Create a pipeline to auto generate testimonials using AI profile pic (Dreambooth) and ChatGPT/ChatSonic prompts
- Create a cleaner looking NextJS UI 
- Add Public Gallery view
- Give user default option of public view
- Create Pricing page
- Add Microsoft, Facebook, and Apple Login options
- Create TOS documentation
- Create FAQ documentation
- Create About documentation

## Todos for backend
- Simplify the limit feature
- Add DB column for public and private photo sharing for Photo Gallery view
- Add support for Stripe, Patreon, buy me coffee payments

## Feature Ideas
- Create Discord server and bot for generating designs via Discord
- Add ability to email photos or add them to personal Google/iCloud/OneDrive Drive storage


This project generates new designs of your room with AI.

[![Room GPT](./public/screenshot.png)](https://cozyspotai.com)

## How it works

It uses an ML model called [ControlNet](https://github.com/lllyasviel/ControlNet) to generate variations of rooms. This application gives you the ability to upload a photo of any room, which will send it through this ML Model using a Next.js API route, and return your generated room. The ML Model is hosted on [Replicate](https://replicate.com) and [Upload](https://upload.io) is used for image storage.

## Running Locally

### Cloning the repository the local machine.

```bash
git clone https://github.com/sappkevin/roomGPT
```

### Creating a account on Replicate to get an API key.

1. Go to [Replicate](https://replicate.com/) to make an account.
2. Click on your profile picture in the top right corner, and click on "Dashboard".
3. Click on "Account" in the navbar. And, here you can find your API token, copy it.

### Storing the API keys in .env

Create a file in root directory of project with env. And store your API key in it, as shown in the .example.env file.

If you'd also like to do rate limiting, create an account on UpStash, create a Redis database, and populate the two environment variables in `.env` as well. If you don't want to do rate limiting, you don't need to make any changes.

### Installing the dependencies.

```bash
npm install
```

### Running the application.

Then, run the application in the command line and it will be available at `http://localhost:3000`.

```bash
npm run dev
```

## Auth setup

1. Use `openssl rand -base64 32` to generate NEXTAUTH_SECRET
2. Add DB URL and SHADOW DB URL from Neon
3. Create a new project in console.cloud.google.com
4. Click configure consent screen in API credentials page and click external
5. Add an app name, do not upload logo, add authorized domain
6. Publish app
7. Create credentials -> Oauth client ID
8. Run npx prisma db push && prisma migrate dev && prisma generate

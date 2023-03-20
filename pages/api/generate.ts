import { Ratelimit } from "@upstash/ratelimit";
import type { NextApiRequest, NextApiResponse } from "next";
import requestIp from "request-ip";
import redis from "../../utils/redis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export type GenerateResponseData = {
  original: string | null;
  generated: string | null;
  id: string;
};

interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    imageUrl: string;
    theme: string;
    room: string;
  };
}

// Create a new ratelimiter, that allows 3 requests per 24 hours
const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.fixedWindow(100, "1440 m"),
      analytics: true,
    })
  : undefined;

export default async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse<GenerateResponseData | string>
) {
  // Check if user is logged in
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(500).json("Login to upload.");
  }

  // Rate Limiter Code
  if (ratelimit) {
    const identifier = session.user.email;
    const result = await ratelimit.limit(identifier!);
    res.setHeader("X-RateLimit-Limit", result.limit);
    res.setHeader("X-RateLimit-Remaining", result.remaining);

    // Calcualte the remaining time until generations are reset
    const diff = Math.abs(
      new Date(result.reset).getTime() - new Date().getTime()
    );
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor(diff / 1000 / 60) - hours * 60;

    if (!result.success) {
      return res
        .status(429)
        .json(
          `Your generations will renew in ${hours} hours and ${minutes} minutes. Email hassan@hey.com if you have any questions.`
        );
    }
  }

  const { imageUrl, theme, room } = req.body;
  //Decide on which prompt to use based on room type
  let replicatePrompt;
  let replicateMainPrompt;
  let genericprompt = `a [${theme.toLowerCase()}] [${room.toLowerCase()}]`
  
  if (room === "Gaming Room") {
  //  Gaming Room
    replicatePrompt =  "a room for gaming with gaming computers, gaming consoles, and gaming chairs"
    replicateMainPrompt = `Editorial Style [${room.toLowerCase()}] photo, Monochromatic, Crate and Barrel furniture, Cool Neon lighting, home speaker system, Vintage gaming posters on wall, Penthouse, earthy tone painted walls, Evening, Sleek, Contemporary —ar 16:9`
  } 
  else if (theme === "Vintage") {
  //  Vintage Prompt
    replicateMainPrompt = `Editorial Style [${room.toLowerCase()}] photo, Bird's eye, luxury Mid-century modern, [${room.toLowerCase()}], Bar stools, Leather, wood, Wide shot of dining area, Earth tones, Design Within Reach, Natural light, Mid-century home, Morning, Retro, Mid-century modern —ar 16:9`
  } 
  else if (theme === "Minimalist") {
  //  Minimalist Room
    replicateMainPrompt = `Editorial Style [${room.toLowerCase()}] photo, High angle, Minimalist, [${room.toLowerCase()}], Marble, wood, Close-up of food, Neutral tones, Williams-Sonoma, Natural light, Home, Morning, Cozy, Modern —ar 16:9`
  } 
  else if (theme === "Rustic") {
  //  Rustic Room
    replicateMainPrompt = `Editorial Style [${room.toLowerCase()}] photo, Eye level, Rustic, [${room.toLowerCase()}], Farmhouse sink, Stone, wood, Close-up of dish, Earth tones, Le Creuset, Warm light, Country house, Afternoon, Warm, Traditional —ar 16:9`
  } 
  else if (theme === "Industrial") {
  //  Industrial Room
    replicateMainPrompt = `Editorial Style [${room.toLowerCase()}] photo, Low angle, Industrial, [${room.toLowerCase()}], Stainless steel appliances, Concrete, metal, Close-up of cookware, Cool tones, Artificial light, Loft, Evening, Moody, Contemporary —ar 16:9`
  } 
  else if (theme === "Scandinavian") {
    //  Scandinavian Room
      replicateMainPrompt = `Editorial Style [${room.toLowerCase()}] photo, Bird's eye, Scandinavian, [${room.toLowerCase()}], Breakfast nook, White, wood, Wide shot of [${room.toLowerCase()}], Pastel colors, IKEA, Natural light, Apartment, Morning, Bright, Modern —ar 16:9`
    } 
  else if (theme === "Modern") {
  //  Modern Room
    replicateMainPrompt = `Editorial Style [${room.toLowerCase()}] photo, Worm's eye, Modern, [${room.toLowerCase()}], Pendant lights, Glass, metal, Close-up of countertop, Monochromatic, Crate and Barrel, Cool light, Penthouse, Evening, Sleek, Contemporary —ar 16:9`
  }
  else if (theme === "Traditional") {
    //  Professional Room
      replicateMainPrompt = `Editorial Style [${room.toLowerCase()}] photo, Eye level, Traditional, [${room.toLowerCase()}], Range hood, Tile, wood, Close-up of utensils, Warm tones, Natural light, Victorian house, Afternoon, Classic, Classic —ar 16:9`
  }
  else if (theme === "Professional") {
    //  Mid-century Room
      replicateMainPrompt = `Editorial Style [${room.toLowerCase()}] photo, Bird's eye, Mid-century modern, [${room.toLowerCase()}], Bar stools, Leather, wood, Wide shot of dining area, Earth tones, Design Within Reach, Natural light, Mid-century home, Morning, Retro, Mid-century modern —ar 16:9`
  }
  else if (theme === "Bohemian") {
    //  Bohemian Room
      replicateMainPrompt = `Editorial Style [${room.toLowerCase()}] photo, High angle, Bohemian, [${room.toLowerCase()}], Hanging plants, Textile, wood, Wide shot of [${room.toLowerCase()}], Earth tones, Anthropologie, Natural light, Beach house, Morning, Relaxing, Coastal —ar 16:9`
  }
  else if (theme === "Art Deco") {
    //  Industrial Room
      replicateMainPrompt = `Editorial Style [${room.toLowerCase()}] photo, Eye level, luxury, Art Deco, [${room.toLowerCase()}], Chandelier, Brass, marble, Close-up of glassware, Jewel tones, West Elm, Warm light, Art Deco building, Evening, Glamorous, Art Deco —ar 16:9`
  }   
  else if (theme === "Tropical") {
  // Tropical Room
    replicateMainPrompt = `Editorial Style [${room.toLowerCase()}] photo, Low angle, Tropical, [${room.toLowerCase()}], Antique stove, Ceramic, wood, Close-up of pie, Earthy tones, beach paradise, Pastel colors, Magnolia Home, Warm light, Farmhouse, Afternoon, Homey, Traditional —ar 16:9`
  }
  else {
    // Generic 
    replicateMainPrompt = `Editorial Style [${room.toLowerCase()}] photo, luxury, High angle, Modern, [${room.toLowerCase()}], Pendant lights, Glass, metal, Close-up of countertop, Monochromatic, Arhaus furniture collection, Cool light, Penthouse, Evening, Sleek, Contemporary —ar 16:9`
  }
  
  if (!replicatePrompt) {
    replicatePrompt = genericprompt
  }

  if (!replicateMainPrompt) {
    replicateMainPrompt = "best quality, extremely detailed, photo from Pinterest, interior, cinematic photo, ultra-detailed, ultra-realistic, award-winning"
  }
  // POST request to Replicate to start the image restoration generation process
  /*
  let startResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Token " + process.env.REPLICATE_API_KEY,
    },
    body: JSON.stringify({
      version:
        "854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b",
      input: {
        image: imageUrl,
        prompt:
          room === "Gaming Room"
            ? "a room for gaming with gaming computers, gaming consoles, and gaming chairs"
            : `a ${theme.toLowerCase()} ${room.toLowerCase()}`,
        a_prompt:
          "best quality, extremely detailed, photo from Pinterest, interior, cinematic photo, ultra-detailed, ultra-realistic, award-winning",
        n_prompt:
          "longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality",
      },
    }),
  });*/
  // POST request to Replicate to start the image restoration generation process
 let startResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Token " + process.env.REPLICATE_API_KEY,
    },
    body: JSON.stringify({
      version:
        "854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b",
      input: {
        image: imageUrl,
        prompt: replicatePrompt,
        a_prompt: replicateMainPrompt,
        n_prompt:
          "longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality",
      },
    }),
  });

  let jsonStartResponse = await startResponse.json();

  let endpointUrl = jsonStartResponse.urls.get;
  const originalImage = jsonStartResponse.input.image;
  const roomId = jsonStartResponse.id;

  // GET request to get the status of the image restoration process & return the result when it's ready
  /*
  while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await sleep(1000);
      const response = await fetch("/api/predictions/" + prediction.id);
      prediction = await response.json();
      if (response.status !== 200) {
        setError(prediction.detail);
        return;
      }
      console.log({prediction})
      setPrediction(prediction);
    }
  };*/
  //
  let generatedImage: string | null = null;
  while (
    jsonFinalResponse.status !== "succeeded" &&
    jsonFinalResponse.status !== "failed"
  ) {
    // Loop in 1s intervals until the alt text is ready
    console.log("polling for result...");
    await sleep(1000);
    let finalResponse = await fetch(endpointUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token " + process.env.REPLICATE_API_KEY,
      },
    });
    let jsonFinalResponse = await finalResponse.json();

    if (finalResponse.status === 200) {
      generatedImage = jsonFinalResponse.output[1] as string;
    } else if (finalResponse.status !== 200 ) {
      break;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  res.status(200).json(
    generatedImage
      ? {
          original: originalImage,
          generated: generatedImage,
          id: roomId,
        }
      : "Failed to restore image"
  );
}

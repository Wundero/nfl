import { z } from "zod";
import { nullableInt } from "./helpers";

export const officialsSchema = z.object({
  game_id: z.string().nullish().describe("The ID of the game this official worked"),
  game_key: z
    .string()
    .nullish()
    .describe(
      "The game key (nflverse game identifier, e.g. '2023_01_DET_KC') this official worked",
    ),
  official_name: z.string().nullish().describe("The name of the official"),
  position: z
    .string()
    .nullish()
    .describe(
      "The official's position on the crew (e.g. 'Referee', 'Umpire', 'Field Judge', 'Replay Official', 'Alternate')",
    ),
  jersey_number: z.coerce.string().describe("The jersey number worn by the official"),
  official_id: z.string().nullish().describe("The unique ID of the official"),
  season: nullableInt.describe("The season (year) of the game"),
  season_type: z.enum(["REG", "WC", "DIV", "CON", "SB", "POST"]).describe(
    `The type of game. Mapping:
REG=Regular season
WC=Wild Card round
DIV=Divisional round
CON=Conference championship
SB=Super Bowl
POST=Postseason (unspecified round)`,
  ),
  week: nullableInt.describe("The week of the game"),
});

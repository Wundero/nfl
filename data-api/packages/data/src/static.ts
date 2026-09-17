// TODO: this is not ideal, since teams can be added over time.

export const NFL_CONFERENCES = ["NFC", "AFC"] as const;

export type NFLConference = (typeof NFL_CONFERENCES)[number];

export const NFL_DIVISIONS = [
  "NFC North",
  "NFC South",
  "NFC East",
  "NFC West",
  "AFC North",
  "AFC South",
  "AFC East",
  "AFC West",
] as const;

export type NFLDivision = (typeof NFL_DIVISIONS)[number];

export const NFL_DIVISION_MAP = {
  "NFC East": "NFC",
  "NFC North": "NFC",
  "NFC South": "NFC",
  "NFC West": "NFC",
  "AFC East": "AFC",
  "AFC North": "AFC",
  "AFC South": "AFC",
  "AFC West": "AFC",
} as const satisfies Record<NFLDivision, NFLConference>;

export const NFL_CONFERENCE_MAP = {
  AFC: ["AFC East", "AFC North", "AFC South", "AFC West"],
  NFC: ["NFC East", "NFC North", "NFC South", "NFC West"],
} as const satisfies Record<NFLConference, NFLDivision[]>;

export const LEAGUE_LOGOS = {
  NFL: "https://raw.githubusercontent.com/nflverse/nflverse-pbp/master/NFL.png",
  NFC: "https://github.com/nflverse/nflverse-pbp/raw/master/NFC.png",
  AFC: "https://github.com/nflverse/nflverse-pbp/raw/master/AFC.png",
};

interface NFCTeam {
  conference: "NFC";
  division: (typeof NFL_CONFERENCE_MAP)["NFC"][number];
}

interface AFCTeam {
  conference: "AFC";
  division: (typeof NFL_CONFERENCE_MAP)["AFC"][number];
}

type HexColor = `#${string}`;

interface TeamBase {
  id: string;
  abbr: string;
  name: string;
  nicknames: string[];
  colors: {
    primary: HexColor;
    secondary: HexColor;
    tertiary?: HexColor;
    quaternary?: HexColor;
  };
  images: {
    logo: string;
    wordmark: string;
    extras: string[];
  };
  externalIds: {
    nflverse: number;
  };
}

export type NFLTeam = TeamBase & (AFCTeam | NFCTeam);

export const NFL_TEAMS = [
  {
    id: "arizona-cardinals",
    name: "Arizona Cardinals",
    abbr: "ARI",
    colors: {
      primary: "#97233f",
      secondary: "#000000",
      tertiary: "#ffb612",
      quaternary: "#a5acaf",
    },
    conference: "NFC",
    division: "NFC West",
    externalIds: {
      nflverse: 3800,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/ARI.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/ARI.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/ari.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/7/72/Arizona_Cardinals_logo.svg/179px-Arizona_Cardinals_logo.svg.png",
      ],
    },
    nicknames: ["Cardinals"],
  },
  {
    id: "atlanta-falcons",
    name: "Atlanta Falcons",
    abbr: "ATL",
    colors: {
      primary: "#A71930",
      secondary: "#000000",
      tertiary: "#a5acaf",
      quaternary: "#a30d2d",
    },
    conference: "NFC",
    division: "NFC South",
    externalIds: {
      nflverse: 200,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/ATL.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/ATL.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/atl.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/c/c5/Atlanta_Falcons_logo.svg/192px-Atlanta_Falcons_logo.svg.png",
      ],
    },
    nicknames: ["Falcons"],
  },
  {
    id: "baltimore-ravens",
    name: "Baltimore Ravens",
    abbr: "BAL",
    colors: {
      primary: "#241773",
      secondary: "#9E7C0C",
      tertiary: "#9e7c0c",
      quaternary: "#c60c30",
    },
    conference: "AFC",
    division: "AFC North",
    externalIds: {
      nflverse: 325,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/BAL.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/BAL.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/bal.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/1/16/Baltimore_Ravens_logo.svg/193px-Baltimore_Ravens_logo.svg.png",
      ],
    },
    nicknames: ["Ravens"],
  },
  {
    id: "buffalo-bills",
    name: "Buffalo Bills",
    abbr: "BUF",
    colors: {
      primary: "#00338D",
      secondary: "#C60C30",
      tertiary: "#0c2e82",
      quaternary: "#d50a0a",
    },
    conference: "AFC",
    division: "AFC East",
    externalIds: {
      nflverse: 610,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/BUF.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/BUF.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/buf.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/7/77/Buffalo_Bills_logo.svg/189px-Buffalo_Bills_logo.svg.png",
      ],
    },
    nicknames: ["Bills"],
  },
  {
    id: "carolina-panthers",
    name: "Carolina Panthers",
    abbr: "CAR",
    colors: {
      primary: "#0085CA",
      secondary: "#000000",
      tertiary: "#bfc0bf",
      quaternary: "#0085ca",
    },
    conference: "NFC",
    division: "NFC South",
    externalIds: {
      nflverse: 750,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/CAR.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/CAR.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500-dark/car.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/1/1c/Carolina_Panthers_logo.svg/100px-Carolina_Panthers_logo.svg.png",
      ],
    },
    nicknames: ["Panthers"],
  },
  {
    id: "chicago-bears",
    name: "Chicago Bears",
    abbr: "CHI",
    colors: {
      primary: "#0B162A",
      secondary: "#E64100",
      tertiary: "#0b162a",
      quaternary: "#E64100",
    },
    conference: "NFC",
    division: "NFC North",
    externalIds: {
      nflverse: 810,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/CHI.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/CHI.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/chi.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Chicago_Bears_logo.svg/100px-Chicago_Bears_logo.svg.png",
      ],
    },
    nicknames: ["Bears"],
  },
  {
    id: "cincinnati-bengals",
    name: "Cincinnati Bengals",
    abbr: "CIN",
    colors: {
      primary: "#FB4F14",
      secondary: "#000000",
      tertiary: "#000000",
      quaternary: "#d32f1e",
    },
    conference: "AFC",
    division: "AFC North",
    externalIds: {
      nflverse: 920,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/CIN.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/CIN.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/cin.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Cincinnati_Bengals_logo.svg/100px-Cincinnati_Bengals_logo.svg.png",
      ],
    },
    nicknames: ["Bengals"],
  },
  {
    id: "cleveland-browns",
    name: "Cleveland Browns",
    abbr: "CLE",
    colors: {
      primary: "#FF3C00",
      secondary: "#311D00",
      tertiary: "#a5acaf",
      quaternary: "#d32f1e",
    },
    conference: "AFC",
    division: "AFC North",
    externalIds: {
      nflverse: 1050,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/CLE.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/CLE.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/cle.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/d/d9/Cleveland_Browns_logo.svg/100px-Cleveland_Browns_logo.svg.png",
      ],
    },
    nicknames: ["Browns"],
  },
  {
    id: "dallas-cowboys",
    name: "Dallas Cowboys",
    abbr: "DAL",
    colors: {
      primary: "#002244",
      secondary: "#B0B7BC",
      tertiary: "#acc0c6",
      quaternary: "#a5acaf",
    },
    conference: "NFC",
    division: "NFC East",
    externalIds: {
      nflverse: 1200,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/DAL.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/DAL.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/dal.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Dallas_Cowboys.svg/100px-Dallas_Cowboys.svg.png",
      ],
    },
    nicknames: ["Cowboys"],
  },
  {
    id: "denver-broncos",
    name: "Denver Broncos",
    abbr: "DEN",
    colors: {
      primary: "#002244",
      secondary: "#FB4F14",
      tertiary: "#00234c",
      quaternary: "#ff5200",
    },
    conference: "AFC",
    division: "AFC West",
    externalIds: {
      nflverse: 1400,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/DEN.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/DEN.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/den.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/4/44/Denver_Broncos_logo.svg/100px-Denver_Broncos_logo.svg.png",
      ],
    },
    nicknames: ["Broncos"],
  },
  {
    id: "detroit-lions",
    name: "Detroit Lions",
    abbr: "DET",
    colors: {
      primary: "#0076B6",
      secondary: "#B0B7BC",
      tertiary: "#000000",
      quaternary: "#004e89",
    },
    conference: "NFC",
    division: "NFC North",
    externalIds: {
      nflverse: 1540,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/DET.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/DET.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/det.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/7/71/Detroit_Lions_logo.svg/100px-Detroit_Lions_logo.svg.png",
      ],
    },
    nicknames: ["Lions"],
  },
  {
    id: "green-bay-packers",
    name: "Green Bay Packers",
    abbr: "GB",
    colors: {
      primary: "#203731",
      secondary: "#FFB612",
      tertiary: "#1c2d25",
      quaternary: "#eead1e",
    },
    conference: "NFC",
    division: "NFC North",
    externalIds: {
      nflverse: 1800,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/GB.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/GB.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/gb.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Green_Bay_Packers_logo.svg/100px-Green_Bay_Packers_logo.svg.png",
      ],
    },
    nicknames: ["Packers"],
  },
  {
    id: "houston-texans",
    name: "Houston Texans",
    abbr: "HOU",
    colors: {
      primary: "#03202F",
      secondary: "#A71930",
      tertiary: "#00071c",
      quaternary: "#a30d2d",
    },
    conference: "AFC",
    division: "AFC South",
    externalIds: {
      nflverse: 2120,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/HOU.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/HOU.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/hou.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/2/28/Houston_Texans_logo.svg/100px-Houston_Texans_logo.svg.png",
      ],
    },
    nicknames: ["Texans"],
  },
  {
    id: "indianapolis-colts",
    name: "Indianapolis Colts",
    abbr: "IND",
    colors: {
      primary: "#002C5F",
      secondary: "#a5acaf",
      tertiary: "#013369",
      quaternary: "#9ba1a2",
    },
    conference: "AFC",
    division: "AFC South",
    externalIds: {
      nflverse: 2200,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/IND.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/IND.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/ind.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Indianapolis_Colts_logo.svg/100px-Indianapolis_Colts_logo.svg.png",
      ],
    },
    nicknames: ["Colts"],
  },
  {
    id: "jacksonville-jaguars",
    name: "Jacksonville Jaguars",
    abbr: "JAX",
    colors: {
      primary: "#006778",
      secondary: "#000000",
      tertiary: "#9f792c",
      quaternary: "#d7a22a",
    },
    conference: "AFC",
    division: "AFC South",
    externalIds: {
      nflverse: 2250,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/JAX.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/JAX.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/jax.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/7/74/Jacksonville_Jaguars_logo.svg/100px-Jacksonville_Jaguars_logo.svg.png",
      ],
    },
    nicknames: ["Jaguars"],
  },
  {
    id: "kansas-city-chiefs",
    name: "Kansas City Chiefs",
    abbr: "KC",
    colors: {
      primary: "#E31837",
      secondary: "#FFB612",
      tertiary: "#000000",
      quaternary: "#e31837",
    },
    conference: "AFC",
    division: "AFC West",
    externalIds: {
      nflverse: 2310,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/KC.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/KC.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/e/e1/Kansas_City_Chiefs_logo.svg/100px-Kansas_City_Chiefs_logo.svg.png",
      ],
    },
    nicknames: ["Chiefs"],
  },
  {
    id: "los-angeles-rams",
    name: "Los Angeles Rams",
    abbr: "LA",
    colors: {
      primary: "#003594",
      secondary: "#FFD100",
      tertiary: "#001532",
      quaternary: "#af925d",
    },
    conference: "NFC",
    division: "NFC West",
    externalIds: {
      nflverse: 2510,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/LA.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/LA.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/lar.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/8/8a/Los_Angeles_Rams_logo.svg/100px-Los_Angeles_Rams_logo.svg.png",
      ],
    },
    nicknames: ["Rams"],
  },
  {
    id: "los-angeles-chargers",
    name: "Los Angeles Chargers",
    abbr: "LAC",
    colors: {
      primary: "#007BC7",
      secondary: "#ffc20e",
      tertiary: "#ffb612",
      quaternary: "#001532",
    },
    conference: "AFC",
    division: "AFC West",
    externalIds: {
      nflverse: 4400,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/LAC.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/LAC.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/lac.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/7/72/NFL_Chargers_logo.svg/100px-NFL_Chargers_logo.svg.png",
      ],
    },
    nicknames: ["Chargers"],
  },
  {
    id: "los-angeles-rams",
    name: "Los Angeles Rams",
    abbr: "LAR",
    colors: {
      primary: "#003594",
      secondary: "#FFD100",
      tertiary: "#001532",
      quaternary: "#af925d",
    },
    conference: "NFC",
    division: "NFC West",
    externalIds: {
      nflverse: 2510,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/LAR.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/LAR.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/lar.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/8/8a/Los_Angeles_Rams_logo.svg/100px-Los_Angeles_Rams_logo.svg.png",
      ],
    },
    nicknames: ["Rams"],
  },
  {
    id: "las-vegas-raiders",
    name: "Las Vegas Raiders",
    abbr: "LV",
    colors: {
      primary: "#000000",
      secondary: "#A5ACAF",
      tertiary: "#a6aeb0",
      quaternary: "#000000",
    },
    conference: "AFC",
    division: "AFC West",
    externalIds: {
      nflverse: 2520,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/LV.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/LV.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/lv.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/4/48/Las_Vegas_Raiders_logo.svg/100px-Las_Vegas_Raiders_logo.svg.png",
      ],
    },
    nicknames: ["Raiders"],
  },
  {
    id: "miami-dolphins",
    name: "Miami Dolphins",
    abbr: "MIA",
    colors: {
      primary: "#008E97",
      secondary: "#F58220",
      tertiary: "#005778",
      quaternary: "#008e97",
    },
    conference: "AFC",
    division: "AFC East",
    externalIds: {
      nflverse: 2700,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/MIA.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/MIA.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/mia.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/3/37/Miami_Dolphins_logo.svg/100px-Miami_Dolphins_logo.svg.png",
      ],
    },
    nicknames: ["Dolphins"],
  },
  {
    id: "minnesota-vikings",
    name: "Minnesota Vikings",
    abbr: "MIN",
    colors: {
      primary: "#4F2683",
      secondary: "#FFC62F",
      tertiary: "#e9bf9b",
      quaternary: "#000000",
    },
    conference: "NFC",
    division: "NFC North",
    externalIds: {
      nflverse: 3000,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/MIN.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/MIN.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/min.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/4/48/Minnesota_Vikings_logo.svg/98px-Minnesota_Vikings_logo.svg.png",
      ],
    },
    nicknames: ["Vikings"],
  },
  {
    id: "new-england-patriots",
    name: "New England Patriots",
    abbr: "NE",
    colors: {
      primary: "#002244",
      secondary: "#C60C30",
      tertiary: "#b0b7bc",
      quaternary: "#001532",
    },
    conference: "AFC",
    division: "AFC East",
    externalIds: {
      nflverse: 3200,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/NE.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/NE.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/ne.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/New_England_Patriots_logo.svg/100px-New_England_Patriots_logo.svg.png",
      ],
    },
    nicknames: ["Patriots"],
  },
  {
    id: "new-orleans-saints",
    name: "New Orleans Saints",
    abbr: "NO",
    colors: {
      primary: "#D3BC8D",
      secondary: "#000000",
      tertiary: "#9f8958",
      quaternary: "#000000",
    },
    conference: "NFC",
    division: "NFC South",
    externalIds: {
      nflverse: 3300,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/NO.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/NO.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/no.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/New_Orleans_Saints_logo.svg/98px-New_Orleans_Saints_logo.svg.png",
      ],
    },
    nicknames: ["Saints"],
  },
  {
    id: "new-york-giants",
    name: "New York Giants",
    abbr: "NYG",
    colors: {
      primary: "#0B2265",
      secondary: "#A71930",
      tertiary: "#a5acaf",
      quaternary: "#012352",
    },
    conference: "NFC",
    division: "NFC East",
    externalIds: {
      nflverse: 3410,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/NYG.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/NYG.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/New_York_Giants_logo.svg/100px-New_York_Giants_logo.svg.png",
      ],
    },
    nicknames: ["Giants"],
  },
  {
    id: "new-york-jets",
    name: "New York Jets",
    abbr: "NYJ",
    colors: {
      primary: "#003F2D",
      secondary: "#000000",
    },
    conference: "AFC",
    division: "AFC East",
    externalIds: {
      nflverse: 3430,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/NYJ.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/NYJ.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/New_York_Jets_logo.svg/100px-New_York_Jets_logo.svg.png",
      ],
    },
    nicknames: ["Jets"],
  },
  {
    id: "oakland-raiders",
    name: "Oakland Raiders",
    abbr: "OAK",
    colors: {
      primary: "#000000",
      secondary: "#A5ACAF",
      tertiary: "#a6aeb0",
      quaternary: "#000000",
    },
    conference: "AFC",
    division: "AFC West",
    externalIds: {
      nflverse: 2520,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/OAK.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/OAK.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/lv.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/4/48/Las_Vegas_Raiders_logo.svg/100px-Las_Vegas_Raiders_logo.svg.png",
      ],
    },
    nicknames: ["Raiders"],
  },
  {
    id: "philadelphia-eagles",
    name: "Philadelphia Eagles",
    abbr: "PHI",
    colors: {
      primary: "#004C54",
      secondary: "#A5ACAF",
      tertiary: "#acc0c6",
      quaternary: "#000000",
    },
    conference: "NFC",
    division: "NFC East",
    externalIds: {
      nflverse: 3700,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/PHI.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/PHI.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/phi.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/Philadelphia_Eagles_logo.svg/100px-Philadelphia_Eagles_logo.svg.png",
      ],
    },
    nicknames: ["Eagles"],
  },
  {
    id: "pittsburgh-steelers",
    name: "Pittsburgh Steelers",
    abbr: "PIT",
    colors: {
      primary: "#000000",
      secondary: "#FFB612",
      tertiary: "#c60c30",
      quaternary: "#00539b",
    },
    conference: "AFC",
    division: "AFC North",
    externalIds: {
      nflverse: 3900,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/PIT.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/PIT.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/pit.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Pittsburgh_Steelers_logo.svg/100px-Pittsburgh_Steelers_logo.svg.png",
      ],
    },
    nicknames: ["Steelers"],
  },
  {
    id: "san-diego-chargers",
    name: "San Diego Chargers",
    abbr: "SD",
    colors: {
      primary: "#007BC7",
      secondary: "#ffc20e",
      tertiary: "#ffb612",
      quaternary: "#001532",
    },
    conference: "AFC",
    division: "AFC West",
    externalIds: {
      nflverse: 4400,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/SD.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/SD.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/lac.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/7/72/NFL_Chargers_logo.svg/100px-NFL_Chargers_logo.svg.png",
      ],
    },
    nicknames: ["Chargers"],
  },
  {
    id: "seattle-seahawks",
    name: "Seattle Seahawks",
    abbr: "SEA",
    colors: {
      primary: "#002244",
      secondary: "#69be28",
      tertiary: "#a5acaf",
      quaternary: "#001532",
    },
    conference: "NFC",
    division: "NFC West",
    externalIds: {
      nflverse: 4600,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/SEA.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/SEA.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/sea.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/Seattle_Seahawks_logo.svg/100px-Seattle_Seahawks_logo.svg.png",
      ],
    },
    nicknames: ["Seahawks"],
  },
  {
    id: "san-francisco-49ers",
    name: "San Francisco 49ers",
    abbr: "SF",
    colors: {
      primary: "#AA0000",
      secondary: "#B3995D",
      tertiary: "#000000",
      quaternary: "#a5acaf",
    },
    conference: "NFC",
    division: "NFC West",
    externalIds: {
      nflverse: 4500,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/SF.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/SF.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/sf.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/San_Francisco_49ers_logo.svg/100px-San_Francisco_49ers_logo.svg.png",
      ],
    },
    nicknames: ["49ers"],
  },
  {
    id: "st.-louis-rams",
    name: "St. Louis Rams",
    abbr: "STL",
    colors: {
      primary: "#003594",
      secondary: "#FFD100",
      tertiary: "#001532",
      quaternary: "#af925d",
    },
    conference: "NFC",
    division: "NFC West",
    externalIds: {
      nflverse: 2510,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/STL.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/STL.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/lar.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/8/8a/Los_Angeles_Rams_logo.svg/100px-Los_Angeles_Rams_logo.svg.png",
      ],
    },
    nicknames: ["Rams"],
  },
  {
    id: "tampa-bay-buccaneers",
    name: "Tampa Bay Buccaneers",
    abbr: "TB",
    colors: {
      primary: "#A71930",
      secondary: "#322F2B",
      tertiary: "#000000",
      quaternary: "#ff7900",
    },
    conference: "NFC",
    division: "NFC South",
    externalIds: {
      nflverse: 4900,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/TB.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/TB.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/tb.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Tampa_Bay_Buccaneers_logo.svg/100px-Tampa_Bay_Buccaneers_logo.svg.png",
      ],
    },
    nicknames: ["Buccaneers"],
  },
  {
    id: "tennessee-titans",
    name: "Tennessee Titans",
    abbr: "TEN",
    colors: {
      primary: "#4495D2",
      secondary: "#D50A0A",
    },
    conference: "AFC",
    division: "AFC South",
    externalIds: {
      nflverse: 2100,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/TEN.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/TEN.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/ten.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Tennessee_Titans_Logo_2026.svg/250px-Tennessee_Titans_Logo_2026.svg.png",
      ],
    },
    nicknames: ["Titans"],
  },
  {
    id: "washington-commanders",
    name: "Washington Commanders",
    abbr: "WAS",
    colors: {
      primary: "#5A1414",
      secondary: "#FFB612",
      tertiary: "#000000",
      quaternary: "#5b2b2f",
    },
    conference: "NFC",
    division: "NFC East",
    externalIds: {
      nflverse: 5110,
    },
    images: {
      logo: "https://github.com/nflverse/nflverse-pbp/raw/master/squared_logos/WAS.png",
      wordmark: "https://github.com/nflverse/nflverse-pbp/raw/master/wordmarks/WAS.png",
      extras: [
        "https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Washington_commanders.svg/100px-Washington_commanders.svg.png",
      ],
    },
    nicknames: ["Commanders"],
  },
] as const satisfies NFLTeam[];

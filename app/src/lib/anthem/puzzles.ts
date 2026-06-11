/* ANTHEM puzzle data — ported verbatim from games/anthem/index.html (the
   behavioral reference). All 48 qualified nations of WC2026, ordered by group (A–L).
   audio: exact archive.org path or null if no public-domain recording exists yet —
   null-audio nations stay guessable but are excluded from the daily/practice
   rotation (see POOL in daily.ts).
   melody: optional hand-transcribed synth fallback (England/USA/France/Germany/Japan). */

export type MelodyNote = [name: string, beats: number]

export interface Puzzle {
  name: string
  flag: string
  cc: string
  colors: string[]
  aliases: string[]
  audio: string | null
  verdict: string
  hints: string[]
  melody?: MelodyNote[]
}

export const PUZZLES: Puzzle[] = [
  /* ---- Group A ---- */
  { name:"Mexico", flag:"🇲🇽", cc:"mx", colors:["#006847","#CE1126"], aliases:["mexico","el tri"], audio:"Current/Mexico.mp3",
    verdict:"“Himno Nacional Mexicano.” Drums, brass, drama.",
    hints:["CONCACAF (N. & C. America)","Green, white & red with an eagle","Group A","Hosts the opening match at the Azteca","Starts with M"] },
  { name:"South Africa", flag:"🇿🇦", cc:"za", colors:["#007749","#FFB81C"], aliases:["south africa","bafana bafana","rsa"], audio:"Current/South Africa.mp3",
    verdict:"“Nkosi Sikelel' iAfrika.” Two songs, five languages, one anthem.",
    hints:["CAF (Africa)","Green, gold, black, white, red & blue","Group A","Its anthem is sung in five languages","Starts with S"] },
  { name:"South Korea", flag:"🇰🇷", cc:"kr", colors:["#CD2E3A","#0047A0"], aliases:["south korea","korea","korea republic","republic of korea"], audio:"Current/Korea, South.mp3",
    verdict:"“Aegukga.” The Song of Patriotism.",
    hints:["AFC (Asia)","White with a red & blue taegeuk","Group A","Semi-finalists on home soil in 2002","Starts with S"] },
  { name:"Czechia", flag:"🇨🇿", cc:"cz", colors:["#D7141A","#11457E"], aliases:["czechia","czech republic","czech"], audio:"Current/Czech Republic.mp3",
    verdict:"“Kde domov můj?” — literally ‘Where is my home?’",
    hints:["UEFA (Europe)","White, red & blue","Group A","Its anthem's title is a question","Starts with C"] },
  /* ---- Group B ---- */
  { name:"Canada", flag:"🇨🇦", cc:"ca", colors:["#D80621","#ffffff"], aliases:["canada","les rouges","canucks"], audio:"Current/Canada.mp3",
    verdict:"“O Canada.” You knew this one, eh?",
    hints:["CONCACAF (N. & C. America)","Red & white maple leaf","Group B","Co-host playing home World Cup matches for the first time","Starts with C"] },
  { name:"Bosnia and Herzegovina", flag:"🇧🇦", cc:"ba", colors:["#002395","#FECB00"], aliases:["bosnia","bosnia and herzegovina","bosnia-herzegovina","bih"], audio:"Current/Bosnia-Herzegovina.mp3",
    verdict:"“Intermeco.” No official lyrics — just the tune.",
    hints:["UEFA (Europe)","Blue & yellow with stars","Group B","Its anthem has no official lyrics","Starts with B"] },
  { name:"Qatar", flag:"🇶🇦", cc:"qa", colors:["#8A1538","#ffffff"], aliases:["qatar"], audio:"Current/Qatar.mp3",
    verdict:"“As-Salam al-Amiri.” The Peace to the Emir.",
    hints:["AFC (Asia)","Maroon & white serrated","Group B","Hosted the previous World Cup","Starts with Q"] },
  { name:"Switzerland", flag:"🇨🇭", cc:"ch", colors:["#DA291C","#ffffff"], aliases:["switzerland","swiss","la nati"], audio:"Current/Switzerland.mp3",
    verdict:"“The Swiss Psalm.” Alpine and solemn.",
    hints:["UEFA (Europe)","Red with a white cross","Group B","One of only two square national flags","Starts with S"] },
  /* ---- Group C ---- */
  { name:"Brazil", flag:"🇧🇷", cc:"br", colors:["#009739","#FEDD00"], aliases:["brazil","brasil","selecao","seleção"], audio:"Current/Brazil.mp3",
    verdict:"“Hino Nacional Brasileiro.” Faster than their wingers.",
    hints:["CONMEBOL (S. America)","Green & yellow with a blue globe","Group C","Record five-time world champions","Starts with B"] },
  { name:"Morocco", flag:"🇲🇦", cc:"ma", colors:["#C1272D","#006233"], aliases:["morocco","atlas lions"], audio:"Current/Morocco.mp3",
    verdict:"“An-Nashid ash-Sharif.” The Cherifian Anthem.",
    hints:["CAF (Africa)","Red with a green star","Group C","First African team to reach a World Cup semi-final","Starts with M"] },
  { name:"Haiti", flag:"🇭🇹", cc:"ht", colors:["#00209F","#D21034"], aliases:["haiti"], audio:"Current/Haiti.mp3",
    verdict:"“La Dessalinienne.” Named for a revolutionary.",
    hints:["CONCACAF (N. & C. America)","Blue & red with a palm-tree crest","Group C","First World Cup since 1974","Starts with H"] },
  { name:"Scotland", flag:"🏴󠁧󠁢󠁳󠁣󠁴󠁿", cc:"gb-sct", colors:["#005EB8","#ffffff"], aliases:["scotland","tartan army"], audio:null,
    verdict:"“Flower of Scotland.” The Hampden roar.",
    hints:["UEFA (Europe)","Blue with a white saltire","Group C","First World Cup since 1998","Starts with S"] },
  /* ---- Group D ---- */
  { name:"United States", flag:"🇺🇸", cc:"us", colors:["#B22234","#3C3B6E"], aliases:["usa","united states","united states of america","america","us"], audio:"Current/United States.mp3",
    verdict:"“The Star-Spangled Banner.” Host nation.",
    hints:["CONCACAF (N. & C. America)","Red, white & blue","Group D","Co-host famous for the anthem's impossible high note","Starts with U"],
    melody:[["G4",1.5],["E4",0.5],["C4",1],["E4",1],["G4",1],["C5",2],["E5",1.5],["D5",0.5],["C5",1],["B4",1],["A4",1],["B4",1],["C5",2]] },
  { name:"Paraguay", flag:"🇵🇾", cc:"py", colors:["#D52B1E","#0038A8"], aliases:["paraguay","la albirroja"], audio:"Removed/Paraguay (2000).mp3",
    verdict:"“Paraguayos, República o Muerte.” Republic or death.",
    hints:["CONMEBOL (S. America)","Red, white & blue","Group D","Back after missing three straight World Cups","Starts with P"] },
  { name:"Australia", flag:"🇦🇺", cc:"au", colors:["#00843D","#FFCD00"], aliases:["australia","socceroos","aussies"], audio:"Current/Australia (Complete).mp3",
    verdict:"“Advance Australia Fair.”",
    hints:["AFC (Asia)","Southern Cross on blue (but they play in green & gold)","Group D","A whole continent playing in the Asian confederation","Starts with A"] },
  { name:"Türkiye", flag:"🇹🇷", cc:"tr", colors:["#E30A17","#ffffff"], aliases:["turkiye","türkiye","turkey"], audio:"Current/Turkey.mp3",
    verdict:"“İstiklal Marşı.” The Independence March.",
    hints:["UEFA (Europe)","Red with a star & crescent","Group D","Its anthem lyrics were chosen by national competition in 1921","Starts with T"] },
  /* ---- Group E ---- */
  { name:"Germany", flag:"🇩🇪", cc:"de", colors:["#DD0000","#FFCE00"], aliases:["germany","deutschland"], audio:"Current/Germany.mp3",
    verdict:"“Deutschlandlied,” melody by Haydn.",
    hints:["UEFA (Europe)","Black, red & gold","Group E","Melody composed by Joseph Haydn","Starts with G"],
    melody:[["G4",1],["A4",1],["G4",1],["F4",1],["E4",1],["F4",1],["G4",2],["D4",1],["E4",1],["F4",1],["G4",1],["A4",1],["G4",1],["F4",1],["G4",2]] },
  { name:"Curaçao", flag:"🇨🇼", cc:"cw", colors:["#002B7F","#F9E814"], aliases:["curacao","curaçao"], audio:null,
    verdict:"“Himno di Kòrsou.” Sung in Papiamentu.",
    hints:["CONCACAF (N. & C. America)","Blue & yellow with two stars","Group E","Smallest nation ever to reach a World Cup","Starts with C"] },
  { name:"Ivory Coast", flag:"🇨🇮", cc:"ci", colors:["#FF8200","#009A44"], aliases:["ivory coast","cote d'ivoire","côte d'ivoire","les elephants"], audio:"Current/Cote d'Ivoire (Ivory Coast).mp3",
    verdict:"“L'Abidjanaise.” Song of Abidjan.",
    hints:["CAF (Africa)","Orange, white & green","Group E","Its anthem is named after its biggest city","Starts with I"] },
  { name:"Ecuador", flag:"🇪🇨", cc:"ec", colors:["#FFDD00","#0072CE"], aliases:["ecuador","la tri"], audio:"Current/Ecuador.mp3",
    verdict:"“Salve, Oh Patria.” We salute you, homeland.",
    hints:["CONMEBOL (S. America)","Yellow, blue & red with a crest","Group E","Named after the line that splits the planet","Starts with E"] },
  /* ---- Group F ---- */
  { name:"Netherlands", flag:"🇳🇱", cc:"nl", colors:["#AE1C28","#21468B"], aliases:["netherlands","holland","oranje","dutch"], audio:"Current/Netherlands.mp3",
    verdict:"“Wilhelmus.” The oldest national anthem of them all.",
    hints:["UEFA (Europe)","Red, white & blue (but they play in orange)","Group F","Its anthem melody is the world's oldest","Starts with N"] },
  { name:"Japan", flag:"🇯🇵", cc:"jp", colors:["#BC002D","#ffffff"], aliases:["japan","nippon"], audio:"Current/Japan.mp3",
    verdict:"“Kimigayo.” The short, solemn one.",
    hints:["AFC (Asia)","Red disc on white","Group F","One of the world's shortest anthems","Starts with J"],
    melody:[["D4",2],["E4",1],["F#4",1],["E4",1],["D4",1],["B3",2],["D4",1],["E4",1],["F#4",1],["E4",1],["D4",2]] },
  { name:"Sweden", flag:"🇸🇪", cc:"se", colors:["#006AA7","#FECC02"], aliases:["sweden","blagult","blågult"], audio:"Current/Sweden.mp3",
    verdict:"“Du gamla, du fria.” Thou ancient, thou free.",
    hints:["UEFA (Europe)","Blue with a yellow cross","Group F","Its anthem was never officially adopted by law","Starts with S"] },
  { name:"Tunisia", flag:"🇹🇳", cc:"tn", colors:["#E70013","#ffffff"], aliases:["tunisia","eagles of carthage"], audio:"Current/Tunisia.mp3",
    verdict:"“Humat al-Hima.” Defenders of the Homeland.",
    hints:["CAF (Africa)","Red with a star & crescent in a white disc","Group F","Its anthem includes verses by poet Aboul-Qacem Echebbi","Starts with T"] },
  /* ---- Group G ---- */
  { name:"Belgium", flag:"🇧🇪", cc:"be", colors:["#FDDA24","#EF3340"], aliases:["belgium","red devils","belgie","belgique"], audio:"Current/Belgium.mp3",
    verdict:"“La Brabançonne.” One anthem, three languages.",
    hints:["UEFA (Europe)","Black, yellow & red","Group G","Its anthem has official lyrics in three languages","Starts with B"] },
  { name:"Egypt", flag:"🇪🇬", cc:"eg", colors:["#CE1126","#000000"], aliases:["egypt","pharaohs"], audio:"Current/Egypt.mp3",
    verdict:"“Bilady, Bilady, Bilady.” My homeland, three times over.",
    hints:["CAF (Africa)","Red, white & black with a golden eagle","Group G","Its anthem title is one word, three times","Starts with E"] },
  { name:"Iran", flag:"🇮🇷", cc:"ir", colors:["#239F40","#DA0000"], aliases:["iran","team melli","persia"], audio:"Removed/Iran (2000).mp3",
    verdict:"“Sorud-e Melli.” The national hymn.",
    hints:["AFC (Asia)","Green, white & red","Group G","Its current anthem was adopted in 1990","Starts with I"] },
  { name:"New Zealand", flag:"🇳🇿", cc:"nz", colors:["#00247D","#CC142B"], aliases:["new zealand","nz","all whites","kiwis"], audio:"Current/New Zealand (God Defend New Zealand).mp3",
    verdict:"“God Defend New Zealand.” Sung in Māori, then English.",
    hints:["OFC (Oceania)","Blue with red Southern Cross stars","Group G","The only team from its confederation","Starts with N"] },
  /* ---- Group H ---- */
  { name:"Spain", flag:"🇪🇸", cc:"es", colors:["#AA151B","#F1BF00"], aliases:["spain","espana","españa","la roja"], audio:"Current/Spain (Complete).mp3",
    verdict:"“Marcha Real.” No lyrics — just hum along.",
    hints:["UEFA (Europe)","Red & gold","Group H","One of the few anthems with no official words","Starts with S"] },
  { name:"Cape Verde", flag:"🇨🇻", cc:"cv", colors:["#003893","#CF2027"], aliases:["cape verde","cabo verde"], audio:"Current/Cape Verde.mp3",
    verdict:"“Cântico da Liberdade.” Song of Freedom.",
    hints:["CAF (Africa)","Blue with a circle of yellow stars","Group H","World Cup debutants — ten islands, one team","Starts with C"] },
  { name:"Saudi Arabia", flag:"🇸🇦", cc:"sa", colors:["#006C35","#ffffff"], aliases:["saudi arabia","saudi","ksa","green falcons"], audio:"Current/Saudi Arabia.mp3",
    verdict:"“Aash Al Maleek.” Long live the King.",
    hints:["AFC (Asia)","Green with a sword & inscription","Group H","Beat the eventual champions at the last World Cup","Starts with S"] },
  { name:"Uruguay", flag:"🇺🇾", cc:"uy", colors:["#0038A8","#FCD116"], aliases:["uruguay","la celeste"], audio:"Current/Uruguay (Short).mp3",
    verdict:"“Orientales, la Patria o la Tumba.” The opera-length one.",
    hints:["CONMEBOL (S. America)","Sky-blue & white stripes with a golden sun","Group H","Has the world's longest national anthem","Starts with U"] },
  /* ---- Group I ---- */
  { name:"France", flag:"🇫🇷", cc:"fr", colors:["#0055A4","#EF4135"], aliases:["france","les bleus"], audio:"Current/France.mp3",
    verdict:"“La Marseillaise.” The march everyone half-knows.",
    hints:["UEFA (Europe)","Blue, white & red","Group I","Anthem written in one night in 1792","Starts with F"],
    melody:[["C4",0.5],["C4",1],["C4",0.5],["F4",1],["F4",1],["G4",1],["G4",1],["C5",1.5],["A4",0.5],["F4",1],["A4",1],["F4",1],["D4",2]] },
  { name:"Senegal", flag:"🇸🇳", cc:"sn", colors:["#00853F","#FDEF42"], aliases:["senegal","lions of teranga"], audio:"Current/Senegal.mp3",
    verdict:"“Pincez Tous vos Koras, Frappez les Balafons.”",
    hints:["CAF (Africa)","Green, yellow & red with a green star","Group I","Its anthem tells you to pluck koras and strike balafons","Starts with S"] },
  { name:"Iraq", flag:"🇮🇶", cc:"iq", colors:["#CE1126","#007A3D"], aliases:["iraq","lions of mesopotamia"], audio:"Current/Iraq.mp3",
    verdict:"“Mawtini.” My Homeland.",
    hints:["AFC (Asia)","Red, white & black with green script","Group I","First World Cup since 1986","Starts with I"] },
  { name:"Norway", flag:"🇳🇴", cc:"no", colors:["#BA0C2F","#00205B"], aliases:["norway","norge"], audio:"Current/Norway.mp3",
    verdict:"“Ja, vi elsker dette landet.” Yes, we love this country.",
    hints:["UEFA (Europe)","Red with a blue & white cross","Group I","Back for the first time since 1998","Starts with N"] },
  /* ---- Group J ---- */
  { name:"Argentina", flag:"🇦🇷", cc:"ar", colors:["#6CACE4","#ffffff"], aliases:["argentina","albiceleste","la albiceleste"], audio:"Current/Argentina (Short).mp3",
    verdict:"“Himno Nacional Argentino.” The one with the famous intro.",
    hints:["CONMEBOL (S. America)","Sky blue & white with a golden sun","Group J","Defending champions","Starts with A"] },
  { name:"Algeria", flag:"🇩🇿", cc:"dz", colors:["#006233","#D21034"], aliases:["algeria","desert foxes","les fennecs"], audio:"Current/Algeria.mp3",
    verdict:"“Kassaman.” The Oath.",
    hints:["CAF (Africa)","Green & white with a red star & crescent","Group J","Its anthem was written by a poet in prison","Starts with A"] },
  { name:"Austria", flag:"🇦🇹", cc:"at", colors:["#ED2939","#ffffff"], aliases:["austria","osterreich","österreich"], audio:"Current/Austria.mp3",
    verdict:"“Land der Berge, Land am Strome.” Mountains and rivers.",
    hints:["UEFA (Europe)","Red-white-red","Group J","Its anthem melody was long credited to Mozart","Starts with A"] },
  { name:"Jordan", flag:"🇯🇴", cc:"jo", colors:["#007A3D","#CE1126"], aliases:["jordan","the chivalrous"], audio:"Current/Jordan.mp3",
    verdict:"“As-Salam al-Malaki al-Urduni.” The royal salute.",
    hints:["AFC (Asia)","Black, white & green with a red chevron","Group J","First World Cup in their history","Starts with J"] },
  /* ---- Group K ---- */
  { name:"Portugal", flag:"🇵🇹", cc:"pt", colors:["#046A38","#DA291C"], aliases:["portugal","selecao das quinas"], audio:"Current/Portugal.mp3",
    verdict:"“A Portuguesa.” To arms, to arms!",
    hints:["UEFA (Europe)","Green & red with an armillary sphere","Group K","Its anthem ends with a call to arms","Starts with P"] },
  { name:"DR Congo", flag:"🇨🇩", cc:"cd", colors:["#007FFF","#F7D618"], aliases:["dr congo","drc","congo dr","congo","democratic republic of the congo","democratic republic of congo"], audio:null,
    verdict:"“Debout Congolais.” Arise, Congolese.",
    hints:["CAF (Africa)","Sky blue with a yellow star & red stripe","Group K","Last seen at a World Cup as Zaire in 1974","Starts with D"] },
  { name:"Uzbekistan", flag:"🇺🇿", cc:"uz", colors:["#0099B5","#1EB53A"], aliases:["uzbekistan","white wolves"], audio:"Current/Uzbekistan.mp3",
    verdict:"“State Anthem of Uzbekistan.” A Soviet-era melody kept after independence.",
    hints:["AFC (Asia)","Blue, white & green with crescent & stars","Group K","World Cup debutants","Starts with U"] },
  { name:"Colombia", flag:"🇨🇴", cc:"co", colors:["#FCD116","#003893"], aliases:["colombia","los cafeteros"], audio:"Current/Colombia.mp3",
    verdict:"“¡Oh Gloria Inmarcesible!” O unfading glory.",
    hints:["CONMEBOL (S. America)","Yellow, blue & red","Group K","By law its anthem plays on radio twice a day","Starts with C"] },
  /* ---- Group L ---- */
  { name:"England", flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", cc:"gb-eng", colors:["#CF142B","#ffffff"], aliases:["england","uk","great britain","britain","three lions"], audio:"Current/United Kingdom.mp3",
    verdict:"“God Save the King.” One you definitely knew.",
    hints:["UEFA (Europe)","Red cross on white (St George)","Group L","Anthem shared with several realms","Starts with E"],
    melody:[["G4",1],["G4",1],["A4",1],["F#4",1.5],["G4",0.5],["A4",1],["B4",1],["B4",1],["C5",1],["B4",1.5],["A4",0.5],["G4",1],["A4",1],["G4",1],["F#4",1],["G4",2]] },
  { name:"Croatia", flag:"🇭🇷", cc:"hr", colors:["#ED1C24","#0093DD"], aliases:["croatia","vatreni","hrvatska"], audio:"Current/Croatia.mp3",
    verdict:"“Lijepa naša domovino.” Our beautiful homeland.",
    hints:["UEFA (Europe)","Red & white checkerboard","Group L","Finalists in 2018","Starts with C"] },
  { name:"Ghana", flag:"🇬🇭", cc:"gh", colors:["#CE1126","#FCD116"], aliases:["ghana","black stars"], audio:"Current/Ghana.mp3",
    verdict:"“God Bless Our Homeland Ghana.”",
    hints:["CAF (Africa)","Red, gold & green with a black star","Group L","The team is named after the star on its flag","Starts with G"] },
  { name:"Panama", flag:"🇵🇦", cc:"pa", colors:["#DA121A","#072357"], aliases:["panama","la marea roja"], audio:"Current/Panama.mp3",
    verdict:"“Himno Istmeño.” Hymn of the Isthmus.",
    hints:["CONCACAF (N. & C. America)","Red, white & blue quarters with stars","Group L","Its anthem is named after the isthmus it sits on","Starts with P"] }
];

export const ALL_NATIONS = PUZZLES.map((p) => p.name).sort()

/* clip seconds unlocked per guess stage */
export const STAGES = [1, 2, 4, 7, 11, 16]

export const AUDIO_BASE =
  'https://archive.org/download/us-navy-band-national-anthems-public-domain/'

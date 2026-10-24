// Season 25 approved boards, kept distinct from the original Season 26 source.
// Full archival research stays in dev/season25-six-answer-raw.json (not deployed).
// Source labels, original questions and point values are retained verbatim.
const concept = (label,value,aliases,boundary,excluded=[])=>({
  label,value,aliases:[label,...aliases.split('|')],boundary,excluded,rawPhrases:[],
});
const season25Board = (id,question,surveyId,concepts)=>({
  id,question,originalWording:question,concepts,kind:'season25',
  sourceSeason:25,sourceSurveyId:surveyId,sourceOrdinal:surveyId-161,
  sourceUrl:'https://mstiescott.neocities.org/feud25_6',
  sampleDescription:'US Family Feud · Season 25 · archived six-answer survey',
  respondentCount:null,
  codebook:'Original rankings and scores preserved; Atlas-authored recognition codebook.',
});
export const season25Boards = [
  season25Board("s25-six-022", "If a dog ran away from home, what might it take with it?", 183, [
    concept("BONE/FOOD", 43, "bone|bones|a bone|dog bone|food|dog food|treats|dog treats|snacks|a snack|something to eat|biscuits|dog biscuits", "A bone, edible food or dog treats carried for the trip; not a bowl.", ["bowl","toy"]),
    concept("TOY/BALL", 28, "toy|toys|a toy|dog toys|his toys|favourite toy|favorite toy|ball|tennis ball|a ball|frisbee|chew toy|stuffed toy", "A plaything such as a ball, not an animal companion.", ["food","bone","blanket"]),
    concept("COLLAR & LEASH", 15, "collar|dog collar|his collar|leash|lead|dog lead|dog leash|collar and leash|his lead|his leash|harness|dog harness", "A collar and/or leash, not the dog's blanket or travel bag.", ["blanket","bowl"]),
    concept("BLANKET/BED", 5, "blanket|his blanket|favourite blanket|favorite blanket|dog blanket|bed|dog bed|his bed|sleeping bed|bedding", "The dog's familiar blanket or sleeping bed, not a food bowl.", ["bowl","collar"]),
    concept("FAVORITE BOWL", 4, "bowl|dog bowl|food bowl|water bowl|his bowl|favourite bowl|favorite bowl|feeding bowl|dog dish|food dish", "An empty or favourite feeding bowl, not food itself.", ["dog food","bone"]),
    concept("OTHER DOG/CAT", 3, "other dog|another dog|dog friend|his dog friend|another pet|cat|the cat|family cat|another cat|pet cat|his friend", "Another pet or animal companion, not an object.", ["toy","dog bed"]),
  ]),
  season25Board("s25-six-026", "Name a complaint that Bigfoot probably has about campers.", 187, [
    concept("DIRTY/LITTER", 36, "litter|littering|rubbish|trash|garbage|leaving trash|leaving rubbish|throwing rubbish|making a mess|a dirty campsite|dirty campers|messy campers|pollution", "Campers littering or leaving rubbish and a dirty campsite, not merely their smell.", ["body odour","noise"]),
    concept("NOISY", 29, "noisy|noise|loud|too loud|loud campers|loud music|shouting|yelling|screaming|making noise|making too much noise|they are loud|they talk too loud", "Campers making excessive noise, not smoke or litter.", ["fire","smoke"]),
    concept("FIRES/SMOKE", 11, "fires|fire|campfire|campfires|smoke|smoky fires|smoke in the forest|campfire smoke|burning wood|too much smoke|smoking fire", "Campfires, their flames or smoke specifically.", ["litter","noise"]),
    concept("B.O./THEY SMELL!", 9, "body odour|body odor|bad smell|stinky campers|smelly campers|they stink|they smell bad|bad body odour|b o|unwashed campers|people smelling", "People smelling bad or having body odour, not campfire smoke.", ["campfire smoke","litter"]),
    concept("INVADE PRIVACY", 8, "privacy|no privacy|invading privacy|invade his privacy|trespassing|intruding|disturb him|invade his home|enter his territory|camping too close|too close to his home", "Campers invading his space, privacy or territory.", ["noise","litter"]),
    concept("DON'T SHARE FOOD", 5, "not sharing food|don't share food|they never share|they keep food to themselves|refuse to share|won't give him food|no food for him|don't feed him|they don't offer food", "Campers failing to share or offer their food, not litter.", ["food rubbish","litter"]),
  ]),
  season25Board("s25-six-027", "Name something your cheap friend does to try to avoid paying his share of the restaurant check.", 188, [
    concept("HIDES IN LOO", 34, "hides in bathroom|hide in the bathroom|hides in toilet|hide in toilet|goes to the toilet|goes to restroom|goes to bathroom|bathroom break|toilet break|sneaks to the restroom|hides in loo|hiding in loo|hides in the loo", "Escaping to or hiding in the toilet to avoid the bill, not simply leaving the premises.", ["leaves early","forgets wallet"]),
    concept("LEAVES EARLY", 33, "leaves early|leave early|leaves before the bill|leaves before paying|sneaks out|walks out|walk out|runs away|runs off|escapes|disappears|leaves the restaurant|slips away", "Leaving or disappearing before the bill arrives, not specifically hiding in a toilet.", ["bathroom","toilet","wallet"]),
    concept("\"FORGETS\" WALLET", 25, "forgets wallet|forgot wallet|left my wallet|forgot his wallet|forgot her wallet|forgot my wallet|forgot the purse|forgot my purse|forgot his card|forgot credit card|left his wallet at home|i left my wallet at home|forgot his money", "Claiming to have forgotten the wallet, bank card or money at home, not admitting poverty.", ["i am broke","complains about the food"]),
    concept("COMPLAINS ABOUT FOOD", 2, "complains about food|complains about the food|complain about meal|food was bad|bad service|this meal is terrible|demands refund|asks for refund|the food is awful|complains to the waiter|won't pay for bad food", "Complaining about meal quality to avoid paying, not just ordering water.", ["only water","wallet"]),
    concept("\"I'M BROKE\" :(", 2, "im broke|i am broke|he is broke|she is broke|no money|out of money|cant afford it|cannot afford it|short of cash|doesnt have money|i have no cash|insufficient funds|i'm broke", "Claiming a lack of money or inability to afford the meal, not pretending to forget wallet.", ["forgot wallet","left wallet"]),
    concept("JUST GETS WATER", 2, "just gets water|orders water|only water|just water|drinks water|drinks only water|orders only water|gets a glass of water|asks for water|does not order food|no food just water", "Ordering only water in an attempt to avoid a bill, not leaving early.", ["leaves early","forgets wallet"]),
  ]),
  season25Board("s25-six-091", "Nowadays, Little Red Riding Hood might ride what to grandma's house?", 252, [
    concept("SCOOTER", 35, "scooter|an electric scooter|electric scooter|kick scooter|e scooter|escooter|a scooter|scootering|stand up scooter", "A kick scooter or electric stand-up scooter, not a motorcycle or moped.", ["motorcycle","moped"]),
    concept("CAR/UBER", 26, "car|a car|uber|an uber|taxi|cab|a taxi|ride share|rideshare|ride hailing|automobile|family car|drive a car|in a car", "A car, taxi or ride-hailing car such as Uber, not a motorbike.", ["scooter","motorbike"]),
    concept("MOTORCYCLE/MOPED", 15, "motorcycle|motorbike|motor bike|a motorbike|a motorcycle|moped|a moped|motorised bike|motorized bike|motorcycle ride", "A motorcycle, motorbike or moped, not a stand-up scooter or bicycle.", ["scooter","bicycle"]),
    concept("BICYCLE", 8, "bicycle|a bicycle|cycling|cycle|pedal bike|push bike|pedal bicycle|ride a bicycle|ride a bike with pedals", "A bicycle or pedal cycle, not a motorcycle.", ["motorcycle","motorbike","scooter"]),
    concept("HOVERBOARD", 4, "hoverboard|hover board|a hoverboard|electric hoverboard|self balancing board|balancing board", "A self-balancing electric hoverboard, not a scooter.", ["skateboard","scooter"]),
    concept("ATV", 4, "atv|quad bike|quadbike|four wheeler|four wheeled bike|all terrain vehicle|off road quad|a quad", "An ATV, quad bike or all-terrain vehicle, not a regular motorbike.", ["motorbike","bicycle"]),
  ]),
  season25Board("s25-six-121", "If two clowns got married, name something they might exchange instead of rings.", 282, [
    concept("RED NOSES", 55, "red noses|red nose|a red nose|clown nose|clown noses|big red noses|rubber nose|red rubber noses|their noses|fake clown nose", "Red clown noses exchanged instead of wedding rings, not wigs or horns.", ["wigs","horns"]),
    concept("SQUEAKY HORNS", 8, "squeaky horns|squeaky horn|horns|clown horns|honking horns|a horn|toy horn|funny honking horn|a squeaker", "Small squeaky clown horns, not musical instruments generally.", ["nose","wig"]),
    concept("BALLOON ANIMALS", 8, "balloon animals|balloon animal|balloons|a balloon animal|balloon dog|balloon dogs|balloon sculpture|twisty balloon|twisted balloons|balloon figures", "Animals made from twisty balloons, not unrelated decorations.", ["wigs","flowers"]),
    concept("RAINBOW WIGS", 5, "rainbow wigs|rainbow wig|wig|wigs|colourful wigs|colorful wigs|clown wig|clown wigs|curly wig|funny wig|big rainbow wig", "Colourful rainbow clown wigs, not the clown noses.", ["noses","horns"]),
    concept("SQUIRT FLOWERS", 4, "squirt flowers|squirting flowers|squirting flower|water spraying flower|water flower|clown flower|water pistol flower|flowers that spray water|trick flowers", "Trick flowers that spray water, not ordinary bouquets.", ["real flowers","bouquet"]),
    concept("JOKES/LAUGHS", 4, "jokes|laughs|jokes and laughs|joke|a joke|laughter|gags|funny jokes|a funny joke|giggles|humour|humor", "Jokes, laughs or humour exchanged as gifts, not clown objects.", ["horns","balloons"]),
  ]),
  season25Board("s25-six-011", "Name something you'd buy if vampires moved in next door.", 172, [
    concept("GARLIC", 57, "garlic|garlic cloves|cloves of garlic|a bulb of garlic|garlic bulbs|garlic necklace|garlic spray|buy garlic|some garlic", "Actual garlic used to discourage vampires, not a cross or stakes.", ["cross","wooden stake","locks"]),
    concept("NEW HOUSE", 13, "new house|another house|new home|move house|move away|move out|move somewhere else|relocate|change houses|different house|a new apartment|a new flat", "Moving home or buying another home to escape the new neighbours.", ["new locks","garlic","lock"]),
    concept("CROSS", 13, "cross|a cross|crucifix|a crucifix|holy cross|cross necklace|religious cross|christian cross|a crucifix necklace", "A cross or crucifix against fictional vampires, not a stake or garlic.", ["wooden stake","garlic"]),
    concept("STAKE/WEAPON", 10, "stake|wooden stake|stakes|wooden stakes|a stake|a weapon|weapon|weapons|a sword|sword|knife|a knife|a wooden stake|vampire stake", "A defensive stake or weapon, not a crucifix or door lock.", ["cross","locks","garlic"]),
    concept("BLOOD WELCOME GIFT", 3, "blood welcome gift|blood as a gift|blood|bag of blood|a blood bag|bottle of blood|blood donation|give them blood|welcome gift of blood|blood for them", "An ironic blood-themed welcome gift for the fictional neighbours.", ["garlic","wooden stake"]),
    concept("NEW LOCKS", 3, "new locks|locks|stronger locks|door locks|lock|a lock|change the locks|replace locks|security locks|padlocks|a padlock|deadbolt|new door locks", "Installing new locks for home security, not moving to a different home.", ["new house","move away"]),
  ]),
  season25Board("s25-six-044", "Be honest -- you have more pictures of your dog than you do of who?", 205, [
    concept("SPOUSE/MATE", 48, "spouse|partner|husband|wife|my partner|my spouse|my husband|my wife|boyfriend|girlfriend|my boyfriend|my girlfriend|significant other|my other half|my mate", "A romantic partner or spouse, not a child, sibling or the respondent.", ["myself","my kids","my mum"]),
    concept("MYSELF", 22, "myself|me|myself of course|pictures of me|photos of me|selfies|selfie|photos of myself|my own face|self portraits|pictures of myself", "The respondent themselves, including their selfies.", ["my children","my mother"]),
    concept("KID/GRANDKID", 13, "kid|kids|child|children|my children|my kids|my child|son|daughter|my son|my daughter|grandchild|grandchildren|grandkids|grandkid|grandson|granddaughter|my baby", "Own children or grandchildren, not siblings or a spouse.", ["sister","brother","mother"]),
    concept("MOTHER", 8, "mother|mum|mom|my mom|my mum|my mother|mummy|mommy|mama|ma|my mama", "The respondent's mother, not another relative.", ["father","my children","sister"]),
    concept("SIBLING", 3, "sibling|siblings|brother|sister|my brother|my sister|my siblings|brothers and sisters|my brothers|my sisters", "A brother or sister, not children, parents or spouse.", ["mother","son","daughter"]),
    concept("CAT", 2, "cat|cats|my cat|the cat|our cat|kitty|kitten|kittens|the family cat|my kitten|pet cat", "The family's cat, not their dog or another relative.", ["dog","puppy","myself"]),
  ]),
];

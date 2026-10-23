// Legacy illustrative boards stay available only for restoring old saved matches.
// New matches use the sourced Season 26 boards at the end of this file.
const concept = (label, value, aliases, boundary, excluded = []) => ({
  label, value, aliases: [label, ...aliases.split('|')], boundary, excluded,
  rawPhrases: [], // Intentionally empty: never invent source responses.
});
const board = (id, question, concepts) => ({
  id, question, originalWording: question, concepts, kind: 'illustrative',
  sampleDescription: 'Illustrative board · not survey data', respondentCount: null,
  codebook: 'One intended answer per attempt. Group synonyms only within each explicit boundary; excluded neighbours do not count. Values are invented development fixtures.',
});
export const legacyBoards = [
  board('leaving-home', 'Name something people forget when leaving home.', [
    concept('Keys', 34, 'key|house keys|car keys|my keys|keyring|the keys to the house|something to unlock the door', 'Physical door or vehicle keys; not access cards.', ['key card','password']),
    concept('Phone', 26, 'mobile|cellphone|cell phone|mobile phone|smartphone|my phone|their phone|the thing they make calls on', 'A mobile telephone; not its accessories.', ['phone case','phone charger']),
    concept('Charger', 18, 'phone charger|charging cable|charger cable|charging cord|power cable|something to charge their phone|the cable for charging my phone', 'Device charging equipment.', ['phone','battery']),
    concept('Wallet', 12, 'purse|billfold|my wallet|their wallet|something to keep money in', 'Container for money and cards; not loose cash or a bag.', ['money','cash','credit card','handbag']),
    concept('Glasses', 6, 'spectacles|eyeglasses|reading glasses|sunglasses|my glasses|something to help them see', 'Eyewear, including sunglasses.', ['contact lenses']),
    concept('Lunch', 3, 'packed lunch|lunchbox|lunch box|their lunch|my lunch|food for lunch|something to eat at work', 'A packed daytime meal; not any food or drink.', ['water','breakfast']),
  ]),
  board('rainy-day', 'Name something people do on a rainy day at home.', [
    concept('Watch TV', 29, 'tv|television|watch television|watch a movie|watch movies|watch films|netflix|watch netflix|stream a film|watch a film|put on a movie', 'Watching television, films or streamed programmes.', ['cinema','video games']),
    concept('Read', 23, 'reading|read a book|read books|a book|books|read a novel|curl up with a book', 'Reading text for pleasure.', ['write a book']),
    concept('Sleep', 17, 'nap|sleeping|take a nap|have a nap|go to bed|lie in|catch up on sleep', 'Sleeping or napping.', ['rest','meditate']),
    concept('Cook or bake', 12, 'cook|cooking|bake|baking|bake a cake|make food|make a meal|bake cookies|prepare dinner|cook and bake', 'Preparing food by cooking or baking.', ['eat','order food']),
    concept('Play games', 9, 'games|gaming|play video games|video games|board games|play board games|play cards|a board game', 'Playing digital, board or card games.', ['watch games','watch football']),
    concept('Clean', 5, 'cleaning|clean the house|tidy up|tidy|housework|do housework|tidy the house', 'Cleaning or tidying the home.', ['decorate','repair things']),
  ]),
  board('beach', 'Name something people take to the beach.', [
    concept('Towel', 31, 'towels|beach towel|a beach towel|something to dry off with', 'Fabric towels for drying or lying on.', ['blanket']),
    concept('Sunscreen', 24, 'suncream|sun cream|sunblock|sun block|sun lotion|sun protection cream|something to stop sunburn', 'Topical sun protection.', ['hat','sunglasses']),
    concept('Swimwear', 16, 'swimsuit|swimming costume|bathing suit|bikini|swim shorts|trunks|swimming trunks|something to swim in', 'Clothing specifically for swimming.', ['clothes','shirt']),
    concept('Water', 11, 'bottled water|water bottle|a bottle of water|drinking water|something to drink water from', 'Drinking water or a water bottle.', ['beer','juice']),
    concept('Umbrella', 8, 'parasol|beach umbrella|sun umbrella|a beach parasol|something to sit under for shade', 'Portable beach sun umbrellas.', ['tent','hat']),
    concept('Snacks', 5, 'snack|food|sandwiches|crisps|chips|picnic|a picnic|something to eat', 'Food brought to the beach.', ['drinks']),
  ]),
  board('queue', 'Name a place where people have to wait in line.', [
    concept('Supermarket', 28, 'grocery store|supermarket checkout|checkout|grocery shop|at the supermarket|the grocery store', 'Food shops and their checkouts.', ['restaurant']),
    concept('Airport', 22, 'airport security|check in|check-in|passport control|at the airport|boarding a plane', 'Airport check-in, security or boarding.', ['bus stop']),
    concept('Bank', 16, 'the bank|at a bank|bank counter|cash machine|atm', 'Bank services and cash machines.', ['post office']),
    concept('Theme park', 13, 'amusement park|roller coaster|rollercoaster|disneyland|rides|for a ride|for a roller coaster', 'Amusement parks and rides.', ['playground']),
    concept('Restaurant', 10, 'cafe|coffee shop|fast food|restaurant counter|a restaurant|at a cafe|to order food', 'Food or drink service establishments.', ['supermarket']),
    concept('Bus stop', 6, 'bus station|for the bus|waiting for a bus|at a bus stop', 'Waiting to board buses.', ['train station','airport']),
  ]),
  board('breakfast', 'Name something people have for breakfast.', [
    concept('Eggs', 27, 'egg|scrambled eggs|fried eggs|boiled egg|omelette|omelet|poached eggs', 'Egg dishes, excluding egg as a hidden ingredient.', ['cake']),
    concept('Toast', 23, 'bread|toasted bread|toast and butter|buttered toast|bread and butter|a slice of toast', 'Bread or toast with spreads.', ['croissant','pancake']),
    concept('Cereal', 19, 'cereals|cornflakes|muesli|granola|breakfast cereal|a bowl of cereal', 'Ready-to-eat breakfast cereals.', ['porridge','oatmeal']),
    concept('Fruit', 12, 'banana|apple|orange|berries|fresh fruit|fruit salad|a banana|an apple', 'Whole or cut fruit, not fruit juice.', ['orange juice','jam']),
    concept('Yogurt', 8, 'yoghurt|yogurts|yoghurts|greek yogurt|greek yoghurt|a pot of yogurt', 'Cultured dairy or plant yogurt.', ['milk','cheese']),
    concept('Porridge', 6, 'oatmeal|oats|hot oats|a bowl of porridge|cooked oats', 'Cooked oat porridge.', ['granola','cereal']),
  ]),
  board('late', 'Name a reason people arrive late to work.', [
    concept('Traffic', 32, 'traffic jam|traffic jams|heavy traffic|stuck in traffic|road congestion|the roads were busy', 'Road congestion delaying travel.', ['car broke down','accident at home']),
    concept('Overslept', 25, 'oversleep|slept in|woke up late|alarm did not go off|missed the alarm|slept through the alarm|didnt wake up|did not wake up', 'Waking too late, including alarm failures.', ['tired','went to bed late']),
    concept('Transport delays', 17, 'late bus|bus was late|train delay|train was late|missed the bus|missed the train|delayed train|bus broke down|train cancelled', 'Public transport delay, cancellation or missed departure.', ['traffic','car broke down']),
    concept('Car trouble', 10, 'car broke down|flat tyre|flat tire|car would not start|car wont start|car problems|dead car battery', 'Mechanical problems with a private vehicle.', ['traffic','bus broke down']),
    concept('Bad weather', 7, 'weather|rain|snow|storm|heavy rain|snowstorm|flooding|icy roads', 'Weather directly delaying the journey.', ['traffic']),
    concept('Childcare', 4, 'kids|children|school run|taking kids to school|babysitter was late|childcare problems|looking after children', 'Childcare or school drop-off delays.', ['pet care']),
  ]),
  board('transformation', 'Name something that can be transformed or passed on, but never truly disappears.', [
    concept('Energy', 34, 'energy|heat|light|electrical energy|chemical energy|kinetic energy|potential energy', 'Energy in the ordinary conservation-of-energy sense; transformations between forms count.', ['electricity bill','power bill']),
    concept('Matter', 21, 'matter|mass|material|atoms|molecules|physical stuff|substance', 'Physical matter or material changing form.', ['energy']),
    concept('Life', 15, 'life|living things|soul|spirit|rebirth|reincarnation|atman|ātman|cycle of life', 'Life or self understood philosophically or religiously as continuity, rebirth or transformation; not a claim that biological life is a conserved physical quantity.', ['corpse','death']),
    concept('Love', 11, 'love|affection|care|kindness|love for someone|love passed on', 'Love or affection understood as persisting through people, memory or action.', ['friendship']),
    concept('Information', 8, 'information|data|knowledge|ideas|memory|memories|digital data', 'Information understood as something copied, transmitted or transformed.', ['secret']),
    concept('Money', 6, 'money|cash|wealth|currency|funds|financial value', 'Money or economic value being transferred or changing hands in the everyday sense.', ['debt']),
  ]),
];

// US Season 26 data. Answer labels, ordering, and point values come from the source;
// synonyms, semantic boundaries and exclusions are authored by Atlas.
const season26Board = (id, question, surveyId, concepts) => ({
  id, question, originalWording: question, concepts, kind: 'season26',
  sourceSurveyId: surveyId,
  sourceUrl: 'https://mstiescott.neocities.org/feud26_6',
  sampleDescription: 'US Family Feud · Season 26 · archived six-answer survey',
  respondentCount: null,
  codebook: 'Original rankings and scores preserved; Atlas-authored recognition codebook.',
});

export const boards = [
  season26Board('s26-six-019', "Tell me a kind of flower that a lot of grandmas have as a first name.", 19, [
    concept("ROSE", 58, "a rose|roses|rose flower|rosie", "Rose flower/given name", ["rosemary","rosebud"]),
    concept("DAISY", 13, "a daisy|daisies|daisy flower", "Daisy flower/given name", ["dahlia"]),
    concept("LILY", 12, "a lily|lilies|lilly|lily flower", "Lily flower/given name", ["lilac"]),
    concept("VIOLET", 6, "a violet|violets|violet flower", "Violet flower/given name", ["purple"]),
    concept("IRIS", 6, "an iris|irises|iris flower", "Iris flower/given name", ["orchid"]),
    concept("PETUNIA", 3, "a petunia|petunias|petunia flower", "Petunia flower/given name", ["pansy"]),
  ]),
  season26Board('s26-six-085', "Name a specific job in which you'd be exposed to a lot of germs.", 85, [
    concept("NURSE", 35, "nurses|a nurse|nursing|registered nurse|hospital nurse|nurse practitioner", "Nurse by occupation, not generic hospital staff", ["doctor","healthcare worker"]),
    concept("DOCTOR", 33, "doctors|a doctor|physician|physicians|medical doctor|general practitioner|gp|family doctor", "Medical doctors/physicians, not nurses", ["nurse","dentist","hospital worker"]),
    concept("JANITOR/HOUSEKEEPER", 11, "janitor|housekeeper|cleaner|cleaners|cleaning staff|cleaning lady|cleaning person|custodian|housekeeping|office cleaner|hospital cleaner|school janitor", "Employed building/room cleaner", ["plumber","gardener"]),
    concept("TRASH COLLECTOR", 10, "trash collector|rubbish collector|garbage collector|refuse collector|waste collector|binman|bin man|bin woman|garbage man|garbage woman|sanitation worker|waste collection worker", "People employed collecting refuse", ["janitor","housekeeper","cleaner"]),
    concept("LAB TECH", 2, "lab technician|laboratory technician|lab tech|lab worker|laboratory worker|medical laboratory technician|medical lab tech|lab assistant", "Worker handling samples in a laboratory", ["doctor","nurse","scientist"]),
    concept("TEACHER", 2, "teachers|a teacher|school teacher|primary teacher|secondary teacher|schoolteacher|kindergarten teacher|classroom teacher", "Teacher by occupation", ["student","school janitor"]),
  ]),
  season26Board('s26-six-111', "Name an animal starting with the letter S that would make a terrible pet.", 111, [
    concept("SNAKE", 42, "a snake|snakes|python|boa constrictor|cobra|rattlesnake|viper", "Snakes, including named snake species", ["salamander","lizard"]),
    concept("SKUNK", 19, "a skunk|skunks", "Skunks", ["squirrel"]),
    concept("SHARK", 11, "a shark|sharks|great white shark|hammerhead shark", "Sharks", ["seal","swordfish"]),
    concept("SLOTH", 8, "a sloth|sloths", "Sloths", ["slug"]),
    concept("SNAIL", 5, "a snail|snails|garden snail", "Snails, not slugs", ["slug","sloth"]),
    concept("SCORPION", 4, "a scorpion|scorpions", "Scorpions", ["spider","stingray"]),
  ]),
  season26Board('s26-six-121', "If dogs knew how to use Google, what might they search for the most?", 121, [
    concept("BONES/FOOD", 59, "bone|bones|dog bone|dog bones|food|dog food|something to eat|find dog food|treat|treats|dog treats|snacks|dog snacks|where are the bones|best dog food", "Searches for food/bones/treats for eating", ["toy","dog toy","cat food"]),
    concept("WHERE DA CATS", 10, "cats|where are the cats|where to find cats|find cats|find a cat|where cats hide|cat locations|where do cats live|locate cats|where da cats", "Locating cats, not photos of dogs", ["dog pictures","dog photos","cat food"]),
    concept("TOY DELIVERY", 5, "dog toy delivery|toy delivery|dog toys online|order dog toys|buy dog toys|toys delivered|deliver toys|order a toy|buy a dog toy", "Ordering or getting dog toys delivered", ["food delivery","delivery","toy store"]),
    concept("DOG PARKS", 4, "dog park|parks for dogs|dog parks near me|nearest dog park|where are dog parks|where is the dog park|find dog parks|dog friendly park|dog-friendly parks", "Searching for dog parks or parks for dogs", ["dog photos","pet shop","national park"]),
    concept("DOG PICS", 4, "dog pictures|dog photos|photos of dogs|pictures of dogs|dog images|dog pics|cute dog pictures|cute dog photos|photos of puppies|puppy photos|pictures of puppies", "Pictures of dogs or puppies", ["cat pictures","dog parks","dog toys"]),
    concept("PEE SPOTS/HYDRANTS", 4, "where to pee|where can i pee|where to urinate|pee spots|places to pee|fire hydrants|fire hydrant|hydrants|best fire hydrants|where are the fire hydrants|where to mark territory|places to mark territory", "Places to urinate or mark territory, especially hydrants", ["dog parks","public toilet","potty training"]),
  ]),
  season26Board('s26-six-137', "Name something you're tempted to do when you notice a stranger staring at you.", 137, [
    concept("STARE RIGHT BACK", 24, "stare right back|stare back|stare at them|stare at the stranger|look back at them|look straight back|look them in the eye|stare them down|make eye contact", "Returning the stare or eye contact", ["look away","turn away","look down"]),
    concept("SMILE/LAUGH", 14, "smile|smiles|smile at them|smile back|give a smile|laugh|laugh at them|giggle|chuckle|start laughing", "Smiling/laughing rather than a rude face", ["scowl","stick tongue out"]),
    concept("WAVE", 13, "wave|wave at them|wave back|give a wave|wave hello|say hello with a wave|raise my hand and wave", "Greeting with a hand wave", ["shout","point"]),
    concept("CONFRONT/ASK", 13, "confront|confront them|ask them why|ask why theyre staring|ask why they're staring|ask what they want|ask them what they want|tell them to stop staring|say stop staring|question them|call them out", "Verbally challenging the staring or asking why", ["wave","say hello"]),
    concept("TURN AWAY", 9, "turn away|look away|look elsewhere|look the other way|avert my eyes|avoid eye contact|ignore them|pretend not to notice|look down|walk away", "Avoiding the stare, not returning it", ["stare back","look at them"]),
    concept("MAKE FACE/TONGUE OUT", 8, "make a face|pull a face|make funny faces|pull a funny face|stick out my tongue|stick my tongue out|show my tongue|poke my tongue out|make a silly face|grimace", "Making a deliberate face or sticking out tongue", ["smile","laugh","wave"]),
  ]),
  season26Board('s26-six-003', "Name a word or phrase that describes how eggs are prepared that also describes you.", 3, [
    concept("SCRAMBLED", 47, "scrambled eggs|scrambled egg|scrambled up|all scrambled|feeling scrambled|i am scrambled|i'm scrambled|completely scrambled|my brain is scrambled|a scrambled mess|scrambled like my brain", "Scrambled eggs or a person feeling mentally scrambled; not confusion unrelated to the egg preparation.", ["poached","omelette","hard boiled","sunny side up","mixed up eggs"]),
    concept("OVER EASY", 19, "over easy|over-easy|over easy eggs|eggs over easy|over easy egg|easy going|easygoing|laid back|laid-back|easy to get along with|low maintenance|i'm over easy", "Eggs cooked over easy, or the corresponding easy-going description of someone's manner.", ["sunny side up","soft boiled","fried","over hard","difficult"]),
    concept("BOILED/HARD-BOILED", 14, "boiled|boiled egg|boiled eggs|hard boiled|hard-boiled|hardboiled|hard boiled eggs|hard-boiled eggs|soft boiled|soft-boiled|i'm hard boiled|tough and hard boiled", "Boiled or hard-boiled eggs and the hard-boiled personality idiom; not other egg preparations.", ["fried","poached","scrambled","over easy","eggs benedict"]),
    concept("SUNNY-SIDE UP", 11, "sunny side up|sunny-side up|sunny-side-up|sunny side up eggs|sunny side up egg|eggs sunny side up|sunny-side-up eggs|always sunny side up|sunny side|sunny-side|i'm sunny side up", "The named sunny-side-up egg preparation or direct wordplay on that phrase.", ["over easy","optimistic","cheerful","sunny weather","boiled"]),
    concept("DEVILED", 7, "deviled|devilled|deviled eggs|devilled eggs|deviled egg|devilled egg|a little devil|devilish|i'm devilish|feeling devilish|devilishly naughty|i'm a little devil", "Deviled/devilled eggs or a playful devilish self-description.", ["boiled","spicy","evil","scrambled","angelic"]),
    concept("FRIED", 2, "fried|fried egg|fried eggs|i'm fried|i am fried|feeling fried|totally fried|my brain is fried|brain fried|completely fried|fried to a crisp|absolutely fried", "Fried eggs or the colloquial self-description 'fried'; not specifically over-easy eggs.", ["over easy","sunny side up","scrambled","poached","burnt toast"]),
  ]),
  season26Board('s26-six-061', "A cop pulls you over for speeding. What's an excuse you give to get out of a ticket?", 61, [
    concept("EMERGENCY/HOSPITAL", 40, "emergency|a medical emergency|medical emergency|family emergency|an emergency|hospital|to the hospital|go to the hospital|rushing to hospital|rushing to the hospital|someone is in hospital|somebody is in hospital|wife is in labor|wife is in labour|having a baby|going to the emergency room", "A serious emergency, particularly a medical or hospital situation; not a routine appointment.", ["late for work","doctor appointment","anniversary dinner","toilet emergency","car trouble"]),
    concept("GOTTA POTTY", 29, "gotta potty|need the toilet|i need the toilet|need the bathroom|need to use the bathroom|i have to pee|i need to pee|i have to go to the toilet|need to poop|need to poo|desperate for the loo|need the loo|bursting for a wee|bathroom emergency|toilet emergency", "Urgently needing to urinate or use the toilet; not being late for an appointment.", ["hospital emergency","bathroom renovation","late for work","hungry","stomach ache"]),
    concept("DIDN'T REALIZE", 15, "didn't realize|didnt realize|didn't realise|didnt realise|i didn't know i was speeding|i didn't realise i was speeding|i didn't realize i was speeding|i had no idea i was speeding|didn't see the speed limit|didnt see the speed limit|i thought i was going slower|did not know the speed limit|unaware of my speed", "Claiming not to have noticed the speed, limit or speeding; not another practical reason to hurry.", ["late for work","speeding on purpose","my pedal got stuck","speed camera","roadworks"]),
    concept("LATE FOR WORK", 7, "late for work|running late for work|late to work|late to my job|i'm late for work|i was late for work|late for my shift|running late for my shift|late to the office|going to be late for work|have to get to work|boss will fire me if i'm late", "Hurrying because of work or a work shift; not a date or other appointment.", ["late for a date","anniversary","late for school","late for a flight","hospital"]),
    concept("GAS PEDAL STUCK", 2, "gas pedal stuck|gas pedal was stuck|the gas pedal stuck|accelerator stuck|accelerator pedal stuck|my accelerator got stuck|my foot was stuck on the gas|the throttle jammed|stuck throttle|the pedal jammed|accelerator would not release|the gas pedal wouldn't release", "The vehicle's accelerator or throttle mechanically sticking and causing unwanted speed.", ["flat tyre","flat tire","brakes failed","ran out of gas","car broke down"]),
    concept("DATE NIGHT/ANNIV.", 2, "date night|date night anniversary|our anniversary|my anniversary|anniversary dinner|late for a date|rushing to a date|going on a date|late for dinner with my partner|dinner date|wedding anniversary|it's our anniversary|romantic date|anniversary date", "A romantic date, date night or anniversary engagement; not generic lateness or work.", ["late for work","birthday party","family emergency","wedding ceremony","dinner reservation"]),
  ]),
  season26Board('s26-six-117', "Name something a castle might have that would be weird if your house had it.", 117, [
    concept("MOAT/DRAWBRIDGE", 61, "moat|a moat|water moat|a moat around the house|drawbridge|draw bridge|a drawbridge|a draw bridge|moat and drawbridge|drawbridge over a moat|a bridge that lifts up|a lifting bridge|water-filled moat|castle moat", "Defensive moat, drawbridge or movable entrance bridge around a castle; not a swimming pool.", ["swimming pool","pond","river","ordinary bridge","fountain"]),
    concept("TORTURE DUNGEON", 10, "torture dungeon|dungeon|a dungeon|torture chamber|torture room|dungeons|castle dungeon|an underground dungeon|prison dungeon|a prison cell for torture|medieval torture room|a rack for torture", "Underground imprisonment or torture facilities associated with a castle; not an ordinary cellar.", ["basement","cellar","home gym","security room","prison guards"]),
    concept("TURRET/TOWER", 9, "turret|turrets|a turret|tower|towers|castle tower|watchtower|watch tower|lookout tower|stone tower|tall tower|battlement tower|guard tower", "A castle's turret, tower or lookout structure; not general guard personnel.", ["knight","guard","roof","balcony","chimney","moat"]),
    concept("NO PLUMBING/A WELL", 3, "no plumbing|without plumbing|no running water|no indoor plumbing|no toilet plumbing|an outdoor well|water well|a well|well in the yard|draw water from a well|no modern plumbing|no toilets|no bathroom plumbing", "The absence of indoor plumbing or the use of a well instead of piped water.", ["swimming pool","moat","fountain","indoor bathroom","hot tub"]),
    concept("KNIGHTS/GUARDS", 2, "knights|knight|a knight|castle knights|knights in armour|knights in armor|guards|castle guards|armed guards|palace guard|castle guard|guards at the gate|knights guarding the castle|sentries", "Armed castle guards, sentries or knights as people; not defensive architecture.", ["tower","turret","weapons","army","drawbridge"]),
    concept("PET DRAGON", 2, "pet dragon|a dragon|dragon|pet dragons|a pet dragon|my own dragon|dragon in the backyard|fire breathing dragon|fire-breathing dragon|domesticated dragon|dragon as a pet", "A dragon kept as a pet, rather than an ordinary household animal or a decorative dragon.", ["dog","cat","lizard","dragon statue","dragon painting"]),
  ]),
  season26Board('s26-six-136', "If a baby could talk while it was still in the womb, tell me a question it might ask its mom.", 136, [
    concept("WHEN DO I GET OUT?", 31, "when do i get out|when can i get out|when am i getting out|when do i come out|when can i come out|how long until i get out|when will i be born|when am i going to be born|when is my birthday|how much longer am i in here|when can i leave|is it time to come out", "Asking when birth, departure from the womb or release into the outside world will happen.", ["where am i","what's my name","who are you","why am i here","what is that noise"]),
    concept("WHAT ARE WE EATING?", 29, "what are we eating|what am i eating|what's for dinner|what is for dinner|what's for lunch|what is for lunch|what's for breakfast|are we eating|what did you eat|what are you eating|what is mom eating|what's for food|what food are we having|is there anything to eat", "Asking about food, meals or what the mother and baby are eating; not the baby's identity.", ["what's my name","am i hungry","where am i","what is that noise","are you my mother"]),
    concept("WHAT'S MY NAME?", 8, "what's my name|what is my name|what will you name me|what are you going to name me|what are you naming me|do i have a name|have you picked my name|what are you calling me|what should i be called|have you named me yet|who am i named after", "Asking about the baby's name or what they will be called; not where they are.", ["who are you","where am i","who is my dad","when is my birthday","what is that noise"]),
    concept("WHO ARE YOU?", 5, "who are you|who is my mother|are you my mum|are you my mom|who is mom|who is mum|who's my mom|who's my mum|are you my mother|who is speaking to me|who am i talking to|who are you mommy", "Asking who the mother is or who is addressing the baby, rather than asking the baby's own name.", ["what's my name","who am i","where am i","who is my father","what are we eating"]),
    concept("WHAT'S THAT NOISE?", 4, "what's that noise|what is that noise|what is that sound|what's that sound|what was that noise|why is it so noisy|what am i hearing|what is that loud noise|who is making that noise|what is making that sound|what's all that noise", "Asking about a noise or sound perceived inside the womb; not someone's identity.", ["who are you","what are we eating","what's my name","why am i here","when do i get out"]),
    concept("WHERE AM I?", 4, "where am i|where are we|where is this|what place is this|where have you put me|where exactly am i|where am i right now|am i inside you|what is this place|what is this room|where in the world am i", "Asking about the baby's present location or surroundings; not asking when it can leave.", ["when do i get out","what's my name","who are you","why am i here","where are we eating"]),
  ]),
  season26Board('s26-six-151', "Susan got fired from the choir because her singing sounds like what animal?", 151, [
    concept("BIRD/SCREECH OWL", 24, "bird|birds|a bird|screech owl|an owl|owl|owls|a screeching bird|a screech owl|squawking bird|a crow|crow|crows|a parrot|parrot|an angry bird|a squawking parrot", "Bird calls or screeches including owls; not mammals or whale sounds.", ["cat","hyena","monkey","whale","donkey","birdsong"]),
    concept("CAT IN HEAT", 15, "cat in heat|a cat in heat|cat|cats|a cat|yowling cat|screaming cat|cat yowling|cat screeching|a mating cat|a feral cat|alley cat|stray cat|an angry cat", "A cat's yowl, especially a cat in heat; not generic animal screaming or hyenas.", ["bird","hyena","monkey","donkey","whale","kitten playing"]),
    concept("HYENA", 14, "hyena|hyenas|a hyena|laughing hyena|a laughing hyena|a pack of hyenas|hyena laughing|hyena cackling|cackling hyena|hyena screech|hyena howl", "Hyena's cackling or howl; not an ordinary laugh or other species.", ["cat","monkey","donkey","bird","whale","laughing person"]),
    concept("DONKEY", 7, "donkey|donkeys|a donkey|braying donkey|donkey braying|braying|jackass|a jackass|an ass braying|a mule|mule braying|a braying mule", "A donkey's or mule's bray, not horse or other animal noises.", ["horse","pony","cat","monkey","hyena","whale"]),
    concept("MONKEY/APE", 6, "monkey|monkeys|a monkey|ape|apes|a chimpanzee|chimpanzee|chimp|chimps|gorilla|a gorilla|monkey screeching|screaming monkey|baboon|a baboon|primate noises", "Monkey or ape calls, including chimpanzees and gorillas; not other mammals.", ["donkey","hyena","cat","whale","parrot","human"]),
    concept("WHALE/ORCA", 4, "whale|whales|a whale|orca|orcas|killer whale|killer whales|whale song|singing whale|whale singing|whale noises|a humpback whale|humpback whale|an orca|whale calls", "Whale or orca vocalisations; not dolphin or other sea animals.", ["dolphin","seal","shark","monkey","bird","siren"]),
  ]),
];

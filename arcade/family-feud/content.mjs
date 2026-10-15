// DEVELOPMENT CONTENT ONLY. No respondents were surveyed; these values are illustrative.
// Replace a complete board/codebook together when genuine survey data is available.
const concept = (label, value, aliases, boundary, excluded = []) => ({
  label, value, aliases: [label, ...aliases.split('|')], boundary, excluded,
  rawPhrases: [], // Intentionally empty: never invent source responses.
});
const board = (id, question, concepts) => ({
  id, question, originalWording: question, concepts, kind: 'illustrative',
  sampleDescription: 'Illustrative board · not survey data', respondentCount: null,
  codebook: 'One intended answer per attempt. Group synonyms only within each explicit boundary; excluded neighbours do not count. Values are invented development fixtures.',
});
export const boards = [
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
    concept('Yogurt', 8, 'yoghurt|yoghurts|yogurts|greek yogurt|greek yoghurt|a pot of yogurt', 'Cultured dairy or plant yogurt.', ['milk','cheese']),
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
];

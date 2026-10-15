-- Workshop: the house writer and its seed jokes, so the Arena works on day one.
-- Original jokes, grouped by topic in prompt_ref 'house:<topic>' (same-prompt duels).
-- House jokes are NOTEBOOK-sourced but explicitly ENTERED into the arena.

INSERT INTO app_user (id, handle) VALUES ('00000000-0000-0000-0000-000000000300', 'The House');

WITH seed(topic, ord, setup, punchline) AS (VALUES
  -- airports
  ('airports', 0, 'Airport security confiscated my water.', 'Then sold it back to me for six dollars, twenty feet later. That''s not security, that''s a business model.'),
  ('airports', 1, 'The flight attendant said, "In the unlikely event of a water landing."', 'We were flying over the Atlantic. Water is the only thing down there.'),
  ('airports', 2, 'I love the moving walkway at the airport.', 'It''s the only time in my life I make progress without trying.'),
  ('airports', 3, 'The gate agent announced, "We''re now boarding group one."', 'Group one is two pilots and a man in a fleece who has decided he''s group one.'),
  ('airports', 4, 'My suitcase has one wheel that only turns left.', 'Every trip through the terminal is a slow, loud political statement.'),
  ('airports', 5, 'Airplane bathrooms are so small', 'I have to choose which half of me gets to wash its hands.'),
  ('airports', 6, 'They say get to the airport three hours early.', 'That''s not travel advice. That''s a hostage situation with a Cinnabon.'),
  -- gym
  ('gym', 7, 'I joined a gym in January.', 'So far I''ve lost forty dollars a month.'),
  ('gym', 8, 'The gym has mirrors on every wall', 'so I can watch myself give up from four angles.'),
  ('gym', 9, 'My smartwatch says I burned three hundred calories today.', 'Most of them were lifting my wrist to check.'),
  ('gym', 10, 'My trainer told me to listen to my body.', 'My body said "nachos." He said not like that.'),
  ('gym', 11, 'I finally found a workout I can stick to:', 'walking past the gym feeling guilty. Twice a day. That''s cardio.'),
  ('gym', 12, 'The guy next to me grunts on every rep,', 'like he''s lifting the weight and his entire childhood.'),
  ('gym', 13, 'I bought a foam roller to fix my back.', 'Now I have a bad back and a very expensive pool noodle.'),
  -- smart-home
  ('smart-home', 14, 'I bought a smart fridge.', 'It knows I open it forty times a night and close it empty. It''s started sending me articles about loneliness.'),
  ('smart-home', 15, 'My smart speaker listens to everything I say.', 'Joke''s on them. Nobody else does.'),
  ('smart-home', 16, 'I asked my speaker to play something relaxing.', 'It turned off the news.'),
  ('smart-home', 17, 'I watched my robot vacuum hit the same wall eight times.', 'Finally, someone in this house who understands my twenties.'),
  ('smart-home', 18, 'My video doorbell pings me every time something moves outside.', 'Now I know the neighbour''s cat has a busier social life than me.'),
  ('smart-home', 19, 'My smart bulbs have sixteen million colours.', 'I use "hospital waiting room" and "slightly brighter hospital waiting room."'),
  ('smart-home', 20, 'My thermostat "learns your habits."', 'Three weeks in, it just stays on "disappointed."'),
  -- office
  ('office', 21, 'My boss said, "We''re like a family here."', 'Which explains why nobody talks at lunch and someone''s always crying in the bathroom.'),
  ('office', 22, 'This meeting could have been an email.', 'That email could have been nothing.'),
  ('office', 23, 'My company offers unlimited vacation.', 'It''s like unlimited breadsticks, except the waiter glares at you every time you take one.'),
  ('office', 24, 'Every work email ends with "thanks in advance."', 'That''s corporate for "I''ve already decided you''re doing this."'),
  ('office', 25, 'My job title is Solutions Architect.', 'I''ve never solved anything. I draw boxes and arrows until people stop asking.'),
  ('office', 26, 'Our office got a ping-pong table to boost morale.', 'Nobody''s allowed to play, so now it just boosts the morale of a stack of printer paper.'),
  ('office', 27, 'My manager loves to say "let''s take this offline."', 'Twelve years at that company, nobody ever found where offline is.'),
  -- dating
  ('dating', 28, 'Every dating profile says "no drama."', 'That''s like a restaurant sign that says "no food poisoning." Why did that need saying?'),
  ('dating', 29, 'My dating profile has five photos.', 'Four are my dog. The fifth is me, blurry, behind my dog.'),
  ('dating', 30, 'The dating app asks, "What are you looking for?"', 'Honestly? My keys. But I''m open to love.'),
  ('dating', 31, 'My date''s bio said she loves to travel.', 'Turns out she meant away from me, at the twenty-minute mark.'),
  ('dating', 32, 'I went on a date with a guy who brought his mother.', 'Not physically. She texted him advice all night, and she was the better conversationalist.'),
  ('dating', 33, 'Online dating is a job interview', 'where both people lie about their hobbies and nobody gets dental.'),
  ('dating', 34, 'My last relationship ended because of a lack of communication.', 'I found out in the group chat.'),
  -- parents
  ('parents', 35, 'My mom texts like she''s defusing a bomb.', '"CALL ME NOW." I call. She wants to know if I''m eating fruit.'),
  ('parents', 36, 'My dad doesn''t say "I love you."', 'He checks my tyre pressure. Aggressively. That''s the love.'),
  ('parents', 37, 'My dad just discovered the thumbs-up emoji.', 'Now every text he sends, including "Grandma''s in hospital," ends with a thumbs-up.'),
  ('parents', 38, 'My parents still pay for my phone plan.', 'So technically, every time I ignore their call, they''re paying for it.'),
  ('parents', 39, 'My mom keeps plastic bags in a plastic bag,', 'inside a drawer of plastic bags. That''s not storage. That''s a nesting doll of fear.'),
  ('parents', 40, 'Visiting my parents means fixing their printer.', 'I don''t know how printers work. Nobody does. I just stand next to it until it gets scared.'),
  ('parents', 41, 'My dad gives directions using landmarks that closed in 1994.', '"Turn left where the video store used to be." Dad, it used to be everywhere.'),
  -- cooking
  ('cooking', 42, 'The recipe says "prep time: ten minutes."', 'Ten minutes for a chef. For me it''s forty minutes and one fingertip.'),
  ('cooking', 43, 'Recipe blogs make you read a life story before the ingredients.', 'I just wanted lasagna. Why do I now know about your divorce?'),
  ('cooking', 44, 'I made a salad for dinner.', 'Then I ate it next to a pizza, as a sort of emotional support vegetable.'),
  ('cooking', 45, 'My smoke alarm is my kitchen timer.', 'When it goes off, dinner''s ready. And by ready, I mean over.'),
  ('cooking', 46, 'The recipe said "season to taste."', 'My taste is salt. So now it''s salt, with some chicken in it.'),
  ('cooking', 47, 'I bought an air fryer.', 'It''s an oven that''s learned to be loud about it.'),
  ('cooking', 48, 'Meal prep Sunday means cooking five identical lunches.', 'By Wednesday I''m eating them like a hostage reading a statement.'),
  -- sleep
  ('sleep', 49, 'I set eight alarms every morning.', 'Not to wake up. Just so I can win seven times before I lose.'),
  ('sleep', 50, 'My sleep tracker says I only got four hours.', 'Now I lie awake at night worrying about my sleep tracker.'),
  ('sleep', 51, 'The doctor said I need eight hours of sleep.', 'I said, "In a row?"'),
  ('sleep', 52, 'I fall asleep to an app that plays rain sounds.', 'It''s raining outside. I can hear real rain. I prefer the app''s. It''s more professional.'),
  ('sleep', 53, 'As a kid, I fought every nap.', 'Now I''d pay for one. And I do. It''s called a long meeting with the camera off.'),
  ('sleep', 54, 'I''m not a morning person.', 'I''m not an evening person either. I peak for about forty minutes after lunch.'),
  ('sleep', 55, 'My bed is the only place I''m truly motivated.', 'I plan my whole life there. Then I lose all of it in the shower.'),
  -- money
  ('money', 56, 'My bank sent me a "year in spending" summary.', 'It wasn''t a summary. It was an intervention.'),
  ('money', 57, 'I finally opened a savings account.', 'It''s where money goes to be scared of me.'),
  ('money', 58, 'I checked my bank balance before ordering takeout.', 'Then I ordered anyway. The number was already sad; how much sadder could it get? Sadder. It could get sadder.'),
  ('money', 59, 'Financial advisers say, "Pay yourself first."', 'I tried. I got declined.'),
  ('money', 60, 'I use a budgeting app.', 'It''s a diet app for money: I lie to it, and it believes me.'),
  ('money', 61, 'My credit score went up twelve points.', 'So I celebrated with a purchase. Full circle.'),
  ('money', 62, 'People say money can''t buy happiness.', 'Neither can no money. I''ve tested that one thoroughly.'),
  -- pets
  ('pets', 63, 'My cat knocks things off the table while making eye contact.', 'It''s not an accident. It''s a performance review.'),
  ('pets', 64, 'My dog greets me like I''ve come home from war.', 'I went to get the mail.'),
  ('pets', 65, 'My cat has a forty-dollar bed.', 'She sleeps in the box it came in. Honestly, same.'),
  ('pets', 66, 'I talk to my dog in a baby voice.', 'He''s eleven. In dog years, I''m baby-talking a seventy-seven-year-old man.'),
  ('pets', 67, 'My dog has an entire lawn to throw up on.', 'He waits for the one white rug. That''s not illness, that''s a choice.'),
  ('pets', 68, 'My goldfish died.', 'I''m not sad, just surprised. I thought he''d been napping for four days.'),
  ('pets', 69, 'My cat ignores me all day, then sits on my laptop the second I start working.', 'She''s not affectionate. She''s management.'),
  -- phones
  ('phones', 70, 'My phone told me my screen time went up thirty percent.', 'Thanks. I read that on my phone.'),
  ('phones', 71, 'I put my phone on "do not disturb."', 'Now it disturbs me to say it''s on "do not disturb."'),
  ('phones', 72, 'Autocorrect turns every swear word I type into "duck."', 'Every argument I''ve had this year sounds like a birdwatcher losing his mind.'),
  ('phones', 73, 'My phone is at two percent.', 'I''ve never been more productive, focused or afraid.'),
  ('phones', 74, 'I have forty-seven unread emails.', 'That''s not an inbox. That''s a to-do list written by strangers.'),
  ('phones', 75, 'Every website wants a password with a capital, a number and a symbol.', 'My memory has none of those.'),
  ('phones', 76, 'My phone''s face unlock doesn''t recognise me in the morning.', 'Honestly? Fair.'),
  -- adulting
  ('adulting', 77, 'Being an adult means getting excited about a new sponge.', 'And I did. Yellow on one side, green on the other. Two moods.'),
  ('adulting', 78, 'I bought a plant to prove I can take care of something.', 'The plant is now proving something else.'),
  ('adulting', 79, 'It took me four days to call and book a doctor''s appointment.', 'The call took ninety seconds. Then I needed a nap.'),
  ('adulting', 80, 'Nobody tells you adulthood is mostly', 'looking for a pen that works while holding three pens that don''t.'),
  ('adulting', 81, 'I assembled furniture without the instructions.', 'It''s a bookshelf. It''s also a chair now. It holds books, people and regret.'),
  ('adulting', 82, 'I''m at the age where a "big night"', 'means I stayed up past eleven and ate some cheese standing up.'),
  ('adulting', 83, 'I keep a junk drawer.', 'It''s the most organised I am about anything. Everything in there is definitely junk.')
),
inserted AS (
  INSERT INTO joke (user_id, setup, punchline, source, prompt_ref, created_at)
  SELECT '00000000-0000-0000-0000-000000000300', setup, punchline, 'NOTEBOOK', 'house:' || topic,
         now() - make_interval(mins => 1000 - ord)
  FROM seed ORDER BY ord
  RETURNING id
)
INSERT INTO workshop_arena_entry (joke_id, status) SELECT id, 'ENTERED' FROM inserted;

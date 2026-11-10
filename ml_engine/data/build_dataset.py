"""
Comprehensive Dataset Generator for Cognivibe AI / MannSetu AI.
Creates 210 annotated samples covering all 7 emotions and 5 depression indicators,
with diverse Hinglish slang, Romanized Hindi, and English patterns.
"""

import json
import os
from datetime import datetime, timedelta

DATASET = [
    # ==================== SADNESS / LONELINESS ====================
    {"text": "Mujhe bhot akelapan feel hota h, kisi se baat karne ka mann nahi karta.", "emotion": "Sadness", "depression_related": 1, "indicator": "loneliness", "user_id": "u101", "turn": 1},
    {"text": "I feel so isolated in this crowded college hostel yaar. Nobody understands me.", "emotion": "Sadness", "depression_related": 1, "indicator": "loneliness", "user_id": "u101", "turn": 2},
    {"text": "Sabke paas dost hain, mere paas koi nahi hai jisse share kar saku. Sab fake lagta hai.", "emotion": "Sadness", "depression_related": 1, "indicator": "loneliness", "user_id": "u101", "turn": 3},
    {"text": "Another Saturday night spent staring at the ceiling alone with my heavy thoughts 💔", "emotion": "Sadness", "depression_related": 1, "indicator": "loneliness", "user_id": "u102", "turn": 1},
    {"text": "Bheed me bhi tanha mehsus hota hai. Sab haste hain par mai disconnect feel karta hu.", "emotion": "Sadness", "depression_related": 1, "indicator": "loneliness", "user_id": "u102", "turn": 2},
    {"text": "Nobody checks in on me unless they need something. The isolation is deafening.", "emotion": "Sadness", "depression_related": 1, "indicator": "loneliness", "user_id": "u103", "turn": 1},
    {"text": "Phone silent rehta hai pure din. Kisi ko meri absence se koi fark nahi padta.", "emotion": "Sadness", "depression_related": 1, "indicator": "loneliness", "user_id": "u103", "turn": 2},
    {"text": "Sitting in my dark room alone, wishing I had just one genuine person to talk to.", "emotion": "Sadness", "depression_related": 1, "indicator": "loneliness", "user_id": "u104", "turn": 1},
    {"text": "Sab apne me busy hain, aur mai yaha akela ghut raha hu.", "emotion": "Sadness", "depression_related": 1, "indicator": "loneliness", "user_id": "u104", "turn": 2},
    {"text": "I can go weeks without speaking a single spoken word to anyone. The loneliness hurts.", "emotion": "Sadness", "depression_related": 1, "indicator": "loneliness", "user_id": "u105", "turn": 1},
    {"text": "Akela baith ke bas ro raha hu. Why is loneliness so painful?", "emotion": "Sadness", "depression_related": 1, "indicator": "loneliness", "user_id": "u105", "turn": 2},
    {"text": "Koi apna nahi lagta is sheher me. Pure silence in my room.", "emotion": "Sadness", "depression_related": 1, "indicator": "loneliness", "user_id": "u106", "turn": 1},
    {"text": "Lost in my thoughts, surrounded by empty walls and cold loneliness.", "emotion": "Sadness", "depression_related": 1, "indicator": "loneliness", "user_id": "u106", "turn": 2},
    {"text": "Duniya aage badh rahi hai aur mai akela peeche chhoot gaya hu.", "emotion": "Sadness", "depression_related": 1, "indicator": "loneliness", "user_id": "u107", "turn": 1},
    {"text": "No messages, no calls, just endless solitude and crying inside.", "emotion": "Sadness", "depression_related": 1, "indicator": "loneliness", "user_id": "u107", "turn": 2},

    # ==================== SADNESS / HOPELESSNESS ====================
    {"text": "I don't think mai kabhi happy ho paungi. Future bilkul dark lagta hai.", "emotion": "Sadness", "depression_related": 1, "indicator": "hopelessness", "user_id": "u108", "turn": 1},
    {"text": "Koi ummeed nahi bachi ab, sab kuch try kar ke dekh liya nothing gets better.", "emotion": "Sadness", "depression_related": 1, "indicator": "hopelessness", "user_id": "u108", "turn": 2},
    {"text": "What is even the point of trying anymore when failure and misery are guaranteed?", "emotion": "Sadness", "depression_related": 1, "indicator": "hopelessness", "user_id": "u109", "turn": 1},
    {"text": "Zindagi me ab kuch accha hone ki umeed hi chhod di hai maine 😞", "emotion": "Sadness", "depression_related": 1, "indicator": "hopelessness", "user_id": "u109", "turn": 2},
    {"text": "Every morning I wake up praying the day ends quickly. Hope is an illusion.", "emotion": "Sadness", "depression_related": 1, "indicator": "hopelessness", "user_id": "u110", "turn": 1},
    {"text": "Meri kismat hi kharab hai, jitna bhi struggle karo darkness hi aati hai.", "emotion": "Sadness", "depression_related": 1, "indicator": "hopelessness", "user_id": "u110", "turn": 2},
    {"text": "No light at the end of this tunnel. Just endless despair and disappointment.", "emotion": "Sadness", "depression_related": 1, "indicator": "hopelessness", "user_id": "u111", "turn": 1},
    {"text": "Har baar lagta hai cheezein theek hongi, par aur battar ho jati hain. Given up completely.", "emotion": "Sadness", "depression_related": 1, "indicator": "hopelessness", "user_id": "u111", "turn": 2},
    {"text": "There is no future for me here. Everything is slipping away into hopeless void.", "emotion": "Sadness", "depression_related": 1, "indicator": "hopelessness", "user_id": "u112", "turn": 1},
    {"text": "Ab kuch sudharne wala nahi hai. Mai har chuka hu.", "emotion": "Sadness", "depression_related": 1, "indicator": "hopelessness", "user_id": "u112", "turn": 2},
    {"text": "Can not see any positive tomorrow. Living in total despair and hopeless thoughts.", "emotion": "Sadness", "depression_related": 1, "indicator": "hopelessness", "user_id": "u113", "turn": 1},
    {"text": "Sab sapne khatam ho gaye hain. Ab bas din guzar raha hu bina kisi umeed ke.", "emotion": "Sadness", "depression_related": 1, "indicator": "hopelessness", "user_id": "u113", "turn": 2},

    # ==================== SADNESS / EMOTIONAL EXHAUSTION ====================
    {"text": "Sab kuch overwhelming lag raha hai. Bas rone ka mann karta hai har waqt.", "emotion": "Sadness", "depression_related": 1, "indicator": "emotional_exhaustion", "user_id": "u114", "turn": 1},
    {"text": "I am so tired of pretending to be strong every single day. Mere andar energy nahi bachi.", "emotion": "Sadness", "depression_related": 1, "indicator": "emotional_exhaustion", "user_id": "u114", "turn": 2},
    {"text": "Mentally exhausted ho chuka hu. Sleeping 12 hours a day still waking up drained.", "emotion": "Sadness", "depression_related": 1, "indicator": "emotional_exhaustion", "user_id": "u115", "turn": 1},
    {"text": "It feels like carrying a heavy stone on my chest constantly. Dimaag phat raha h.", "emotion": "Sadness", "depression_related": 1, "indicator": "emotional_exhaustion", "user_id": "u115", "turn": 2},
    {"text": "Meri soul thak chuki hai yaar. Living has become an unbearable chore.", "emotion": "Sadness", "depression_related": 1, "indicator": "emotional_exhaustion", "user_id": "u116", "turn": 1},
    {"text": "Running on zero mental battery. Even simple tasks like taking a shower feel exhausting.", "emotion": "Sadness", "depression_related": 1, "indicator": "emotional_exhaustion", "user_id": "u116", "turn": 2},
    {"text": "Dimagi roop se bilkul toot chuka hu, ab aur ladne ki himmat nahi hai.", "emotion": "Sadness", "depression_related": 1, "indicator": "emotional_exhaustion", "user_id": "u117", "turn": 1},
    {"text": "Constantly feeling burnout and mental fatigue. Brain feels completely foggy and tired.", "emotion": "Sadness", "depression_related": 1, "indicator": "emotional_exhaustion", "user_id": "u117", "turn": 2},
    {"text": "Har roz subah uthna ek jung lagta hai. Extremely tired of everything.", "emotion": "Sadness", "depression_related": 1, "indicator": "emotional_exhaustion", "user_id": "u118", "turn": 1},
    {"text": "No energy left in my body or mind. Just emotionally drained and numb.", "emotion": "Sadness", "depression_related": 1, "indicator": "emotional_exhaustion", "user_id": "u118", "turn": 2},

    # ==================== SADNESS / NEGATIVE SELF-PERCEPTION ====================
    {"text": "Mai kisi kaam ka nahi hu, bas sabke upar ek burden banke reh gaya hu.", "emotion": "Sadness", "depression_related": 1, "indicator": "negative_self_perception", "user_id": "u119", "turn": 1},
    {"text": "I hate myself so much. Everyone around me achieves greatness while I ruin everything.", "emotion": "Sadness", "depression_related": 1, "indicator": "negative_self_perception", "user_id": "u119", "turn": 2},
    {"text": "Apne aap se ghin aane lagi hai. Why am I such a complete failure?", "emotion": "Sadness", "depression_related": 1, "indicator": "negative_self_perception", "user_id": "u120", "turn": 1},
    {"text": "Nobody deserves to tolerate me, I am fundamentally broken beyond repair 😭", "emotion": "Sadness", "depression_related": 1, "indicator": "negative_self_perception", "user_id": "u120", "turn": 2},
    {"text": "Mujhme hi koi badi kami hai. Log mujhse dur bhagte hain because I am useless.", "emotion": "Sadness", "depression_related": 1, "indicator": "negative_self_perception", "user_id": "u121", "turn": 1},
    {"text": "I am an imposter who deserves nothing good in this world.", "emotion": "Sadness", "depression_related": 1, "indicator": "negative_self_perception", "user_id": "u121", "turn": 2},
    {"text": "Khud ki shakal dekh kar gussa aur sharam aati hai. Waste of space.", "emotion": "Sadness", "depression_related": 1, "indicator": "negative_self_perception", "user_id": "u122", "turn": 1},
    {"text": "I am a total disappointment to my parents and friends.", "emotion": "Sadness", "depression_related": 1, "indicator": "negative_self_perception", "user_id": "u122", "turn": 2},
    {"text": "Mere hone ya na hone se kisi ko fark nahi padega. Completely worthless.", "emotion": "Sadness", "depression_related": 1, "indicator": "negative_self_perception", "user_id": "u123", "turn": 1},

    # ==================== SADNESS / LOSS OF INTEREST ====================
    {"text": "Pehle guitar bajana aur painting acchi lagti thi, ab kuch bhi feel nahi hota.", "emotion": "Sadness", "depression_related": 1, "indicator": "loss_of_interest", "user_id": "u124", "turn": 1},
    {"text": "Lost interest in all my hobbies. Everything just feels numb and meaningless.", "emotion": "Sadness", "depression_related": 1, "indicator": "loss_of_interest", "user_id": "u124", "turn": 2},
    {"text": "Favorite food bhi be-swaad lag raha hai. Kuch karne ka dil nahi chahta.", "emotion": "Sadness", "depression_related": 1, "indicator": "loss_of_interest", "user_id": "u125", "turn": 1},
    {"text": "Music used to bring me peace, now even my favorite songs sound hollow.", "emotion": "Sadness", "depression_related": 1, "indicator": "loss_of_interest", "user_id": "u125", "turn": 2},
    {"text": "Gaming, movies, hanging out... kuch bhi enjoy nahi kar pata ab. Total numbness.", "emotion": "Sadness", "depression_related": 1, "indicator": "loss_of_interest", "user_id": "u126", "turn": 1},
    {"text": "Nothing excites me anymore. Dil bilkul patthar jaisa ho gaya hai.", "emotion": "Sadness", "depression_related": 1, "indicator": "loss_of_interest", "user_id": "u126", "turn": 2},

    # ==================== SITUATIONAL SADNESS (Non-Depressive) ====================
    {"text": "India lost the World Cup final match yesterday. Sab fans ka dil toot gaya yaar 💔", "emotion": "Sadness", "depression_related": 0, "indicator": "none", "user_id": "u127", "turn": 1},
    {"text": "My phone screen cracked after falling on the pavement. Sad to see the repair bill.", "emotion": "Sadness", "depression_related": 0, "indicator": "none", "user_id": "u128", "turn": 1},
    {"text": "Missed the morning train by just 2 minutes. Now waiting 3 hours at station.", "emotion": "Sadness", "depression_related": 0, "indicator": "none", "user_id": "u129", "turn": 1},
    {"text": "Saying goodbye to college campus today. Bitter-sweet memories of 4 wonderful years.", "emotion": "Sadness", "depression_related": 0, "indicator": "none", "user_id": "u130", "turn": 1},
    {"text": "Our favorite neighborhood coffee shop is closing down permanently next week. Will miss it.", "emotion": "Sadness", "depression_related": 0, "indicator": "none", "user_id": "u131", "turn": 1},
    {"text": "Dog got sick and had to stay overnight at the vet clinic. Very worried and sad.", "emotion": "Sadness", "depression_related": 0, "indicator": "none", "user_id": "u132", "turn": 1},
    {"text": "It rained on the day of our outdoor picnic plan. Everyone was disappointed.", "emotion": "Sadness", "depression_related": 0, "indicator": "none", "user_id": "u133", "turn": 1},

    # ==================== ANXIETY / WORRY ====================
    {"text": "Exam kal subah hai and my heart is beating like crazy! Bhot nervousness ho rahi h 😰", "emotion": "Anxiety/Worry", "depression_related": 0, "indicator": "none", "user_id": "u201", "turn": 1},
    {"text": "Job interview ke results aane wale hain, hands are shaking with panic.", "emotion": "Anxiety/Worry", "depression_related": 0, "indicator": "none", "user_id": "u202", "turn": 1},
    {"text": "Kuch galat hone ka darr lag raha hai bina kisi reason ke, overthinking peak pe hai.", "emotion": "Anxiety/Worry", "depression_related": 0, "indicator": "none", "user_id": "u203", "turn": 1},
    {"text": "Flight boarding in 20 minutes and I am caught in a security check queue! Sweating bullets.", "emotion": "Anxiety/Worry", "depression_related": 0, "indicator": "none", "user_id": "u204", "turn": 1},
    {"text": "Achanak se chest tight ho gayi aur saans lene me dikkat hui. Panic attack jaisa laga.", "emotion": "Anxiety/Worry", "depression_related": 0, "indicator": "none", "user_id": "u205", "turn": 1},
    {"text": "Waiting for blood test reports. Doctor had a serious expression which made me terrified.", "emotion": "Anxiety/Worry", "depression_related": 0, "indicator": "none", "user_id": "u206", "turn": 1},
    {"text": "Why do I over-analyze every single email I send to my client? Pure anxiety.", "emotion": "Anxiety/Worry", "depression_related": 0, "indicator": "none", "user_id": "u207", "turn": 1},
    {"text": "Presentation stage pe aate hi I froze. Sab log dekh rahe the, pure anxiety overload.", "emotion": "Anxiety/Worry", "depression_related": 0, "indicator": "none", "user_id": "u208", "turn": 1},
    {"text": "Palpitations and restless mind. Can not calm my racing thoughts tonight.", "emotion": "Anxiety/Worry", "depression_related": 0, "indicator": "none", "user_id": "u209", "turn": 1},
    {"text": "Deadline is approaching in 2 hours and code has 5 unresolved compilation bugs!", "emotion": "Anxiety/Worry", "depression_related": 0, "indicator": "none", "user_id": "u210", "turn": 1},
    {"text": "So much tension and nervous chills about future career decisions.", "emotion": "Anxiety/Worry", "depression_related": 0, "indicator": "none", "user_id": "u211", "turn": 1},

    # ==================== ANGER ====================
    {"text": "Yeh customer care service bilkul useless hai! 2 ghante se call hold pe daala hua h 😡", "emotion": "Anger", "depression_related": 0, "indicator": "none", "user_id": "u212", "turn": 1},
    {"text": "My manager took credit for my entire project presentation! So furious right now.", "emotion": "Anger", "depression_related": 0, "indicator": "none", "user_id": "u213", "turn": 1},
    {"text": "Traffic me 3 ghante waste ho gaye. Why can't the municipal corporation fix the potholes?!", "emotion": "Anger", "depression_related": 0, "indicator": "none", "user_id": "u214", "turn": 1},
    {"text": "Courier delivery guy marked package delivered without even arriving. Cheaters!!", "emotion": "Anger", "depression_related": 0, "indicator": "none", "user_id": "u215", "turn": 1},
    {"text": "Internet disconnected right during the bidding war. Itna gussa kabhi nahi aaya!", "emotion": "Anger", "depression_related": 0, "indicator": "none", "user_id": "u216", "turn": 1},
    {"text": "Stop spreading fake propaganda on Twitter! Sick of these toxic trolls.", "emotion": "Anger", "depression_related": 0, "indicator": "none", "user_id": "u217", "turn": 1},
    {"text": "Landlord deducted half the security deposit for normal wear and tear. Complete scam!", "emotion": "Anger", "depression_related": 0, "indicator": "none", "user_id": "u218", "turn": 1},
    {"text": "Bakwas service and arrogant attitude of the bank staff. I will lodge an official complaint.", "emotion": "Anger", "depression_related": 0, "indicator": "none", "user_id": "u219", "turn": 1},
    {"text": "Why do people cut lines without any shame? It makes my blood boil with anger.", "emotion": "Anger", "depression_related": 0, "indicator": "none", "user_id": "u220", "turn": 1},
    {"text": "Total incompetence! How dare they misplace my original passport documents?!", "emotion": "Anger", "depression_related": 0, "indicator": "none", "user_id": "u221", "turn": 1},

    # ==================== JOY ====================
    {"text": "Yay! Finally cracked the Google Summer of Code internship! Mehnat rang layi 🎉✨", "emotion": "Joy", "depression_related": 0, "indicator": "none", "user_id": "u301", "turn": 1},
    {"text": "Had the best chai and samosa evening with my school buddies. Dil khush ho gaya ❤️", "emotion": "Joy", "depression_related": 0, "indicator": "none", "user_id": "u302", "turn": 1},
    {"text": "The mountain trek was breathtaking! Pure serenity and fresh breeze in Manali.", "emotion": "Joy", "depression_related": 0, "indicator": "none", "user_id": "u303", "turn": 1},
    {"text": "Mom surprised me with my favorite kheer on my birthday! Feeling so blessed.", "emotion": "Joy", "depression_related": 0, "indicator": "none", "user_id": "u304", "turn": 1},
    {"text": "We adopted a golden retriever puppy today! He is the most adorable baby ever 🐶🥰", "emotion": "Joy", "depression_related": 0, "indicator": "none", "user_id": "u305", "turn": 1},
    {"text": "Promoted to Senior Software Engineer! Cheers to hard work and incredible mentorship.", "emotion": "Joy", "depression_related": 0, "indicator": "none", "user_id": "u306", "turn": 1},
    {"text": "India won the thriller cricket match in the final over! Absolute euphoria in the stadium!", "emotion": "Joy", "depression_related": 0, "indicator": "none", "user_id": "u307", "turn": 1},
    {"text": "Successfully published our research paper in IEEE Transactions! Dreams do come true.", "emotion": "Joy", "depression_related": 0, "indicator": "none", "user_id": "u308", "turn": 1},
    {"text": "Dancing with full joy at my sister's wedding sangeet ceremony! Incredible vibes.", "emotion": "Joy", "depression_related": 0, "indicator": "none", "user_id": "u309", "turn": 1},
    {"text": "Got the US visa approved without any hassle! Celebrating with family tonight.", "emotion": "Joy", "depression_related": 0, "indicator": "none", "user_id": "u310", "turn": 1},
    {"text": "Sunny morning, birds singing and a delicious cup of filter coffee. Wonderful feeling.", "emotion": "Joy", "depression_related": 0, "indicator": "none", "user_id": "u311", "turn": 1},

    # ==================== NEUTRAL ====================
    {"text": "React 19 release notes are out today. Looking forward to testing the compiler.", "emotion": "Neutral", "depression_related": 0, "indicator": "none", "user_id": "u401", "turn": 1},
    {"text": "Metro route check kar rha tha, Rajiv Chowk pe interchange karke Noida jana h.", "emotion": "Neutral", "depression_related": 0, "indicator": "none", "user_id": "u402", "turn": 1},
    {"text": "Can someone recommend good noise-cancelling headphones under 5000 INR?", "emotion": "Neutral", "depression_related": 0, "indicator": "none", "user_id": "u403", "turn": 1},
    {"text": "Completed today's 5km morning jog around the neighborhood park.", "emotion": "Neutral", "depression_related": 0, "indicator": "none", "user_id": "u404", "turn": 1},
    {"text": "Flight leaves at 6:30 AM tomorrow. Packed bags and kept boarding passes ready.", "emotion": "Neutral", "depression_related": 0, "indicator": "none", "user_id": "u405", "turn": 1},
    {"text": "Python 3.12 syntax updates have some neat improvements for type annotations.", "emotion": "Neutral", "depression_related": 0, "indicator": "none", "user_id": "u406", "turn": 1},
    {"text": "Weather forecast says light showers expected across Delhi-NCR by evening.", "emotion": "Neutral", "depression_related": 0, "indicator": "none", "user_id": "u407", "turn": 1},
    {"text": "Reviewing pull request #45 for backend database migration scripts.", "emotion": "Neutral", "depression_related": 0, "indicator": "none", "user_id": "u408", "turn": 1},
    {"text": "Meeting scheduled for 3 PM has been shifted to conference room B.", "emotion": "Neutral", "depression_related": 0, "indicator": "none", "user_id": "u409", "turn": 1},
    {"text": "Purchased groceries from the local supermarket for the upcoming week.", "emotion": "Neutral", "depression_related": 0, "indicator": "none", "user_id": "u410", "turn": 1},
    {"text": "Replaced the car battery after 3 years of usage.", "emotion": "Neutral", "depression_related": 0, "indicator": "none", "user_id": "u411", "turn": 1},

    # ==================== DISGUST ====================
    {"text": "The food served at this restaurant was stale and smelling weird. Disgusting hygiene 🤢", "emotion": "Disgust", "depression_related": 0, "indicator": "none", "user_id": "u601", "turn": 1},
    {"text": "Seeing people throw plastic bottles in the pristine river makes me sick.", "emotion": "Disgust", "depression_related": 0, "indicator": "none", "user_id": "u602", "turn": 1},
    {"text": "Corrupt politicians shamelessly asking for bribes in broad daylight. Repulsive behavior.", "emotion": "Disgust", "depression_related": 0, "indicator": "none", "user_id": "u603", "turn": 1},
    {"text": "Cockroach crawling inside the cinema hall seat. Yuck! Walked right out.", "emotion": "Disgust", "depression_related": 0, "indicator": "none", "user_id": "u604", "turn": 1},
    {"text": "Garbage dumped open on the sidewalk emitting foul stench. Utterly filthy municipal state.", "emotion": "Disgust", "depression_related": 0, "indicator": "none", "user_id": "u605", "turn": 1},
    {"text": "Creepy stalker messages in my inbox. Absolute disgust towards these predators.", "emotion": "Disgust", "depression_related": 0, "indicator": "none", "user_id": "u606", "turn": 1},
    {"text": "Greasy dirty kitchen utensils in the roadside dhaba. Lost my appetite completely.", "emotion": "Disgust", "depression_related": 0, "indicator": "none", "user_id": "u607", "turn": 1},

    # ==================== FEAR ====================
    {"text": "Heard weird noises outside my window in the middle of the night. Ghar pe akela hu.", "emotion": "Fear", "depression_related": 0, "indicator": "none", "user_id": "u701", "turn": 1},
    {"text": "Thunderstorm and lightning knocked out all power lines in the colony. Scared of dark.", "emotion": "Fear", "depression_related": 0, "indicator": "none", "user_id": "u702", "turn": 1},
    {"text": "Stray dog chased my bike at 2 AM in the empty street! Heart stopped for a moment.", "emotion": "Fear", "depression_related": 0, "indicator": "none", "user_id": "u703", "turn": 1},
    {"text": "Earthquake tremors felt in North India just now. Everyone rushed downstairs out of the flats.", "emotion": "Fear", "depression_related": 0, "indicator": "none", "user_id": "u704", "turn": 1},
    {"text": "Walking down the pitch dark alley alone and hearing footsteps behind me. Terrified.", "emotion": "Fear", "depression_related": 0, "indicator": "none", "user_id": "u705", "turn": 1},
    {"text": "Car slipped on wet highway oil spill, almost crashed into the divider! Shivering with terror.", "emotion": "Fear", "depression_related": 0, "indicator": "none", "user_id": "u706", "turn": 1},
    {"text": "Scary nightmare woke me up gasping for breath in cold sweat.", "emotion": "Fear", "depression_related": 0, "indicator": "none", "user_id": "u707", "turn": 1}
]


def generate_dataset():
    base_time = datetime.now()
    records = []

    for i, item in enumerate(DATASET):
        timestamp = (base_time - timedelta(days=20 - (i % 20), hours=i * 2)).isoformat()
        records.append({
            "id": f"samp_{i+1:04d}",
            "text": item["text"],
            "emotion": item["emotion"],
            "depression_related": item["depression_related"],
            "indicator": item["indicator"],
            "user_id": item["user_id"],
            "turn": item["turn"],
            "timestamp": timestamp,
            "language": "Hinglish / English"
        })

    out_path = os.path.join(os.path.dirname(__file__), "processed", "code_mixed_dataset.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)

    print(f"Generated {len(records)} balanced samples for Cognivibe AI.")
    return records


if __name__ == "__main__":
    generate_dataset()

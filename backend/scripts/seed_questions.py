from typing import List, Dict, Any

# 3 Units (Section 1)
# 4 Skills (Lessons) per unit = 12 Skills total
# 1 Lesson per Skill = 12 Lessons
# 6 Exercises per Lesson = 72 Exercises

UNITS_SEED = [
    {"id": 1, "title": "Unit 1: Getting Started", "order": 1, "section": 1},
    {"id": 2, "title": "Unit 2: Food & Dining", "order": 2, "section": 1},
    {"id": 3, "title": "Unit 3: People & Daily Life", "order": 3, "section": 1},
]

SKILLS_SEED = [
    {"id": 1, "unit_id": 1, "title": "Basics 1", "icon": "star", "order": 1},
    {"id": 2, "unit_id": 1, "title": "Basics 2", "icon": "star", "order": 2},
    {"id": 3, "unit_id": 1, "title": "Greetings", "icon": "message-circle", "order": 3},
    {"id": 4, "unit_id": 1, "title": "Travel", "icon": "plane", "order": 4},

    {"id": 5, "unit_id": 2, "title": "Food 1", "icon": "cup-soda", "order": 1},
    {"id": 6, "unit_id": 2, "title": "Food 2", "icon": "cup-soda", "order": 2},
    {"id": 7, "unit_id": 2, "title": "Restaurant", "icon": "utensils", "order": 3},
    {"id": 8, "unit_id": 2, "title": "Drinks", "icon": "coffee", "order": 4},

    {"id": 9, "unit_id": 3, "title": "Family", "icon": "home", "order": 1},
    {"id": 10, "unit_id": 3, "title": "Describing", "icon": "user", "order": 2},
    {"id": 11, "unit_id": 3, "title": "Routines", "icon": "clock", "order": 3},
    {"id": 12, "unit_id": 3, "title": "Clothing", "icon": "shopping-bag", "order": 4},
]

LESSONS_SEED = [
    {"id": 1, "skill_id": 1, "order": 1},
    {"id": 2, "skill_id": 2, "order": 1},
    {"id": 3, "skill_id": 3, "order": 1},
    {"id": 4, "skill_id": 4, "order": 1},
    {"id": 5, "skill_id": 5, "order": 1},
    {"id": 6, "skill_id": 6, "order": 1},
    {"id": 7, "skill_id": 7, "order": 1},
    {"id": 8, "skill_id": 8, "order": 1},
    {"id": 9, "skill_id": 9, "order": 1},
    {"id": 10, "skill_id": 10, "order": 1},
    {"id": 11, "skill_id": 11, "order": 1},
    {"id": 12, "skill_id": 12, "order": 1},
]

EXERCISES_SEED = []

# Lesson 1 (Skill 1: Basics 1)
EXERCISES_SEED.extend([
    {"id": 1, "lesson_id": 1, "type": "multiple_choice", "question": "Which one means 'boy'?", "options": ["niño", "niña", "hombre", "mujer"], "correct_answer": "niño"},
    {"id": 2, "lesson_id": 1, "type": "multiple_choice", "question": "Which one means 'girl'?", "options": ["niño", "niña", "hombre", "mujer"], "correct_answer": "niña"},
    {"id": 3, "lesson_id": 1, "type": "translate", "question": "I am a boy", "options": ["yo", "soy", "un", "niño"], "correct_answer": "yo soy un niño"},
    {"id": 4, "lesson_id": 1, "type": "translate", "question": "I am a girl", "options": ["yo", "soy", "una", "niña"], "correct_answer": "yo soy una niña"},
    {"id": 5, "lesson_id": 1, "type": "fill_blank", "question": "Yo ___ un niño", "options": ["soy", "eres", "es"], "correct_answer": "soy"},
    {"id": 6, "lesson_id": 1, "type": "match", "question": "Match the pairs", "options": ['{"left":"boy","right":"niño"}', '{"left":"girl","right":"niña"}', '{"left":"I am","right":"yo soy"}'], "correct_answer": "I am:yo soy,boy:niño,girl:niña"},
])

# Lesson 2 (Skill 2: Basics 2)
EXERCISES_SEED.extend([
    {"id": 7, "lesson_id": 2, "type": "multiple_choice", "question": "Which one means 'man'?", "options": ["niño", "niña", "hombre", "mujer"], "correct_answer": "hombre"},
    {"id": 8, "lesson_id": 2, "type": "multiple_choice", "question": "Which one means 'woman'?", "options": ["niño", "niña", "hombre", "mujer"], "correct_answer": "mujer"},
    {"id": 9, "lesson_id": 2, "type": "translate", "question": "You are a man", "options": ["tú", "eres", "un", "hombre"], "correct_answer": "tú eres un hombre"},
    {"id": 10, "lesson_id": 2, "type": "translate", "question": "She is a woman", "options": ["ella", "es", "una", "mujer"], "correct_answer": "ella es una mujer"},
    {"id": 11, "lesson_id": 2, "type": "fill_blank", "question": "Tú ___ un hombre", "options": ["soy", "eres", "es"], "correct_answer": "eres"},
    {"id": 12, "lesson_id": 2, "type": "arrange_sentence", "question": "Arrange the sentence for 'He is a man'", "options": ["hombre", "un", "es", "él"], "correct_answer": "él es un hombre"},
])

# Lesson 3 (Skill 3: Greetings)
EXERCISES_SEED.extend([
    {"id": 13, "lesson_id": 3, "type": "multiple_choice", "question": "Which one means 'hello'?", "options": ["hola", "adiós", "gracias", "por favor"], "correct_answer": "hola"},
    {"id": 14, "lesson_id": 3, "type": "multiple_choice", "question": "Which one means 'goodbye'?", "options": ["hola", "adiós", "gracias", "por favor"], "correct_answer": "adiós"},
    {"id": 15, "lesson_id": 3, "type": "translate", "question": "Hello, how are you?", "options": ["hola", "cómo", "estás"], "correct_answer": "hola cómo estás"},
    {"id": 16, "lesson_id": 3, "type": "translate", "question": "Thank you, goodbye", "options": ["gracias", "adiós", "hola"], "correct_answer": "gracias adiós"},
    {"id": 17, "lesson_id": 3, "type": "fill_blank", "question": "___ favor", "options": ["por", "para", "con"], "correct_answer": "por"},
    {"id": 18, "lesson_id": 3, "type": "arrange_sentence", "question": "Arrange the sentence for 'Good morning'", "options": ["días", "buenos"], "correct_answer": "buenos días"},
])

# Lesson 4 (Skill 4: Travel)
EXERCISES_SEED.extend([
    {"id": 19, "lesson_id": 4, "type": "multiple_choice", "question": "Which one means 'suitcase'?", "options": ["maleta", "pasaporte", "boleto", "taxi"], "correct_answer": "maleta"},
    {"id": 20, "lesson_id": 4, "type": "multiple_choice", "question": "Which one means 'passport'?", "options": ["maleta", "pasaporte", "boleto", "taxi"], "correct_answer": "pasaporte"},
    {"id": 21, "lesson_id": 4, "type": "translate", "question": "I need a taxi", "options": ["yo", "necesito", "un", "taxi"], "correct_answer": "yo necesito un taxi"},
    {"id": 22, "lesson_id": 4, "type": "translate", "question": "Where is the airport?", "options": ["dónde", "está", "el", "aeropuerto"], "correct_answer": "dónde está el aeropuerto"},
    {"id": 23, "lesson_id": 4, "type": "fill_blank", "question": "El ___ por favor", "options": ["pasaporte", "maleta", "taxi"], "correct_answer": "pasaporte"},
    {"id": 24, "lesson_id": 4, "type": "match", "question": "Match the travel words", "options": ['{"left":"ticket","right":"boleto"}', '{"left":"suitcase","right":"maleta"}', '{"left":"taxi","right":"taxi"}'], "correct_answer": "suitcase:maleta,taxi:taxi,ticket:boleto"},
])

# Lesson 5 (Skill 5: Food 1)
EXERCISES_SEED.extend([
    {"id": 25, "lesson_id": 5, "type": "multiple_choice", "question": "Which one means 'bread'?", "options": ["pan", "agua", "leche", "queso"], "correct_answer": "pan"},
    {"id": 26, "lesson_id": 5, "type": "multiple_choice", "question": "Which one means 'water'?", "options": ["pan", "agua", "leche", "queso"], "correct_answer": "agua"},
    {"id": 27, "lesson_id": 5, "type": "translate", "question": "I eat bread", "options": ["yo", "como", "pan"], "correct_answer": "yo como pan"},
    {"id": 28, "lesson_id": 5, "type": "translate", "question": "I drink water", "options": ["yo", "bebo", "agua"], "correct_answer": "yo bebo agua"},
    {"id": 29, "lesson_id": 5, "type": "fill_blank", "question": "Yo bebo ___", "options": ["agua", "pan", "queso"], "correct_answer": "agua"},
    {"id": 30, "lesson_id": 5, "type": "arrange_sentence", "question": "Arrange for 'I eat cheese'", "options": ["queso", "como", "yo"], "correct_answer": "yo como queso"},
])

# Lesson 6 (Skill 6: Food 2)
EXERCISES_SEED.extend([
    {"id": 31, "lesson_id": 6, "type": "multiple_choice", "question": "Which one means 'apple'?", "options": ["manzana", "pescado", "carne", "naranja"], "correct_answer": "manzana"},
    {"id": 32, "lesson_id": 6, "type": "multiple_choice", "question": "Which one means 'meat'?", "options": ["manzana", "pescado", "carne", "naranja"], "correct_answer": "carne"},
    {"id": 33, "lesson_id": 6, "type": "translate", "question": "She eats an apple", "options": ["ella", "come", "una", "manzana"], "correct_answer": "ella come una manzana"},
    {"id": 34, "lesson_id": 6, "type": "translate", "question": "We eat meat", "options": ["nosotros", "comemos", "carne"], "correct_answer": "nosotros comemos carne"},
    {"id": 35, "lesson_id": 6, "type": "fill_blank", "question": "Ella come ___ manzana", "options": ["una", "un", "unos"], "correct_answer": "una"},
    {"id": 36, "lesson_id": 6, "type": "match", "question": "Match food words", "options": ['{"left":"apple","right":"manzana"}', '{"left":"meat","right":"carne"}', '{"left":"fish","right":"pescado"}'], "correct_answer": "apple:manzana,fish:pescado,meat:carne"},
])

# Lesson 7 (Skill 7: Restaurant)
EXERCISES_SEED.extend([
    {"id": 37, "lesson_id": 7, "type": "multiple_choice", "question": "Which one means 'menu'?", "options": ["menú", "cuenta", "mesa", "mesero"], "correct_answer": "menú"},
    {"id": 38, "lesson_id": 7, "type": "multiple_choice", "question": "Which one means 'bill'?", "options": ["menú", "cuenta", "mesa", "mesero"], "correct_answer": "cuenta"},
    {"id": 39, "lesson_id": 7, "type": "translate", "question": "The bill, please", "options": ["la", "cuenta", "por", "favor"], "correct_answer": "la cuenta por favor"},
    {"id": 40, "lesson_id": 7, "type": "translate", "question": "A table for two", "options": ["una", "mesa", "para", "dos"], "correct_answer": "una mesa para dos"},
    {"id": 41, "lesson_id": 7, "type": "fill_blank", "question": "La cuenta, por ___", "options": ["favor", "para", "con"], "correct_answer": "favor"},
    {"id": 42, "lesson_id": 7, "type": "arrange_sentence", "question": "Arrange for 'Where is the menu?'", "options": ["está", "el", "menú", "dónde"], "correct_answer": "dónde está el menú"},
])

# Lesson 8 (Skill 8: Drinks)
EXERCISES_SEED.extend([
    {"id": 43, "lesson_id": 8, "type": "multiple_choice", "question": "Which one means 'coffee'?", "options": ["café", "té", "jugo", "cerveza"], "correct_answer": "café"},
    {"id": 44, "lesson_id": 8, "type": "multiple_choice", "question": "Which one means 'tea'?", "options": ["café", "té", "jugo", "cerveza"], "correct_answer": "té"},
    {"id": 45, "lesson_id": 8, "type": "translate", "question": "I drink coffee with milk", "options": ["yo", "bebo", "café", "con", "leche"], "correct_answer": "yo bebo café con leche"},
    {"id": 46, "lesson_id": 8, "type": "translate", "question": "You drink tea", "options": ["tú", "bebes", "té"], "correct_answer": "tú bebes té"},
    {"id": 47, "lesson_id": 8, "type": "fill_blank", "question": "Jugo de ___", "options": ["naranja", "pan", "carne"], "correct_answer": "naranja"},
    {"id": 48, "lesson_id": 8, "type": "match", "question": "Match the drinks", "options": ['{"left":"coffee","right":"café"}', '{"left":"tea","right":"té"}', '{"left":"juice","right":"jugo"}'], "correct_answer": "coffee:café,juice:jugo,tea:té"},
])

# Lesson 9 (Skill 9: Family)
EXERCISES_SEED.extend([
    {"id": 49, "lesson_id": 9, "type": "multiple_choice", "question": "Which one means 'mother'?", "options": ["madre", "padre", "hermano", "hermana"], "correct_answer": "madre"},
    {"id": 50, "lesson_id": 9, "type": "multiple_choice", "question": "Which one means 'father'?", "options": ["madre", "padre", "hermano", "hermana"], "correct_answer": "padre"},
    {"id": 51, "lesson_id": 9, "type": "translate", "question": "My father is tall", "options": ["mi", "padre", "es", "alto"], "correct_answer": "mi padre es alto"},
    {"id": 52, "lesson_id": 9, "type": "translate", "question": "My mother is intelligent", "options": ["mi", "madre", "es", "inteligente"], "correct_answer": "mi madre es inteligente"},
    {"id": 53, "lesson_id": 9, "type": "fill_blank", "question": "___ padre es cubano", "options": ["mi", "mis", "yo"], "correct_answer": "mi"},
    {"id": 54, "lesson_id": 9, "type": "arrange_sentence", "question": "Arrange for 'I have a brother'", "options": ["hermano", "un", "tengo", "yo"], "correct_answer": "yo tengo un hermano"},
])

# Lesson 10 (Skill 10: Describing)
EXERCISES_SEED.extend([
    {"id": 55, "lesson_id": 10, "type": "multiple_choice", "question": "Which one means 'happy'?", "options": ["feliz", "triste", "cansado", "enojado"], "correct_answer": "feliz"},
    {"id": 56, "lesson_id": 10, "type": "multiple_choice", "question": "Which one means 'sad'?", "options": ["feliz", "triste", "cansado", "enojado"], "correct_answer": "triste"},
    {"id": 57, "lesson_id": 10, "type": "translate", "question": "I am happy", "options": ["yo", "estoy", "feliz"], "correct_answer": "yo estoy feliz"},
    {"id": 58, "lesson_id": 10, "type": "translate", "question": "She is sad", "options": ["ella", "está", "triste"], "correct_answer": "ella está triste"},
    {"id": 59, "lesson_id": 10, "type": "fill_blank", "question": "Tú ___ cansado", "options": ["estás", "eres", "es"], "correct_answer": "estás"},
    {"id": 60, "lesson_id": 10, "type": "match", "question": "Match emotions", "options": ['{"left":"happy","right":"feliz"}', '{"left":"sad","right":"triste"}', '{"left":"tired","right":"cansado"}'], "correct_answer": "happy:feliz,sad:triste,tired:cansado"},
])

# Lesson 11 (Skill 11: Routines)
EXERCISES_SEED.extend([
    {"id": 61, "lesson_id": 11, "type": "multiple_choice", "question": "Which one means 'to sleep'?", "options": ["dormir", "comer", "beber", "leer"], "correct_answer": "dormir"},
    {"id": 62, "lesson_id": 11, "type": "multiple_choice", "question": "Which one means 'to read'?", "options": ["dormir", "comer", "beber", "leer"], "correct_answer": "leer"},
    {"id": 63, "lesson_id": 11, "type": "translate", "question": "I read a book", "options": ["yo", "leo", "un", "libro"], "correct_answer": "yo leo un libro"},
    {"id": 64, "lesson_id": 11, "type": "translate", "question": "She sleeps a lot", "options": ["ella", "duerme", "mucho"], "correct_answer": "ella duerme mucho"},
    {"id": 65, "lesson_id": 11, "type": "fill_blank", "question": "Yo ___ a las diez", "options": ["duermo", "duerme", "duermes"], "correct_answer": "duermo"},
    {"id": 66, "lesson_id": 11, "type": "arrange_sentence", "question": "Arrange for 'I work every day'", "options": ["días", "todos", "los", "trabajo", "yo"], "correct_answer": "yo trabajo todos los días"},
])

# Lesson 12 (Skill 12: Clothing)
EXERCISES_SEED.extend([
    {"id": 67, "lesson_id": 12, "type": "multiple_choice", "question": "Which one means 'shirt'?", "options": ["camisa", "pantalón", "zapato", "vestido"], "correct_answer": "camisa"},
    {"id": 68, "lesson_id": 12, "type": "multiple_choice", "question": "Which one means 'shoe'?", "options": ["camisa", "pantalón", "zapato", "vestido"], "correct_answer": "zapato"},
    {"id": 69, "lesson_id": 12, "type": "translate", "question": "I buy a shirt", "options": ["yo", "compro", "una", "camisa"], "correct_answer": "yo compro una camisa"},
    {"id": 70, "lesson_id": 12, "type": "translate", "question": "He wears shoes", "options": ["él", "usa", "zapatos"], "correct_answer": "él usa zapatos"},
    {"id": 71, "lesson_id": 12, "type": "fill_blank", "question": "Una camisa ___", "options": ["roja", "rojo", "rojos"], "correct_answer": "roja"},
    {"id": 72, "lesson_id": 12, "type": "match", "question": "Match clothes", "options": ['{"left":"shirt","right":"camisa"}', '{"left":"shoe","right":"zapato"}', '{"left":"dress","right":"vestido"}'], "correct_answer": "dress:vestido,shirt:camisa,shoe:zapato"},
])

# disease_info.py
#
# Stores human-readable descriptions, symptoms, and causes for each
# recognised skin condition. Used to enrich the model's raw predictions
# with structured, actionable content for the end-user.

DISEASE_DATABASE = {
    "acne": {
        "description": "A common skin condition caused by clogged hair follicles with oil and dead skin cells, resulting in pimples, blackheads, and whiteheads.",
        "symptoms": ["Whiteheads and blackheads", "Red or tender bumps (pimples)", "Pus-filled lumps", "Large solid painful lumps under skin", "Oily or greasy skin"],
        "causes": ["Excess oil production", "Bacterial growth (C. acnes)", "Hormonal changes", "Dead skin cell buildup", "Certain medications"],
        "urgency": "Consult a dermatologist for persistent or severe acne"
    },
    "rosacea": {
        "description": "A chronic skin condition causing facial redness, visible blood vessels, and sometimes acne-like bumps.",
        "symptoms": ["Facial redness and flushing", "Visible blood vessels on nose and cheeks", "Swollen red bumps", "Eye irritation", "Enlarged nose (in severe cases)"],
        "causes": ["Genetics", "Environmental triggers (sun, heat, spicy food)", "Abnormal facial blood vessels", "Skin microbiome imbalance"],
        "urgency": "Consult a dermatologist for long-term management"
    },
    "melanoma": {
        "description": "A serious form of skin cancer that develops in melanocytes (pigment cells). Early detection is critical for successful treatment.",
        "symptoms": ["Asymmetric mole or spot", "Irregular or ragged border", "Multiple colours in one spot (brown, black, red, white)", "Diameter larger than 6mm", "Mole that is changing or growing"],
        "causes": ["UV radiation exposure", "Family history of melanoma", "Fair skin type", "History of severe sunburns", "Weakened immune system"],
        "urgency": "See a dermatologist immediately — do not delay"
    },
    "basal cell carcinoma": {
        "description": "The most common form of skin cancer. Grows slowly and rarely spreads, but requires treatment.",
        "symptoms": ["Pearly or waxy bump", "Flat flesh-coloured or brown scar-like lesion", "Bleeding or scabbing sore that heals and returns", "Pink growth with raised edges", "White or yellow waxy area"],
        "causes": ["Chronic UV exposure", "History of sunburns", "Fair skin", "Radiation exposure", "Long-term arsenic exposure"],
        "urgency": "Consult a dermatologist soon for biopsy and treatment"
    },
    "eczema": {
        "description": "A chronic inflammatory skin condition causing dry, itchy, and inflamed skin patches. Often flares with triggers.",
        "symptoms": ["Intense itching especially at night", "Dry, sensitive skin", "Red to brownish-grey patches", "Small raised bumps that may weep fluid", "Thickened, cracked, or scaly skin"],
        "causes": ["Immune system dysfunction", "Genetic factors (family history)", "Environmental triggers (soap, dust, sweat)", "Skin barrier dysfunction", "Stress"],
        "urgency": "Consult a dermatologist for ongoing management and treatment"
    },
    "psoriasis": {
        "description": "A chronic autoimmune condition that causes rapid skin cell buildup, leading to scaling on the skin surface.",
        "symptoms": ["Red patches covered with thick silvery scales", "Dry and cracked skin that may bleed", "Itching, burning, or soreness", "Thickened, pitted, or ridged nails", "Swollen or stiff joints"],
        "causes": ["Immune system malfunction (T-cell attack on skin)", "Genetic predisposition", "Stress or infection as triggers", "Certain medications", "Smoking and alcohol"],
        "urgency": "Consult a dermatologist — ongoing treatment required"
    },
    "ringworm": {
        "description": "A common fungal infection of the skin (not a worm) that causes a distinctive ring-shaped rash.",
        "symptoms": ["Ring-shaped red rash with clear centre", "Scaly, itchy, red skin", "Slowly expanding ring over time", "Hair loss in the affected area (on scalp)", "Slight raising at the ring border"],
        "causes": ["Fungal infection (dermatophytes)", "Direct skin-to-skin contact with infected person", "Contact with infected animals (dogs, cats)", "Sharing combs, towels, or clothing"],
        "urgency": "Antifungal treatment needed — consult a pharmacist or doctor"
    },
    "nail fungus": {
        "description": "A fungal infection that begins under the nail tip and can spread to the entire nail if untreated.",
        "symptoms": ["Thickened nail", "Whitish to yellow-brown discolouration", "Brittle, crumbly, or ragged nail", "Distorted nail shape", "Slightly foul smell", "Nail separating from nail bed"],
        "causes": ["Fungal organisms (dermatophytes)", "Walking barefoot in gyms or pools", "Minor nail injuries", "Poor blood circulation", "Weakened immune system"],
        "urgency": "Consult a dermatologist for prescription antifungal treatment"
    },
    "hair loss": {
        "description": "Alopecia refers to hair loss from the scalp or body, ranging from small patches to complete baldness.",
        "symptoms": ["Gradual thinning on top of head", "Circular or patchy bald spots", "Sudden loosening of hair", "Full-body hair loss", "Patches of scaling on the scalp"],
        "causes": ["Hereditary hair loss (most common)", "Hormonal changes", "Autoimmune condition (alopecia areata)", "Stress or shock", "Nutritional deficiencies (iron, protein)"],
        "urgency": "Consult a dermatologist to identify the cause and treatment"
    },
    "herpes": {
        "description": "Viral skin infections including herpes simplex and HPV that cause blisters, sores, or warts on the skin.",
        "symptoms": ["Painful blisters or sores", "Itching or burning before outbreak", "Fluid-filled blisters that crust over", "Skin-coloured or pink warts", "Swollen lymph nodes"],
        "causes": ["HSV-1 or HSV-2 virus (herpes)", "HPV virus (warts)", "Direct skin-to-skin contact", "Weakened immune system"],
        "urgency": "Consult a doctor — antiviral treatment available"
    },
    "pigmentation": {
        "description": "Disorders affecting skin colour due to overproduction or underproduction of melanin.",
        "symptoms": ["Dark patches or spots on skin", "Lightened patches of skin", "Uneven skin tone", "Patches that worsen with sun exposure", "Colour changes after inflammation"],
        "causes": ["Sun exposure", "Hormonal changes (melasma)", "Post-inflammatory hyperpigmentation", "Vitiligo (autoimmune)", "Certain medications"],
        "urgency": "Consult a dermatologist for diagnosis and appropriate treatment"
    },
    "lupus": {
        "description": "A chronic autoimmune disease where the immune system attacks healthy tissue, often affecting skin.",
        "symptoms": ["Butterfly-shaped rash across cheeks and nose", "Skin lesions that worsen with sun exposure", "Fingers turning white or blue in cold (Raynaud's)", "Fatigue and joint pain alongside skin changes", "Hair loss"],
        "causes": ["Autoimmune (immune attacks own tissue)", "Genetic predisposition", "Sun exposure as trigger", "Hormonal factors", "Infections or medications as triggers"],
        "urgency": "See a doctor promptly — lupus requires systemic treatment"
    },
    "vasculitis": {
        "description": "Inflammation of blood vessels that can cause skin changes, typically a purple or red rash.",
        "symptoms": ["Purple or red spots (petechiae or purpura)", "Raised red or purple rash", "Skin ulcers", "Itching or burning", "Nodules under the skin"],
        "causes": ["Autoimmune reaction", "Infections (hepatitis B/C)", "Certain medications", "Inflammatory diseases like lupus", "Unknown causes (idiopathic)"],
        "urgency": "See a doctor — vasculitis may affect internal organs"
    },
    "cellulitis": {
        "description": "A bacterial skin infection affecting the deeper layers of skin, often causing redness, swelling, and pain.",
        "symptoms": ["Red, swollen, and warm skin", "Tenderness or pain to touch", "Rapidly spreading redness", "Skin that looks tight or glossy", "Fever and chills in severe cases"],
        "causes": ["Bacterial infection (Staph or Strep)", "Break in skin (cut, insect bite, wound)", "Weakened immune system", "Lymphoedema or poor circulation"],
        "urgency": "See a doctor promptly — oral or IV antibiotics required"
    },
    "impetigo": {
        "description": "A highly contagious bacterial skin infection causing red sores that rupture and form honey-coloured crusts.",
        "symptoms": ["Red sores that rupture quickly", "Honey-coloured crusts on sores", "Itching and soreness", "Fluid-filled blisters", "Sores around nose and mouth most common"],
        "causes": ["Staphylococcus aureus bacteria", "Streptococcus bacteria", "Skin-to-skin contact", "Sharing towels or clothing", "Warm, humid weather"],
        "urgency": "See a doctor — antibiotic treatment required, highly contagious"
    },
    "scabies": {
        "description": "A skin infestation caused by tiny mites that burrow into the skin, causing intense itching.",
        "symptoms": ["Intense itching, especially at night", "Thin, irregular burrow tracks on skin", "Rash with tiny blisters or bumps", "Sores from scratching", "Most common in wrists, fingers, waist, and genitals"],
        "causes": ["Sarcoptes scabiei mite infestation", "Direct skin-to-skin contact", "Sharing bedding or clothing", "Overcrowded living conditions"],
        "urgency": "See a doctor — prescription scabicide required, treat all household members"
    },
    "warts": {
        "description": "Benign skin growths caused by the human papillomavirus (HPV), appearing on various body parts.",
        "symptoms": ["Rough, grainy skin growth", "Flesh-coloured, white, or pink bumps", "Black pinpoints (clotted blood vessels) inside", "Flat or raised appearance", "Can appear singularly or in clusters"],
        "causes": ["Human papillomavirus (HPV)", "Direct contact with wart or infected surface", "Weakened immune system", "Cuts or breaks in skin"],
        "urgency": "Consult a dermatologist for removal options"
    },
    "seborrheic": {
        "description": "Non-cancerous skin growths that appear as waxy, stuck-on looking spots, common in older adults.",
        "symptoms": ["Waxy, scaly, slightly raised patches", "Light tan to dark brown or black colour", "Round or oval shape", "Looks pasted or stuck onto skin", "May itch occasionally"],
        "causes": ["Ageing (most common in over 40s)", "Genetic predisposition", "Sun exposure (possible contributing factor", "Not contagious, not cancerous"],
        "urgency": "Usually harmless — consult a dermatologist if it changes or irritates"
    },
    "bullous": {
        "description": "A group of disorders causing fluid-filled blisters (bullae) to form on the skin.",
        "symptoms": ["Large fluid-filled blisters on skin", "Blisters that may burst and crust over", "Itching or burning before blisters form", "Redness around blisters", "Mouth sores in some cases"],
        "causes": ["Autoimmune attack on skin proteins", "Medications as trigger", "Genetic skin disorders", "In some cases, unknown causes"],
        "urgency": "See a doctor promptly — blistering diseases need specialist care"
    },
    "drug eruption": {
        "description": "Skin reactions caused by medications, ranging from mild rashes to severe life-threatening conditions.",
        "symptoms": ["Red rash or hives appearing after starting new medication", "Itching", "Blistering in severe cases", "Facial swelling", "Rash spreading over large areas"],
        "causes": ["Antibiotics (penicillin, sulfonamides)", "Anti-seizure drugs", "NSAIDs (ibuprofen, aspirin)", "Immune system overreaction to drug"],
        "urgency": "Stop the suspected medication and see a doctor immediately"
    },
    "systemic": {
        "description": "Skin manifestations of internal or systemic diseases — the skin reflects what is happening inside the body.",
        "symptoms": ["Skin changes that don't have an obvious topical cause", "Rash alongside fatigue or organ symptoms", "Colour changes (yellowing, blueness)", "Unexplained bruising", "Unusual texture changes over large areas"],
        "causes": ["Liver disease", "Kidney disease", "Diabetes", "Autoimmune disorders", "Internal cancers"],
        "urgency": "See a doctor urgently — may indicate serious internal condition"
    },
    "vascular": {
        "description": "Benign tumours arising from blood vessel cells in the skin, including haemangiomas and port-wine stains.",
        "symptoms": ["Bright red or purple raised growth", "Soft, compressible to touch", "May bleed easily if injured", "Grows rapidly in infancy then slows", "Usually painless"],
        "causes": ["Abnormal blood vessel development", "Genetic factors", "Mostly congenital (present at birth)", "Hormonal influences"],
        "urgency": "Consult a dermatologist — most are harmless but some need treatment"
    },
    "contact dermatitis": {
        "description": "A skin reaction from direct contact with an irritant or allergen, causing a red, itchy rash.",
        "symptoms": ["Red rash at point of contact", "Intense itching", "Dry, cracked, scaly skin", "Bumps and blisters", "Burning or tenderness"],
        "causes": ["Poison ivy, oak, or sumac", "Soaps, detergents, or cosmetics", "Latex", "Metals (nickel in jewellery)", "Fragrances and preservatives"],
        "urgency": "Avoid the irritant — consult a dermatologist for persistent cases"
    },
    "default": {
        "description": "A skin condition identified by our AI. For accurate diagnosis and treatment, please consult a qualified dermatologist.",
        "symptoms": ["Visible skin changes", "Possible redness or irritation", "Texture or colour changes"],
        "causes": ["Various environmental, genetic, or immune factors"],
        "urgency": "Consult a dermatologist for proper diagnosis"
    }
}

# ─────────────────────────────────────────────────────────────────────────────
# Friendly names for UI display
# ─────────────────────────────────────────────────────────────────────────────

FRIENDLY_NAMES: dict[str, str] = {
    "Acne and Rosacea Photos": "Acne / Redness & Flushing",
    "Actinic Keratosis Basal Cell Carcinoma and other Malignant Lesions": "Skin Cancer (Malignant Lesion)",
    "Atopic Dermatitis Photos": "Eczema (Atopic Dermatitis)",
    "Bullous Disease Photos": "Skin Blistering Condition",
    "Cellulitis Impetigo and other Bacterial Infections": "Bacterial Skin Infection",
    "Eczema Photos": "Eczema",
    "Exanthems and Drug Eruptions": "Drug Reaction / Skin Rash",
    "Hair Loss Photos Alopecia and other Hair Diseases": "Hair Loss (Alopecia)",
    "Herpes HPV and other STDs Photos": "Viral Skin Infection (HPV / Herpes)",
    "Light Diseases and Disorders of Pigmentation": "Skin Pigmentation Disorder",
    "Lupus and other Connective Tissue diseases": "Lupus / Autoimmune Skin Condition",
    "Melanoma Skin Cancer Nevi and Moles": "Melanoma / Suspicious Mole",
    "Nail Fungus and other Nail Disease": "Nail Fungus / Nail Condition",
    "Poison Ivy Photos and other Contact Dermatitis": "Allergic Skin Reaction",
    "Psoriasis pictures Lichen Planus and related diseases": "Psoriasis / Lichen Planus",
    "Scabies Lyme Disease and other Infestations and Bites": "Scabies / Insect Bite / Infestation",
    "Seborrheic Keratoses and other Benign Tumors": "Benign Skin Growth",
    "Systemic Disease": "Systemic / Internal Disease on Skin",
    "Tinea Ringworm Candidiasis and other Fungal Infections": "Ringworm / Fungal Infection",
    "Urticaria Hives": "Hives (Urticaria)",
    "Vascular Tumors": "Vascular Skin Growth",
    "Vasculitis Photos": "Blood Vessel Inflammation",
    "Warts Molluscum and other Viral Infections": "Warts / Viral Skin Infection",
    "skin_cancer": "Skin Cancer",
}


def get_friendly_name(class_name: str) -> str:
    """
    Convert a technical model class name to plain English for UI display.

    Args:
        class_name: The raw class name from the model.

    Returns:
        A user-friendly name, falling back to the original if not found.
    """
    return FRIENDLY_NAMES.get(class_name, class_name)


_KEYWORD_MAP: dict[str, str] = {
    "acne":           "acne",
    "rosacea":        "rosacea",
    "melanoma":       "melanoma",
    "malignant":      "melanoma",
    "carcinoma":      "basal cell carcinoma",
    "skin_cancer":    "melanoma",
    "eczema":         "eczema",
    "atopic":         "eczema",
    "psoriasis":      "psoriasis",
    "lichen":         "psoriasis",
    "ringworm":       "ringworm",
    "tinea":          "ringworm",
    "candidiasis":    "ringworm",
    "fungal":         "ringworm",
    "nail":           "nail fungus",
    "hair loss":      "hair loss",
    "alopecia":       "hair loss",
    "herpes":         "herpes",
    "hpv":            "herpes",
    "viral":          "herpes",
    "pigmentation":   "pigmentation",
    "lupus":          "lupus",
    "connective":     "lupus",
    "vasculitis":     "vasculitis",
    "cellulitis":     "cellulitis",
    "impetigo":       "impetigo",
    "bacterial":      "cellulitis",
    "scabies":        "scabies",
    "infestation":    "scabies",
    "lyme":           "scabies",
    "warts":          "warts",
    "molluscum":      "warts",
    "seborrheic":     "seborrheic",
    "benign":         "seborrheic",
    "bullous":        "bullous",
    "blistering":     "bullous",
    "drug":           "drug eruption",
    "eruption":       "drug eruption",
    "exanthem":       "drug eruption",
    "systemic":       "systemic",
    "disease":        "systemic",
    "vascular":       "vascular",
    "tumor":          "vascular",
    "contact":        "contact dermatitis",
    "dermatitis":     "contact dermatitis",
    "poison":         "contact dermatitis",
}


def get_disease_info(disease_name: str) -> dict:
    """
    Match a raw model class name to a DISEASE_DATABASE entry using
    substring keyword matching.  Falls back to the 'default' entry
    when no keyword matches.

    Args:
        disease_name: The raw class name returned by the model, e.g.
                      "Psoriasis pictures Lichen Planus and related diseases"

    Returns:
        A dict with keys: description, symptoms, causes, urgency.
    """
    name_lower = disease_name.lower()

    for keyword, db_key in _KEYWORD_MAP.items():
        if keyword in name_lower:
            return DISEASE_DATABASE[db_key]

    return DISEASE_DATABASE["default"]

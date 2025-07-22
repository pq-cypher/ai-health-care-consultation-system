<?php
/*
=============================================================================
MEDICAL CHAT API HANDLER WITH NLP INTEGRATION
=============================================================================
This file handles chat requests, processes them through Groq API,
implements NLP for medical symptom analysis, and provides medical
professional referrals for life-threatening conditions.
=============================================================================
*/

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Database configuration
$db_config = [
    'host' => $_ENV['DB_HOST'],
    'username' =>  $_ENV['DB_USER'],
    'password' =>  $_ENV['DB_PASS'],
    'database' => 'ai-health-care-consultation-system'
];

// Groq API configuration
$groq_api_key = $_ENV['GROQ_API_KEY'];
$groq_api_url = 'https://api.groq.com/openai/v1/chat/completions';
$model = 'llama3-8b-8192';

/*
=============================================================================
NLP COMPONENT 1: SYMPTOM CLASSIFICATION AND SEVERITY ANALYSIS
=============================================================================
This NLP module analyzes user input to identify medical symptoms and 
assess their severity levels using keyword matching and pattern recognition.
*/

function analyzeSymptomSeverity($message) {
    // Convert to lowercase for analysis
    $text = strtolower($message);
    
    // Critical/Life-threatening symptoms (NLP keyword classification)
    $critical_symptoms = [
        // Cardiovascular emergencies
        'chest pain', 'heart attack', 'myocardial infarction', 'cardiac arrest', 
        'severe chest pain', 'crushing chest pain', 'chest pressure', 'chest tightness',
        'radiating chest pain', 'jaw pain with chest discomfort', 'left arm pain with chest pain',
        'cardiac arrhythmia', 'ventricular fibrillation', 'heart stopped',
        
        // Neurological emergencies
        'stroke', 'cerebrovascular accident', 'transient ischemic attack', 'tia',
        'numbness in face', 'sudden weakness', 'slurred speech', 'speech difficulties',
        'facial drooping', 'arm weakness', 'sudden confusion', 'sudden severe headache',
        'loss of consciousness', 'unconscious', 'unresponsive', 'coma', 'seizure',
        'status epilepticus', 'prolonged seizure', 'first time seizure', 'convulsions',
        'vision loss', 'sudden blindness', 'double vision', 'paralysis', 'hemiplegia',
        'meningitis', 'encephalitis', 'brain hemorrhage', 'intracranial pressure',
        
        // Respiratory emergencies
        'difficulty breathing', 'can\'t breathe', 'unable to breathe', 'shortness of breath',
        'severe dyspnea', 'respiratory distress', 'respiratory failure', 'cyanosis',
        'blue lips', 'blue fingernails', 'choking', 'airway obstruction', 'stridor',
        'severe asthma attack', 'status asthmaticus', 'pneumothorax', 'collapsed lung',
        'pulmonary embolism', 'severe pneumonia', 'acute respiratory distress',
        
        // Bleeding and trauma
        'severe bleeding', 'heavy bleeding', 'uncontrolled bleeding', 'hemorrhage',
        'internal bleeding', 'bleeding from ears', 'bleeding from nose won\'t stop',
        'vomiting blood', 'coughing up blood', 'hematemesis', 'hemoptysis',
        'rectal bleeding', 'vaginal bleeding severe', 'postpartum hemorrhage',
        'head trauma', 'severe head injury', 'skull fracture', 'brain injury',
        'spinal injury', 'neck injury', 'open fracture', 'compound fracture',
        'amputation', 'traumatic amputation', 'crushing injury', 'severe burns',
        'third degree burns', 'electrical burns', 'chemical burns',
        
        // Allergic reactions and poisoning
        'anaphylaxis', 'allergic reaction', 'severe allergic reaction', 'anaphylactic shock',
        'swelling throat', 'throat closing', 'tongue swelling', 'facial swelling',
        'hives with breathing difficulty', 'drug overdose', 'poisoning', 'toxic ingestion',
        'carbon monoxide poisoning', 'severe food poisoning',
        
        // Abdominal emergencies
        'severe abdominal pain', 'appendicitis', 'bowel obstruction', 'intestinal obstruction',
        'abdominal rigidity', 'rebound tenderness', 'peritonitis', 'ruptured appendix',
        'ectopic pregnancy', 'aortic aneurysm', 'dissecting aneurysm',
        
        // Obstetric emergencies
        'pregnancy complications', 'placental abruption', 'preeclampsia', 'eclampsia',
        'breech birth', 'cord prolapse', 'uterine rupture', 'severe morning sickness',
        
        // Psychiatric emergencies
        'suicidal thoughts', 'suicide attempt', 'homicidal thoughts', 'psychotic break',
        'severe depression', 'manic episode', 'violent behavior', 'self harm',
        
        // Metabolic emergencies
        'diabetic coma', 'diabetic ketoacidosis', 'hypoglycemic coma', 'insulin shock',
        'thyroid storm', 'adrenal crisis', 'severe dehydration', 'heat stroke',
        'hypothermia', 'frostbite', 'electrolyte imbalance severe'
    ];
    
    // High severity symptoms
    $high_severity = [
        // Pain symptoms
        'severe pain', 'excruciating pain', 'unbearable pain', '10/10 pain',
        'severe headache', 'migraine severe', 'cluster headache', 'thunderclap headache',
        'severe back pain', 'kidney stone pain', 'gallbladder pain', 'severe toothache',
        
        // Fever and infection
        'high fever', 'fever over 103', 'fever with chills', 'fever with rash',
        'sepsis', 'blood infection', 'severe infection', 'abscess', 'cellulitis',
        'meningitis symptoms', 'stiff neck with fever', 'photophobia',
        
        // Gastrointestinal
        'vomiting blood', 'blood in stool', 'black tarry stool', 'melena',
        'severe abdominal pain', 'persistent vomiting', 'projectile vomiting',
        'severe diarrhea', 'bloody diarrhea', 'severe constipation', 'bowel obstruction symptoms',
        'unable to pass gas', 'severe heartburn', 'difficulty swallowing', 'dysphagia',
        
        // Cardiovascular
        'rapid heartbeat', 'tachycardia', 'irregular heartbeat', 'palpitations severe',
        'chest discomfort', 'chest heaviness', 'angina', 'heart palpitations',
        'severe hypertension', 'blood pressure crisis', 'severe hypotension',
        
        // Respiratory
        'wheezing severe', 'asthma attack', 'bronchospasm', 'pleuritic chest pain',
        'severe cough', 'productive cough with blood', 'night sweats', 'hemoptysis',
        
        // Neurological
        'severe dizziness', 'vertigo severe', 'balance problems', 'coordination problems',
        'memory loss', 'confusion severe', 'disorientation', 'altered mental status',
        'severe tremors', 'muscle spasms', 'dystonia', 'severe weakness',
        
        // Genitourinary
        'severe kidney pain', 'unable to urinate', 'urinary retention', 'kidney stones',
        'severe pelvic pain', 'testicular pain severe', 'ovarian cyst rupture',
        
        // Skin and wounds
        'severe rash', 'widespread rash', 'blistering rash', 'painful rash',
        'severe sunburn', 'infected wound', 'wound won\'t heal', 'gangrene',
        
        // Endocrine
        'blood sugar very high', 'blood sugar very low', 'diabetic symptoms severe',
        'thyroid problems', 'hormone imbalance severe'
    ];
    
    // Moderate severity symptoms
    $moderate_severity = [
        // General symptoms
        'fever', 'moderate fever', 'low grade fever', 'chills', 'sweating',
        'headache', 'tension headache', 'sinus headache', 'moderate pain',
        'body aches', 'muscle aches', 'joint aches', 'arthritis pain',
        'fatigue', 'weakness', 'malaise', 'feeling unwell',
        
        // Gastrointestinal
        'nausea', 'vomiting', 'stomach pain', 'abdominal pain', 'cramping',
        'diarrhea', 'loose stools', 'constipation', 'bloating', 'gas',
        'heartburn', 'acid reflux', 'indigestion', 'stomach upset',
        'loss of appetite', 'weight loss', 'nausea and vomiting',
        
        // Respiratory
        'cough', 'persistent cough', 'dry cough', 'productive cough',
        'sore throat', 'throat pain', 'hoarse voice', 'laryngitis',
        'congestion', 'nasal congestion', 'sinus pressure', 'sinusitis',
        'shortness of breath mild', 'wheezing mild',
        
        // Musculoskeletal
        'back pain', 'neck pain', 'shoulder pain', 'joint pain',
        'muscle pain', 'muscle cramps', 'stiffness', 'arthritis',
        'sprains', 'strains', 'moderate injury', 'bruising',
        
        // Neurological
        'dizziness', 'lightheadedness', 'mild confusion', 'forgetfulness',
        'mild tremors', 'tingling', 'numbness mild', 'pins and needles',
        
        // Cardiovascular
        'chest discomfort mild', 'palpitations', 'irregular pulse',
        'high blood pressure', 'elevated blood pressure',
        
        // Skin
        'rash', 'itching', 'hives', 'eczema', 'psoriasis', 'acne',
        'skin irritation', 'dry skin', 'wound healing slowly',
        
        // Genitourinary
        'urinary frequency', 'urgency', 'burning urination', 'uti symptoms',
        'kidney pain mild', 'pelvic pain', 'menstrual cramps',
        
        // Mental health
        'anxiety', 'stress', 'depression symptoms', 'mood changes',
        'irritability', 'restlessness', 'insomnia', 'sleep problems',
        
        // Eyes and vision
        'eye pain', 'eye irritation', 'blurred vision', 'dry eyes',
        'eye strain', 'light sensitivity mild',
        
        // Ears
        'ear pain', 'earache', 'ear infection', 'hearing problems',
        'tinnitus', 'ear discharge'
    ];
    
    // Mild severity symptoms
    $mild_severity = [
        // Upper respiratory
        'runny nose', 'stuffy nose', 'sneezing', 'postnasal drip',
        'mild cough', 'throat clearing', 'scratchy throat',
        'mild sore throat', 'dry mouth', 'bad breath',
        
        // General wellness
        'tiredness', 'mild fatigue', 'feeling sluggish', 'low energy',
        'mild headache', 'tension', 'slight fever', 'feeling warm',
        'mild body aches', 'stiffness morning', 'growing pains',
        
        // Skin and minor injuries
        'minor cut', 'small cut', 'scrape', 'abrasion', 'bruise',
        'mild bruising', 'minor burn', 'sunburn mild', 'dry skin',
        'minor rash', 'mild itching', 'insect bite', 'paper cut',
        
        // Digestive
        'mild nausea', 'slight stomach upset', 'mild bloating',
        'occasional heartburn', 'mild constipation', 'gas mild',
        'mild appetite loss', 'slight indigestion',
        
        // Musculoskeletal
        'minor aches', 'mild stiffness', 'slight muscle tension',
        'minor joint discomfort', 'mild soreness', 'exercise soreness',
        'minor sprain', 'mild strain', 'muscle fatigue',
        
        // Mental and emotional
        'mild stress', 'slight anxiety', 'minor mood changes',
        'mild irritability', 'restless sleep', 'occasional insomnia',
        'feeling down', 'mild worry', 'tension headache',
        
        // Eyes and vision
        'mild eye strain', 'tired eyes', 'dry eyes mild',
        'slight blurred vision', 'eye irritation mild',
        'allergic eyes', 'watery eyes',
        
        // Other minor symptoms
        'hiccups', 'mild dizziness', 'slight tremor', 'cold hands',
        'cold feet', 'mild sweating', 'occasional palpitations',
        'minor memory lapse', 'mild forgetfulness', 'slight confusion',
        'hangover', 'motion sickness', 'mild allergies',
        'seasonal allergies', 'hay fever', 'pollen allergies',
        'food sensitivity mild', 'lactose intolerance symptoms',
        'mild dehydration', 'thirst', 'dry lips', 'chapped lips',
        'hangnail', 'splinter', 'callus', 'blister small',
        'minor dental discomfort', 'sensitive teeth', 'gum irritation'
    ];
    
    $severity_score = 0;
    $detected_symptoms = [];
    $severity_level = 'mild';
    
    // NLP Pattern matching for critical symptoms
    foreach ($critical_symptoms as $symptom) {
        if (strpos($text, $symptom) !== false) {
            $severity_score += 10;
            $detected_symptoms[] = $symptom;
            $severity_level = 'critical';
        }
    }
    
    // Pattern matching for high severity
    foreach ($high_severity as $symptom) {
        if (strpos($text, $symptom) !== false) {
            $severity_score += 7;
            $detected_symptoms[] = $symptom;
            if ($severity_level !== 'critical') $severity_level = 'high';
        }
    }
    
    // Pattern matching for moderate severity
    foreach ($moderate_severity as $symptom) {
        if (strpos($text, $symptom) !== false) {
            $severity_score += 4;
            $detected_symptoms[] = $symptom;
            if (!in_array($severity_level, ['critical', 'high'])) $severity_level = 'moderate';
        }
    }
    
    // Pattern matching for mild severity
    foreach ($mild_severity as $symptom) {
        if (strpos($text, $symptom) !== false) {
            $severity_score += 1;
            $detected_symptoms[] = $symptom;
            if (!in_array($severity_level, ['critical', 'high', 'moderate'])) $severity_level = 'mild';
        }
    }
    
    // Map symptoms to medical specialties (NLP-based specialty classification)
    $specialty_mapping = [
        // Cardiology
        'chest pain' => 'Cardiologist',
        'heart attack' => 'Cardiologist',
        'irregular heartbeat' => 'Cardiologist',
        'shortness of breath during exertion' => 'Cardiologist',
        'high blood pressure' => 'Cardiologist',

        // Pulmonology
        'difficulty breathing' => 'Pulmonologist',
        'chronic cough' => 'Pulmonologist',
        'wheezing' => 'Pulmonologist',
        'asthma' => 'Pulmonologist',
        'coughing up blood' => 'Pulmonologist',

        // Neurology
        'stroke' => 'Neurologist',
        'severe headache' => 'Neurologist',
        'numbness' => 'Neurologist',
        'paralysis' => 'Neurologist',
        'seizures' => 'Neurologist',
        'memory loss' => 'Neurologist',
        'tingling' => 'Neurologist',

        // Emergency
        'unconscious' => 'Emergency Medicine',
        'accident injury' => 'Emergency Medicine',
        'trauma' => 'Emergency Medicine',
        'severe bleeding' => 'Emergency Medicine',

        // General Medicine
        'fever' => 'General Practitioner',
        'fatigue' => 'General Practitioner',
        'body pain' => 'General Practitioner',
        'general weakness' => 'General Practitioner',

        // Endocrinology
        'excessive thirst' => 'Endocrinologist',
        'weight gain' => 'Endocrinologist',
        'frequent urination' => 'Endocrinologist',
        'thyroid problems' => 'Endocrinologist',

        // Dermatology
        'skin rash' => 'Dermatologist',
        'acne' => 'Dermatologist',
        'eczema' => 'Dermatologist',
        'hair loss' => 'Dermatologist',

        // Pediatrics
        'child fever' => 'Pediatrician',
        'child cough' => 'Pediatrician',
        'vaccination' => 'Pediatrician',

        // Orthopedics
        'joint pain' => 'Orthopedic Surgeon',
        'broken bone' => 'Orthopedic Surgeon',
        'back pain' => 'Orthopedic Surgeon',

        // Radiology
        'need x-ray' => 'Radiologist',
        'ct scan' => 'Radiologist',
        'mri' => 'Radiologist',

        // Oncology
        'cancer symptoms' => 'Oncologist',
        'tumor' => 'Oncologist',
        'chemotherapy' => 'Oncologist',

        // Psychiatry
        'depression' => 'Psychiatrist',
        'anxiety' => 'Psychiatrist',
        'hallucinations' => 'Psychiatrist',
        'bipolar disorder' => 'Psychiatrist',

        // Urology
        'painful urination' => 'Urologist',
        'urinary tract infection' => 'Urologist',
        'kidney stones' => 'Urologist',

        // Nephrology
        'swollen legs' => 'Nephrologist',
        'high creatinine' => 'Nephrologist',
        'kidney failure' => 'Nephrologist',

        // Hematology
        'anemia' => 'Hematologist',
        'bleeding disorder' => 'Hematologist',
        'blood clot' => 'Hematologist',

        // Gynecology / Obstetrics
        'pregnancy' => 'Obstetrician',
        'menstrual issues' => 'Gynecologist',
        'pelvic pain' => 'Gynecologist',

        // Gastroenterology
        'abdominal pain' => 'Gastroenterologist',
        'diarrhea' => 'Gastroenterologist',
        'constipation' => 'Gastroenterologist',
        'indigestion' => 'Gastroenterologist',

        // Rheumatology
        'joint stiffness' => 'Rheumatologist',
        'autoimmune disorder' => 'Rheumatologist',
        'arthritis' => 'Rheumatologist',

        // Ophthalmology
        'blurry vision' => 'Ophthalmologist',
        'eye pain' => 'Ophthalmologist',
        'red eye' => 'Ophthalmologist',

        // ENT
        'hearing loss' => 'Otolaryngologist',
        'sore throat' => 'Otolaryngologist',
        'sinus problem' => 'Otolaryngologist',

        // Infectious Disease
        'persistent fever' => 'Infectious Disease Specialist',
        'chronic infection' => 'Infectious Disease Specialist',

        // Allergy & Immunology
        'seasonal allergies' => 'Allergist',
        'food allergy' => 'Allergist',
        'skin allergy' => 'Allergist',

        // Pathology
        'biopsy analysis' => 'Pathologist',

        // Anesthesiology
        'pre-surgery assessment' => 'Anesthesiologist',

        // Surgery
        'plastic surgery' => 'Plastic Surgeon',
        'vascular issues' => 'Vascular Surgeon',
        'lung surgery' => 'Thoracic Surgeon',

        // Palliative Care
        'end of life care' => 'Palliative Care Specialist',

        // Rehabilitation
        'post stroke rehab' => 'Rehabilitation Specialist',
        'physical therapy' => 'Rehabilitation Specialist',

        // Geriatrics
        'elderly care' => 'Geriatrician',
        'memory issues in elderly' => 'Geriatrician',

        // Sports Injuries
        'sprain' => 'Sports Medicine Specialist',
        'sports injury' => 'Sports Medicine Specialist',

        // Genetic disorders
        'birth defects' => 'Clinical Geneticist',
        'family history of disease' => 'Clinical Geneticist',

        // Occupational Medicine
        'workplace injury' => 'Occupational Medicine Specialist',
        'occupational hazard' => 'Occupational Medicine Specialist',
    ];
    
    $recommended_specialty = 'Emergency Medicine'; // Default for critical cases
    foreach ($detected_symptoms as $symptom) {
        if (isset($specialty_mapping[$symptom])) {
            $recommended_specialty = $specialty_mapping[$symptom];
            break;
        }
    }
    
    return [
        'severity_level' => $severity_level,
        'severity_score' => $severity_score,
        'detected_symptoms' => $detected_symptoms,
        'is_life_threatening' => $severity_level === 'critical',
        'recommended_specialty' => $recommended_specialty
    ];
}

/*
=============================================================================
NLP COMPONENT 2: INTENT CLASSIFICATION
=============================================================================
This NLP module classifies user intent to provide more targeted responses
using keyword-based natural language understanding.
*/

function classifyUserIntent($message) {
    $text = strtolower($message);
    
    // Intent classification patterns (NLP intent recognition)
    $intents = [
        'symptom_inquiry' => [
            'pain', 'hurt', 'feel', 'symptom', 'sick', 'ill', 'fever', 'headache',
            'nausea', 'vomiting', 'dizzy', 'lightheaded', 'cough', 'sore throat', 'rash',
            'fatigue', 'tired', 'weak', 'chills', 'sweating', 'cramping', 'discomfort',
            'shortness of breath', 'difficulty breathing', 'bleeding', 'infection', 'swelling'
        ],
        'medication_query' => [
            'medicine', 'medication', 'drug', 'prescription', 'dosage', 'pill',
            'tablet', 'capsule', 'side effects', 'take my meds', 'how often', 'missed dose',
            'overdose', 'antibiotic', 'painkiller', 'paracetamol', 'ibuprofen', 'injection'
        ],
        'appointment_request' => [
            'appointment', 'schedule', 'book', 'see doctor', 'visit', 'consultation',
            'can I come', 'checkup', 'meet doctor', 'when is available', 'make an appointment',
            'clinic hours', 'reschedule', 'cancel appointment'
        ],
        'emergency' => [
            'emergency', 'urgent', 'help', 'crisis', 'severe', 'can\'t breathe',
            'chest pain', 'collapse', 'unconscious', 'bleeding heavily', 'accident',
            'faint', 'stroke', 'heart attack', 'call ambulance', 'life-threatening'
        ],
        'general_health' => [
            'health', 'wellness', 'fitness', 'diet', 'exercise', 'nutrition',
            'healthy lifestyle', 'how to stay fit', 'prevent illness', 'weight loss',
            'mental health', 'self-care', 'hydration', 'stress management'
        ],
        'greeting' => [
            'hello', 'hi', 'good morning', 'good afternoon', 'good evening', 'hey',
            'greetings', 'what\'s up', 'how are you', 'howdy', 'yo', 'morning doc'
        ],
        'goodbye' => [
            'bye', 'goodbye', 'see you', 'take care', 'thanks', 'thank you',
            'talk later', 'catch you later', 'farewell'
        ],
        'insurance_inquiry' => [
            'insurance', 'cover', 'health plan', 'is this covered', 'HMO', 'payment options',
            'billing', 'claim', 'reimbursement', 'insurance accepted'
        ],
        'location_query' => [
            'where is', 'location', 'address', 'how do I get to', 'direction to hospital',
            'clinic location', 'nearest branch', 'map'
        ]
    ];

    
    $intent_scores = [];
    foreach ($intents as $intent => $keywords) {
        $score = 0;
        foreach ($keywords as $keyword) {
            if (strpos($text, $keyword) !== false) {
                $score++;
            }
        }
        $intent_scores[$intent] = $score;
    }
    
    // Return the intent with highest score
    $primary_intent = array_keys($intent_scores, max($intent_scores))[0];
    return [
        'primary_intent' => $primary_intent,
        'confidence' => max($intent_scores) > 0 ? max($intent_scores) / count($intents[$primary_intent]) : 0,
        'all_scores' => $intent_scores
    ];
}

/*
=============================================================================
NLP COMPONENT 3: TEXT PREPROCESSING AND ENHANCEMENT
=============================================================================
This module preprocesses text for better AI understanding and expands
medical abbreviations using NLP text normalization techniques.
*/

function preprocessText($text) {
    // Medical abbreviation expansion (NLP text normalization)
    $medical_abbreviations = [
        'bp' => 'blood pressure',
        'hr' => 'heart rate',
        'rr' => 'respiratory rate',
        'temp' => 'temperature',
        'wt' => 'weight',
        'ht' => 'height',
        'sob' => 'shortness of breath',
        'cp' => 'chest pain',
        'abd' => 'abdominal',
        'n/v' => 'nausea and vomiting',
        'h/a' => 'headache',
        'ha' => 'headache',
        'rash' => 'skin rash',
        'c/o' => 'complains of',
        'd/c' => 'discharge',
        'hx' => 'history',
        'dx' => 'diagnosis',
        'tx' => 'treatment',
        'sx' => 'symptoms',
        'rx' => 'prescription',
        'fx' => 'fracture',
        'wbc' => 'white blood cell count',
        'rbc' => 'red blood cell count',
        'hct' => 'hematocrit',
        'hgb' => 'hemoglobin',
        'bpm' => 'beats per minute',
        'po' => 'by mouth',
        'iv' => 'intravenous',
        'im' => 'intramuscular',
        'bid' => 'twice a day',
        'tid' => 'three times a day',
        'qid' => 'four times a day',
        'prn' => 'as needed',
        'ac' => 'before meals',
        'pc' => 'after meals',
        'hs' => 'at bedtime',
        'NAD' => 'no apparent distress',
        'DOE' => 'dyspnea on exertion',
        'PERRLA' => 'pupils equal, round, reactive to light and accommodation',
        'PMH' => 'past medical history',
        'NKDA' => 'no known drug allergies',
        'VS' => 'vital signs',
        'URI' => 'upper respiratory infection',
        'UTI' => 'urinary tract infection',
        'DM' => 'diabetes mellitus',
        'HTN' => 'hypertension',
        'CAD' => 'coronary artery disease',
        'MI' => 'myocardial infarction',
        'CVA' => 'cerebrovascular accident',
        'TBI' => 'traumatic brain injury',
        'CHF' => 'congestive heart failure'
    ];

    
    $processed_text = strtolower($text);
    
    // Expand abbreviations
    foreach ($medical_abbreviations as $abbrev => $expansion) {
        $processed_text = str_replace(" $abbrev ", " $expansion ", $processed_text);
    }
    
    // Clean up text (remove extra spaces, normalize punctuation)
    $processed_text = preg_replace('/\s+/', ' ', $processed_text);
    $processed_text = trim($processed_text);
    
    return $processed_text;
}

/*
=============================================================================
DATABASE FUNCTIONS
=============================================================================
*/

function getDatabaseConnection($config) {
    try {
        $pdo = new PDO(
            "mysql:host={$config['host']};dbname={$config['database']};charset=utf8mb4",
            $config['username'],
            $config['password'],
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        throw new Exception("Database connection failed: " . $e->getMessage());
    }
}

function findMedicalProfessional($pdo, $specialty) {
    try {
        $sql = "SELECT name, specialty, phone, email, department, availability 
                FROM medical_professionals 
                WHERE specialty = ? AND status = 'active' AND availability IN ('Available', 'On Call')
                ORDER BY 
                    CASE availability 
                        WHEN 'Available' THEN 1 
                        WHEN 'On Call' THEN 2 
                        ELSE 3 
                    END
                LIMIT 1";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$specialty]);
        $professional = $stmt->fetch();
        
        // If no specialist found, get emergency medicine doctor
        if (!$professional) {
            $sql = "SELECT name, specialty, phone, email, department, availability 
                    FROM medical_professionals 
                    WHERE specialty = 'Emergency Medicine' AND status = 'active'
                    ORDER BY 
                        CASE availability 
                            WHEN 'Available' THEN 1 
                            WHEN 'On Call' THEN 2 
                            ELSE 3 
                        END
                    LIMIT 1";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            $professional = $stmt->fetch();
        }
        
        return $professional;
    } catch (PDOException $e) {
        throw new Exception("Database query failed: " . $e->getMessage());
    }
}

/*
=============================================================================
GROQ API FUNCTIONS
=============================================================================
*/

function sendToGroqAPI($messages, $api_key, $api_url, $model) {
    $payload = [
        'model' => $model,
        'messages' => $messages,
        'temperature' => 0.7,
        'max_tokens' => 500,
        'top_p' => 1,
        'stream' => false
    ];
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $api_url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $api_key,
            'Content-Type: application/json'
        ],
        CURLOPT_TIMEOUT => 30,
        CURLOPT_CONNECTTIMEOUT => 10
    ]);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);
    
    if ($curl_error) {
        throw new Exception("cURL error: " . $curl_error);
    }
    
    if ($http_code !== 200) {
        throw new Exception("Groq API error: HTTP " . $http_code . " - " . $response);
    }
    
    $decoded_response = json_decode($response, true);
    if (!$decoded_response) {
        throw new Exception("Invalid JSON response from Groq API");
    }
    
    return $decoded_response;
}

/*
=============================================================================
CHAT TITLE GENERATION (NLP-based)
=============================================================================
*/

function generateChatTitle($first_message) {
    // NLP-based title generation using keyword extraction
    $text = strtolower($first_message);
    
    // Extract key medical terms for title
    $title_keywords = [
        'chest pain' => 'Chest Pain Consultation',
        'headache' => 'Headache Assessment',
        'fever' => 'Fever Evaluation',
        'cough' => 'Cough Analysis',
        'abdominal pain' => 'Abdominal Pain Review',
        'breathing' => 'Respiratory Consultation',
        'shortness of breath' => 'Shortness of Breath Evaluation',
        'heart' => 'Cardiac Consultation',
        'palpitations' => 'Palpitations Assessment',
        'nausea' => 'Nausea Management',
        'vomiting' => 'Vomiting Evaluation',
        'diarrhea' => 'Diarrhea Review',
        'constipation' => 'Constipation Consultation',
        'dizziness' => 'Dizziness Assessment',
        'fatigue' => 'Fatigue Evaluation',
        'rash' => 'Skin Rash Review',
        'itching' => 'Itching Consultation',
        'anxiety' => 'Mental Health Check',
        'depression' => 'Depression Screening',
        'medication' => 'Medication Inquiry',
        'prescription' => 'Prescription Refill Request',
        'appointment' => 'Appointment Request',
        'follow-up' => 'Follow-up Visit',
        'checkup' => 'Routine Checkup',
        'diabetes' => 'Diabetes Management',
        'hypertension' => 'Blood Pressure Evaluation',
        'injury' => 'Injury Assessment',
        'fracture' => 'Fracture Evaluation',
        'infection' => 'Infection Check',
        'allergy' => 'Allergy Consultation',
        'asthma' => 'Asthma Management',
        'pain' => 'Pain Management',
        'swelling' => 'Swelling Examination',
        'burn' => 'Burn Injury Assessment',
        'bleeding' => 'Bleeding Evaluation',
        'vision' => 'Vision Screening',
        'hearing' => 'Hearing Assessment',
        'urination' => 'Urinary Symptoms Evaluation',
        'pregnancy' => 'Pregnancy Consultation',
        'menstruation' => 'Menstrual Cycle Review'
    ];
    
    foreach ($title_keywords as $keyword => $title) {
        if (strpos($text, $keyword) !== false) {
            return $title;
        }
    }
    
    // Default title with timestamp
    return 'Medical Consultation - ' . date('M j, Y');
}

/*
=============================================================================
MAIN REQUEST HANDLER
=============================================================================
*/

try {
    // Validate request method
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Only POST method is allowed");
    }
    
    // Get and validate input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception("Invalid JSON input");
    }
    
    // Validate required fields
    if (!isset($input['messages']) || !is_array($input['messages']) || empty($input['messages'])) {
        throw new Exception("Messages array is required and cannot be empty");
    }
    
    if (!isset($input['isNewSession'])) {
        throw new Exception("isNewSession field is required");
    }
    
    $messages = $input['messages'];
    $isNewSession = $input['isNewSession'];
    $chatId = $input['chatId'] ?? null;
    
    // Get the latest user message for NLP analysis
    $latest_message = end($messages);
    if (!$latest_message || !isset($latest_message['content'])) {
        throw new Exception("Latest message content is missing");
    }
    
    $user_message = $latest_message['content'];
    
    // =============================================================================
    // APPLY NLP PROCESSING
    // =============================================================================
    
    // 1. Preprocess text using NLP normalization
    $processed_text = preprocessText($user_message);
    
    // 2. Analyze symptoms and severity using NLP classification
    $symptom_analysis = analyzeSymptomSeverity($processed_text);
    
    // 3. Classify user intent using NLP intent recognition
    $intent_analysis = classifyUserIntent($processed_text);
    
    // Initialize response data
    $response_data = [
        'success' => true,
        'message' => '',
        'chatId' => $chatId,
        'medical_alert' => null,
        'professional_contact' => null,
        'nlp_analysis' => [
            'symptom_analysis' => $symptom_analysis,
            'intent_analysis' => $intent_analysis,
            'processed_text' => $processed_text
        ]
    ];
    
    // Enhance messages with NLP insights for better AI understanding
    $enhanced_messages = $messages;

    // Handle life-threatening conditions
    if ($symptom_analysis['is_life_threatening']) {
        try {
            $pdo = getDatabaseConnection($db_config);
            $professional = findMedicalProfessional($pdo, $symptom_analysis['recommended_specialty']);
            
            $response_data['medical_alert'] = [
                'severity' => 'CRITICAL',
                'message' => 'URGENT: Your symptoms may be life-threatening. Please seek immediate medical attention or call emergency services.',
                'detected_symptoms' => $symptom_analysis['detected_symptoms'],
                'recommended_action' => 'Seek immediate emergency care'
            ];
            
            if ($professional) {
                $response_data['professional_contact'] = $professional;

                array_unshift($enhanced_messages, [
                    'role' => 'system',
                    'content' => "advice to visit the closest hospital and refer the user to this professional contact 1) Name: ".$professional['name'].", 2) Phone: ".$professional['phone'].", 3) Email: ".$professional['email'].", 4) Specialty: ".$professional['specialty'].""
                ]);
            }
            
        } catch (Exception $e) {
            error_log("Database error while fetching medical professional: " . $e->getMessage());
            // Continue with API call but log the error
        }
    }

    if( $response_data['professional_contact'] === null){
        // Add system context based on NLP analysis
        array_unshift($enhanced_messages, [
            'role' => 'system',
            'content' => "If you do not have enough symptoms from the previous messages request for more symptoms but if symptoms is enough then diagnose the user"
        ]);
        if ($symptom_analysis['severity_level'] !== 'mild') {
            $system_context = "Note: The user is experiencing " . $symptom_analysis['severity_level'] . " severity symptoms. " .
                             "Detected symptoms include: " . implode(', ', $symptom_analysis['detected_symptoms']) . ". " .
                             "Primary intent appears to be: " . $intent_analysis['primary_intent'] . ". " .
                             "Please provide appropriate medical guidance while emphasizing the need for professional consultation if necessary.";
            
            array_unshift($enhanced_messages, [
                'role' => 'system',
                'content' => $system_context
            ]);
        }
    }
    
    
    // Send to Groq API
    try {
        $groq_response = sendToGroqAPI($enhanced_messages, $groq_api_key, $groq_api_url, $model);
        
        if (!isset($groq_response['choices'][0]['message']['content'])) {
            throw new Exception("Invalid response format from Groq API");
        }
        
        $ai_message = $groq_response['choices'][0]['message']['content'];
        $response_data['message'] = $ai_message;
        
        // Add usage information if available
        if (isset($groq_response['usage'])) {
            $response_data['usage'] = $groq_response['usage'];
        }
        
    } catch (Exception $e) {
        throw new Exception("Groq API error: " . $e->getMessage());
    }
    
    // Generate title for new sessions using NLP
    if ($isNewSession) {
        $response_data['title'] = generateChatTitle($user_message);
        $response_data['chatId'] = $chatId ?: uniqid('chat_', true);
    }

    $response_data['enhanced_messages'] = $enhanced_messages;
    
    // Return response
    echo json_encode($response_data, JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    // Error handling
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'chatId' => $input['chatId'] ?? null
    ]);
    
    // Log error for debugging
    error_log("Chat API Error: " . $e->getMessage() . " | Input: " . json_encode($input ?? 'No input'));
}
?>
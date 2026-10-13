import { calculateAge } from '../utils/dates'
import type { Question, Section } from '../types'

const NO_YES = ['No', 'Yes']
const NO_YES_NOT_SURE = ['No', 'Yes', 'Not sure']

function radio(id: string, label: string, options: string[]): Question {
  return { id, label, type: 'radio', required: false, options }
}

function checkboxes(id: string, label: string, options: string[]): Question {
  return { id, label, type: 'checkbox', required: false, options, helpText: 'Select all that apply.' }
}

function paragraph(id: string, label: string): Question {
  return { id, label, type: 'textarea', required: false, maxLength: 1000 }
}

function scale(id: string, label: string, minLabel: string, maxLabel: string): Question {
  return { id, label, type: 'scale', required: false, min: 0, max: 10, minLabel, maxLabel }
}

function consent(id: string, label: string): Question {
  return { id, label, type: 'consent', required: true }
}

function withOther(question: Question): Question[] {
  const otherId = `${question.id}Other`
  return [
    { ...question, otherId },
    {
      id: otherId,
      label: 'Other (please specify)',
      type: 'text',
      required: true,
      maxLength: 150,
      isOtherText: true,
      showIf: { questionId: question.id, value: 'Other' },
    },
  ]
}

function reasonFollowUps(reason: string, title: string, questions: (Question | Question[])[]): Question[] {
  return questions.flat().map((question) => {
    if (question.isOtherText) return { ...question, group: title }
    return { ...question, group: title, isGroupItem: true, showIf: { questionId: 'visitReasons', value: reason } }
  })
}

export const questionnaireSections: Section[] = [
  {
    id: 'patient',
    title: 'Patient Information',
    isPatientInfo: true,
    questions: [
      { id: 'lastName', label: 'Last Name', type: 'name', required: true, maxLength: 60 },
      { id: 'firstName', label: 'First Name', type: 'name', required: true, maxLength: 60 },
      { id: 'preferredName', label: 'Preferred Name', type: 'text', required: false, maxLength: 60 },
      { id: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
      {
        id: 'age',
        label: 'Age',
        type: 'number',
        required: true,
        min: 0,
        max: 120,
        helpText: 'Filled in from your date of birth. You can change it.',
        calculateFrom: 'dateOfBirth',
        calculate: (answers) => calculateAge(answers.dateOfBirth),
      },
      {
        id: 'sex',
        label: 'Sex',
        type: 'select',
        required: true,
        options: ['Male', 'Female', 'Prefer not to say', 'Other'],
      },
      { id: 'mobileNumber', label: 'Mobile Number', type: 'tel', required: true, placeholder: '09XXXXXXXXX', maxLength: 11 },
      { id: 'email', label: 'Email Address', type: 'email', required: true },
      { id: 'address', label: 'Address', type: 'text', required: true, maxLength: 200 },
      { id: 'occupation', label: 'Occupation', type: 'letters', required: true, maxLength: 100 },
      { id: 'emergencyContactName', label: 'Emergency Contact Name', type: 'name', required: true, maxLength: 60 },
      {
        id: 'emergencyContactNumber',
        label: 'Emergency Contact Number',
        type: 'tel',
        required: true,
        placeholder: '09XXXXXXXXX',
        maxLength: 11,
      },
      {
        id: 'emergencyContactRelationship',
        label: 'Relationship to Patient',
        type: 'letters',
        allowHyphens: true,
        required: true,
        maxLength: 60,
      },
    ],
  },
  {
    id: 'reason',
    title: 'Reason for Visit',
    questions: [
      ...withOther({
        ...checkboxes('visitReasons', 'What is the main reason for your visit today?', [
          'Routine dental check-up',
          'Dental cleaning',
          'Toothache',
          'Tooth sensitivity',
          'Broken/chipped tooth',
          'Tooth extraction',
          'Swollen gums',
          'Bleeding gums',
          'Dental filling',
          'Root canal treatment',
          'Dental crown/bridge',
          'Dentures',
          'Braces/orthodontic treatment',
          'Dental implant',
          'Cosmetic dentistry',
          'Wisdom tooth concern',
          'Oral pain',
          'Bad breath',
          'Other',
        ]),
        helpText: 'Select all that apply. Follow-up questions will appear for each reason you select.',
      }),
      paragraph('concernDescription', 'Please describe your current dental concern.'),

      ...reasonFollowUps('Routine dental check-up', 'Routine Dental Check-up', [
        radio('checkupLastVisit', 'When was your last dental check-up?', [
          'Less than 6 months ago',
          '6–12 months ago',
          '1–2 years ago',
          'More than 2 years ago',
          "I don't remember",
          'This is my first dental visit',
        ]),
        radio('checkupProblemsSince', 'Have you experienced any dental problems since your last check-up?', NO_YES_NOT_SURE),
        paragraph('checkupSpecificRequest', 'Is there anything specific you would like the dentist to check?'),
      ]),

      ...reasonFollowUps('Dental cleaning', 'Dental Cleaning', [
        radio('cleaningLastCleaning', 'When was your last professional dental cleaning?', [
          'Less than 6 months ago',
          '6–12 months ago',
          '1–2 years ago',
          'More than 2 years ago',
          "I don't remember",
          'Never',
        ]),
        radio('cleaningGumsBleed', 'Do your gums bleed when brushing or flossing?', [
          'Never',
          'Occasionally',
          'Frequently',
          'Almost always',
          'Not sure',
        ]),
        radio('cleaningBadBreath', 'Do you experience persistent bad breath?', NO_YES_NOT_SURE),
        radio('cleaningTartar', 'Are you aware of significant plaque or tartar buildup?', NO_YES_NOT_SURE),
        radio('cleaningBrushing', 'How often do you brush your teeth?', [
          'Less than once a day',
          'Once a day',
          'Twice a day',
          'More than twice a day',
        ]),
        radio('cleaningFlossing', 'How often do you floss or clean between your teeth?', [
          'Daily',
          'Several times a week',
          'Occasionally',
          'Never',
        ]),
      ]),

      ...reasonFollowUps('Toothache', 'Toothache', [
        radio('toothacheLocation', 'Where is the toothache located?', [
          'Upper right',
          'Upper left',
          'Lower right',
          'Lower left',
          'Front teeth',
          'Multiple areas',
          'Not sure',
        ]),
        radio('toothacheStart', 'When did the toothache start?', [
          'Today',
          '1–3 days ago',
          'Less than 1 week ago',
          '1–4 weeks ago',
          'More than 1 month ago',
          'Not sure',
        ]),
        scale('toothachePain', 'How severe is the pain right now?', 'No pain', 'Worst pain'),
        withOther(
          checkboxes('toothacheWorse', 'What makes the pain worse?', [
            'Hot food or drinks',
            'Cold food or drinks',
            'Sweet food or drinks',
            'Biting/chewing',
            'Touching the tooth',
            'Lying down',
            'Nothing specific',
            'Other',
          ]),
        ),
        radio(
          'toothacheSpontaneous',
          'Does the pain occur without eating, drinking, or touching the tooth?',
          NO_YES_NOT_SURE,
        ),
      ]),

      ...reasonFollowUps('Tooth sensitivity', 'Tooth Sensitivity', [
        withOther(
          checkboxes('sensitivityTriggers', 'What triggers your tooth sensitivity?', [
            'Cold',
            'Hot',
            'Sweet foods or drinks',
            'Sour foods or drinks',
            'Brushing',
            'Cold air',
            'Biting',
            'Other',
          ]),
        ),
        radio('sensitivityDuration', 'How long does the sensitivity usually last?', [
          'A few seconds',
          'Less than 1 minute',
          'Several minutes',
          'Longer than several minutes',
          'It is constant',
          'Not sure',
        ]),
        radio('sensitivityArea', 'Which area is sensitive?', [
          'One tooth',
          'Several teeth',
          'Upper teeth',
          'Lower teeth',
          'Entire mouth',
          'Not sure',
        ]),
      ]),

      ...reasonFollowUps('Broken/chipped tooth', 'Broken/Chipped Tooth', [
        radio('brokenWhen', 'When did the tooth break or chip?', [
          'Today',
          '1–3 days ago',
          'Less than 1 week ago',
          'More than 1 week ago',
          'More than 1 month ago',
        ]),
        withOther(
          radio('brokenHow', 'How did the tooth break or chip?', [
            'While eating',
            'Injury/accident',
            'It gradually chipped',
            'Previous filling/crown broke',
            'Not sure',
            'Other',
          ]),
        ),
        radio('brokenPain', 'Are you currently experiencing pain or sensitivity?', NO_YES),
      ]),

      ...reasonFollowUps('Tooth extraction', 'Tooth Extraction', [
        radio('extractionReason', 'What is the reason for the tooth extraction?', [
          'Toothache',
          'Broken tooth',
          'Decayed tooth',
          'Wisdom tooth',
          'Loose tooth',
          'Orthodontic treatment',
          'Dentist recommendation',
          'Other',
          'Not sure',
        ]),
        radio('extractionArea', 'Which tooth or area is involved?', [
          'Upper right',
          'Upper left',
          'Lower right',
          'Lower left',
          'Front tooth',
          'Wisdom tooth',
          'Not sure',
        ]),
      ]),

      ...reasonFollowUps('Swollen gums', 'Swollen Gums', [
        withOther(
          checkboxes('swollenSymptoms', 'What symptoms are you experiencing?', [
            'Swelling',
            'Pain',
            'Bleeding',
            'Pus/discharge',
            'Bad taste',
            'Other',
          ]),
        ),
        radio('swollenStart', 'When did the swelling start?', [
          'Today',
          'Within the past week',
          '1–4 weeks ago',
          'More than 1 month ago',
          'Not sure',
        ]),
        radio('swollenFever', 'Do you have facial swelling or fever?', NO_YES_NOT_SURE),
      ]),

      ...reasonFollowUps('Bleeding gums', 'Bleeding Gums', [
        radio('bleedingFrequency', 'How often do your gums bleed?', [
          'Rarely',
          'Occasionally',
          'Frequently',
          'Almost always',
          'Not sure',
        ]),
        radio('bleedingStart', 'When did you first notice the bleeding?', [
          'Recently',
          'Within the past week',
          '1–4 weeks ago',
          'More than 1 month ago',
          'Not sure',
        ]),
        radio('bleedingSwollen', 'Do you also experience swollen or painful gums?', NO_YES_NOT_SURE),
      ]),

      ...reasonFollowUps('Dental filling', 'Dental Filling', [
        radio('fillingPain', 'Is the tooth currently painful?', NO_YES),
        radio('fillingSensitive', 'Is the tooth sensitive to hot or cold?', NO_YES_NOT_SURE),
        radio('fillingPrevious', 'Has a previous filling fallen out or broken?', NO_YES_NOT_SURE),
      ]),

      ...reasonFollowUps('Root canal treatment', 'Root Canal Treatment', [
        withOther(
          radio('rootCanalReason', 'Why are you seeking root canal treatment?', [
            'Tooth pain',
            'Deep decay',
            'Infection',
            'Previous dentist recommendation',
            'Tooth injury',
            'Previous root canal problem',
            'Not sure',
            'Other',
          ]),
        ),
        radio('rootCanalPain', 'Are you currently experiencing pain?', NO_YES),
        radio('rootCanalSwelling', 'Do you have swelling around the tooth?', NO_YES_NOT_SURE),
      ]),

      ...reasonFollowUps('Dental crown/bridge', 'Dental Crown/Bridge', [
        withOther(
          radio('crownReason', 'What is the reason for your visit?', [
            'New crown/bridge',
            'Existing crown/bridge needs repair',
            'Existing crown/bridge came loose',
            'Existing crown/bridge is broken',
            'Existing crown/bridge is uncomfortable',
            'Not sure',
            'Other',
          ]),
        ),
        radio('crownPain', 'Are you currently experiencing pain?', NO_YES),
      ]),

      ...reasonFollowUps('Dentures', 'Dentures', [
        withOther(
          radio('denturesReason', 'What is the reason for your visit?', [
            'New dentures',
            'Replacement dentures',
            'Denture adjustment',
            'Broken dentures',
            'Loose dentures',
            'Dentures causing pain/discomfort',
            'Other',
          ]),
        ),
        radio('denturesSores', 'Are your current dentures causing pain or sores?', ['No', 'Yes', 'Not applicable']),
      ]),

      ...reasonFollowUps('Braces/orthodontic treatment', 'Braces/Orthodontic Treatment', [
        withOther(
          radio('bracesReason', 'What is the reason for your visit?', [
            'Orthodontic consultation',
            'New braces',
            'Adjustment',
            'Broken bracket or wire',
            'Retainer problem',
            'Pain/discomfort',
            'Follow-up',
            'Other',
          ]),
        ),
        radio('bracesPain', 'Are you currently experiencing significant pain or swelling?', NO_YES),
      ]),

      ...reasonFollowUps('Dental implant', 'Dental Implant', [
        radio('implantStage', 'What stage of implant treatment are you seeking?', [
          'Implant consultation',
          'Implant placement',
          'Implant restoration/crown',
          'Implant follow-up',
          'Problem with an existing implant',
          'Not sure',
        ]),
        radio(
          'implantProblem',
          'Do you currently have pain, swelling, or another problem around an existing implant?',
          ['No', 'Yes', 'Not applicable'],
        ),
      ]),

      ...reasonFollowUps('Cosmetic dentistry', 'Cosmetic Dentistry', [
        withOther(
          checkboxes('cosmeticTreatments', 'What cosmetic treatment are you interested in?', [
            'Teeth whitening',
            'Veneers',
            'Composite bonding',
            'Smile makeover',
            'Tooth reshaping',
            'Other',
            'Not sure',
          ]),
        ),
        paragraph('cosmeticGoals', 'What would you like to improve about your smile?'),
      ]),

      ...reasonFollowUps('Wisdom tooth concern', 'Wisdom Tooth Concern', [
        withOther(
          checkboxes('wisdomProblems', 'What problem are you experiencing with your wisdom tooth?', [
            'Pain',
            'Swelling',
            'Difficulty opening the mouth',
            'Food getting trapped',
            'Gum inflammation',
            'Tooth partially erupted',
            'Tooth has not erupted',
            'Bad taste/discharge',
            'Other',
          ]),
        ),
        radio('wisdomDuration', 'How long have you experienced the problem?', [
          'Today',
          'A few days',
          '1–4 weeks',
          'More than 1 month',
          'It keeps coming back',
        ]),
        radio('wisdomFever', 'Do you have facial swelling or fever?', NO_YES_NOT_SURE),
      ]),

      ...reasonFollowUps('Oral pain', 'Oral Pain', [
        radio('oralPainLocation', 'Where are you experiencing the pain?', [
          'Upper right',
          'Upper left',
          'Lower right',
          'Lower left',
          'Front teeth',
          'Gums',
          'Jaw',
          'Multiple areas',
          'Not sure',
        ]),
        radio('oralPainStart', 'When did the pain start?', [
          'Today',
          '1–3 days ago',
          'Less than 1 week ago',
          '1–4 weeks ago',
          'More than 1 month ago',
          'Not sure',
        ]),
        scale('oralPainSeverity', 'How severe is the pain right now?', 'No pain', 'Worst pain'),
      ]),

      ...reasonFollowUps('Bad breath', 'Bad Breath', [
        radio('badBreathDuration', 'How long have you experienced persistent bad breath?', [
          'Less than 1 week',
          '1–4 weeks',
          '1–6 months',
          'More than 6 months',
          'Not sure',
        ]),
        radio('badBreathDryMouth', 'Do you experience dry mouth?', NO_YES_NOT_SURE),
        radio('badBreathGumsBleed', 'Do your gums bleed regularly?', NO_YES_NOT_SURE),
      ]),
    ],
  },
  {
    id: 'medical',
    title: 'General Medical History',
    questions: [
      ...withOther({
        ...checkboxes('medicalConditions', 'Do you have any medical conditions that your dentist should know about?', [
          'Diabetes',
          'High blood pressure',
          'Heart disease',
          'Bleeding/clotting disorder',
          'Asthma',
          'Epilepsy/seizures',
          'Kidney disease',
          'Liver disease',
          'Osteoporosis/bone condition',
          'Cancer',
          'Immune-system condition',
          'Other',
          'None',
        ]),
        exclusiveOption: 'None',
      }),
      {
        ...paragraph('medicalConditionDetails', 'If you selected any medical condition above, please provide details.'),
        showIf: { questionId: 'medicalConditions', anyExcept: 'None' },
      },
    ],
  },
  {
    id: 'medications',
    title: 'Medications',
    questions: [
      radio('takingMedications', 'Are you currently taking any medications?', NO_YES_NOT_SURE),
      {
        ...paragraph('medicationList', 'Please list your current medications, including dosage if known.'),
        showIf: { questionId: 'takingMedications', value: ['Yes', 'Not sure'] },
      },
      radio('bloodThinners', 'Are you taking blood-thinning/anticoagulant medication?', NO_YES_NOT_SURE),
      radio(
        'boneMedication',
        'Are you taking medication for osteoporosis or another bone condition?',
        NO_YES_NOT_SURE,
      ),
    ],
  },
  {
    id: 'allergies',
    title: 'Allergies',
    questions: [
      radio('hasAllergies', 'Do you have any known allergies?', NO_YES_NOT_SURE),
      ...withOther({
        ...checkboxes('allergens', 'What are you allergic to?', [
          'Antibiotics',
          'Pain medication/NSAIDs',
          'Local anesthetic',
          'Latex',
          'Other medication',
          'Food',
          'Other',
        ]),
        showIf: { questionId: 'hasAllergies', value: 'Yes' },
      }),
      {
        ...paragraph('allergyReaction', 'What reaction do you experience?'),
        showIf: { questionId: 'hasAllergies', value: 'Yes' },
      },
    ],
  },
  {
    id: 'safety',
    title: 'Dental Treatment Safety',
    questions: [
      radio('anesthesiaReaction', 'Have you ever had a bad reaction to dental or local anesthesia?', NO_YES_NOT_SURE),
      radio(
        'excessiveBleeding',
        'Have you ever experienced excessive bleeding after a dental procedure, surgery, or injury?',
        NO_YES_NOT_SURE,
      ),
      radio('fainting', 'Have you ever fainted or felt faint during a dental or medical procedure?', NO_YES),
      radio(
        'antibioticPremedication',
        'Have you ever been told by a doctor that you need antibiotics before certain dental procedures?',
        NO_YES_NOT_SURE,
      ),
    ],
  },
  {
    id: 'pregnancy',
    title: 'Pregnancy',
    questions: [
      {
        ...radio('pregnancy', 'Are you currently pregnant or could you possibly be pregnant?', [
          'No',
          'Yes',
          'Not sure',
          'Not applicable',
          'Prefer not to say',
        ]),
        lockedIf: (answers) => answers.sex === 'Male',
        lockedText: 'Set to "Not applicable" because you chose Male as your sex.',
        calculateFrom: 'sex',
        calculate: (answers, previousAnswers) => {
          if (answers.sex === 'Male') return 'Not applicable'
          if (previousAnswers.sex === 'Male' && answers.pregnancy === 'Not applicable') return undefined
          return answers.pregnancy
        },
      },
    ],
  },
  {
    id: 'anxiety',
    title: 'Dental Anxiety',
    questions: [
      scale('anxietyLevel', 'How anxious do you feel about dental treatment?', 'Not anxious', 'Extremely anxious'),
      radio('negativeExperience', 'Have you ever had a negative or frightening dental experience?', [
        'No',
        'Yes',
        'Prefer not to say',
      ]),
      paragraph('comfortRequests', 'Is there anything we can do to make your visit more comfortable?'),
    ],
  },
  {
    id: 'final',
    title: 'Final Information',
    questions: [
      paragraph(
        'additionalInfo',
        'Is there anything else about your health or dental concern that your dentist should know?',
      ),
    ],
  },
  {
    id: 'consent',
    title: 'Consent',
    questions: [
      consent(
        'consentAccurate',
        'I confirm that the information I have provided is accurate to the best of my knowledge.',
      ),
      consent(
        'consentInformChanges',
        'I understand that I should inform the dental clinic if my health, medications, or allergies change.',
      ),
      consent(
        'consentPrivacy',
        "I have read and understood the clinic's privacy notice and consent to the collection and processing of my personal and health information according to the clinic's privacy notice and applicable law.",
      ),
    ],
  },
]

export const allQuestions = questionnaireSections.flatMap((section) => section.questions)

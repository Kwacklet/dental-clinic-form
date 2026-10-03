import { useEffect, useState } from 'react'
import AppHeader from './components/AppHeader'
import Questionnaire from './components/Questionnaire'
import AnswerSummary from './components/AnswerSummary'
import { allQuestions, questionnaireSections } from './data/questions'
import { applyCalculatedAnswers } from './utils/calculatedAnswers'
import { formSettings } from './data/formSettings'
import { getSettings, submitAssessment } from './services/assessmentService'

// A fresh form, with any automatic answers filled in.
function createInitialAnswers() {
  return applyCalculatedAnswers({}, allQuestions)
}

// Patient flow: Questionnaire -> Review your answers -> Sent (thank you).
// Answers are only sent to the clinic's database when the patient presses
// "Send to clinic" on the review screen. After that they cannot be changed.
function PatientApp() {
  const [screen, setScreen] = useState('questionnaire') // 'questionnaire' | 'review' | 'sent'
  const [answers, setAnswers] = useState(createInitialAnswers)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [settings, setSettings] = useState(formSettings) // defaults until the real ones load

  // Load the form title and clinic name set by the dentist.
  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch(() => {}) // keep the defaults if they can't be loaded
  }, [])

  function showScreen(name) {
    setScreen(name)
    window.scrollTo({ top: 0 })
  }

  function handleReview(finalAnswers) {
    setAnswers(finalAnswers)
    setSendError('')
    showScreen('review')
  }

  async function handleSend() {
    setSending(true)
    setSendError('')
    try {
      await submitAssessment(answers)
      showScreen('sent')
    } catch (error) {
      // Answers are kept, so the patient can simply try again.
      setSendError(error.message)
    } finally {
      setSending(false)
    }
  }

  function handleStartNew() {
    setAnswers(createInitialAnswers())
    showScreen('questionnaire')
  }

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-content">
        {screen === 'questionnaire' && (
          <Questionnaire
            sections={questionnaireSections}
            allQuestions={allQuestions}
            answers={answers}
            onAnswersChange={setAnswers}
            onSubmit={handleReview}
            title={settings.formTitle}
          />
        )}
        {screen === 'review' && (
          <AnswerSummary
            sections={questionnaireSections}
            allQuestions={allQuestions}
            answers={answers}
            sending={sending}
            error={sendError}
            onEdit={() => showScreen('questionnaire')}
            onSend={handleSend}
          />
        )}
        {screen === 'sent' && (
          <div className="sent-confirmation">
            <p className="notice notice-success" role="status">
              <strong>Thank you. Your form has been sent to {settings.clinicName}.</strong>
              <br />
              The dental team will review your answers before your visit.
            </p>
            <button type="button" className="button button-primary" onClick={handleStartNew}>
              Start a new form
            </button>
          </div>
        )}
      </main>
      <footer className="app-footer">{settings.clinicName}</footer>
    </div>
  )
}

export default PatientApp

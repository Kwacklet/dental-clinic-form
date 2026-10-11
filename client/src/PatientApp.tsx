import { useEffect, useState } from 'react'
import AppHeader from './components/AppHeader'
import Questionnaire from './components/Questionnaire'
import AnswerSummary from './components/AnswerSummary'
import { submitAssessment } from './api/assessments'
import { getSettings } from './api/settings'
import { allQuestions } from './data/questions'
import { formSettings } from './data/formSettings'
import { applyCalculatedAnswers } from './utils/answers'
import type { Answers } from './types'

type Screen = 'questionnaire' | 'review' | 'sent'

// A fresh form, with any automatic answers filled in.
const createInitialAnswers = () => applyCalculatedAnswers({}, allQuestions)

// Patient flow: Questionnaire -> Review your answers -> Sent (thank you).
// Answers are only saved when the patient presses "Send to clinic".
function PatientApp() {
  const [screen, setScreen] = useState<Screen>('questionnaire')
  const [answers, setAnswers] = useState<Answers>(createInitialAnswers)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [settings, setSettings] = useState(formSettings) // defaults until the real ones load

  // Load the form title and clinic name set by the dentist.
  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch(() => {}) // keep the defaults if they can't be loaded
  }, [])

  function showScreen(name: Screen) {
    setScreen(name)
    window.scrollTo({ top: 0 })
  }

  function handleReview(finalAnswers: Answers) {
    setAnswers(finalAnswers)
    setSendError('')
    showScreen('review')
  }

  async function handleSend() {
    setSending(true)
    setSendError('')
    try {
      await submitAssessment(answers)
      setAnswers(createInitialAnswers()) // reset the form after a successful save
      showScreen('sent')
    } catch (error) {
      // Answers are kept, so the patient can simply try again.
      setSendError((error as Error).message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="app-shell">
      <AppHeader clinicName={settings.clinicName} />
      <main className="app-content">
        {screen === 'questionnaire' && (
          <Questionnaire
            title={settings.formTitle}
            answers={answers}
            onAnswersChange={setAnswers}
            onSubmit={handleReview}
          />
        )}
        {screen === 'review' && (
          <AnswerSummary
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
            <button type="button" className="button button-primary" onClick={() => showScreen('questionnaire')}>
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

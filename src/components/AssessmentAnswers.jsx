import { Fragment } from 'react'
import { isQuestionVisible } from '../utils/branching'
import { formatDate } from '../utils/dates'
import { isEmpty } from '../utils/validation'


function formatAnswer(question, answers) {
  const value = answers[question.id]
  if (question.type === 'consent') return value === true ? 'Agreed' : null
  if (isEmpty(value)) return null
  if (question.type === 'date') return formatDate(value)
  if (question.type === 'scale') return `${value} out of ${question.max}`

  // Show "Other" together with what the patient typed, e.g. "Other: grinding".
  const otherText = question.otherId ? answers[question.otherId] : ''
  const withOther = (answer) => (answer === 'Other' && otherText ? `Other: ${otherText}` : answer)
  if (Array.isArray(value)) return value.map(withOther).join(', ')
  return withOther(value)
}


function AssessmentAnswers({ sections, allQuestions, answers }) {
  return (
    <>
      {sections.map((section, sectionIndex) => {
        const mainQuestions = section.questions.filter((q) => !q.showIf)
        const rows = section.questions
          .filter((q) => !q.isOtherText) // shown inside the parent answer instead
          .filter((q) => isQuestionVisible(q, answers, allQuestions))
          .map((question) => ({ question, answer: formatAnswer(question, answers) }))
          .filter((row) => row.answer !== null)

        return (
          <section key={section.id} className="form-panel summary-section">
            <div className="form-panel-header">
              <h2>
                {sectionIndex + 1}. {section.title}
              </h2>
            </div>
            {rows.length === 0 ? (
              <p className="summary-none">No information provided.</p>
            ) : (
              <dl className={`summary-list ${section.isPatientInfo ? 'summary-grid' : ''}`}>
                {rows.map(({ question, answer }, index) => {
                  const number = !section.isPatientInfo && !question.showIf ? mainQuestions.indexOf(question) + 1 : null
                  // Heading before the first answer of each group, e.g. "Toothache Details".
                  const startsGroup = question.group && question.group !== rows[index - 1]?.question.group
                  return (
                    <Fragment key={question.id}>
                      {startsGroup && <div className="summary-group-title">{question.group} Details</div>}
                      <div
                        className={`summary-row ${question.showIf && !question.isGroupItem ? 'summary-row-follow-up' : ''}`}
                      >
                        <dt>
                          {number && <span className="question-number">{number}.</span>}
                          {question.label}
                        </dt>
                        <dd>{answer}</dd>
                      </div>
                    </Fragment>
                  )
                })}
              </dl>
            )}
          </section>
        )
      })}
    </>
  )
}

export default AssessmentAnswers

import { Fragment } from 'react'
import { allQuestions, questionnaireSections } from '../data/questions'

const TYPE_LABELS = {
  text: 'Short text',
  name: 'Name',
  email: 'Email',
  tel: 'Numbers only',
  number: 'Number',
  date: 'Date',
  textarea: 'Paragraph',
  select: 'Dropdown',
  radio: 'Single choice',
  checkbox: 'Multiple choice',
  scale: 'Slider 0–10',
  consent: 'Required checkbox',
}

const NOT_AVAILABLE = 'Available once a database is connected'


function questionName(questionId, section) {
  const mainQuestions = section.questions.filter((q) => !q.showIf)
  const index = mainQuestions.findIndex((q) => q.id === questionId)
  if (index >= 0) return `Q${index + 1}`
  return `"${allQuestions.find((q) => q.id === questionId)?.label ?? questionId}"`
}


function describeCondition(question, section) {
  const rule = question.showIf
  if (!rule) return '—'
  const name = questionName(rule.questionId, section)
  if (rule.anyExcept !== undefined) return `If ${name} is anything except "${rule.anyExcept}"`

  const parent = allQuestions.find((q) => q.id === rule.questionId)
  const values = (Array.isArray(rule.value) ? rule.value : [rule.value]).map((v) => `"${v}"`).join(' or ')
  const verb = parent?.type === 'checkbox' ? 'includes' : 'is'
  return `If ${name} ${verb} ${values}`
}


function QuestionnairePage() {
  return (
    <>
      <div className="dentist-page-header detail-header">
        <div>
          <h1>Questionnaire</h1>
          <p>The questions patients see on the assessment form.</p>
        </div>
        <button type="button" className="button button-primary" disabled title={NOT_AVAILABLE}>
          Add question
        </button>
      </div>

      <p className="notice notice-info">
        Editing is not available yet: for now, questions are changed in <code>src/data/questions.js</code>. Add, edit
        and remove will work here once a database is connected.
      </p>

      {questionnaireSections.map((section, sectionIndex) => {
        const mainQuestions = section.questions.filter((q) => !q.showIf)
        return (
          <section key={section.id} className="dentist-card">
            <div className="dentist-card-header">
              <h2>
                {sectionIndex + 1}. {section.title}
              </h2>
              <span className="dentist-card-count">{section.questions.length} questions</span>
            </div>
            <table className="dentist-table question-table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Question</th>
                  <th scope="col">Type</th>
                  <th scope="col">Required</th>
                  <th scope="col">Shown when</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {section.questions.map((question, index) => {
                  const number = question.showIf ? '' : `Q${mainQuestions.indexOf(question) + 1}`
                  const startsGroup = question.group && question.group !== section.questions[index - 1]?.group
                  return (
                    <Fragment key={question.id}>
                      {startsGroup && (
                        <tr className="question-table-group">
                          <th colSpan={6} scope="colgroup">
                            {question.group}
                          </th>
                        </tr>
                      )}
                      <tr className={question.showIf ? 'is-follow-up' : ''}>
                        <td data-label="#" className="question-table-number">
                          {number || '↳'}
                        </td>
                        <td data-label="Question" className="table-primary-cell">
                          {question.label}
                          {question.options && (
                            <span className="question-options">{question.options.join(' · ')}</span>
                          )}
                        </td>
                        <td data-label="Type">{TYPE_LABELS[question.type] ?? question.type}</td>
                        <td data-label="Required">{question.required ? 'Required' : 'Optional'}</td>
                        <td data-label="Shown when">{describeCondition(question, section)}</td>
                        <td className="table-action-cell">
                          <button
                            type="button"
                            className="button button-secondary button-small"
                            disabled
                            title={NOT_AVAILABLE}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="button button-secondary button-small"
                            disabled
                            title={NOT_AVAILABLE}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </section>
        )
      })}
    </>
  )
}

export default QuestionnairePage

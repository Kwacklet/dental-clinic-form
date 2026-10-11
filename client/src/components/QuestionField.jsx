import { getTodayISO } from '../utils/dates'

// Renders a single questionnaire question based on its `type`.
// `locked` makes a radio question read-only (see `lockedIf` in questions.js).
function QuestionField({ question, value, error, onChange, onBlur, isFollowUp, number, locked }) {
  const { id, label, type, required, options = [], placeholder, maxLength } = question
  const helpText = locked ? question.lockedText : question.helpText
  const errorId = `${id}-error`
  const describedBy = error ? errorId : undefined
  const isGroup = ['radio', 'checkbox', 'consent'].includes(type)

  function handleCheckboxChange(option, checked) {
    const selected = Array.isArray(value) ? value : []
    const next = checked ? [...selected, option] : selected.filter((item) => item !== option)
    // Keep the selection order the same as the options list.
    onChange(id, options.filter((item) => next.includes(item)))
  }

  function handleTextChange(event) {
    let newValue = event.target.value
    // Number and phone fields only accept digits.
    if (type === 'number' || type === 'tel') newValue = newValue.replace(/\D/g, '')
    onChange(id, newValue)
  }

  const labelContent = (
    <>
      {number && <span className="question-number">{number}.</span>}
      {label}
      {required && (
        <span className="required-mark" aria-hidden="true">
          {' '}*
        </span>
      )}
      {required && <span className="visually-hidden"> (required)</span>}
    </>
  )

  function renderControl() {
    const inputClass = `input ${error ? 'input-invalid' : ''}`
    const commonProps = {
      id,
      name: id,
      'aria-invalid': Boolean(error),
      'aria-describedby': describedBy,
      onBlur: () => onBlur(question),
    }

    switch (type) {
      case 'date':
        return (
          <input
            {...commonProps}
            className={inputClass}
            type="date"
            max={getTodayISO()}
            value={value ?? ''}
            onChange={handleTextChange}
          />
        )
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            className={`${inputClass} textarea`}
            rows={3}
            value={value ?? ''}
            placeholder={placeholder}
            maxLength={maxLength}
            onChange={handleTextChange}
          />
        )
      case 'select':
        return (
          <select {...commonProps} className={`${inputClass} select`} value={value ?? ''} onChange={handleTextChange}>
            <option value="">Select</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )
      case 'radio':
        return (
          // Short Yes/No lists sit on one line; long lists use two columns.
          <div className={`choice-list ${options.length <= 3 ? 'choice-list-inline' : 'choice-list-grid'}`}>
            {options.map((option) => (
              <label key={option} className={`choice ${locked ? 'choice-locked' : ''}`}>
                <input
                  type="radio"
                  name={id}
                  value={option}
                  checked={value === option}
                  disabled={locked}
                  onChange={() => onChange(id, option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )
      case 'checkbox': {
        const selected = Array.isArray(value) ? value : []
        return (
          <div className="choice-list choice-list-grid">
            {options.map((option) => (
              <label key={option} className="choice">
                <input
                  type="checkbox"
                  name={id}
                  value={option}
                  checked={selected.includes(option)}
                  onChange={(event) => handleCheckboxChange(option, event.target.checked)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )
      }
      case 'consent':
        return (
          <label className="choice consent-choice">
            <input
              type="checkbox"
              name={id}
              checked={value === true}
              aria-invalid={Boolean(error)}
              onChange={(event) => onChange(id, event.target.checked)}
            />
            <span>I agree</span>
          </label>
        )
      case 'scale': {
        // 0-10 slider. It starts unanswered; the answer is set when the patient
        // moves or clicks the slider (clicking also counts if they choose 0).
        const hasValue = value !== undefined && value !== ''
        const setFromEvent = (event) => onChange(id, event.target.value)
        return (
          <div className="scale">
            <div className="scale-row">
              <input
                {...commonProps}
                type="range"
                className={`scale-input ${hasValue ? '' : 'scale-input-empty'}`}
                min={question.min}
                max={question.max}
                step={1}
                value={hasValue ? value : question.min}
                aria-valuetext={hasValue ? `${value} out of ${question.max}` : 'Not answered'}
                onChange={setFromEvent}
                onPointerUp={setFromEvent}
                onKeyUp={(event) => {
                  if (/^(Arrow|Home|End)/.test(event.key)) setFromEvent(event)
                }}
              />
              <output htmlFor={id} className="scale-value">
                {hasValue ? value : '–'}
              </output>
            </div>
            <div className="scale-labels" aria-hidden="true">
              <span>
                {question.min} = {question.minLabel}
              </span>
              <span>
                {question.max} = {question.maxLabel}
              </span>
            </div>
            {hasValue && (
              <button type="button" className="link-button" onClick={() => onChange(id, '')}>
                Clear answer
              </button>
            )}
          </div>
        )
      }
      default:
        // text, name, email, tel (digits only), number (digits only)
        return (
          <input
            {...commonProps}
            className={inputClass}
            type={type === 'email' ? 'email' : type === 'tel' ? 'tel' : 'text'}
            inputMode={type === 'number' || type === 'tel' ? 'numeric' : undefined}
            autoComplete={type === 'name' ? 'name' : undefined}
            value={value ?? ''}
            placeholder={placeholder}
            maxLength={maxLength}
            onChange={handleTextChange}
          />
        )
    }
  }

  const footer = (
    <>
      {helpText && !error && <p className="field-hint">{helpText}</p>}
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </>
  )

  const className = [
    'question',
    number && 'question-numbered',
    isFollowUp && 'question-follow-up',
    question.isOtherText && 'question-other',
    type === 'consent' && 'question-consent',
    error && 'question-invalid',
  ]
    .filter(Boolean)
    .join(' ')

  // Radio / checkbox groups use fieldset + legend for accessibility.
  if (isGroup) {
    return (
      <fieldset className={className} data-field={id} aria-describedby={describedBy}>
        <legend className="field-label">{labelContent}</legend>
        {renderControl()}
        {footer}
      </fieldset>
    )
  }

  return (
    <div className={className} data-field={id}>
      <label htmlFor={id} className="field-label">
        {labelContent}
      </label>
      {renderControl()}
      {footer}
    </div>
  )
}

export default QuestionField

import type { Section } from '../types'

interface ProgressStepsProps {
  sections: Section[]
  currentIndex: number
  onStepClick: (index: number) => void
}

// Progress indicator above the form: "Section 3 of 10" plus one bar segment
// per section. Earlier sections can be clicked to go back to them.
function ProgressSteps({ sections, currentIndex, onStepClick }: ProgressStepsProps) {
  const nextSection = sections[currentIndex + 1]

  return (
    <nav className="progress" aria-label="Form progress">
      <div className="progress-text">
        <span className="progress-count">
          Section {currentIndex + 1} of {sections.length}
        </span>
        {nextSection && <span className="progress-next">Next: {nextSection.title}</span>}
      </div>
      <ol className="progress-segments">
        {sections.map((section, index) => {
          const status = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming'
          return (
            <li key={section.id}>
              <button
                type="button"
                className={`progress-segment progress-segment-${status}`}
                onClick={() => onStepClick(index)}
                disabled={status !== 'done'}
                aria-current={status === 'current' ? 'step' : undefined}
                title={`${index + 1}. ${section.title}`}
              >
                <span className="visually-hidden">
                  {index + 1}. {section.title}
                  {status === 'done' ? ' (completed, go back)' : ''}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default ProgressSteps

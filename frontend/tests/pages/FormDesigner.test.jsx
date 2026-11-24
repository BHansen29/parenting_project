import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import FormDesigner, {
  answerText,
  FormTemplatePrintDocument,
  loadTemplate,
  templateStorageKey,
} from '../../src/pages/FormDesigner'
import { CUSTOM_COMPARISON_QUESTIONS } from '../../src/lib/comparisonQuestionDefinitions'
import { renderWithRouter } from '../../src/utils/renderWithRouter'

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth, callback) => {
    callback(null)
    return vi.fn()
  }),
}))

vi.mock('../../src/lib/firebase', () => ({ auth: {} }))

vi.stubGlobal('fetch', vi.fn((url) => {
  if (String(url).includes('/api/logic-engine/questions')) {
    return Promise.resolve({
      ok: true,
      json: async () => [{ qKey: 'parentalRights.test', qText: 'Sample parental-rights question', section: 'parental-rights' }],
    })
  }
  return Promise.resolve({ ok: true, json: async () => ({}) })
}))

describe('FormDesigner', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(fetch).mockClear()
  })

  it('renders the blank designer and both PDF formats', async () => {
    renderWithRouter(<FormDesigner />)

    expect(screen.getByRole('heading', { name: 'Form Designer' })).toBeInTheDocument()
    expect(screen.getByLabelText('Document title')).toHaveValue('Ohio Form 20 Parenting Plan')
    expect(screen.getByRole('option', { name: 'Form 20' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Form 21' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Review PDF' })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Comparison PDF' })).not.toBeInTheDocument()
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/logic-engine/questions'),
    ))
  })

  it('adds editable document text and switches PDF formats', async () => {
    renderWithRouter(<FormDesigner />)

    await userEvent.click(screen.getByRole('button', { name: /add section heading/i }))
    expect(screen.getAllByRole('textbox').length).toBeGreaterThan(1)

    await userEvent.selectOptions(screen.getByLabelText('PDF format'), 'form21')
    expect(screen.getByLabelText('Document title')).toHaveValue('Ohio Form 21 Parenting Plan')
  })

  it('shows the question-pages palette', async () => {
    renderWithRouter(<FormDesigner />)

    expect(await screen.findByRole('tab', { name: 'Personal info' })).toBeInTheDocument()
    expect(screen.getByRole('tablist', { name: 'Question pages' })).toBeInTheDocument()
  })

  it('allows the same question to be added repeatedly and duplicated', async () => {
    renderWithRouter(<FormDesigner />)

    await userEvent.click(await screen.findByRole('tab', { name: 'Parental Rights' }))
    const questionButton = await screen.findByRole('button', {
      name: /sample parental-rights question/i,
    })

    await userEvent.click(questionButton)
    await userEvent.click(questionButton)

    expect(screen.getAllByText('Sample parental-rights question').length).toBeGreaterThanOrEqual(2)

    await userEvent.click(screen.getAllByRole('button', { name: 'Duplicate block' })[0])
    expect(screen.getAllByText('Sample parental-rights question').length).toBeGreaterThanOrEqual(3)
  })

  it('does not render help bubbles for question blocks', async () => {
    renderWithRouter(<FormDesigner />)

    await userEvent.click(await screen.findByRole('tab', { name: 'Parental Rights' }))
    await userEvent.click(await screen.findByRole('button', {
      name: /sample parental-rights question/i,
    }))

    expect(document.querySelector('.help-menu')).not.toBeInTheDocument()
  })

  it('does not print additional information help text', () => {
    render(
      <FormTemplatePrintDocument
        template={{
          title: 'Review',
          blocks: [{
            id: 'answer-1',
            type: 'answer',
            qKey: 'parentalRights.test',
            questionText: 'Sample question',
            infoText: 'This help text should not print',
          }],
        }}
        answersByKey={{
          'parentalRights.test': { answer: 'Yes' },
        }}
        questions={{
          'parentalRights.test': {
            qText: 'Sample question',
            qIntro: 'This fallback help text should not print',
          },
        }}
      />,
    )

    expect(screen.queryByText('This help text should not print')).not.toBeInTheDocument()
    expect(screen.queryByText('This fallback help text should not print')).not.toBeInTheDocument()
  })

  it('restores duplicate answer blocks from local storage', () => {
    localStorage.setItem(templateStorageKey('form20'), JSON.stringify({
      title: 'Repeated responses',
      blocks: [
        { id: 'answer-1', type: 'answer', qKey: 'parentalRights.test', questionText: 'First copy' },
        { id: 'answer-2', type: 'answer', qKey: 'parentalRights.test', questionText: 'Second copy' },
      ],
    }))

    const restored = loadTemplate('form20')

    expect(restored.blocks.filter((block) => block.qKey === 'parentalRights.test')).toHaveLength(2)
  })

  it('shows readable Information Sharing question labels', async () => {
    localStorage.setItem('shareCareFormTemplate:form20', JSON.stringify({
      title: 'Comparison',
      blocks: [{ id: 'intro', type: 'heading', text: 'Questionnaire Responses' }],
    }))
    renderWithRouter(<FormDesigner />)

    await userEvent.click(await screen.findByRole('tab', { name: 'Information Sharing' }))
    expect(screen.getAllByText('Medical information access').length).toBeGreaterThan(0)
    expect(screen.getAllByText('School contact rights').length).toBeGreaterThan(0)
    expect(screen.getAllByText('School activity participation').length).toBeGreaterThan(0)
  })

  it('uses readable Information Sharing labels in shared comparison metadata', () => {
    expect(CUSTOM_COMPARISON_QUESTIONS['informationSharing.medicalRecords'].qText)
      .toBe('Medical information access')
    expect(CUSTOM_COMPARISON_QUESTIONS['informationSharing.schoolContact'].qText)
      .toBe('School contact rights')
    expect(CUSTOM_COMPARISON_QUESTIONS['informationSharing.schoolActivities'].qText)
      .toBe('School activity participation')
  })

  it('uses address-specific labels for the school-address parent question', () => {
    const question = CUSTOM_COMPARISON_QUESTIONS.school_address_parent
    expect(question.options).toEqual(expect.arrayContaining([
      { value: 'me', label: 'Just my address' },
      { value: 'coParent', label: "Just my co-parent's address" },
    ]))
    expect(answerText('me', question)).toBe('Just my address')
    expect(answerText('coParent', question)).toBe("Just my co-parent's address")
  })

  it('formats both parents tax years for odd, even, and custom arrangements', () => {
    const question = { childAnswers: true }
    expect(answerText({
      Alex: { intent: 'parent1SomeYears', taxYears: 'odd', userIsParent2: true },
    }, question)).toContain('Parent 1 will claim: Odd-numbered tax years')
    expect(answerText({
      Alex: { intent: 'parent1SomeYears', taxYears: 'odd', userIsParent2: true },
    }, question)).toContain('Parent 2 will claim: Even-numbered tax years')
    expect(answerText({
      Alex: { intent: 'parent1SomeYears', taxYears: 'odd', userIsParent2: true },
    }, question)).not.toContain('Alex: Parent 1 —')
    expect(answerText({
      Alex: {
        intent: 'parent2SomeYears',
        taxYears: 'custom',
        customYears: '2025, 2029',
        coParentCustomYears: '2026, 2028',
        userIsParent2: false,
      },
    }, question)).toContain('Parent 2 will claim: 2025, 2029')
    expect(answerText({
      Alex: {
        intent: 'parent2SomeYears',
        taxYears: 'custom',
        customYears: '2025, 2029',
        coParentCustomYears: '2026, 2028',
        userIsParent2: false,
      },
    }, question)).toContain('Parent 1 will claim: 2026, 2028')
  })

  it('uses relative tax-year labels in review mode and parent labels in comparison mode', () => {
    const question = { childAnswers: true }
    const answer = {
      Alex: { intent: 'parent1SomeYears', taxYears: 'odd', userIsParent2: false },
    }

    expect(answerText(answer, question, 'parent1', true, true)).toContain(
      'I will claim',
    )
    expect(answerText(answer, question, 'parent1', false, true)).toContain(
      'Parent 1 will claim',
    )
  })

  it('uses relative labels for generic review options instead of Parent 1 or Parent 2', () => {
    const question = {
      qKey: 'test.question',
      options: [
        { value: 'parent1', label: 'Just me' },
        { value: 'parent2', label: 'Just my co-parent' },
        { value: 'both', label: 'Both me and my co-parent' },
      ],
    }

    expect(answerText('parent1', question, 'parent1', true)).toBe('Just me')
    expect(answerText('parent2', question, 'parent1', true)).toBe('Just my co-parent')
    expect(answerText('both', question, 'parent1', true)).toBe('Both me and my co-parent')
  })

  it('prints distinct local-plan schedule parents regardless of case filing role', () => {
    const { container, rerender } = render(
      <FormTemplatePrintDocument
        template={{
          title: 'Review',
          blocks: [{
            id: 'schedule-1',
            type: 'answer',
            qKey: 'parentingTimeAndCommunication.parentingSchedule',
            questionText: 'Parenting schedule',
          }],
        }}
        answersByKey={{
          'parentingTimeAndCommunication.parentingSchedule': {
            answer: {
              0: [
                { parent: 'parent1', startTime: '09:00', endTime: '12:00' },
                { parent: 'parent2', startTime: '13:00', endTime: '17:00' },
              ],
            },
          },
        }}
        questions={{
          'parentingTimeAndCommunication.parentingSchedule': { scheduleType: 'regular' },
        }}
        answeringParent="no_case"
      />,
    )

    const scheduleParentLabels = () => [...container.querySelectorAll('.form-designer__schedule-slot-parent')]
      .map((label) => label.textContent)
    expect(scheduleParentLabels()).toEqual(['Me', 'My co-parent'])

    rerender(
      <FormTemplatePrintDocument
        template={{
          title: 'Review',
          blocks: [{
            id: 'schedule-1',
            type: 'answer',
            qKey: 'parentingTimeAndCommunication.parentingSchedule',
            questionText: 'Parenting schedule',
          }],
        }}
        answersByKey={{
          'parentingTimeAndCommunication.parentingSchedule': {
            answer: {
              0: [
                { parent: 'parent1', startTime: '09:00', endTime: '12:00' },
                { parent: 'parent2', startTime: '13:00', endTime: '17:00' },
              ],
            },
          },
        }}
        questions={{
          'parentingTimeAndCommunication.parentingSchedule': { scheduleType: 'regular' },
        }}
        answeringParent="parent2"
      />,
    )
    expect(scheduleParentLabels()).toEqual(['Me', 'My co-parent'])
    expect(screen.queryByText(/Parent 1|Parent 2/)).not.toBeInTheDocument()
  })

  it('prints both parent answers for items needing discussion', () => {
    render(
      <FormTemplatePrintDocument
        template={{
          title: 'Comparison',
          blocks: [{
            id: 'answer-1',
            type: 'answer',
            qKey: 'parentalRights.test',
            questionText: 'Who makes this decision?',
          }],
        }}
        answersByKey={{
          'parentalRights.test': {
            qKey: 'parentalRights.test',
            answer: 'merged answer',
            parentAnswers: { parent1: 'Parent 1 answer', parent2: 'Parent 2 answer' },
          },
        }}
        questions={{ 'parentalRights.test': { qKey: 'parentalRights.test' } }}
        needsDiscussionKeys={new Set(['parentalRights.test'])}
        parentNames={{ parent1: 'Alex', parent2: 'Jordan' }}
      />,
    )

    expect(screen.getByText("Alex's answer")).toBeInTheDocument()
    expect(screen.getByText('Parent 1 answer')).toBeInTheDocument()
    expect(screen.getByText("Jordan's answer")).toBeInTheDocument()
    expect(screen.getByText('Parent 2 answer')).toBeInTheDocument()
    expect(screen.queryByText('merged answer')).not.toBeInTheDocument()
  })

  it('hides headings that contain no answered questions', () => {
    render(
      <FormTemplatePrintDocument
        template={{
          title: 'Comparison',
          blocks: [
            { id: 'heading-empty', type: 'heading', text: 'Empty section' },
            { id: 'answer-empty', type: 'answer', qKey: 'empty.question', questionText: 'Unanswered question' },
            { id: 'heading-answered', type: 'heading', text: 'Answered section' },
            { id: 'answer-answered', type: 'answer', qKey: 'answered.question', questionText: 'Answered question' },
          ],
        }}
        answersByKey={{
          'empty.question': { qKey: 'empty.question', answer: null },
          'answered.question': { qKey: 'answered.question', answer: 'The answer' },
        }}
        questions={{}}
      />,
    )

    expect(screen.queryByText('Empty section')).not.toBeInTheDocument()
    expect(screen.queryByText('Unanswered question')).not.toBeInTheDocument()
    expect(screen.getByText('Answered section')).toBeInTheDocument()
    expect(screen.getByText('Answered question')).toBeInTheDocument()
  })
})

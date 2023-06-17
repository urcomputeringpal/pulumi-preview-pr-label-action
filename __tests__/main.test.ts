import {computeLabels} from '../src/labels'
import {expect, test} from '@jest/globals'

test('only some', async () => {
  const pulumiOutput = `
    ~ 4 to update
    +-8 to replace
  `

  const labels = await computeLabels(pulumiOutput, 'production')
  expect(labels.add).toContain('production changes')
  expect(labels.add).toContain('production replacements')
  expect(labels.remove).toContain('production creations')
  expect(labels.remove).toContain('production deletions')
  expect(labels.remove).toContain('production noop')
})

test('all', async () => {
  const pulumiOutput = `
    + 5 to create
    ~ 4 to update
    - 5 to delete
    +-9 to replace
  `

  const labels = await computeLabels(pulumiOutput, 'production')
  expect(labels.add).toContain('production changes')
  expect(labels.add).toContain('production replacements')
  expect(labels.add).toContain('production creations')
  expect(labels.add).toContain('production deletions')
  expect(labels.remove).toContain('production noop')
})

test('noop', async () => {
  const pulumiOutput = `
  `

  const labels = await computeLabels(pulumiOutput, 'production')
  expect(labels.remove).toContain('production changes')
  expect(labels.remove).toContain('production replacements')
  expect(labels.remove).toContain('production creations')
  expect(labels.remove).toContain('production deletions')
  expect(labels.add).toContain('production noop')
})

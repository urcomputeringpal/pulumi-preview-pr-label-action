import * as github from '@actions/github'
import {Context} from '@actions/github/lib/context'

type OctokitInstance = ReturnType<typeof github.getOctokit>

type LabelMutations = {
  add: string[]
  remove: string[]
}

export async function computeLabels(
  pulumiOutput: string,
  labelPrefix: string
): Promise<LabelMutations> {
  const labels: LabelMutations = {
    add: [],
    remove: []
  }
  if (pulumiOutput === '') {
    return labels
  }

  if (pulumiOutput.match('[1-9]* to update')) {
    labels.add.push(`${labelPrefix} updates`)
  } else {
    labels.remove.push(`${labelPrefix} updates`)
  }

  if (pulumiOutput.match('[1-9]* to replace')) {
    labels.add.push(`${labelPrefix} replacements`)
  } else {
    labels.remove.push(`${labelPrefix} replacements`)
  }

  if (pulumiOutput.match('[1-9]* to create')) {
    labels.add.push(`${labelPrefix} creations`)
  } else {
    labels.remove.push(`${labelPrefix} creations`)
  }

  if (pulumiOutput.match('[1-9]* to delete')) {
    labels.add.push(`${labelPrefix} deletions`)
  } else {
    labels.remove.push(`${labelPrefix} deletions`)
  }

  if (labels.add.length === 0) {
    labels.add.push(`${labelPrefix} noop`)
  } else {
    labels.remove.push(`${labelPrefix} noop`)
  }

  return labels
}

export async function writeLabels(
  labels: LabelMutations,
  prNumber: number,
  context: Context,
  octokit: OctokitInstance
): Promise<void> {
  await octokit.rest.issues.addLabels({
    ...context.repo,
    issue_number: prNumber,
    labels: labels.add
  })

  for (const label of labels.remove) {
    try {
      await octokit.rest.issues.removeLabel({
        ...context.repo,
        issue_number: prNumber,
        name: label
      })
    } catch (error: unknown) {
      if (error instanceof Error && 'status' in error && error.status !== 404) {
        throw error
      }
    }
  }
}

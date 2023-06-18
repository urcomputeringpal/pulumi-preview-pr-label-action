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

export async function labelPR(
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

// an exported function called ensureLabels that takes in a labelPrefix
// string, a context object, and an octokit object this function either creates
// or updates each of the labels that the computeLabels function may return to
// assign them colors that reflect their meaning (to me at least).
export async function ensureLabels(
  labelPrefix: string,
  context: Context,
  octokit: OctokitInstance
): Promise<void> {
  const labels = [
    {
      name: `${labelPrefix} updates`,
      color: 'ffcc00',
      description: `This PR will update Pulumi resources in ${labelPrefix}.`
    },
    {
      name: `${labelPrefix} replacements`,
      color: 'ff9900',
      description: `This PR will replace Pulumi resources in ${labelPrefix}.`
    },
    {
      name: `${labelPrefix} creations`,
      color: '0000ff',
      description: `This PR will create Pulumi resources in ${labelPrefix}.`
    },
    {
      name: `${labelPrefix} deletions`,
      color: 'ff3300',
      description: `This PR will delete Pulumi resources in ${labelPrefix}.`
    },
    {
      name: `${labelPrefix} noop`,
      color: '00cc00',
      description: `This PR is a ${labelPrefix} Pulumi noop.`
    }
  ]

  for (const label of labels) {
    try {
      await octokit.rest.issues.createLabel({
        ...context.repo,
        ...label
      })
    } catch (error: unknown) {
      if (error instanceof Error && 'status' in error && error.status !== 422) {
        throw error
      }
      // update the label's color if it already exists
      try {
        await octokit.rest.issues.updateLabel({
          ...context.repo,
          ...label
        })
      } catch (updateError: unknown) {
        if (
          updateError instanceof Error &&
          'status' in updateError &&
          updateError.status !== 422
        ) {
          throw updateError
        }
      }
    }
  }
}

import * as core from '@actions/core'
import {context, getOctokit} from '@actions/github'
import {requestLog} from '@octokit/plugin-request-log'
import {retry} from '@octokit/plugin-retry'
import {computeLabels, ensureLabels, labelPR} from './labels'

async function run(): Promise<void> {
  try {
    const token: string = core.getInput('github-token', {required: true})
    const octokit = getOctokit(token, undefined, retry, requestLog)

    const labelPrefix: string = core.getInput('label-prefix', {
      required: true
    })

    const pulumiOutput: string = core.getInput('pulumi-output', {
      required: true
    })

    const prNumber: number | undefined = context.payload.pull_request?.number
    if (prNumber === undefined) {
      throw new Error('No pull request number found')
    }

    const labels = await computeLabels(pulumiOutput, labelPrefix)
    await ensureLabels(labelPrefix, context, octokit)
    await labelPR(labels, prNumber, context, octokit)
    for (const label of labels.add) {
      core.setOutput(label.replace(/ /, '-'), 'true')
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()

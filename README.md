# Pulumi Preview PR Label Action

Decorate your PR with context from Pulumi Preview output. 

See [./action.yml](./action.yml) for the full documentation for this action's inputs and outputs.

## Example

The following example demonstrates how to use this with [pulumi/actions](https://github.com/pulumi/actions):
    
```yaml
name: pulumi-preview
on: [pull_request]
jobs:
    preview:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      issues: write
      pull-requests: write
    steps:
        - uses: actions/checkout@v2
        - uses: pulumi/actions@v4
          id: pulumi-preview
          with:
            work-dir: pulumi
            command: preview
        - uses: urcomputeringpal/pulumi-preview-pr-label-action@v0
          with:
            label-prefix: Production
            pulumi-output: ${{ steps.pulumi-preview.outputs.output }}
```

# nx-buf

An [Nx](https://nx.dev) plugin for performing codegen from Protobuf/gRPC projects
using [Buf](http://buf.build).

## Installation

To install this plugin, run the following command:

```sh
npm install nx-buf
```

And add it to the list of plugins in `nx.json`:

```jsonc
{
  // ...
  "plugins": [
    // ...
    "nx-buf"
  ]
}
```

## Features

This plugin assumes that you have a separate Nx project in your workspace that contains your `.proto` files, as well as `buf.yaml` and `buf.gen.yaml` in that project root.

### Linting

To enable linting a `buf` project, use the `nx-buf:lint` executor in that project's `project.json`:

```jsonc
{
  // ...
  "targets": {
    "lint": {
      "executor": "nx-buf:lint"
    }
  }
}
```

### Codegen

To generate source files from a `buf` project into another project, use the `nx-buf:generate` executor in the destination project:

```jsonc
{
  // ...
  "targets": {
    "proto-gen": {
      "executor": "nx-buf:generate",
      "outputs": ["{projectRoot}/{options.copyTo}"],
      "options": {
        "srcProject": "proto",
        "copyFrom": ["gen/*"],
        "copyTo": "src/gen"
      }
    },
    "build": {
      "dependsOn": ["proto-gen"],
      // ...
    }
  }
}
```

The options are as follows:

* `srcProject`: the project from where to grab the generated sources after running `buf generate`.
* `copyFrom`: a list of glob patterns to copy from that project, relative to its root.
* `copyTo`: the destination folder, relative to the target project.

### Dependency graph

This plugin will automatically establish a dependency between any project that contain a `nx-buf:generate` target and the respective project specified in `options.srcProject`.

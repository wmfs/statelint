# statelint
[![Tymly Package](https://img.shields.io/badge/tymly-package-blue.svg)](https://tymly.io/) [![npm (scoped)](https://img.shields.io/npm/v/@wmfs/statelint.svg)](https://www.npmjs.com/package/@wmfs/statelint) [![Build Status](https://travis-ci.com/wmfs/statelint.svg?branch=master)](https://travis-ci.org/wmfs/statelint) [![codecov](https://codecov.io/gh/wmfs/statelint/branch/master/graph/badge.svg)](https://codecov.io/gh/wmfs/statelint) [![Dependabot badge](https://img.shields.io/badge/Dependabot-active-brightgreen.svg)](https://dependabot.com/) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/wmfs/tymly/blob/master/packages/statelint/LICENSE)

An npm package providing a validator for [Amazon States Language](https://states-language.net/spec.html) JSON files. Usable from the command-line or as a library.

This package is derived from Amazon Web Services Labs' [awslabs/statelint](https://github.com/awslabs/statelint).

## From the Command-line 

### Installation
```sh
npm install --global @wmfs/statelint
```

### Usage
```javascript
statelint state-machine-spec [state-machine-spec...]
```

There are no options. If you see no output, your state machine is fine.

## As a library 

### Installation
```sh
npm install --save @wmfs/statelint
```

### Usage
```javascript
const stateLint = require('@wmfs/statelint')

const problems = stateLint.validate(json)
if (problems.length !== 0) {
  console.log('Oh dear!')
  problems.forEach(p => console.log(`ERROR: ${p}`)
}
```

* `json` is the state machine to validate as a JSON object.

`stateLint.validate` returns an array or error strings. If the array is empty, the state machine is fine. If not, then there's a problem! The validator is exhaustive, so it will report every problem it finds, not simply bail at the first thing. The error messages have the general form `<json-path to error> <description of error>`.

## Contributing

Bug reports and pull requests are welcome on GitHub. Please be aware of our [Code of Conduct](https://github.com/wmfs/statelint/blob/master/CODE_OF_CONDUCT.md)

## <a name="license"></a>License
Licensed under the terms of the [MIT license](https://github.com/wmfs/statelint/blob/master/LICENSE). Copyright (c) 2018 West Midlands Fire Service


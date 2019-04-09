## set up

1. `npm i -g firebase-tools`
2. `firebase init`
  - select `functions`
  - select `create new project`
  - select `TypeScript`
  - `Use TSLint`

## deploy

1. `firebase login`
2. `cd functions`
3. `npm run deploy -- --project <project id>`

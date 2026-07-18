# How to add your own reading passages and writing prompts

You don't need to touch any code for this. Just edit the file
`public/questions.json` in a plain text editor (Notepad, VS Code,
TextEdit — anything that saves plain text works), then refresh the
app in your browser. No `npm` commands needed, no rebuild needed.

## Adding a new reading question

Find the `"reading"` section. Each question looks like this:

```json
{
  "passage": "A short paragraph the player reads.",
  "question": "A question about that paragraph.",
  "correct": "The right answer.",
  "wrong": [
    "A wrong answer.",
    "Another wrong answer.",
    "A third wrong answer."
  ]
}
```

To add a new one, copy an existing `{ ... }` block (including the
curly braces), paste it right after the previous one, add a comma
between them, and fill in your own passage/question/answers.

## Adding a new writing prompt

Find the `"writing"` section — it's just a plain list of prompts:

```json
"writing": [
  "Write about your day.",
  "Describe your favorite hobby and what you enjoy about it."
]
```

To add one, copy a line, paste it, add a comma after the previous
line, and change the text.

## Common mistakes to avoid

- Every piece of text must be wrapped in double quotes `" "` (not
  single quotes).
- Every item except the *last* one in a list needs a comma `,`
  after it.
- If you accidentally break the file's formatting, don't worry —
  the app checks the file when it loads. If something's wrong with
  it, the app just quietly falls back to its built-in default
  questions instead of crashing. Nothing you do here can break the
  app itself.

## Tip: validate before you save

If you're not sure the file is still valid, paste its contents into
a free online tool like jsonlint.com — it'll tell you exactly which
line has a problem, if any.

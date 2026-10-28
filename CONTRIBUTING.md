# Share-it Contribution Guide

Thank you for visiting. This is a guide on how to contribute to and request features for this Web Extension.

## Requesting Features

- If you have a button feature you would like to see added, please feel free to add a [GitHub Issue](https://github.com/psephopaiktes/share-it/issues/new) or reply to [my X account](https://x.com/psephopaiktes).
- However, whether it can be implemented depends on **whether the service supports posting from URL queries**. For example, [Notion Web Clipper](https://www.notion.com/web-clipper) does not support new posts from URLs, so it cannot be implemented.
- Also, individual buttons are relatively easy to implement. If you find it simple after looking at [this source code](https://github.com/psephopaiktes/share-it/blob/main/components/Button/HackerNews.vue), please feel free to send a Pull Request!

## Proposing Features via Pull Request

Please fork the repository and submit a Pull Request following the general procedure.

### Setting Up the Development Environment

```zsh
npm i
npm start
```


### Adding a Button

0. Add the new button component to `/components/Button/`.
1. Add a 24x24 SVG Icon to `public/img`.
2. Add a line to `/components/defaultButtonList.ts`. The `enable` flag determines whether the button is enabled by default. Generally, set this to `false` for services that are expected to have fewer users.

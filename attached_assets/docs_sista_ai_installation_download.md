URL: https://docs.sista.ai/installation/download
---
[Skip to main content](#__docusaurus_skipToContent_fallback)

On this page

* * *

- React
- JavaScript
- iOS
- Android
- Ionic
- Vue
- Angular
- Gatsby
- Cordova
- Flutter
- Maui
- Xamarin
- Dart
- Ember
- Svelte

* * *

## Intro [​](\#intro "Direct link to Intro")

Let’s get started! Integrating a conversational AI assistant into your apps and websites has never been simpler with Sista AI’s Plug & Play AI Voice Assistant. This guide will show you how to effortlessly add the AI assistant button in three straightforward steps, instantly transforming your application with minimal effort.

## Supported React-based Frameworks [​](\#supported-react-based-frameworks "Direct link to Supported React-based Frameworks")

This package supports a diverse range of React-based frameworks:

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| [![React](/img/sdks/REACT.svg)](https://github.com/sista-ai/ai-assistant-react) | [![Next](/img/sdks/NEXT.svg)](https://github.com/sista-ai/ai-assistant-react) | [![Electron](/img/sdks/ELECTRON.svg)](https://github.com/sista-ai/ai-assistant-react) | [![Gatsby](/img/sdks/GATSBY.svg)](https://github.com/sista-ai/ai-assistant-react) | [![Meteor](/img/sdks/METEOR.svg)](https://github.com/sista-ai/ai-assistant-react) |
| [![React Native](/img/sdks/REACT-NATIVE.svg)](https://github.com/sista-ai/ai-assistant-react) | [![Remix](/img/sdks/REMIX.svg)](https://github.com/sista-ai/ai-assistant-react) | [![RedwoodJS](/img/sdks/REDWOODJS.svg)](https://github.com/sista-ai/ai-assistant-react) | [![Expo](/img/sdks/EXPO.svg)](https://github.com/sista-ai/ai-assistant-react) | [![BlitzJS](/img/sdks/BLITZJS.svg)](https://github.com/sista-ai/ai-assistant-react) |

## 1\. Install Package [​](\#1-install-package "Direct link to 1. Install Package")

Install ( **@sista/ai-assistant-react**) in your React App.

```codeBlockLines_e6Vv
npm install @sista/ai-assistant-react

```

If using Yarn: `yarn add @sista/ai-assistant-react`

## 2\. Import Provider [​](\#2-import-provider "Direct link to 2. Import Provider")

Import `AiAssistantProvider` and wrap your App at the root level, with the AI Assistant Provider.

```codeBlockLines_e6Vv
import { AiAssistantProvider } from "@sista/ai-assistant-react";

ReactDOM.render(
  <AiAssistantProvider apiKey="YOUR_API_KEY">
    <App />
  </AiAssistantProvider>
);

```

Get your **free** `API key` from the [Admin Panel](https://admin.sista.ai/applications) and replace `"YOUR_API_KEY"`.

## 3\. Import Button [​](\#3-import-button "Direct link to 3. Import Button")

Import `AiAssistantButton` and inject it wherever you want.

```codeBlockLines_e6Vv
import { AiAssistantButton } from "@sista/ai-assistant-react";

function RandomComponent() {
  return (
    // ...
      <AiAssistantButton />
    // ...
  );
}

```

> 🎉 Congrats! Press the button, start talking, and enjoy!

- [Intro](#intro)
- [Supported React-based Frameworks](#supported-react-based-frameworks)
- [1\. Install Package](#1-install-package)
- [2\. Import Provider](#2-import-provider)
- [3\. Import Button](#3-import-button)
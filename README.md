> This library isn't supported anymore because i don't get time to code on open projects.

# 🦆 DuckDuck (DuckDuckGo Search)

DuckDuck is a JS Module for interacting with DuckDuckGo's chat and search APIs. It supports conversational AI chat.

## ⚡ Features

- Supports Chat.
- Perform text-based searches using DuckDuckGo.

## 🛠 Installation

```bash
npm install
```

## 🚀 Usage

### 📥 Import DuckDuck Class

```javascript
import { DuckDuck, CHAT_MODELS } from 'duckduckjs';
```

### 🛎 Initialize DuckDuck

```javascript
const duckduck = new DuckDuck();
```

### 💬 Start a Chat

```javascript
const messages = [{ role: 'user', content: 'Tell me a joke.' }];

for await (const response of duckduck.chatYield(messages, CHAT_MODELS['gpt-4o-mini'])) {
  console.log(response);
}
```

### 🔎 Perform a Text Search

You can use the `text()` function to perform text-based searches and get the results in plain text.

```javascript
const results = await duckduck.text('latest AI news');
console.log(results);
```

### 🧠 Models

Available models include:
- `gpt-4o-mini`
- `llama-3.3-70b`
- `claude-3-haiku`
- `o3-mini`
- `mistral-small-3`

## 🔎 Troubleshooting

- **Invalid\_VQD Error:** Rerun the chat or text function.

Other Issues or feature Request: [Github](https://github.com/RajDave-Dev/DuckDuckJS)

## 🤝 Contributing

Contributions are welcome! Feel free to submit pull requests or issues.


## 🧑‍💻 Author
Developed by Raj Dave.

Inspired by [deedy5/duckduckgo_search](https://github.com/deedy5/duckduckgo_search)

## Disclaimer

This library is not affiliated with DuckDuckGo and is for educational purposes only. It is not intended for commercial use or any purpose that violates DuckDuckGo's Terms of Service. By using this library, you acknowledge that you will not use it in a way that infringes on DuckDuckGo's terms. The official DuckDuckGo website can be found at https://duckduckgo.com.


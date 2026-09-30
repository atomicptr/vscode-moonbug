# vscode-moonbug

<img src="./resources/moonbug_logo.png" alt="moonbug logo" width="256"/>

Lua debugger for Visual Studio Code, powered by [moonbug](https://github.com/atomicptr/moonbug)

Please report issues at the main repository: [atomicptr/moonbug](https://github.com/atomicptr/moonbug)

## Install

Get the extension from [here](https://marketplace.visualstudio.com/items?itemName=atomicptr.vscode-moonbug)

## Usage

Just import the moonbug module and get started!

```lua
local moonbug = require "moonbug" -- module path might vary

moonbug.listen(host, port, {
    wait = true, -- the process will block until a debugger attaches
})

-- Explore the `moonbug.Config` type for more options (or check out the main repository at https://github.com/atomicptr/moonbug)
```

Thats it!

The module is added to your `LUA_PATH` automatically, you might however need to import it manually from here: [atomicptr/moonbug](https://github.com/atomicptr/moonbug)

## License

MIT

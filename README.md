# herdr-tui-prefix

A Herdr mod that gives Herdr a tmux-style `Ctrl+B` prefix. Press `Ctrl+B`, then one key.
A popup lists the available actions.

| Key | Action |
| --- | --- |
| `c` | New tab |
| `v` / `-` | Split right / down |
| `h` `j` `k` `l` | Focus left / below / above / right pane |
| `w` | Workspace / tab picker |
| `x` | Close focused pane |
| `q` | Detach (close window) |
| `Shift+N` | New workspace |
| `Shift+T` | Rename tab |
| `Shift+D` | Close workspace |
| `b` | Toggle sidebar |

`Esc` or any unbound key cancels. Pressing `Ctrl+B` again sends a literal `^B` to the focused terminal, so nested tmux/TUI apps still work.

## Install

1. Copy this folder to `~/.config/herdr-app/mods/herdr-tui-prefix/`.
2. Bind the key in `~/.config/herdr-app/keys.json`:

```json
{
  "global":   { "ctrl-b": "mod.open:herdr-tui-prefix" },
  "terminal": { "ctrl-b": "mod.open:herdr-tui-prefix" },
  "mod:herdr-tui-prefix": { "ctrl-b": "herdr-tui-prefix.send-prefix" }
}
```

Edit the `ACTIONS` list at the top of `main.js` to change the bindings. Herdr hot-reloads mods.
The `w` action expects a mod named `picker` (shipped with Herdr's defaults).

Check it with `herdr-app check ~/.config/herdr-app/mods/herdr-tui-prefix`.

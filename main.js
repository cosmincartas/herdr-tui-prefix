import { View, div } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";
import { closeOverlay, focused, hc, nextCommand, props, run, theme } from "herdr";

const ACTIONS = [
  { key: "c", label: "New tab", command: "tab.new", args: {} },
  { key: "v", label: "Split right", command: "pane.split", args: { direction: "right" } },
  { key: "-", label: "Split down", command: "pane.split", args: { direction: "down" } },
  { key: "h", label: "Focus left pane", command: "pane.go", args: { direction: "left" } },
  { key: "j", label: "Focus pane below", command: "pane.go", args: { direction: "down" } },
  { key: "k", label: "Focus pane above", command: "pane.go", args: { direction: "up" } },
  { key: "l", label: "Focus right pane", command: "pane.go", args: { direction: "right" } },
  { key: "w", label: "Workspace / tab picker", command: "mod.open", args: { name: "picker" } },
  { key: "q", label: "Detach (close window)", command: "window.close", args: {} },
  { key: "x", label: "Close focused pane", command: "pane.close", args: {} },
  { key: "z", label: "Zoom focused pane", command: "pane.zoom", args: {} },
  { key: "Shift+X", label: "Close tab", command: "tab.close", args: {} },
  { key: "Shift+N", label: "New workspace", command: "space.new", args: {} },
  { key: "Shift+T", label: "Rename tab", command: "tab.rename", args: {} },
  { key: "Shift+D", label: "Close workspace", command: "space.close", args: {} },
  { key: "b", label: "Toggle sidebar", command: "layout.toggle", args: { id: "sidebar" } },
];
const ACTION_BY_KEY = Object.fromEntries(ACTIONS.map((action) => [action.key, action]));

function normalizeKey(event) {
  if (event.key === "escape") return "escape";
  const modifiers = event.modifiers ?? {};
  if (modifiers.control && !modifiers.shift && !modifiers.alt && !modifiers.platform && !modifiers.function && event.key.toLowerCase() === "b") {
    return "ctrl-b";
  }
  if (modifiers.control || modifiers.alt || modifiers.platform || modifiers.function) return null;

  if (modifiers.shift) {
    if (typeof event.key_char === "string" && event.key_char.length === 1) {
      return /^[a-z]$/i.test(event.key_char) ? `Shift+${event.key_char.toUpperCase()}` : `Shift+${event.key_char}`;
    }
    if (typeof event.key === "string" && /^[a-z]$/i.test(event.key)) return `Shift+${event.key.toUpperCase()}`;
  }
  if (typeof event.key_char === "string" && event.key_char.length === 1) return event.key_char;
  return event.key;
}

export default class HerdrTuiPrefix extends View {
  init(_props, cx) {
    this.handle = cx.focus_handle();
    this.handle.focus();
    this.finished = false;
    cx.spawn(async (cx) => {
      const command = await nextCommand();
      if (command === "send-prefix") this.sendPrefix(cx);
    });
  }

  finish() {
    if (this.finished) return false;
    this.finished = true;
    closeOverlay(props().overlay);
    return true;
  }

  sendPrefix(cx) {
    if (this.finished) return;
    this.finished = true;
    const terminal = focused()?.terminal;
    if (terminal) {
      const pending = hc(["keys", terminal, "ctrl+b"]);
      cx.spawn(async () => {
        try {
          const result = await pending;
          if (result.code !== 0) console.log(`herdr-tui-prefix: hc keys failed: ${result.stderr}`);
        } catch (error) {
          console.log(`herdr-tui-prefix: hc keys failed: ${error}`);
        }
      });
    }
    closeOverlay(props().overlay);
  }

  key(event, cx) {
    cx.stop_propagation();
    if (this.finished) return;

    const key = normalizeKey(event);
    if (key === "escape") return this.finish();
    if (key === "ctrl-b") return this.sendPrefix(cx);

    const action = ACTION_BY_KEY[key];
    if (!action) return this.finish();
    if (!this.finish()) return;
    run(action.command, action.args);
  }

  render() {
    const t = theme();
    return v_flex().id("herdr-tui-prefix").track_focus(this.handle)
      .on_key_down((event, cx) => this.key(event, cx))
      .w_full().min_h(0).p(14).gap(7).bg(t.popover).text_color(t.foreground).text_size(12)
      .child(h_flex().items_center().justify_between()
        .child(div().font_semibold().text_size(14).child("Ctrl+B · choose one action"))
        .child(div().text_color(t.muted).child("Esc cancels · Ctrl+B sends ^B")))
      .child(v_flex().gap(2).children(ACTIONS.map((action) =>
        h_flex().h(21).flex_none().items_center().gap(12)
          .child(div().w(76).text_color(t.accent).font_semibold().child(action.key))
          .child(div().text_color(t.foreground).child(action.label)))))
      .child(div().text_color(t.dim).child("One key only · normal terminal input is unchanged outside the prefix"));
  }
}

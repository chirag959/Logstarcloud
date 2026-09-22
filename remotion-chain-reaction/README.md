# The Flow — Chain Reaction (Remotion, 9:16)

A cinematic vertical (1080×1920) animation: a bright blue pulse races along
glowing threads through a network of nodes. It leaves the **Chat** node and
triggers a chain reaction — each node flaring to life as the pulse passes,
with a tracking camera following the pulse down the wire.

Nodes: **Reply → CRM → Calendar → Invoice → Team**
Step captions appear in sync: `Auto-reply → Lead saved → Slot booked → Invoice sent → Team alerted`

Electric blue + white on black. 14s @ 30fps.

## Run

```bash
npm install
npm run dev        # open Remotion Studio to preview / tweak
npm run render     # renders out/chain-reaction.mp4
```

## Structure
- `src/Root.tsx` — composition config (dimensions, fps, duration)
- `src/ChainReaction.tsx` — scene geometry, tracking camera, pulse, nodes, captions

## Notes
- Timeline is driven by `INTRO` + `SEG` (frames per hop) in `ChainReaction.tsx`.
  Change node positions/labels in the `NODES` array; captions in `STEPS`.
- No audio track is embedded. The brief's audio (rising synth pulses + clicks
  per node) can be added by dropping files into `public/` and using
  Remotion's `<Audio>` component, timed to `INTRO + i*SEG`.

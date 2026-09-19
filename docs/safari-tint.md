# Safari theme tint

## Device results and opaque-edge candidate

User's affected-device comparison: `flow` follows theme, `solid` follows theme,
`glass` does not. This narrows the failure to the sticky translucent/filter case;
it does not establish which internal WebKit cache or compositor path is failing.
The user proposes a solid edge or a transition from solid to glass.

Two new opt-in variants preserve the existing sticky glass header:

- `?safari-test=edge`: separate, fixed 12px opaque theme-colored strip at the top.
- `?safari-test=feather`: the same strip plus a 20px fade below it onto the glass.

The strip is a body child, not a child of the filtered header, has no backdrop
filter, does not intercept taps, and has no layout footprint. It covers part of
the header's existing top padding. The gradient is below the opaque strip rather
than replacing its background-color. Default and earlier diagnostic modes hide it.
This deliberately aims for native SOLID status-area tint with a smooth transition
into a glass navigation bar, not true custom blur inside native browser chrome.

Source rationale: current WebKit LocalFrameView::fixedContainerEdges samples
near the edge (4px inset) and primaryBackgroundColorForRenderer skips boxes whose
width or height is <=10px. A 12px opaque box is different from the historical 4px
probe and from a thin CSS border. Source-main behavior is not proof of the exact
implementation shipped in the user's iOS 27. Device acceptance is still required:
fresh load for each mode, repeated theme changes without reload, scrolling,
toolbar expansion/collapse, and checking both color updates and visual seams.

## Reference comparison and opt-in device checks

The user confirms that https://dany.works changes the native top area's color on
the same phone. Source fetched again for this investigation uses `body.light`
and typed `@property --bg` with a 400ms transition. It has no theme-color or
color-scheme metadata, no viewport-fit=cover, and no equivalent full-width sticky
glass header. It does have fixed decorative overlays and desktop controls;
do not generalize this into "all fixed elements break tint". The earlier root
canvas change is not an implementation of this reference's full structure.

The current diagnostic change adds three query-selected variants to the actual
site, applied in the head before first paint. No parameter means normal behavior:

- `?safari-test=glass`: existing sticky translucent/blurred header (control).
- `?safari-test=flow`: same header, only position changes to relative.
- `?safari-test=solid`: same sticky header, opaque theme background, no blur.

After deploying the diagnostic change, open each variant separately on the
affected iPhone, switch dark then light without reloading, and compare the native
status area. Reloads between variants are intentional to avoid native tint carryover.
The flow case should also be checked after scrolling: its header leaves the screen.
Do not change theme persistence, root background, safe-area geometry or animation
at the same time. If flow also fails, the header-only explanation is insufficient;
then isolate the reference's body canvas/transition and viewport settings.
These are diagnostic variants, not a validated fix. Nothing is uploaded by them.

## Required visual outcome and directly relevant upstream report

The user wants the same translucent navigation surface, including blurred content
behind it, to continue into the status/Dynamic Island area. Merely replacing a
black strip with a light solid strip does not meet this requirement.

https://bugs.webkit.org/show_bug.cgi?id=301108 tracks viewport-fit=cover and blur
overlays not covering browser-obscured areas. Comment 4 specifically reports a
header updating on a website theme toggle while the browser's top area retains
the previous color until reload. This is a close symptom match, not proof that
the same WebKit defect persists in the user's iOS 27 build.

https://bugs.webkit.org/show_bug.cgi?id=300965#c32 explains a related browser-side
fix as extending solid color into the top/bottom browser areas, not extending
the original overlay and its backdrop filter. The distinction explains why
ordinary content visible behind browser UI does not establish that a sticky
glass layer can paint that area identically.

The site already has viewport-fit=cover, safe-area padding and a backdrop filter
on the sticky header. Do not propose those existing settings again as a new fix.
Do not promise that negative offsets, larger overlays, replacing sticky with
fixed, or a nested scroll container will cross browser compositor clipping;
each would require affected-device evidence. Removing the sticky header is a
useful control case but would sacrifice requested behavior, not fulfill it.

## 2026-09-19 — explicit root canvas (iOS 27 report)

**Device feedback: this candidate did not fix the reported issue.** The user
confirmed that the status area still does not follow theme changes. A subsequent
fetch of https://aimaradio.com/ includes the explicit root canvas bootstrap and
asset hashes `styles.css?v=e0a87cfda1ea538f` and
`script.js?v=d7af54a7964d6df5`, matching local commit `d778230`. The current server
is serving this candidate; do not repeat it or dismiss the report as an undeployed
change. This does not inspect the device's own cache, but there is no evidence to
blame that cache.

Next investigation must isolate the native status-area behavior on the affected
device: compare normal-flow, sticky opaque, and sticky translucent/blurred headers
with identical theme handling, loading each variant separately to avoid carrying
native tint state between variants. Desktop computed-style checks are regression
checks only. A sticky-header sampling/cache issue remains a hypothesis, not an
established diagnosis of this iOS 27 report.

The user reports a stale black status area after dark → light in iOS 27 Safari.
Revision 28's header filter is already present; do not assume moving that filter
again or changing only `theme-color` resolves this report.

The root previously remained transparent and relied on body background propagation.
It now paints the active background explicitly. The head bootstrap sets that
color before changing `color-scheme` and before loading CSS. The same assignment
is made on theme changes. Storage failures still initialize the light canvas.
Theme variables now belong only to `html`, so the body and glass surfaces inherit
one theme rather than maintaining a second body override.

This addresses canvas initialization and synchronization, not a demonstrated fix
to Safari's internal fixed-edge color cache. Keep the existing sticky header's
translucency, backdrop filter and safe-area padding. Do not force page reloads,
replace navigation nodes, or interrupt audio to refresh browser chrome.

Validation: build and JavaScript syntax checks passed. The bootstrap was checked
with light, dark, invalid and unavailable storage. Safari 26.6.2 WebDriver passed
16 theme switches at requested 402px/1200px window widths, at scroll positions
0/650px: root/body colors agree, header blur remains, sticky positioning and
scroll position remain stable, audio node identities are retained, and saved-dark
reload works. Desktop window sizing is not iPhone emulation.

The host has desktop Safari 26.6.2, but no usable iOS 27 simulator. Computed styles
and desktop browser checks cannot establish that the iPhone status area updates.
Final acceptance remains on the reported device: fresh load, light → dark → light
at the top and after scrolling, saved-dark reload then light, and switches during
audio playback. Check the status area's color as well as the header blur. Website
CSS does not directly control the native status bar's blur.

## Historical revision 20260910-28

The previous revision (27) is confirmed deployed at aimaradio.com. Its computed
CSS changed correctly, but that never established that Safari's chrome updated.

## Reference and implementation

The public source of https://dany.works uses a body background controlled by CSS
variables (with registered color-property transitions). It has no colored fixed
top strip and no sticky header equivalent to ours. It does not establish that
PWA metadata or a theme-color mutation is necessary.

WebKit's `LocalFrameView::fixedContainerEdges` walks hit-test renderer ancestors
and checks `hasBackdropFilter()`. When it finds a filter it returns a multiple-color
result, rather than a sampled solid color. Without that flag, a transparent fixed
container can reuse the previous sampled color for the same container. Our filter
was on `::before`, which is not an ancestor of the header's controls. This is a
source-backed explanation to test, not proof of the behavior of every Safari build.

Revision 28 removes the fixed 4px tint probe and the header pseudo-element. The
sticky header itself now has the translucent background and backdrop-filter.
Body continues to paint the CSS theme background. theme-color remains only for
browser compatibility, without claiming it forces Safari to repaint. Existing
viewport-fit and standalone status-bar settings are preserved.

Sources inspected on 2026-09-10:

- https://dany.works/
- https://github.com/WebKit/WebKit/blob/main/Source/WebCore/page/LocalFrameView.cpp
  (`findFixedContainer`, `foundBackdropFilter`, `lastFixedContainer`)
- https://bugs.webkit.org/show_bug.cgi?id=301756

## Verification limits

Safari 26.6.2 WebDriver verified the actual header filter and both theme changes
before and after scrolling. Its automation window also showed a dark toolbar for
the light dany.works reference, so those screenshots are not a valid chrome visual
acceptance test. No claim of successful iOS or ordinary Safari chrome validation
has been made for revision 28. iOS 26 simulator is unavailable on this host.

Acceptance still needed in ordinary Safari and a home-screen launch: load revision
28, scroll, toggle light/dark/light without reload, and check both the status area
and navigation. A one-time load of the new assets is distinct from reloading on
every theme change. Do not add a forced reload: it interrupts audio playback.

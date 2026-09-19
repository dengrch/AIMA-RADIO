# Safari theme tint

## 2026-09-19 — explicit root canvas (iOS 27 report)

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

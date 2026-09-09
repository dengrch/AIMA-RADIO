# Safari theme tint — revision 20260910-28

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

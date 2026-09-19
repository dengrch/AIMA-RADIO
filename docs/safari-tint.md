# Safari top edge — gradient treatment

## Current implementation

The user confirmed on their iOS 27 iPhone that both the opaque-edge and
opaque-edge-plus-gradient variants make the native top area follow theme changes.
They selected the gradient version as the default and requested more visible glass.

The user's latest device tests found 4px fails, 10px fails/is unstable, and 11px
works. The user has set the opaque strip to 11px; preserve that tested value.
The user found the short fade harsh and requested a more generous transition.
The new fade is 40px, ending 51px from the viewport top. It uses alpha stops of
100%, 96%, 84%, 68%, 50%, 32%, 16%, 4%, 0% at evenly spaced positions, approximating
smoothstep with gentle slopes at both ends. A linear fallback is provided for
browsers without color-mix. `--top-edge-height` and `--top-edge-fade` in :root
control the two dimensions. The 11px minimum is evidence from this
device, not a cross-version browser guarantee. Keep 12px as the known-good fallback.

`.safari-top-edge` is a fixed body child above the sticky header, separate from
its backdrop-filter. It has an opaque `background-color: var(--bg)`. The fade now
lives on `.site-head::before` with z-index -1, inside the header's stacking context:
above its glass background but below its controls. This prevents a longer fade
from washing out text, unlike the previous sibling overlay. The opaque sampling
strip remains separate and unchanged. Both layers have no layout footprint and
do not intercept taps. The theme color comes from the same root variables as the
page. This longer fade and layer adjustment still need user visual acceptance.

There are no diagnostic query switches or alternate page modes anymore.
Old `?safari-test=...` URLs simply render the standard page.

Previous 12px-strip finalization checks: build, JavaScript syntax and diff whitespace checks passed.
Desktop Safari verified the default URL and all five old query variants in both
themes: each has the sticky blurred header, a 12px opaque edge and a 12px fade.
These were implementation checks. The subsequent user tests establish native
theme following at 11px on their iPhone.

The selected visual compromise is a native solid status-area tint blending
into the site's glass navigation. It does not make the native status area render
our custom backdrop filter. Keep the strip outside the filtered header. Do not
shrink the strip to <=10px again. If native tint stops updating in other browser
states, restore the known-good 12px strip before investigating other changes.

## Device evidence and failed approaches

- 4px opaque strip: fails.
- 10px opaque strip: fails/is unstable.
- 11px opaque strip: follows theme; current selected minimum on the user's device.

- Ordinary non-sticky glass header: native top color follows theme; navigation
  scrolls away, so this does not meet the desired behavior.
- Sticky opaque header: follows theme but loses the glass effect.
- Sticky translucent/blurred header alone: does not follow theme.
- Independent 12px opaque strip plus sticky glass header: follows theme.
- The same strip with a 20px downward fade: follows theme; selected by the user.

Earlier attempts to move the filter onto the sticky element, update theme-color,
or explicitly paint the root canvas did not resolve the reported native tint.
The explicit root canvas remains for consistent startup and theme rendering.
Desktop computed-style checks do not prove that native iOS chrome updates.

The reference https://dany.works changes body background using registered color
variables and a 400ms transition. The user confirmed its native top tint follows
on the same phone. It lacks our full-width sticky glass header, though it has
other fixed overlays. Do not conclude that all fixed elements cause the issue.

## Source rationale and validation limits

Current WebKit `LocalFrameView::fixedContainerEdges` samples near viewport edges
(4px inset), treats backdrop-filter separately from a solid background, and its
`primaryBackgroundColorForRenderer` skips boxes with width or height <=10px.
This supports choosing a separate 12px opaque surface instead of a thin border.
The user's device result is the acceptance evidence; source-main is not proof
of the precise implementation shipped in their iOS 27 build.

Sources:

- https://github.com/WebKit/WebKit/blob/main/Source/WebCore/page/LocalFrameView.cpp
- https://bugs.webkit.org/show_bug.cgi?id=301756#c2
- https://bugs.webkit.org/show_bug.cgi?id=301108#c4
- https://bugs.webkit.org/show_bug.cgi?id=300965#c32

For future changes, verify repeated light/dark switching without reload, scrolling,
Safari toolbar expansion/collapse, and visual seams on the affected iPhone.
Do not force reloads or rebuild navigation nodes to refresh native chrome;
these are unnecessary with the accepted approach and could disrupt playback.

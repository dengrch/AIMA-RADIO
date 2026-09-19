# Safari top edge — gradient treatment

## Current implementation

The user confirmed on their iOS 27 iPhone that both the opaque-edge and
opaque-edge-plus-gradient variants make the native top area follow theme changes.
They selected the gradient version as the default and requested more visible glass.

At the user's latest request, the opaque strip is now 4px and the fade beneath
it is 12px, ending 16px from the viewport top. The fade uses alpha stops of
100%, 56%, 25%, 6%, 0% at evenly spaced positions, approximating a quadratic
falloff to reveal the glass sooner and soften the tail. A linear fallback is
provided for browsers without color-mix. This 4px version awaits the user's
device test; only the earlier 12px strip + 20px fade was explicitly confirmed.

`.safari-top-edge` is a fixed body child above the sticky header, separate from
its backdrop-filter. It has an opaque `background-color: var(--bg)` and a fading
pseudo-element below it. It has no layout footprint, is hidden from accessibility,
and does not intercept taps. Header controls, glass, scrolling and playback are
unchanged. The theme color comes from the same root variables as the page.

There are no diagnostic query switches or alternate page modes anymore.
Old `?safari-test=...` URLs simply render the standard page.

Previous 12px-strip finalization checks: build, JavaScript syntax and diff whitespace checks passed.
Desktop Safari verified the default URL and all five old query variants in both
themes: each has the sticky blurred header, a 12px opaque edge and a 12px fade.
This checks the implementation; the shortened fade's appearance has not yet
been rechecked on the user's iPhone.

The selected visual compromise is a native solid status-area tint blending
into the site's glass navigation. It does not make the native status area render
our custom backdrop filter. Keep the strip outside the filtered header. The user
explicitly authorized trying 4px and will test it. If native tint stops updating,
restore the known-good 12px strip before investigating other changes.

## Device evidence and failed approaches

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

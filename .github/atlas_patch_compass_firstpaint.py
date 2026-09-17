from pathlib import Path

path = Path('compass/index.html')
text = path.read_text(encoding='utf-8')

old_gate = '''  <script>
    (function () {
      var root = document.documentElement;
      var released = false;
      var sessionFont = null;
      var safetyTimer = window.setTimeout(release, 1500);

      function release() {
        if (released) return;
        released = true;
        window.clearTimeout(safetyTimer);
        window.requestAnimationFrame(function () {
          root.classList.remove('atlas-session-fonts-pending');
        });
      }

      if (document.fonts && typeof document.fonts.load === 'function') {
        sessionFont = document.fonts.load('500 13px "DM Sans"');
      }

      function finishFirstPaint() {
        Promise.resolve(sessionFont).then(release, release);
      }

      if (document.readyState === 'loading') {
        document.addEventListener(
          'DOMContentLoaded',
          finishFirstPaint,
          { once: true }
        );
      } else {
        finishFirstPaint();
      }
    })();
  </script>'''

new_gate = '''  <script>
    (function () {
      var root = document.documentElement;
      var released = false;
      var fontReady = false;
      var sessionChromeReady = false;
      var safetyTimer = window.setTimeout(release, 1500);

      function release() {
        if (released) return;
        released = true;
        window.clearTimeout(safetyTimer);
        window.requestAnimationFrame(function () {
          root.classList.remove('atlas-session-fonts-pending');
        });
      }

      function releaseWhenReady() {
        if (fontReady && sessionChromeReady) {
          release();
        }
      }

      window.addEventListener(
        'atlas:compass-session-chrome-ready',
        function () {
          sessionChromeReady = true;
          releaseWhenReady();
        },
        { once: true }
      );

      if (document.fonts && typeof document.fonts.load === 'function') {
        Promise.resolve(
          document.fonts.load('500 13px "DM Sans"')
        ).then(
          function () {
            fontReady = true;
            releaseWhenReady();
          },
          function () {
            fontReady = true;
            releaseWhenReady();
          }
        );
      } else {
        fontReady = true;
      }
    })();
  </script>'''

shell_anchor = '''  <main class="hub-main" id="hub-main" role="main"></main>
  <div id="atlas-session-panel-root"></div>

  <!-- ============================================================ SCRIPTS -->'''

shell_replacement = '''  <main class="hub-main" id="hub-main" role="main"></main>
  <div id="atlas-session-panel-root"></div>

  <script>
    window.dispatchEvent(
      new Event('atlas:compass-session-chrome-ready')
    );
  </script>

  <!-- ============================================================ SCRIPTS -->'''

if text.count(old_gate) != 1:
    raise SystemExit(f'Expected exactly one old Compass first-paint gate, found {text.count(old_gate)}')

if text.count(shell_anchor) != 1:
    raise SystemExit(f'Expected exactly one Compass shell anchor, found {text.count(shell_anchor)}')

text = text.replace(old_gate, new_gate, 1)
text = text.replace(shell_anchor, shell_replacement, 1)

head_gate = text.split('</head>', 1)[0]
if 'DOMContentLoaded' in head_gate:
    raise SystemExit('Compass first-paint gate still depends on DOMContentLoaded')

if text.count("atlas:compass-session-chrome-ready") != 2:
    raise SystemExit('Compass readiness event contract is incomplete')

path.write_text(text, encoding='utf-8')

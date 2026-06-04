#!/usr/bin/env bash
# Install the systemd USER timer that fires cron-publish-next.sh twice a day
# (09:00 and 21:00 local). Medium caps publishing at 2 stories / 24h, so two
# evenly-spaced slots sustain the max throughput. User units =
# no sudo needed, but they only run while you're logged in (or while
# linger is enabled via `loginctl enable-linger <user>` — flagged
# below).
#
# To uninstall: pass --uninstall.
set -euo pipefail

ACTION=install
[ "${1:-}" = "--uninstall" ] && ACTION=uninstall

REPO="$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")/../.." && pwd)"
SCRIPT="$REPO/scripts/medium-poster/cron-publish-next.sh"
UNIT_DIR="$HOME/.config/systemd/user"
SVC="$UNIT_DIR/medium-publish.service"
TMR="$UNIT_DIR/medium-publish.timer"
LOG_DIR="$HOME/.local/state"
LOG="$LOG_DIR/medium-publish.log"

if [ "$ACTION" = "uninstall" ]; then
  systemctl --user stop medium-publish.timer 2>/dev/null || true
  systemctl --user disable medium-publish.timer 2>/dev/null || true
  rm -f "$SVC" "$TMR"
  systemctl --user daemon-reload
  echo "✓ Removed medium-publish.service + .timer"
  exit 0
fi

mkdir -p "$UNIT_DIR" "$LOG_DIR"

cat > "$SVC" <<EOF
[Unit]
Description=Publish next due Medium post via Chrome + userscript
After=graphical-session.target

[Service]
Type=oneshot
WorkingDirectory=$REPO
ExecStart=$SCRIPT
# DISPLAY is needed so xdg-open can talk to Chrome. graphical-session.target
# usually provides it; force it as a fallback for the common single-display setup.
Environment=DISPLAY=:0
StandardOutput=append:$LOG
StandardError=append:$LOG
EOF

cat > "$TMR" <<EOF
[Unit]
Description=Medium auto-publish twice daily (09:00, 21:00) — respects Medium's 2-stories/24h cap

[Timer]
OnCalendar=*-*-* 09:00:00
OnCalendar=*-*-* 21:00:00
Persistent=true
Unit=medium-publish.service

[Install]
WantedBy=timers.target
EOF

chmod +x "$SCRIPT"
systemctl --user daemon-reload
systemctl --user enable --now medium-publish.timer

echo
echo "✓ Installed."
echo "  service: $SVC"
echo "  timer:   $TMR"
echo "  log:     $LOG"
echo
echo "Schedule:"
systemctl --user list-timers medium-publish.timer --no-pager 2>/dev/null | head -6 || true
echo
echo "Useful commands:"
echo "  systemctl --user status medium-publish.timer"
echo "  systemctl --user start  medium-publish.service   # fire once now (test)"
echo "  journalctl --user -u medium-publish.service -n 50 --no-pager"
echo "  tail -n 50 $LOG"
echo "  $(basename "$0") --uninstall                     # remove"
echo
echo "If you want this to run while you're logged out:"
echo "  sudo loginctl enable-linger $USER"

/*
  Fullscreen Notifications Gnome Shell Extension
  Developed by Aleksey Pozharov sorrow.about.alice@pm.me

  This program is free software; you can redistribute it and/or
  modify it under the terms of the GNU General Public License
  as published by the Free Software Foundation; either version 2
  of the License, or (at your option) any later version.
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  You should have received a copy of the GNU General Public License
  along with this program. If not, see
  < https://www.gnu.org/licenses/gpl-2.0.html >.
  This program is a derived work of Gnome Shell.
*/

const Main = imports.ui.main;
const Lang = imports.lang;
const GnomeSession = imports.misc.gnomeSession;

let originalUpdateState = null;

function init() {}

const State = {
    HIDDEN: 0,
    SHOWING: 1,
    SHOWN: 2,
    HIDING: 3,
};

const Urgency = {
    LOW: 0,
    NORMAL: 1,
    HIGH: 2,
    CRITICAL: 3,
};
// Adopted from original Gnome Shell code. Original version can be found in gnome-shell/ui/messageTray.js
function updateState() {
    let hasMonitor = Main.layoutManager.primaryMonitor != null;
    this.visible = !this._bannerBlocked && hasMonitor && this._banner != null;
    if (this._bannerBlocked || !hasMonitor) return;

    // If our state changes caused _updateState to be called,
    // just exit now to prevent reentrancy issues.
    if (this._updatingState) return;

    this._updatingState = true;

    // Filter out acknowledged notifications.
    let changed = false;
    this._notificationQueue = this._notificationQueue.filter((n) => {
        changed = changed || n.acknowledged;
        return !n.acknowledged;
    });

    if (changed) this.emit("queue-changed");

    let hasNotifications = Main.sessionMode.hasNotifications;

    if (this._notificationState == State.HIDDEN) {
        let nextNotification = this._notificationQueue[0] || null;
        if (hasNotifications && nextNotification) {
            // Removed fullscreen check
            // let limited = this._busy || Main.layoutManager.primaryMonitor.inFullscreen;
            let limited = this._busy;
            let showNextNotification =
                !limited ||
                nextNotification.forFeedback ||
                nextNotification.urgency == Urgency.CRITICAL;
            if (showNextNotification) this._showNotification();
        }
    } else if (this._notificationState == State.SHOWN) {
        let expired =
            (this._userActiveWhileNotificationShown &&
                this._notificationTimeoutId == 0 &&
                this._notification.urgency != Urgency.CRITICAL &&
                !this._banner.focused &&
                !this._pointerInNotification) ||
            this._notificationExpired;
        let mustClose =
            this._notificationRemoved || !hasNotifications || expired;

        if (mustClose) {
            let animate = hasNotifications && !this._notificationRemoved;
            this._hideNotification(animate);
        } else if (this._pointerInNotification && !this._banner.expanded) {
            this._expandBanner(false);
        } else if (this._pointerInNotification) {
            this._ensureBannerFocused();
        }
    }

    this._updatingState = false;

    // Clean transient variables that are used to communicate actions
    // to updateState()
    this._notificationExpired = false;
}

function enable() {
    originalUpdateState = Main.messageTray._updateState;
    Main.messageTray._updateState = updateState.bind(Main.messageTray);
}

function disable() {
    Main.messageTray._updateState = originalUpdateState;
}

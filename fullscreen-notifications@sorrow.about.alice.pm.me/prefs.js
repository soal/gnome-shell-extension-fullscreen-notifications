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


const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();


function init() {
}

function buildPrefsWidget() {

  this.settings = ExtensionUtils.getSettings(
    'me.pm.alice.about.sorrow.fullscreen-notifications');

  // Create a parent widget that we'll return from this function
  let prefsWidget = new Gtk.Grid({
    column_spacing: 12,
    row_spacing: 12,
    visible: true
  });

  // Add a simple title and add it to the prefsWidget
  let title = new Gtk.Label({
    label: `<b>${Me.metadata.name} Preferences</b>`,
    halign: Gtk.Align.START,
    use_markup: true,
    visible: true
  });
  prefsWidget.attach(title, 0, 0, 2, 1);

  // Create a label & switch for `no-mouse`
  let toggleLabel = new Gtk.Label({
    label: 'Dismiss notification without mouse movement in fullscreen:',
    halign: Gtk.Align.START,
    visible: true
  });
  prefsWidget.attach(toggleLabel, 0, 1, 1, 1);

  let toggle = new Gtk.Switch({
    active: this.settings.get_boolean('no-mouse'),
    halign: Gtk.Align.END,
    visible: true
  });
  prefsWidget.attach(toggle, 1, 1, 1, 1);

  // Bind the switch to the `no-mouse` key
  this.settings.bind(
    'no-mouse',
    toggle,
    'active',
    Gio.SettingsBindFlags.DEFAULT
  );

  // Return our widget which will be added to the window
  return prefsWidget;
}

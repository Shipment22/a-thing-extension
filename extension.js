/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
/* exported init */
// Imports and stuff
const GETTEXT_DOMAIN = 'athing-extension';
const { GObject, St, Clutter, GLib, Gio } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Gtk = imports.gi.Gtk;
// Create a Button that has a text and will open Text Editor to change that text on click
const Button = GObject.registerClass(
class Button extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('A Button'));
        // Get the file create a monitor for the file and set text based on the content of the file
        const file = Gio.File.new_for_path('.local/share/gnome-shell/extensions/aThing@shipment22.github.io/thing.txt');
        const fileMonitor = file.monitor(Gio.FileMonitorFlags.WATCH_CHANGES, null);
        const text = String(file.load_contents(null)[1]).replace('\n', '');
        // Create a label
        const label = new St.Label({
            style_class: 'a-thing-label',
            text: text
        });
        label.set_y_align(Clutter.ActorAlign.CENTER); // Align the label
        this.actor.add_child(label); // Add the label to the button
        // Connect a button press event to the button
        this.connect('button-press-event', () => {
            // Open thing.txt in text editor
            GLib.spawn_command_line_async('gnome-text-editor .local/share/gnome-shell/extensions/aThing@shipment22.github.io/thing.txt');
            // Connect the file monitor change event (hopefully this overwrites the old one, because it didn't work well when it was defined outside this scope)
            fileMonitor.connect('changed', (monitor, file) => {
                label.set_text(String(file.load_contents(null)[1]).replace('\n', '')); // Set the text of the label to the content of the file
            });
        });
    }
});
// Create an exetnsion class
class Extension {
    // Constructor
    constructor(uuid) {
        this._uuid = uuid;
        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }
    // Create the Button and add it to the panel
    enable() {
        this._button = new Button();
        Main.panel.addToStatusArea(this._uuid, this._button);
    }
    // Destroy and set the button to null
    disable() {
        this._button.destroy();
        this._button = null;
    }
}
// Export the extension
function init(meta) {
    return new Extension(meta.uuid);
}